import fs from 'fs';
import path from 'path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createDb, DB_CLIENT, sqliteFile } from './db';
import { resetDatabase, TITLE_MAX_LENGTH } from './schema';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = '127.0.0.1';

type TaskRow = { id: number; title: string; done: boolean | number; created_at: string | Date };

/**
 * SQLite stores booleans as 0/1 and timestamps as UTC text without a zone ("2026-01-01 12:00:00");
 * normalise both so the API response is identical on SQLite and Postgres.
 */
function toTask(row: TaskRow) {
  const createdAt =
    typeof row.created_at === 'string' && !/[zZ]|[+-]\d\d:?\d\d$/.test(row.created_at)
      ? `${row.created_at.replace(' ', 'T')}Z`
      : row.created_at;
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    created_at: new Date(createdAt).toISOString(),
  };
}

type TaskInput = { title?: string; done?: boolean };

/**
 * Validates a request body. `required` lists the fields that must be present.
 * Returns an error message, or the cleaned input.
 */
function validateTask(body: unknown, required: (keyof TaskInput)[]): string | TaskInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }
  const input = body as Record<string, unknown>;

  const unknownFields = Object.keys(input).filter((key) => key !== 'title' && key !== 'done');
  if (unknownFields.length > 0) {
    return `Unknown field(s): ${unknownFields.join(', ')}`;
  }
  for (const field of required) {
    if (input[field] === undefined) return `${field} is required`;
  }
  if (Object.keys(input).length === 0) {
    return 'At least one of title or done is required';
  }

  const result: TaskInput = {};
  if (input.title !== undefined) {
    if (typeof input.title !== 'string') return 'title must be a string';
    const title = input.title.trim();
    if (title.length === 0) return 'title is required';
    if (title.length > TITLE_MAX_LENGTH) {
      return `title must be at most ${TITLE_MAX_LENGTH} characters`;
    }
    result.title = title;
  }
  if (input.done !== undefined) {
    if (typeof input.done !== 'boolean') return 'done must be a boolean';
    result.done = input.done;
  }
  return result;
}

function parseId(req: Request, res: Response): number | undefined {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return undefined;
  }
  return id;
}

async function main() {
  if (DB_CLIENT === 'sqlite') {
    fs.mkdirSync(path.dirname(sqliteFile), { recursive: true });
  }
  const db = createDb();
  await resetDatabase(db);

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', db: DB_CLIENT });
  });

  app.get('/api/tasks', async (_req, res) => {
    const rows = await db<TaskRow>('tasks').orderBy('id');
    res.json(rows.map(toTask));
  });

  app.get('/api/tasks/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === undefined) return;
    const row = await db<TaskRow>('tasks').where({ id }).first();
    if (!row) return void res.status(404).json({ error: 'Task not found' });
    res.json(toTask(row));
  });

  app.post('/api/tasks', async (req, res) => {
    const input = validateTask(req.body, ['title']);
    if (typeof input === 'string') return void res.status(400).json({ error: input });
    const [row] = await db<TaskRow>('tasks')
      .insert({ title: input.title, done: input.done ?? false })
      .returning('*');
    res.status(201).json(toTask(row));
  });

  // PUT replaces the whole task, so every field is required.
  app.put('/api/tasks/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === undefined) return;
    const input = validateTask(req.body, ['title', 'done']);
    if (typeof input === 'string') return void res.status(400).json({ error: input });
    const [row] = await db<TaskRow>('tasks').where({ id }).update(input).returning('*');
    if (!row) return void res.status(404).json({ error: 'Task not found' });
    res.json(toTask(row));
  });

  // PATCH updates only the fields that were sent.
  app.patch('/api/tasks/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === undefined) return;
    const input = validateTask(req.body, []);
    if (typeof input === 'string') return void res.status(400).json({ error: input });
    const [row] = await db<TaskRow>('tasks').where({ id }).update(input).returning('*');
    if (!row) return void res.status(404).json({ error: 'Task not found' });
    res.json(toTask(row));
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === undefined) return;
    const deleted = await db('tasks').where({ id }).del();
    if (deleted === 0) return void res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      return void res.status(400).json({ error: 'Malformed JSON' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, HOST, () => {
    console.log(`Task app listening on http://${HOST}:${PORT} (db: ${DB_CLIENT})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

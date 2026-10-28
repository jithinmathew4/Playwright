import path from 'path';
import knex, { type Knex } from 'knex';

export const DB_CLIENT = process.env.DB_CLIENT === 'pg' ? 'pg' : 'sqlite';

const SQLITE_FILE =
  process.env.DB_FILE ?? path.resolve(__dirname, '..', 'data', 'app.db');

/**
 * Creates a Knex connection for the configured database.
 * The app server and the test fixtures both use this, so they always talk to the same DB.
 *
 *   DB_CLIENT=sqlite (default)  -> data/app.db, no setup needed
 *   DB_CLIENT=pg                -> DATABASE_URL, e.g. the Postgres service container in CI
 */
export function createDb(): Knex {
  if (DB_CLIENT === 'pg') {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set when DB_CLIENT=pg');
    }
    return knex({ client: 'pg', connection: process.env.DATABASE_URL });
  }

  return knex({
    client: 'better-sqlite3',
    connection: { filename: SQLITE_FILE },
    useNullAsDefault: true,
    pool: {
      // The server and the test runner open the same file from different processes.
      // WAL + a busy timeout lets them read and write concurrently without "database is locked".
      afterCreate: (conn: any, done: (err: Error | null, conn: any) => void) => {
        conn.pragma('journal_mode = WAL');
        conn.pragma('busy_timeout = 5000');
        done(null, conn);
      },
    },
  });
}

export const sqliteFile = SQLITE_FILE;

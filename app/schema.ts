import { type Knex } from 'knex';

export const TITLE_MAX_LENGTH = 200;

export const SEED_TASKS = [
  { title: 'Write the test plan', done: true },
  { title: 'Automate the smoke suite', done: false },
  { title: 'Review the HTML report', done: false },
];

/** Drops and recreates the schema, then inserts the seed rows. Runs once on server start. */
export async function resetDatabase(db: Knex) {
  await db.schema.dropTableIfExists('tasks');
  await db.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', TITLE_MAX_LENGTH).notNullable();
    table.boolean('done').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
  });
  await db('tasks').insert(SEED_TASKS);
}

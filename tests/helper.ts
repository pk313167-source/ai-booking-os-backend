import knex from "../src/db/knex";

export const setupTestDB = async () => {
  // SQLite in-memory doesn't work well with multiple connections in Knex
  // So we use a temporary file for tests
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_secret_key";
  
  await knex.migrate.latest();
};

export const teardownTestDB = async () => {
  await knex.migrate.rollback(undefined, true);
  await knex.destroy();
};

export const clearDB = async () => {
  const tables = ["reminder_jobs", "chat_messages", "appointments", "contacts", "users", "businesses"];
  for (const table of tables) {
    await knex(table).truncate();
  }
};

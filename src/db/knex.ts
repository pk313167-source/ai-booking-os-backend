import knex from "knex";

const environment = process.env.NODE_ENV || "development";

const config = {
  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/ai_booking_os",
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
};

const connection = knex((config as any)[environment]);

export default connection;

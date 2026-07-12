import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./dev.sqlite3"
    },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
  test: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: ":memory:"
    },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },
};

export default config;

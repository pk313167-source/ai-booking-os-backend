import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/ai_booking_os",
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, "db", "migrations"),
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
      directory: path.join(__dirname, "db", "migrations"),
      extension: "ts",
    },
  },
};

export default config;

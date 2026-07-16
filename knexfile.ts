import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

const databaseUrl = "postgresql://neondb_owner:npg_lwF1mtVxGT4q@ep-billowing-bread-aj1r9djt-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
};

export default config;

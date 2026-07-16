import knex from "knex";

const environment = process.env.NODE_ENV || "development";

const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_lwF1mtVxGT4q@ep-billowing-bread-aj1r9djt-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";
const databaseUrl = process.env.DATABASE_URL || NEON_DATABASE_URL;

const config = {
  development: {
    client: "pg",
    connection: {
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("neon.tech") ? { rejectUnauthorized: false } : false
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

const connection = knex((config as any)[environment]);
export default connection;

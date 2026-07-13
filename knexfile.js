"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
    development: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/ai_booking_os",
            ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
        },
        migrations: {
            directory: path_1.default.join(__dirname, "src", "db", "migrations"),
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
            directory: path_1.default.join(__dirname, "src", "db", "migrations"),
            extension: "ts",
        },
    },
};
exports.default = config;

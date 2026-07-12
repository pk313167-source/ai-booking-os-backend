"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: "pg",
        connection: process.env.DATABASE_URL || "postgres://localhost:5432/ai_booking_os",
        migrations: {
            directory: "./src/db/migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/db/seeds",
        },
    },
    production: {
        client: "pg",
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: "./src/db/migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/db/seeds",
        },
    },
};
exports.default = config;

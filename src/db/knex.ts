import knex from "knex";
import config from "../../knexfile";

const environment = (process.env.NODE_ENV || "development") as keyof typeof config;
const connection = knex(config[environment]);

export default connection;

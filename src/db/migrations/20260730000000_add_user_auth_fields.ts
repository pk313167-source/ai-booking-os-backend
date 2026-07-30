import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.boolean("is_verified").defaultTo(false);
    table.string("verification_token");
    table.string("reset_password_token");
    table.timestamp("reset_password_expires");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("is_verified");
    table.dropColumn("verification_token");
    table.dropColumn("reset_password_token");
    table.dropColumn("reset_password_expires");
  });
}

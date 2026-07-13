import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("contacts", (table: Knex.CreateTableBuilder) => {
    table.index(["business_id"]);
    table.index(["created_at"]);
  });

  await knex.schema.alterTable("appointments", (table: Knex.CreateTableBuilder) => {
    table.index(["business_id"]);
    table.index(["status"]);
    table.index(["start_time"]);
  });

  await knex.schema.alterTable("chat_messages", (table: Knex.CreateTableBuilder) => {
    table.index(["business_id"]);
    table.index(["created_at"]);
  });

  await knex.schema.alterTable("reminder_jobs", (table: Knex.CreateTableBuilder) => {
    table.index(["business_id"]);
    table.index(["status"]);
    table.index(["scheduled_for"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reminder_jobs", (table: Knex.CreateTableBuilder) => {
    table.dropIndex(["business_id"]);
    table.dropIndex(["status"]);
    table.dropIndex(["scheduled_for"]);
  });

  await knex.schema.alterTable("chat_messages", (table: Knex.CreateTableBuilder) => {
    table.dropIndex(["business_id"]);
    table.dropIndex(["created_at"]);
  });

  await knex.schema.alterTable("appointments", (table: Knex.CreateTableBuilder) => {
    table.dropIndex(["business_id"]);
    table.dropIndex(["status"]);
    table.dropIndex(["start_time"]);
  });

  await knex.schema.alterTable("contacts", (table: Knex.CreateTableBuilder) => {
    table.dropIndex(["business_id"]);
    table.dropIndex(["created_at"]);
  });
}

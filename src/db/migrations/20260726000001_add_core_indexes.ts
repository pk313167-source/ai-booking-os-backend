import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Services indexes
  await knex.schema.alterTable("services", (table) => {
    table.index(["business_id"]);
    table.index(["category"]);
    table.index(["is_active"]);
  });

  // Customers indexes
  await knex.schema.alterTable("customers", (table) => {
    table.index(["business_id"]);
    table.index(["email"]);
    table.index(["created_at"]);
  });

  // Staff indexes
  await knex.schema.alterTable("staff", (table) => {
    table.index(["business_id"]);
    table.index(["is_active"]);
    table.index(["role"]);
  });

  // Bookings indexes
  await knex.schema.alterTable("bookings", (table) => {
    table.index(["business_id"]);
    table.index(["status"]);
    table.index(["date"]);
    table.index(["customer_id"]);
    table.index(["service_id"]);
    table.index(["staff_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Bookings indexes
  await knex.schema.alterTable("bookings", (table) => {
    table.dropIndex(["staff_id"]);
    table.dropIndex(["service_id"]);
    table.dropIndex(["customer_id"]);
    table.dropIndex(["date"]);
    table.dropIndex(["status"]);
    table.dropIndex(["business_id"]);
  });

  // Staff indexes
  await knex.schema.alterTable("staff", (table) => {
    table.dropIndex(["role"]);
    table.dropIndex(["is_active"]);
    table.dropIndex(["business_id"]);
  });

  // Customers indexes
  await knex.schema.alterTable("customers", (table) => {
    table.dropIndex(["created_at"]);
    table.dropIndex(["email"]);
    table.dropIndex(["business_id"]);
  });

  // Services indexes
  await knex.schema.alterTable("services", (table) => {
    table.dropIndex(["is_active"]);
    table.dropIndex(["category"]);
    table.dropIndex(["business_id"]);
  });
}

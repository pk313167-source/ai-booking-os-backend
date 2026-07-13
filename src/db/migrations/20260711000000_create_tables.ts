import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("businesses", (table) => {
    table.string("id").primary();
    table.string("name", 255);
    table.string("phone", 20);
    table.jsonb("hours_json");
    table.jsonb("faq_json");
    table.string("subscription_tier", 50);
    table.dateTime("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("users", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("email", 255).unique();
    table.string("password_hash", 255);
    table.string("role", 50); // owner, staff
  });

  await knex.schema.createTable("contacts", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("name", 255);
    table.string("phone", 20);
    table.string("email", 255);
    table.text("notes");
    table.dateTime("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("appointments", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
    table.dateTime("start_time");
    table.dateTime("end_time");
    table.string("status", 50); // scheduled, completed, cancelled
  });

  await knex.schema.createTable("chat_messages", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("contact_phone_or_email", 255);
    table.text("message");
    table.string("sender", 50); // customer, ai, staff
    table.dateTime("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("reminder_jobs", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("appointment_id").references("id").inTable("appointments").onDelete("CASCADE");
    table.dateTime("scheduled_for");
    table.string("status", 50); // pending, sent
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reminder_jobs");
  await knex.schema.dropTableIfExists("chat_messages");
  await knex.schema.dropTableIfExists("appointments");
  await knex.schema.dropTableIfExists("contacts");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("businesses");
}

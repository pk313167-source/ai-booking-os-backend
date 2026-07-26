import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Services table
  await knex.schema.createTable("services", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("description");
    table.integer("duration").notNullable().comment("Duration in minutes");
    table.decimal("price", 10, 2).notNullable();
    table.string("category", 100);
    table.boolean("is_active").defaultTo(true);
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
  });

  // Customers table (distinct from contacts for full booking customer profiles)
  await knex.schema.createTable("customers", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.string("email", 255);
    table.string("phone", 20);
    table.text("notes");
    table.integer("total_bookings").defaultTo(0);
    table.dateTime("last_visit");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
  });

  // Staff table
  await knex.schema.createTable("staff", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.string("email", 255);
    table.string("role", 100);
    table.jsonb("specialties");
    table.jsonb("availability");
    table.boolean("is_active").defaultTo(true);
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
  });

  // Bookings table
  await knex.schema.createTable("bookings", (table) => {
    table.string("id").primary();
    table.string("business_id").references("id").inTable("businesses").onDelete("CASCADE");
    table.string("customer_id").references("id").inTable("customers").onDelete("CASCADE");
    table.string("service_id").references("id").inTable("services").onDelete("SET NULL");
    table.string("staff_id").references("id").inTable("staff").onDelete("SET NULL");
    table.date("date").notNullable();
    table.string("time", 10).notNullable();
    table.integer("duration").notNullable().comment("Duration in minutes");
    table.string("status", 50).defaultTo("pending").comment("pending, confirmed, cancelled, completed");
    table.text("notes");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("bookings");
  await knex.schema.dropTableIfExists("staff");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("services");
}

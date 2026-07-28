import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add subscription-related columns to businesses table
  await knex.schema.alterTable("businesses", (table) => {
    table.string("stripe_customer_id", 255);
    table.string("stripe_subscription_id", 255);
    table.dateTime("trial_ends_at");
    table.string("stripe_payment_method_id", 255);
    table.text("last_invoice_id");
    table.string("subscription_status", 50).defaultTo("active");
    table.string("email", 255);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("businesses", (table) => {
    table.dropColumn("stripe_customer_id");
    table.dropColumn("stripe_subscription_id");
    table.dropColumn("trial_ends_at");
    table.dropColumn("stripe_payment_method_id");
    table.dropColumn("last_invoice_id");
    table.dropColumn("subscription_status");
    table.dropColumn("email");
  });
}

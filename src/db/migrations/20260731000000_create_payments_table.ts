import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("payments");
  if (!exists) {
    await knex.schema.createTable("payments", (table) => {
      table.uuid("id").primary();
      table.uuid("business_id").references("id").inTable("businesses");
      table.uuid("user_id");
      table.string("razorpay_order_id", 255);
      table.string("razorpay_payment_id", 255);
      table.string("razorpay_signature", 512);
      table.integer("amount");
      table.string("currency", 10).defaultTo("INR");
      table.string("status", 50).defaultTo("created");
      table.string("plan_id", 100);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Remove Stripe columns if they exist
  const hasStripeCustomerId = await knex.schema.hasColumn("businesses", "stripe_customer_id");
  if (hasStripeCustomerId) {
    await knex.schema.alterTable("businesses", (table) => {
      table.dropColumn("stripe_customer_id");
      table.dropColumn("stripe_subscription_id");
      table.dropColumn("stripe_payment_method_id");
      table.dropColumn("last_invoice_id");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payments");
}

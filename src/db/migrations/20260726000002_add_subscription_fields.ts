import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add subscription-related columns to businesses table (only if they don't exist)
  const columnsToAdd: [string, (table: Knex.AlterTableBuilder) => void][] = [
    ["stripe_customer_id", (table) => table.string("stripe_customer_id", 255)],
    ["stripe_subscription_id", (table) => table.string("stripe_subscription_id", 255)],
    ["trial_ends_at", (table) => table.dateTime("trial_ends_at")],
    ["stripe_payment_method_id", (table) => table.string("stripe_payment_method_id", 255)],
    ["last_invoice_id", (table) => table.text("last_invoice_id")],
    ["subscription_status", (table) => table.string("subscription_status", 50).defaultTo("active")],
    ["email", (table) => table.string("email", 255)],
  ];

  for (const [colName, colDef] of columnsToAdd) {
    const hasCol = await knex.schema.hasColumn("businesses", colName);
    if (!hasCol) {
      await knex.schema.alterTable("businesses", colDef);
    }
  }
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

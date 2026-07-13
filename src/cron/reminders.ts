import cron from "node-cron";
import knex from "../db/knex";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC_dummy";
const authToken = process.env.TWILIO_AUTH_TOKEN || "token_dummy";
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

const client = twilio(accountSid, authToken);

export const initCronJobs = () => {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("Running reminder cron job...");
    const now = new Date();

    try {
      const pendingJobs = await knex("reminder_jobs")
        .where("status", "pending")
        .andWhere("scheduled_for", "<=", now);

      for (const job of pendingJobs) {
        const appointment = await knex("appointments")
          .where({ id: job.appointment_id })
          .first();
        
        if (!appointment || appointment.status === "cancelled") {
          await knex("reminder_jobs").where({ id: job.id }).update({ status: "cancelled" });
          continue;
        }

        const contact = await knex("contacts")
          .where({ id: appointment.contact_id })
          .first();

        const business = await knex("businesses")
          .where({ id: job.business_id })
          .first();

        if (contact && contact.phone) {
          try {
            const message = `Reminder: You have an appointment with ${business.name} at ${new Date(appointment.start_time).toLocaleString()}.`;
            
            // In a real scenario, you'd call Twilio here
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== "AC_dummy") {
                await client.messages.create({
                    body: message,
                    from: twilioPhone,
                    to: contact.phone,
                });
            } else {
                console.log(`[MOCK SMS to ${contact.phone}]: ${message}`);
            }

            await knex("reminder_jobs").where({ id: job.id }).update({ status: "sent" });
          } catch (err) {
            console.error(`Failed to send SMS for job ${job.id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};

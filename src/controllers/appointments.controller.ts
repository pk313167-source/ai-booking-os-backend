import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";
import { Knex } from "knex";

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  const { contactId, startTime, endTime } = req.body;
  const businessId = req.user?.business_id;

  try {
    const id = uuidv4();
    await knex.transaction(async (trx: Knex.Transaction) => {
      await trx("appointments").insert({
        id,
        business_id: businessId,
        contact_id: contactId,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        status: "scheduled",
      });

      // Create reminder jobs (24h and 1h before)
      const start = new Date(startTime);
      const reminder24h = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const reminder1h = new Date(start.getTime() - 60 * 60 * 1000);

      await trx("reminder_jobs").insert([
        {
          id: uuidv4(),
          business_id: businessId,
          appointment_id: id,
          scheduled_for: reminder24h.toISOString(),
          status: "pending",
        },
        {
          id: uuidv4(),
          business_id: businessId,
          appointment_id: id,
          scheduled_for: reminder1h.toISOString(),
          status: "pending",
        },
      ]);
    });

    res.status(201).json({ id, contactId, startTime, endTime });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error });
  }
};

export const listAppointments = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const appointments = await knex("appointments")
      .join("contacts", "appointments.contact_id", "contacts.id")
      .where("appointments.business_id", businessId)
      .select("appointments.*", "contacts.name as contact_name");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error listing appointments", error });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { startTime, endTime, status } = req.body;
  const businessId = req.user?.business_id;

  try {
    await knex.transaction(async (trx: Knex.Transaction) => {
      const updated = await trx("appointments")
        .where({ id, business_id: businessId })
        .update({
          start_time: startTime ? new Date(startTime) : undefined,
          end_time: endTime ? new Date(endTime) : undefined,
          status,
        });

      if (!updated) {
        throw new Error("Appointment not found");
      }

      if (startTime) {
        // Delete existing pending reminders
        await trx("reminder_jobs")
          .where({ appointment_id: id, status: "pending" })
          .delete();

        // Create new reminders
        const start = new Date(startTime);
        const reminder24h = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        const reminder1h = new Date(start.getTime() - 60 * 60 * 1000);

        await trx("reminder_jobs").insert([
          {
            id: uuidv4(),
            business_id: businessId,
            appointment_id: id,
            scheduled_for: reminder24h.toISOString(),
            status: "pending",
          },
          {
            id: uuidv4(),
            business_id: businessId,
            appointment_id: id,
            scheduled_for: reminder1h.toISOString(),
            status: "pending",
          },
        ]);
      }
    });

    res.json({ message: "Appointment updated successfully" });
  } catch (error: any) {
    if (error.message === "Appointment not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

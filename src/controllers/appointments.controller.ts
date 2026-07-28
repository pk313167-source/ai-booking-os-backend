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

    // Fetch the created appointment with contact name
    const appointment = await knex("appointments")
      .join("contacts", "appointments.contact_id", "contacts.id")
      .where("appointments.id", id)
      .select("appointments.*", "contacts.name as contact_name")
      .first();

    res.status(201).json({
      id: appointment.id,
      contactId: appointment.contact_id,
      contactName: appointment.contact_name,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
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

    // Map to camelCase for frontend
    const mapped = appointments.map((appt: any) => ({
      id: appt.id,
      contactId: appt.contact_id,
      contactName: appt.contact_name,
      startTime: appt.start_time,
      endTime: appt.end_time,
      status: appt.status,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Error listing appointments:", error);
    res.status(500).json({ message: "Error listing appointments", error });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { startTime, endTime, status } = req.body;
  const businessId = req.user?.business_id;

  try {
    const appointment = await knex("appointments")
      .where({ id, business_id: businessId })
      .first();

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await knex.transaction(async (trx: Knex.Transaction) => {
      const updateData: any = {};
      if (startTime) updateData.start_time = new Date(startTime);
      if (endTime) updateData.end_time = new Date(endTime);
      if (status) updateData.status = status;

      if (Object.keys(updateData).length > 0) {
        await trx("appointments")
          .where({ id, business_id: businessId })
          .update(updateData);
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

    // Return the updated appointment
    const updated = await knex("appointments")
      .join("contacts", "appointments.contact_id", "contacts.id")
      .where("appointments.id", id)
      .select("appointments.*", "contacts.name as contact_name")
      .first();

    res.json({
      id: updated.id,
      contactId: updated.contact_id,
      contactName: updated.contact_name,
      startTime: updated.start_time,
      endTime: updated.end_time,
      status: updated.status,
    });
  } catch (error: any) {
    if (error.message === "Appointment not found") {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

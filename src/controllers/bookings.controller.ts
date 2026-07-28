import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from "./notifications.controller";

export const createBooking = async (req: AuthRequest, res: Response) => {
  const { customerId, serviceId, staffId, date, time, duration, status, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    // Validation
    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }
    if (!time) {
      return res.status(400).json({ message: "time is required" });
    }
    if (duration === undefined || duration === null || duration <= 0) {
      return res.status(400).json({ message: "duration must be a positive number" });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Verify customer belongs to this business
    const customer = await knex("customers")
      .where({ id: customerId, business_id: businessId })
      .first();
    if (!customer) {
      return res.status(404).json({ message: "Customer not found in your business" });
    }

    // Verify service belongs to this business (if provided)
    if (serviceId) {
      const service = await knex("services")
        .where({ id: serviceId, business_id: businessId })
        .first();
      if (!service) {
        return res.status(404).json({ message: "Service not found in your business" });
      }
    }

    // Verify staff belongs to this business (if provided)
    if (staffId) {
      const staff = await knex("staff")
        .where({ id: staffId, business_id: businessId })
        .first();
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found in your business" });
      }
    }

    // Double-booking check: if staff is assigned, check for conflicts
    if (staffId) {
      const conflictingBooking = await knex("bookings")
        .where({
          business_id: businessId,
          staff_id: staffId,
          date,
        })
        .whereNot({ status: "cancelled" })
        .first();

      if (conflictingBooking) {
        const existingStart = timeToMinutes(conflictingBooking.time);
        const existingEnd = existingStart + conflictingBooking.duration;
        const newStart = timeToMinutes(time);
        const newEnd = newStart + duration;

        if (newStart < existingEnd && newEnd > existingStart) {
          return res.status(409).json({
            message: "Double booking conflict: staff member already has a booking at this time",
            conflictingBooking,
          });
        }
      }
    }

    const id = uuidv4();
    const bookingStatus = status || "pending";

    await knex("bookings").insert({
      id,
      business_id: businessId,
      customer_id: customerId,
      service_id: serviceId || null,
      staff_id: staffId || null,
      date,
      time,
      duration,
      status: bookingStatus,
      notes: notes || null,
    });

    // Update customer's total bookings and last visit
    await knex("customers")
      .where({ id: customerId })
      .update({
        total_bookings: knex.raw("total_bookings + 1"),
        last_visit: new Date(),
      });

    // Enrich and return
    const booking = await knex("bookings").where({ id }).first();
    const enriched = enrichBooking(booking);

    // Send booking confirmation email (non-blocking)
    if (customer.email) {
      const serviceName = serviceId 
        ? await knex("services").where({ id: serviceId }).select("name").first().then((s: any) => s?.name || undefined)
        : undefined;
      sendBookingConfirmationEmail(
        businessId,
        customer.email,
        customer.name,
        date,
        time,
        serviceName
      ).catch(err => {
        console.error("Failed to send booking confirmation email:", err);
      });
    }

    res.status(201).json(enriched);
  } catch (error: any) {
    console.error("Error creating booking:", error?.message || error);
    res.status(500).json({ message: "Error creating booking" });
  }
};

export const listBookings = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;
  const { status, date, customerId } = req.query;

  try {
    let query = knex("bookings").where("business_id", businessId);

    if (status) {
      query = query.where("status", status);
    }
    if (date) {
      query = query.where("date", date);
    }
    if (customerId) {
      query = query.where("customer_id", customerId);
    }

    query = query.orderBy("date", "desc").orderBy("time", "desc");

    const bookings = await query;
    const enriched = bookings.map(enrichBooking);

    res.json(enriched);
  } catch (error: any) {
    console.error("Error listing bookings:", error?.message || error);
    res.status(500).json({ message: "Error listing bookings" });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const booking = await knex("bookings")
      .where({ id, business_id: businessId })
      .first();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(enrichBooking(booking));
  } catch (error: any) {
    console.error("Error getting booking:", error?.message || error);
    res.status(500).json({ message: "Error getting booking" });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { customerId, serviceId, staffId, date, time, duration, status, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    const existing = await knex("bookings")
      .where({ id, business_id: businessId })
      .first();

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate date if changing
    if (date) {
      const bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
    }

    // Validate duration if changing
    if (duration !== undefined && duration <= 0) {
      return res.status(400).json({ message: "duration must be a positive number" });
    }

    // Double-booking check if staff or date/time changes
    const newStaffId = staffId || existing.staff_id;
    const newDate = date || existing.date;
    const newTime = time || existing.time;
    const newDuration = duration || existing.duration;

    if (newStaffId) {
      const conflictingBooking = await knex("bookings")
        .where({
          business_id: businessId,
          staff_id: newStaffId,
          date: newDate,
        })
        .whereNot({ id })
        .whereNot({ status: "cancelled" })
        .first();

      if (conflictingBooking) {
        const existingStart = timeToMinutes(conflictingBooking.time);
        const existingEnd = existingStart + conflictingBooking.duration;
        const newStart = timeToMinutes(newTime);
        const newEnd = newStart + newDuration;

        if (newStart < existingEnd && newEnd > existingStart) {
          return res.status(409).json({
            message: "Double booking conflict: staff member already has a booking at this time",
            conflictingBooking,
          });
        }
      }
    }

    const updateData: any = { updated_at: knex.fn.now() };
    if (customerId !== undefined) updateData.customer_id = customerId;
    if (serviceId !== undefined) updateData.service_id = serviceId;
    if (staffId !== undefined) updateData.staff_id = staffId;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await knex("bookings")
      .where({ id, business_id: businessId })
      .update(updateData);

    const updated = await knex("bookings").where({ id }).first();
    // Send cancellation email if status changed to cancelled
    if (status === "cancelled" && existing.status !== "cancelled") {
      const customer = await knex("customers").where({ id: existing.customer_id }).first();
      if (customer?.email) {
        sendBookingCancellationEmail(
          businessId,
          customer.email,
          customer.name,
          newDate,
          newTime
        ).catch(err => {
          console.error("Failed to send cancellation email:", err);
        });
      }
    }

    res.json(enrichBooking(updated));
  } catch (error: any) {
    console.error("Error updating booking:", error?.message || error);
    res.status(500).json({ message: "Error updating booking" });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const booking = await knex("bookings")
      .where({ id, business_id: businessId })
      .first();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await knex("bookings").where({ id, business_id: businessId }).del();

    // Decrement customer's total bookings
    if (booking.customer_id) {
      await knex("customers")
        .where({ id: booking.customer_id })
        .update({
          total_bookings: knex.raw("GREATEST(total_bookings - 1, 0)"),
        });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting booking:", error?.message || error);
    res.status(500).json({ message: "Error deleting booking" });
  }
};

// Helper: enrich booking with related data
async function enrichBooking(booking: any) {
  if (!booking) return booking;
  const enriched = { ...booking };
  if (booking.customer_id) {
    const customer = await knex("customers").where({ id: booking.customer_id }).first();
    enriched.customer_name = customer?.name || null;
  }
  if (booking.service_id) {
    const service = await knex("services").where({ id: booking.service_id }).first();
    enriched.service_name = service?.name || null;
  }
  if (booking.staff_id) {
    const staff = await knex("staff").where({ id: booking.staff_id }).first();
    enriched.staff_name = staff?.name || null;
  }
  return enriched;
}

// Helper: convert HH:MM to minutes from midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

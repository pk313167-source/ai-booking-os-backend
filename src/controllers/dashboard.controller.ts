import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    // Get user info for business name
    const user = await knex("users")
      .join("businesses", "users.business_id", "businesses.id")
      .where("users.id", req.user?.id)
      .select("businesses.name as business_name")
      .first();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total contacts
    const totalContactsResult = await knex("contacts")
      .where({ business_id: businessId })
      .count("id as count")
      .first();
    const totalContacts = parseInt((totalContactsResult?.count as string) || "0");

    // Upcoming appointments (today onwards)
    const upcomingAppointmentsResult = await knex("appointments")
      .where({ business_id: businessId })
      .where("start_time", ">=", today.toISOString())
      .count("id as count")
      .first();
    const upcomingAppointments = parseInt((upcomingAppointmentsResult?.count as string) || "0");

    // Total appointments
    const totalAppointmentsResult = await knex("appointments")
      .where({ business_id: businessId })
      .count("id as count")
      .first();
    const totalAppointments = parseInt((totalAppointmentsResult?.count as string) || "0");

    // Total messages
    const totalMessagesResult = await knex("chat_messages")
      .where({ business_id: businessId })
      .count("id as count")
      .first();
    const totalMessages = parseInt((totalMessagesResult?.count as string) || "0");

    // Today's appointments
    const appointments = await knex("appointments")
      .join("contacts", "appointments.contact_id", "contacts.id")
      .where({ "appointments.business_id": businessId })
      .whereBetween("start_time", [today.toISOString(), tomorrow.toISOString()])
      .select("appointments.*", "contacts.name as contact_name");

    // Recent activity (last 10 chat messages + appointments)
    const recentChats = await knex("chat_messages")
      .where({ business_id: businessId })
      .orderBy("created_at", "desc")
      .limit(5);

    const recentActivity = [
      ...recentChats.map((m: any) => ({
        type: "message",
        content: m.message,
        timestamp: m.created_at,
        sender: m.sender,
      })),
      ...appointments.map((a: any) => ({
        type: "appointment",
        content: `Appointment with ${a.contact_name || "Unknown"}`,
        timestamp: a.start_time,
        status: a.status,
      })),
    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    res.json({
      businessName: user?.business_name || "",
      totalContacts,
      upcomingAppointments,
      totalAppointments,
      totalMessages,
      appointments: appointments.map((a: any) => ({
        id: a.id,
        contactId: a.contact_id,
        contactName: a.contact_name,
        startTime: a.start_time,
        endTime: a.end_time,
        status: a.status,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

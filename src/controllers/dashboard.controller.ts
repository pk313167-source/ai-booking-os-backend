import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await knex("appointments")
      .where({ business_id: businessId })
      .whereBetween("start_time", [today, tomorrow])
      .select("*");

    const pendingChats = await knex("chat_messages")
      .where({ business_id: businessId, sender: "customer" })
      .orderBy("created_at", "desc")
      .limit(10);

    res.json({ appointments, pendingChats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

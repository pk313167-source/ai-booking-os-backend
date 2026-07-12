import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";

export const saveSettings = async (req: AuthRequest, res: Response) => {
  const { faq, hours } = req.body;
  const businessId = req.user?.business_id;

  try {
    await knex("businesses")
      .where({ id: businessId })
      .update({
        faq_json: faq,
        hours_json: hours,
      });

    res.json({ message: "Settings saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving settings", error });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const settings = await knex("businesses")
      .where({ id: businessId })
      .select("name", "phone", "hours_json", "faq_json", "subscription_tier")
      .first();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings", error });
  }
};

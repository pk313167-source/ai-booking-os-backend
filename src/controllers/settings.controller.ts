import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";

export const saveSettings = async (req: AuthRequest, res: Response) => {
  const { businessName, phone, faq, hours } = req.body;
  const businessId = req.user?.business_id;

  try {
    const updateData: any = {};
    if (businessName !== undefined) updateData.name = businessName;
    if (phone !== undefined) updateData.phone = phone;
    if (faq !== undefined) updateData.faq_json = faq;
    if (hours !== undefined) updateData.hours_json = hours;

    await knex("businesses")
      .where({ id: businessId })
      .update(updateData);

    res.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ message: "Error saving settings", error });
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const business = await knex("businesses")
      .where({ id: businessId })
      .select("name", "phone", "hours_json", "faq_json", "subscription_tier", "created_at")
      .first();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Get user email
    const user = await knex("users")
      .where({ business_id: businessId })
      .select("email")
      .first();

    res.json({
      businessName: business.name || "",
      email: user?.email || "",
      phone: business.phone || "",
      hours: business.hours_json || {},
      faq: business.faq_json || {},
      subscriptionTier: business.subscription_tier || "free",
      createdAt: business.created_at || null,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings", error });
  }
};

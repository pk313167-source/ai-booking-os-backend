import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";
import knex from "../db/knex";

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await knex("users")
      .join("businesses", "users.business_id", "businesses.id")
      .where("users.id", userId)
      .select(
        "users.id",
        "users.email",
        "users.role",
        "businesses.id as business_id",
        "businesses.name as business_name",
        "businesses.phone as business_phone",
        "businesses.subscription_tier"
      )
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Error getting profile", error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { email, businessName, businessPhone, password } = req.body;

  try {
    const user = await knex("users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingEmail = await knex("users").where({ email }).first();
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await knex("users").where({ id: userId }).update(updateData);
    }

    // Update business info
    const businessUpdate: any = {};
    if (businessName !== undefined) businessUpdate.name = businessName;
    if (businessPhone !== undefined) businessUpdate.phone = businessPhone;

    if (Object.keys(businessUpdate).length > 0) {
      await knex("businesses").where({ id: user.business_id }).update(businessUpdate);
    }

    // Return updated profile
    const updatedUser = await knex("users")
      .join("businesses", "users.business_id", "businesses.id")
      .where("users.id", userId)
      .select(
        "users.id",
        "users.email",
        "users.role",
        "businesses.id as business_id",
        "businesses.name as business_name",
        "businesses.phone as business_phone",
        "businesses.subscription_tier"
      )
      .first();

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

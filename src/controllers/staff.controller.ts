import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";

export const createStaff = async (req: AuthRequest, res: Response) => {
  const { name, email, role, specialties, availability, isActive } = req.body;
  const businessId = req.user?.business_id;

  try {
    const id = uuidv4();
    await knex("staff").insert({
      id,
      business_id: businessId,
      name,
      email: email || null,
      role: role || null,
      specialties: specialties ? JSON.stringify(specialties) : null,
      availability: availability ? JSON.stringify(availability) : null,
      is_active: isActive !== undefined ? isActive : true,
    });

    const staff = await knex("staff").where({ id }).first();
    res.status(201).json(staff);
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: "Error creating staff member", error });
  }
};

export const listStaff = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const staffList = await knex("staff")
      .where("business_id", businessId)
      .orderBy("created_at", "desc");
    res.json(staffList);
  } catch (error) {
    console.error("Error listing staff:", error);
    res.status(500).json({ message: "Error listing staff", error });
  }
};

export const getStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const staff = await knex("staff")
      .where({ id, business_id: businessId })
      .first();

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Parse JSON fields
    const parsed = {
      ...staff,
      specialties: staff.specialties ? JSON.parse(staff.specialties) : [],
      availability: staff.availability ? JSON.parse(staff.availability) : {},
    };

    res.json(parsed);
  } catch (error) {
    console.error("Error getting staff:", error);
    res.status(500).json({ message: "Error getting staff member", error });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, role, specialties, availability, isActive } = req.body;
  const businessId = req.user?.business_id;

  try {
    const existing = await knex("staff")
      .where({ id, business_id: businessId })
      .first();

    if (!existing) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const updateData: any = { updated_at: knex.fn.now() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (specialties !== undefined) updateData.specialties = JSON.stringify(specialties);
    if (availability !== undefined) updateData.availability = JSON.stringify(availability);
    if (isActive !== undefined) updateData.is_active = isActive;

    await knex("staff")
      .where({ id, business_id: businessId })
      .update(updateData);

    const updated = await knex("staff").where({ id }).first();
    const parsed = {
      ...updated,
      specialties: updated.specialties ? JSON.parse(updated.specialties) : [],
      availability: updated.availability ? JSON.parse(updated.availability) : {},
    };

    res.json(parsed);
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Error updating staff member", error });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const deleted = await knex("staff")
      .where({ id, business_id: businessId })
      .del();

    if (!deleted) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Error deleting staff member", error });
  }
};

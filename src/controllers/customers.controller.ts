import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";

export const createCustomer = async (req: AuthRequest, res: Response) => {
  const { name, email, phone, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    if (email) {
      const existing = await knex("customers")
        .where({ email, business_id: businessId })
        .first();
      if (existing) {
        return res.status(400).json({ message: "A customer with this email already exists in your business" });
      }
    }

    const id = uuidv4();
    await knex("customers").insert({
      id,
      business_id: businessId,
      name,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      total_bookings: 0,
    });

    const customer = await knex("customers").where({ id }).first();
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Error creating customer", error });
  }
};

export const listCustomers = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const customers = await knex("customers")
      .where("business_id", businessId)
      .orderBy("created_at", "desc");
    res.json(customers);
  } catch (error) {
    console.error("Error listing customers:", error);
    res.status(500).json({ message: "Error listing customers", error });
  }
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const customer = await knex("customers")
      .where({ id, business_id: businessId })
      .first();

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error getting customer:", error);
    res.status(500).json({ message: "Error getting customer", error });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    const existing = await knex("customers")
      .where({ id, business_id: businessId })
      .first();

    if (!existing) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const emailExists = await knex("customers")
        .where({ email, business_id: businessId })
        .whereNot({ id })
        .first();
      if (emailExists) {
        return res.status(400).json({ message: "A customer with this email already exists" });
      }
    }

    const updateData: any = { updated_at: knex.fn.now() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;

    await knex("customers")
      .where({ id, business_id: businessId })
      .update(updateData);

    const updated = await knex("customers").where({ id }).first();
    res.json(updated);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error updating customer", error });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const deleted = await knex("customers")
      .where({ id, business_id: businessId })
      .del();

    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error });
  }
};

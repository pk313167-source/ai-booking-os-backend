import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";

export const addContact = async (req: AuthRequest, res: Response) => {
  const { name, phone, email, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    const id = uuidv4();
    await knex("contacts").insert({
      id,
      business_id: businessId,
      name,
      phone,
      email: email || null,
      notes: notes || null,
      created_at: new Date(),
    });

    res.status(201).json({ id, name, phone, email: email || null });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Error adding contact", error });
  }
};

export const listContacts = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const contacts = await knex("contacts")
      .where({ business_id: businessId })
      .orderBy("created_at", "desc");
    res.json(contacts);
  } catch (error) {
    console.error("Error listing contacts:", error);
    res.status(500).json({ message: "Error listing contacts", error });
  }
};

export const editContact = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    const existing = await knex("contacts")
      .where({ id, business_id: businessId })
      .first();

    if (!existing) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (notes !== undefined) updateData.notes = notes;

    await knex("contacts")
      .where({ id, business_id: businessId })
      .update(updateData);

    const updated = await knex("contacts")
      .where({ id })
      .first();

    res.json(updated);
  } catch (error) {
    console.error("Error editing contact:", error);
    res.status(500).json({ message: "Error editing contact", error });
  }
};

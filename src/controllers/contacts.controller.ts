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
      email,
      notes,
      created_at: new Date(),
    });

    res.status(201).json({ id, name, phone, email });
  } catch (error) {
    res.status(500).json({ message: "Error adding contact", error });
  }
};

export const listContacts = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const contacts = await knex("contacts").where({ business_id: businessId });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error listing contacts", error });
  }
};

export const editContact = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, notes } = req.body;
  const businessId = req.user?.business_id;

  try {
    const updated = await knex("contacts")
      .where({ id, business_id: businessId })
      .update({ name, phone, email, notes });

    if (!updated) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating contact", error });
  }
};

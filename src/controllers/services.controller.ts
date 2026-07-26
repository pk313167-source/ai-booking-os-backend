import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";

export const createService = async (req: AuthRequest, res: Response) => {
  const { name, description, duration, price, category, isActive } = req.body;
  const businessId = req.user?.business_id;

  try {
    if (duration !== undefined && duration <= 0) {
      return res.status(400).json({ message: "Duration must be a positive number" });
    }
    if (price !== undefined && parseFloat(price) <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const id = uuidv4();
    await knex("services").insert({
      id,
      business_id: businessId,
      name,
      description: description || null,
      duration,
      price,
      category: category || null,
      is_active: isActive !== undefined ? isActive : true,
    });

    const service = await knex("services").where({ id }).first();
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error creating service", error });
  }
};

export const listServices = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const services = await knex("services")
      .where("business_id", businessId)
      .orderBy("created_at", "desc");
    res.json(services);
  } catch (error) {
    console.error("Error listing services:", error);
    res.status(500).json({ message: "Error listing services", error });
  }
};

export const getService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const service = await knex("services")
      .where({ id, business_id: businessId })
      .first();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error getting service:", error);
    res.status(500).json({ message: "Error getting service", error });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, duration, price, category, isActive } = req.body;
  const businessId = req.user?.business_id;

  try {
    if (duration !== undefined && duration <= 0) {
      return res.status(400).json({ message: "Duration must be a positive number" });
    }
    if (price !== undefined && parseFloat(price) <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const existing = await knex("services")
      .where({ id, business_id: businessId })
      .first();

    if (!existing) {
      return res.status(404).json({ message: "Service not found" });
    }

    const updateData: any = {
      updated_at: knex.fn.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.is_active = isActive;

    await knex("services")
      .where({ id, business_id: businessId })
      .update(updateData);

    const updated = await knex("services").where({ id }).first();
    res.json(updated);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error updating service", error });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.user?.business_id;

  try {
    const deleted = await knex("services")
      .where({ id, business_id: businessId })
      .del();

    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Error deleting service", error });
  }
};

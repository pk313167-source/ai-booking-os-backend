import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";
import { Knex } from "knex";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response) => {
  const { email, password, businessName } = req.body;

  try {
    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const businessId = uuidv4();
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await knex.transaction(async (trx: Knex.Transaction) => {
      await trx("businesses").insert({
        id: businessId,
        name: businessName,
        subscription_tier: "free",
        created_at: new Date(),
      });

      await trx("users").insert({
        id: userId,
        business_id: businessId,
        email,
        password_hash: passwordHash,
        role: "owner",
      });
    });

    const token = jwt.sign({ id: userId, business_id: businessId, role: "owner" }, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({ token, userId, businessId });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, business_id: user.business_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, userId: user.id, businessId: user.business_id });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

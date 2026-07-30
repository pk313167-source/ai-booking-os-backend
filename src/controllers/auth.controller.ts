import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";
import { Knex } from "knex";
import { 
  sendWelcomeEmail, 
  sendEmailVerificationEmail, 
  sendPasswordResetEmail 
} from "../controllers/notifications.controller";

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ai-booking-os-frontend.vercel.app";

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await knex("users").where({ id: userId }).update({
      verification_token: verificationToken
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(businessName, email).catch(err => {
      console.error("Failed to send welcome email:", err);
    });

    // Send verification email (non-blocking)
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    sendEmailVerificationEmail(email, verificationUrl).catch(err => {
      console.error("Failed to send verification email:", err);
    });

    res.status(201).json({
      message: "User created successfully. Please check your email to verify your account.",
      token,
      userId,
      businessId,
      email,
      businessName,
    });
  } catch (error: any) {
    console.error("Signup error:", error?.message || error);
    res.status(500).json({ message: "Error creating user" });
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

    // Get business info
    const business = await knex("businesses")
      .where({ id: user.business_id })
      .select("name", "subscription_tier")
      .first();

    const token = jwt.sign(
      { id: user.id, business_id: user.business_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      userId: user.id,
      businessId: user.business_id,
      email: user.email,
      businessName: business?.name || "",
      subscriptionTier: business?.subscription_tier || "free",
      isVerified: !!user.is_verified,
    });
  } catch (error: any) {
    console.error("Login error:", error?.message || error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const user = await knex("users").where({ verification_token: token }).first();

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await knex("users").where({ id: user.id }).update({
      is_verified: true,
      verification_token: null,
    });

    res.json({ message: "Email verified successfully" });
  } catch (error: any) {
    console.error("Verification error:", error?.message || error);
    res.status(500).json({ message: "Error during email verification" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await knex("users").where({ email }).first();

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If an account with that email exists, we have sent a password reset link." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await knex("users").where({ id: user.id }).update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpires,
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ message: "If an account with that email exists, we have sent a password reset link." });
  } catch (error: any) {
    console.error("Forgot password error:", error?.message || error);
    res.status(500).json({ message: "Error during forgot password request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const user = await knex("users")
      .where({ reset_password_token: token })
      .andWhere("reset_password_expires", ">", new Date())
      .first();

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await knex("users").where({ id: user.id }).update({
      password_hash: passwordHash,
      reset_password_token: null,
      reset_password_expires: null,
    });

    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset password error:", error?.message || error);
    res.status(500).json({ message: "Error during password reset" });
  }
};

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";
import { sendEmail, templates } from "../services/email.service";

export const testEmail = async (req: AuthRequest, res: Response) => {
  const { to } = req.body;
  const userId = req.user?.id;
  const businessId = req.user?.business_id;

  try {
    const user = await knex("users").where({ id: userId }).first();
    const emailTo = to || user?.email;

    if (!emailTo) {
      return res.status(400).json({ message: "Email address required" });
    }

    const template = templates.testEmail();
    template.to = emailTo;

    const sent = await sendEmail(template);

    if (sent) {
      res.json({
        message: "Test email sent successfully",
        to: emailTo,
      });
    } else {
      res.status(500).json({ message: "Failed to send test email" });
    }
  } catch (error: any) {
    console.error("Test email error:", error?.message || error);
    res.status(500).json({ message: "Error sending test email" });
  }
};

export const sendBookingConfirmationEmail = async (
  businessId: string | undefined,
  customerEmail: string,
  customerName: string,
  bookingDate: string,
  bookingTime: string,
  serviceName?: string
) => {
  try {
    const template = templates.bookingConfirmation(
      customerName,
      bookingDate,
      bookingTime,
      serviceName
    );
    template.to = customerEmail;
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending booking confirmation email:", error?.message || error);
    return false;
  }
};

export const sendBookingCancellationEmail = async (
  businessId: string | undefined,
  customerEmail: string,
  customerName: string,
  bookingDate: string,
  bookingTime: string
) => {
  try {
    const template = templates.bookingCancellation(
      customerName,
      bookingDate,
      bookingTime
    );
    template.to = customerEmail;
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending booking cancellation email:", error?.message || error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  businessName: string,
  email: string
) => {
  try {
    const template = templates.welcome(businessName, email);
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending welcome email:", error?.message || error);
    return false;
  }
};

export const sendPaymentReceiptEmail = async (
  businessName: string,
  email: string,
  planName: string,
  amount: string
) => {
  try {
    const template = templates.paymentReceipt(businessName, planName, amount);
    template.to = email;
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending payment receipt email:", error?.message || error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    const template = templates.passwordReset(email, resetUrl);
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error?.message || error);
    return false;
  }
};

export const sendEmailVerificationEmail = async (
  email: string,
  verificationUrl: string
) => {
  try {
    const template = templates.emailVerification(email, verificationUrl);
    await sendEmail(template);
    return true;
  } catch (error: any) {
    console.error("Error sending email verification email:", error?.message || error);
    return false;
  }
};

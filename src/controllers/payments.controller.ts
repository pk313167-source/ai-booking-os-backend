import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";
import {
  getPlan,
  getAllPlans,
  createOrder,
  verifyPaymentSignature,
} from "../services/razorpay.service";
import { sendPaymentReceiptEmail } from "./notifications.controller";

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = getAllPlans();
    res.json(plans);
  } catch (error: any) {
    console.error("Error fetching plans:", error?.message || error);
    res.status(500).json({ message: "Error fetching plans" });
  }
};

export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
  const { planId } = req.body;
  const userId = req.user?.id;
  const businessId = req.user?.business_id;

  try {
    const plan = getPlan(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Free trial doesn't need payment
    if (plan.price === 0) {
      await knex("businesses").where({ id: businessId }).update({
        subscription_tier: "starter",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      return res.json({
        message: "Free trial activated",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    const receipt = `rcpt_${businessId}_${Date.now()}`.substring(0, 40);
    const order = await createOrder(plan.price, "INR", receipt, {
      business_id: businessId as string,
      plan_id: planId,
      user_id: userId as string,
    });

    // Save order to payment history
    await knex("payments").insert({
      id: require("uuid").v4(),
      business_id: businessId,
      user_id: userId,
      razorpay_order_id: order.id,
      amount: plan.price,
      currency: "INR",
      status: "created",
      plan_id: planId,
      created_at: new Date(),
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
    });
  } catch (error: any) {
    console.error("Error creating payment order:", error?.message || error);
    res.status(500).json({ message: "Error creating payment order" });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user?.id;
  const businessId = req.user?.business_id;

  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Update payment status to failed
      await knex("payments")
        .where({ razorpay_order_id })
        .update({ status: "failed", updated_at: new Date() });

      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Get the payment record
    const payment = await knex("payments")
      .where({ razorpay_order_id })
      .first();

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update payment record
    await knex("payments")
      .where({ razorpay_order_id })
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        updated_at: new Date(),
      });

    // Update business subscription
    const plan = getPlan(payment.plan_id);
    await knex("businesses")
      .where({ id: businessId })
      .update({
        subscription_tier: payment.plan_id,
        subscription_status: "active",
        trial_ends_at: null,
      });

    // Send payment receipt email
    const user = await knex("users").where({ id: userId }).first();
    if (user?.email && plan) {
      sendPaymentReceiptEmail(
        user.email,
        user.email,
        plan.name,
        `₹${(payment.amount / 100).toFixed(2)}`
      ).catch((err: any) => {
        console.error("Failed to send payment receipt:", err);
      });
    }

    res.json({
      message: "Payment verified successfully",
      subscription: payment.plan_id,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error?.message || error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const business = await knex("businesses")
      .where({ id: businessId })
      .select("subscription_tier", "subscription_status", "trial_ends_at")
      .first();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Get latest payment
    const latestPayment = await knex("payments")
      .where({ business_id: businessId, status: "paid" })
      .orderBy("created_at", "desc")
      .first();

    res.json({
      tier: business.subscription_tier,
      status: business.subscription_status,
      trialEndsAt: business.trial_ends_at,
      lastPayment: latestPayment
        ? {
            amount: latestPayment.amount,
            currency: latestPayment.currency,
            date: latestPayment.created_at,
            planId: latestPayment.plan_id,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error fetching subscription status:", error?.message || error);
    res.status(500).json({ message: "Error fetching subscription status" });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const payments = await knex("payments")
      .where({ business_id: businessId })
      .orderBy("created_at", "desc")
      .limit(20);

    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching payment history:", error?.message || error);
    res.status(500).json({ message: "Error fetching payment history" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  // Razorpay webhook handler
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";

  try {
    const shasum = require("crypto")
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const expectedSignature = req.headers["x-razorpay-signature"];

    if (expectedSignature && shasum !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;
    const eventType = event.event;

    if (eventType === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const orderId = payment.order_id;
        await knex("payments")
          .where({ razorpay_order_id: orderId })
          .update({
            razorpay_payment_id: payment.id,
            status: "paid",
            updated_at: new Date(),
          });
      }
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        await knex("payments")
          .where({ razorpay_order_id: payment.order_id })
          .update({
            status: "failed",
            updated_at: new Date(),
          });
      }
    }

    res.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error("Webhook error:", error?.message || error);
    res.status(500).json({ message: "Webhook processing error" });
  }
};

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import knex from "../db/knex";
import {
  getPlan,
  getAllPlans,
  PLANS,
  createStripeCheckoutSession,
} from "../services/stripe.service";
import { sendPaymentReceiptEmail } from "./notifications.controller";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://ai-booking-os-frontend.vercel.app";

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = getAllPlans();
    res.json(plans);
  } catch (error: any) {
    console.error("Error fetching plans:", error?.message || error);
    res.status(500).json({ message: "Error fetching plans" });
  }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  const { planId } = req.body;
  const userId = req.user?.id;
  const businessId = req.user?.business_id;

  try {
    const plan = getPlan(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Free trial doesn't need Stripe checkout
    if (plan.price === 0) {
      // Update business to trial
      await knex("businesses").where({ id: businessId }).update({
        subscription_tier: "starter",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      // Send welcome/trial email
      const user = await knex("users").where({ id: userId }).first();
      if (user?.email) {
        sendPaymentReceiptEmail(
          plan.name,
          user.email,
          plan.name,
          "Free"
        ).catch(err => {
          console.error("Failed to send trial email:", err);
        });
      }

      return res.json({
        message: "Free trial activated",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    const priceId = (plan as any).stripePriceId;
    if (!priceId) {
      return res.status(400).json({ message: "Plan pricing not configured" });
    }

    const session = await createStripeCheckoutSession(
      priceId,
      `${FRONTEND_URL}/settings?upgrade=success`,
      `${FRONTEND_URL}/settings?upgrade=cancelled`,
    );

    res.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error?.message || error);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // If no webhook secret configured, accept the event (for development)
    if (!webhookSecret) {
      console.log("No webhook secret configured, accepting event directly");
    }

    // Parse the event
    let event;
    try {
      const { stripe } = require("../services/stripe.service");
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const result = await (
      require("../services/stripe.service").handleWebhookEvent
    )(event);

    // Process the event based on type
    if (result.type === "checkout_completed") {
      const subscriptionId = result.subscriptionId;
      if (subscriptionId) {
        await knex("businesses")
          .whereNotNull("id")
          .limit(1)
          .update({
            subscription_tier: "professional",
            stripe_subscription_id: subscriptionId,
          });
      }
    } else if (result.type === "subscription_cancelled") {
      await knex("businesses")
        .where({ stripe_subscription_id: result.subscriptionId })
        .update({
          subscription_tier: "free",
          stripe_subscription_id: null,
        });
    } else if (result.type === "subscription_updated") {
      const statusMap: Record<string, string> = {
        active: "professional",
        trialing: "starter",
        past_due: "professional",
        canceled: "free",
        incomplete: "free",
        unpaid: "free",
      };
      const tier = statusMap[result.status] || "free";
      await knex("businesses")
        .where({ stripe_subscription_id: result.subscriptionId })
        .update({
          subscription_tier: tier,
        });
    }

    res.json({ received: true, type: result.type });
  } catch (error: any) {
    console.error("Webhook error:", error?.message || error);
    res.status(500).json({ message: "Webhook processing error" });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const business = await knex("businesses")
      .where({ id: businessId })
      .select("subscription_tier", "stripe_subscription_id", "trial_ends_at")
      .first();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let stripeStatus = null;
    if (business.stripe_subscription_id) {
      try {
        const { getStripeSubscriptionStatus } = require("../services/stripe.service");
        stripeStatus = await getStripeSubscriptionStatus(business.stripe_subscription_id);
      } catch (error: any) {
        console.error("Error fetching Stripe subscription:", error?.message || error);
      }
    }

    res.json({
      tier: business.subscription_tier,
      stripeSubscriptionId: business.stripe_subscription_id,
      trialEndsAt: business.trial_ends_at,
      stripeStatus,
    });
  } catch (error: any) {
    console.error("Error fetching subscription status:", error?.message || error);
    res.status(500).json({ message: "Error fetching subscription status" });
  }
};

export const getBillingPortal = async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.business_id;

  try {
    const business = await knex("businesses")
      .where({ id: businessId })
      .select("stripe_customer_id")
      .first();

    if (!business?.stripe_customer_id) {
      return res.status(400).json({ message: "No billing portal available" });
    }

    const { stripe } = require("../services/stripe.service");
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: business.stripe_customer_id,
      return_url: `${FRONTEND_URL}/settings`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Error creating billing portal:", error?.message || error);
    res.status(500).json({ message: "Error creating billing portal" });
  }
};

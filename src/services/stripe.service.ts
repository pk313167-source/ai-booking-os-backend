import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Subscription plans configuration
export const PLANS = {
  free_trial: {
    id: "free_trial",
    name: "Free Trial",
    description: "14-day free trial with full access",
    price: 0,
    interval: "trial",
    trialDays: 14,
    features: [
      "Full access to all features",
      "AI chat assistant",
      "Booking management",
      "Contact management",
      "14-day trial period",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter Plan",
    description: "Perfect for small businesses",
    price: 29,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "",
    features: [
      "Everything in Free Trial",
      "Up to 50 contacts",
      "Up to 100 bookings/month",
      "AI chat assistant",
      "Email reminders",
      "Basic reporting",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional Plan",
    description: "For growing businesses",
    price: 79,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || "",
    features: [
      "Everything in Starter",
      "Unlimited contacts",
      "Unlimited bookings",
      "Advanced AI assistant",
      "Priority email support",
      "Advanced analytics",
      "Staff management (up to 5)",
      "Custom branding",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For large organizations",
    price: 199,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "",
    features: [
      "Everything in Professional",
      "Unlimited staff members",
      "White-label solution",
      "API access",
      "24/7 priority support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
};

export const getPlan = (planId: string) => {
  return PLANS[planId as keyof typeof PLANS] || null;
};

export const getAllPlans = () => {
  return Object.values(PLANS);
};

export const createStripeCheckoutSession = async (
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  customerName?: string
): Promise<Stripe.Checkout.Session> => {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan_id: "professional",
    },
  };

  if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
};

export const getStripeSubscriptionStatus = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at,
    };
  } catch (error: any) {
    console.error("Error fetching subscription:", error?.message || error);
    throw error;
  }
};

export const cancelStripeSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error: any) {
    console.error("Error cancelling subscription:", error?.message || error);
    throw error;
  }
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        type: "checkout_completed",
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription as string,
        metadata: session.metadata,
      };
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        type: "subscription_updated",
        subscriptionId: subscription.id,
        status: subscription.status,
      };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        type: "subscription_cancelled",
        subscriptionId: subscription.id,
      };
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        type: "payment_succeeded",
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_paid,
      };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        type: "payment_failed",
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_due,
      };
    }

    default:
      return { type: "unhandled", eventType: event.type };
  }
};

export { stripe };

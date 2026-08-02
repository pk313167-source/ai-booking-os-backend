import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const PLANS = [
  {
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
  {
    id: "starter",
    name: "Starter Plan",
    description: "Perfect for small businesses",
    price: 2999,
    interval: "month",
    features: [
      "Everything in Free Trial",
      "Up to 50 contacts",
      "Up to 100 bookings/month",
      "AI chat assistant",
      "Email reminders",
      "Basic reporting",
    ],
  },
  {
    id: "professional",
    name: "Professional Plan",
    description: "For growing businesses",
    price: 7999,
    interval: "month",
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
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For large organizations",
    price: 19999,
    interval: "month",
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
];

export const getAllPlans = () => PLANS;

export const getPlan = (planId: string) => PLANS.find((p) => p.id === planId);

export const createOrder = async (
  amount: number,
  currency: string = "INR",
  receipt: string,
  notes: Record<string, string> = {}
) => {
  const options = {
    amount: amount, // amount in paise
    currency,
    receipt,
    notes,
  };
  const order = await razorpay.orders.create(options);
  return order;
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

export const getPaymentDetails = async (paymentId: string) => {
  return await razorpay.payments.fetch(paymentId);
};

export default razorpay;

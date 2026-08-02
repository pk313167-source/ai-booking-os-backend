import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { paymentsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Check, Crown, Sparkles, Building2, Rocket } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  trialDays?: number;
  features: string[];
}

const planIcons: Record<string, any> = {
  free_trial: Sparkles,
  starter: Rocket,
  professional: Crown,
  enterprise: Building2,
};

export default function SubscriptionPlans() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("");

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await paymentsAPI.getPlans();
      // If API fails, use hardcoded plans
      if (response.data?.length) {
        setPlans(response.data);
      } else {
        setPlans(getDefaultPlans());
      }
    } catch {
      setPlans(getDefaultPlans());
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await paymentsAPI.getSubscriptionStatus();
      setCurrentTier(response.data?.tier || "free");
    } catch {
      // Ignore
    }
  };

  const handleUpgrade = async (planId: string, planName: string, price: number) => {
    setCheckoutLoading(planId);
    try {
      if (price === 0) {
        // Free trial activation
        await paymentsAPI.createOrder(planId);
        toast.success("Free trial activated! Enjoy 14 days of full access.");
        fetchSubscriptionStatus();
        setCheckoutLoading(null);
        return;
      }

      // Create payment order via backend (Razorpay)
      const response = await paymentsAPI.createOrder(planId);
      const { orderId, amount, currency, keyId, planName: backendPlanName } = response.data;

      if (!orderId || !amount || !keyId) {
        throw new Error("Invalid payment order response from server");
      }

      // Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "AI Booking OS",
        description: `Upgrade to ${backendPlanName || planName}`,
        order_id: orderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data?.message) {
              toast.success("Payment successful! Your subscription has been upgraded.");
              fetchSubscriptionStatus();
            }
          } catch (verifyError: any) {
            toast.error(verifyError.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setCheckoutLoading(null);
          }
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            setCheckoutLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process upgrade");
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Scale your business with the right plan. All plans include AI-powered booking management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = planIcons[plan.id] || Sparkles;
            const isCurrent = currentTier === plan.id ||
              (currentTier === "starter" && plan.id === "free_trial") ||
              (currentTier === "professional" && plan.id === "starter");
            const isFree = plan.price === 0;

            return (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col transition-all ${
                  plan.id === "professional"
                    ? "border-primary border-2 shadow-lg scale-[1.02]"
                    : ""
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    {isFree ? "Free" : `$${plan.price}`}
                  </span>
                  {!isFree && <span className="text-muted-foreground">/mo</span>}
                  {plan.trialDays && (
                    <p className="text-xs text-primary mt-1">
                      {plan.trialDays}-day free trial
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "default" : plan.id === "professional" ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.id, plan.name, plan.price)}
                  disabled={checkoutLoading !== null || isCurrent}
                >
                  {checkoutLoading === plan.id ? (
                    "Processing..."
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    isFree ? "Start Free Trial" : "Upgrade Now"
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{" "}
            <button
              className="text-primary underline hover:text-primary/80"
              onClick={() => navigate("/settings")}
            >
              Contact us
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

// Fallback plans in case API fails
function getDefaultPlans() {
  return [
    {
      id: "free_trial",
      name: "Free Trial",
      description: "Try all features free for 14 days",
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
      name: "Starter",
      description: "Perfect for small businesses",
      price: 29,
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
      name: "Professional",
      description: "For growing businesses",
      price: 79,
      interval: "month",
      features: [
        "Everything in Starter",
        "Unlimited contacts",
        "Unlimited bookings",
        "Advanced AI assistant",
        "Priority support",
        "Advanced analytics",
        "Staff management",
        "Custom branding",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      price: 199,
      interval: "month",
      features: [
        "Everything in Professional",
        "Unlimited staff",
        "White-label solution",
        "API access",
        "24/7 priority support",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager",
      ],
    },
  ];
}

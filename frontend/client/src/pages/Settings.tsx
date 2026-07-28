import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { settingsAPI, paymentsAPI } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Crown, Rocket, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
    fetchSubscriptionStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      const data = response.data;
      setSettings(data);
      setBusinessName(data.businessName || "");
      setEmail(data.email || user?.email || "");
      setPhone(data.phone || "");
    } catch (error: any) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await paymentsAPI.getSubscriptionStatus();
      setSubscription(response.data);
    } catch {
      // Subscription status fetch is optional
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsAPI.saveSettings({
        businessName,
        phone,
      });
      toast.success("Settings saved successfully");
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    }
  };

  const tierIcons: Record<string, any> = {
    free: Zap,
    starter: Rocket,
    professional: Crown,
    enterprise: Crown,
  };

  const TierIcon = tierIcons[settings?.subscriptionTier || "free"] || Zap;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl space-y-6">
          {/* Subscription Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Subscription</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TierIcon className="w-4 h-4 text-primary" />
                  <p className="text-sm text-muted-foreground capitalize">
                    {settings?.subscriptionTier || "Free"} Plan
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/plans")}>
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium capitalize">{settings?.subscriptionTier || "free"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {settings?.createdAt
                    ? new Date(settings.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Business Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Business Settings</h2>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled
                  className="opacity-70"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <Button type="submit" className="w-full">
                Save Settings
              </Button>
            </form>
          </Card>

          {/* Account Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Account Status</p>
                <p className="font-medium">Active</p>
              </div>
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium capitalize">
                  {settings?.subscriptionTier || "Free"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {settings?.createdAt
                    ? new Date(settings.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

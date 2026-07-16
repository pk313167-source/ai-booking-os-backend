import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Plus } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { logout, user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getDashboard();
        setDashboard(response.data);
      } catch (error: any) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">AI Booking OS</h1>
            <p className="text-sm text-muted-foreground">{user?.businessName}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Contacts</p>
            <p className="text-3xl font-bold">{dashboard?.totalContacts || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
            <p className="text-3xl font-bold">{dashboard?.upcomingAppointments || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Appointments</p>
            <p className="text-3xl font-bold">{dashboard?.totalAppointments || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Messages</p>
            <p className="text-3xl font-bold">{dashboard?.totalMessages || 0}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/contacts")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Manage Contacts
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/appointments")}
              >
                <Plus className="w-4 h-4 mr-2" />
                View Appointments
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/chat")}
              >
                <Plus className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/settings")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              {dashboard?.recentActivity?.length ? "Recent activities will appear here" : "No recent activity"}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

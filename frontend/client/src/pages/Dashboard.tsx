import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Calendar, Users, MessageSquare, TrendingUp } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">AI Booking OS</h1>
            <p className="text-sm text-muted-foreground">{user?.businessName || "Welcome back!"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/settings")}>
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-3xl font-bold">{dashboard?.totalContacts || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold">{dashboard?.upcomingAppointments || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold">{dashboard?.totalAppointments || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-3xl font-bold">{dashboard?.totalMessages || 0}</p>
              </div>
            </div>
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
                <Users className="w-4 h-4 mr-2" />
                Manage Contacts
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/appointments")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Appointments
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/chat")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/settings")}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {dashboard?.recentActivity?.length ? (
                dashboard.recentActivity.slice(0, 5).map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </Card>
        </div>

        {dashboard?.appointments?.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
            <div className="space-y-3">
              {dashboard.appointments.map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div>
                    <p className="font-medium">{appt.contactName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

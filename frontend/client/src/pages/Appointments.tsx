import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { appointmentsAPI, contactsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";

export default function Appointments() {
  const [, navigate] = useLocation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contactId, setContactId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appts, ctcs] = await Promise.all([
        appointmentsAPI.listAppointments(),
        contactsAPI.listContacts(),
      ]);
      setAppointments(appts.data);
      setContacts(ctcs.data);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentsAPI.bookAppointment(contactId, startTime, endTime, title);
      toast.success("Appointment booked successfully");
      setContactId("");
      setStartTime("");
      setEndTime("");
      setTitle("");
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book appointment");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Appointments</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">{appointments.length} appointments</p>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="">Select a contact</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Book Appointment</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid gap-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{appt.title || "Appointment"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(appt.startTime)} - {formatDate(appt.endTime)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {appt.status || "scheduled"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No appointments yet. Book one to get started.</p>
          </Card>
        )}
      </main>
    </div>
  );
}

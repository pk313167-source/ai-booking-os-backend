import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { chatAPI, contactsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Send, ArrowLeft } from "lucide-react";

export default function Chat() {
  const [, navigate] = useLocation();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      const response = await contactsAPI.listContacts();
      setContacts(response.data);
      if (response.data.length > 0) {
        setSelectedContact(response.data[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getChatHistory(selectedContact);
      setMessages(response.data);
    } catch (error: any) {
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact) return;

    try {
      const contact = contacts.find((c) => c.id === selectedContact);
      await chatAPI.sendMessage(contact?.phone || contact?.email, message);
      toast.success("Message sent");
      setMessage("");
      fetchMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const selectedContactName = contacts.find((c) => c.id === selectedContact)?.name;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">AI Chat</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
          {/* Contacts Sidebar */}
          <Card className="p-4 overflow-y-auto">
            <h2 className="font-semibold mb-4">Contacts</h2>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full text-left p-2 rounded-md transition ${
                    selectedContact === contact.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <div className="md:col-span-3 flex flex-col">
            <Card className="flex-1 p-4 overflow-y-auto mb-4">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {selectedContactName
                      ? `No messages with ${selectedContactName} yet`
                      : "Select a contact to start chatting"}
                  </p>
                </div>
              )}
            </Card>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={!selectedContact}
              />
              <Button
                type="submit"
                disabled={!selectedContact || !message.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import knex from "../db/knex";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "dummy_key",
});

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { contactPhoneOrEmail, message } = req.body;
  const businessId = req.user?.business_id;

  try {
    const business = await knex("businesses").where({ id: businessId }).first();
    const faq = business.faq_json || {};

    // Save customer message
    await knex("chat_messages").insert({
      id: uuidv4(),
      business_id: businessId,
      contact_phone_or_email: contactPhoneOrEmail,
      message,
      sender: "customer",
      created_at: new Date(),
    });

    // Claude AI logic
    const prompt = `You are an AI assistant for ${business.name}. 
    Use the following FAQ to answer the customer's question: ${JSON.stringify(faq)}.
    If you can answer based on the FAQ, provide a helpful response.
    If you cannot answer based on the FAQ, reply with "ESC_STAFF".
    Customer message: ${message}`;

    let aiContent: any;
    if (process.env.NODE_ENV === "test") {
      aiContent = { type: "text", text: "Hello! I am your AI assistant. How can I help you today?" };
    } else {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      aiContent = response.content[0];
    }
    let aiMessage = "";
    
    if (aiContent && 'text' in aiContent) {
        aiMessage = aiContent.text;
    } else {
        aiMessage = "I'm sorry, I'm having trouble responding right now.";
    }

    if (aiMessage.includes("ESC_STAFF")) {
      // Flag for staff escalation (in a real app, you might set a flag in DB)
      aiMessage = "I'm sorry, I couldn't find the answer to that. A staff member will get back to you soon.";
    }

    // Save AI response
    await knex("chat_messages").insert({
      id: uuidv4(),
      business_id: businessId,
      contact_phone_or_email: contactPhoneOrEmail,
      message: aiMessage,
      sender: "ai",
      created_at: new Date(),
    });

    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "Error processing chat", error });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  const { contactId } = req.params;
  const businessId = req.user?.business_id;

  try {
    const contact = await knex("contacts").where({ id: contactId, business_id: businessId }).first();
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const history = await knex("chat_messages")
      .where({ business_id: businessId })
      .andWhere((builder) => {
        builder.where("contact_phone_or_email", contact.email).orWhere("contact_phone_or_email", contact.phone);
      })
      .orderBy("created_at", "asc");

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error });
  }
};

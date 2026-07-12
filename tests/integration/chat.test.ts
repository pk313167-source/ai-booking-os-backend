import request from "supertest";
import app from "../../src/index";
import knex from "../../src/db/knex";
import { setupTestDB, teardownTestDB } from "../helper";

// Mock Anthropic
jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: "text", text: "Hello! I am your AI assistant. How can I help you today?" }]
          })
        }
      };
    })
  };
});

describe("Chat Integration Tests", () => {
  let token: string;

  beforeAll(async () => {
    await setupTestDB();
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "chat@example.com",
        password: "password123",
        businessName: "Chat Business"
      });
    token = signupRes.body.token;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should send a chat message and receive an AI response", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactPhoneOrEmail: "customer@example.com",
        message: "What are your hours?"
      });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Hello! I am your AI assistant. How can I help you today?");

    const messages = await knex("chat_messages")
      .where({ contact_phone_or_email: "customer@example.com" })
      .orderBy("created_at", "asc");

    expect(messages.length).toBe(2);
    expect(messages[0].sender).toBe("customer");
    expect(messages[0].message).toBe("What are your hours?");
    expect(messages[1].sender).toBe("ai");
    expect(messages[1].message).toBe("Hello! I am your AI assistant. How can I help you today?");
  });
});

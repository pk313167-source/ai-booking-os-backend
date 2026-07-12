import request from "supertest";
import app from "../../src/index";
import knex from "../../src/db/knex";
import { setupTestDB, teardownTestDB, clearDB } from "../helper";

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  it("should signup a new user and business", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "test@example.com",
        password: "password123",
        businessName: "Test Business"
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("businessId");

    const user = await knex("users").where({ email: "test@example.com" }).first();
    expect(user).toBeDefined();
    expect(user.role).toBe("owner");
  });

  it("should login an existing user", async () => {
    // First signup
    await request(app)
      .post("/api/auth/signup")
      .send({
        email: "login@example.com",
        password: "password123",
        businessName: "Login Business"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail login with incorrect password", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        email: "fail@example.com",
        password: "password123",
        businessName: "Fail Business"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fail@example.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});

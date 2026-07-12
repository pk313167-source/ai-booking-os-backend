import request from "supertest";
import app from "../../src/index";
import knex from "../../src/db/knex";
import { setupTestDB, teardownTestDB, clearDB } from "../helper";

describe("Booking Flow Integration Tests", () => {
  let token: string;
  let businessId: string;

  beforeAll(async () => {
    await setupTestDB();
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "booking@example.com",
        password: "password123",
        businessName: "Booking Business"
      });
    token = signupRes.body.token;
    businessId = signupRes.body.businessId;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should create a contact, book an appointment, and verify reminders", async () => {
    // 1. Create contact
    const contactRes = await request(app)
      .post("/api/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com"
      });
    const contactId = contactRes.body.id;
    expect(contactRes.status).toBe(201);

    // 2. Book appointment
    const startTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h from now
    const endTime = new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString();
    const appointmentRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId,
        startTime,
        endTime
      });
    const appointmentId = appointmentRes.body.id;
    expect(appointmentRes.status).toBe(201);

    // 3. Verify reminder_jobs
    const reminders = await knex("reminder_jobs").where({ appointment_id: appointmentId });
    expect(reminders.length).toBe(2);
    
    const scheduledTimes = reminders.map(r => {
      // SQLite returns dates as strings in ISO format or as milliseconds
      const d = new Date(r.scheduled_for);
      return d.toISOString();
    });
    const start = new Date(startTime);
    const expected24h = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const expected1h = new Date(start.getTime() - 60 * 60 * 1000).toISOString();
    
    expect(scheduledTimes).toContain(expected24h);
    expect(scheduledTimes).toContain(expected1h);

    // 4. Update appointment and verify reminders regenerated
    const newStartTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const updateRes = await request(app)
      .patch(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startTime: newStartTime
      });
    expect(updateRes.status).toBe(200);

    const newReminders = await knex("reminder_jobs").where({ appointment_id: appointmentId });
    expect(newReminders.length).toBe(2);
    const newScheduledTimes = newReminders.map(r => {
      const d = new Date(r.scheduled_for);
      return d.toISOString();
    });
    const newStart = new Date(newStartTime);
    const expectedNew24h = new Date(newStart.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const expectedNew1h = new Date(newStart.getTime() - 60 * 60 * 1000).toISOString();
    
    expect(newScheduledTimes).toContain(expectedNew24h);
    expect(newScheduledTimes).toContain(expectedNew1h);
    
    // Ensure old ones were deleted (total count for this appointment should still be 2)
    const totalReminders = await knex("reminder_jobs").where({ appointment_id: appointmentId }).count("id as count").first();
    expect(Number(totalReminders?.count)).toBe(2);
  });
});

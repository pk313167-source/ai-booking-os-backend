import nodemailer from "nodemailer";

// Brevo SMTP Configuration
const createTransporter = () => {
  const host = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST;
  const user = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
  const port = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || "587");

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return null;
};

const transporter = createTransporter();
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM || "noreply@aibookingos.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "AI Booking OS";

export interface EmailOptions { to: string; subject: string; html: string; text?: string; }

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      console.log(`=== EMAIL (no SMTP) === To: ${options.to} | Subject: ${options.subject}`);
      return true;
    }
    await transporter.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to: options.to, subject: options.subject, html: options.html, text: options.text });
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error: any) {
    console.error("Email send error:", error?.message || error);
    return false;
  }
};

export const templates = {
  welcome: (businessName: string, email: string) => ({
    to: email,
    subject: "Welcome to AI Booking OS!",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2563eb;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;font-size:28px;">Welcome to AI Booking OS!</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Hi there! Your business <strong>${businessName}</strong> is set up.</p><ul><li>Manage bookings</li><li>Track customers</li><li>AI chat assistance</li><li>Automated reminders</li></ul></div></div>`,
  }),
  emailVerification: (email: string, verificationUrl: string) => ({
    to: email,
    subject: "Verify Your Email - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2563eb;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Verify Your Email</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Please verify your email address:</p><div style="text-align:center;margin:30px 0;"><a href="${verificationUrl}" style="background:#2563eb;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;display:inline-block;">Verify Email</a></div><p style="font-size:12px;color:#6b7280;">If you didn't create an account, ignore this email.</p></div></div>`,
  }),
  passwordReset: (email: string, resetUrl: string) => ({
    to: email,
    subject: "Password Reset - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2563eb;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Password Reset</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Click below to reset your password:</p><div style="text-align:center;margin:30px 0;"><a href="${resetUrl}" style="background:#2563eb;color:white;padding:12px 30px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></div><p style="font-size:12px;color:#6b7280;">Link expires in 1 hour.</p></div></div>`,
  }),
  bookingConfirmation: (customerName: string, date: string, time: string, serviceName?: string) => ({
    to: "",
    subject: "Booking Confirmed - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#059669;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Booking Confirmed!</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Hi ${customerName},</p><p>Your booking is confirmed:</p><table style="width:100%;margin:20px 0;"><tr><td style="padding:8px;color:#6b7280;">Date</td><td style="padding:8px;font-weight:bold;">${date}</td></tr><tr><td style="padding:8px;color:#6b7280;">Time</td><td style="padding:8px;font-weight:bold;">${time}</td></tr>${serviceName ? `<tr><td style="padding:8px;color:#6b7280;">Service</td><td style="padding:8px;font-weight:bold;">${serviceName}</td></tr>` : ""}</table></div></div>`,
  }),
  bookingCancellation: (customerName: string, date: string, time: string) => ({
    to: "",
    subject: "Booking Cancelled - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#dc2626;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Booking Cancelled</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Hi ${customerName},</p><p>Your booking on ${date} at ${time} has been cancelled.</p><p style="font-size:12px;color:#6b7280;">If this was a mistake, please rebook.</p></div></div>`,
  }),
  paymentReceipt: (customerName: string, planName: string, amount: string) => ({
    to: "",
    subject: "Payment Receipt - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2563eb;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Payment Receipt</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Dear ${customerName},</p><table style="width:100%;margin:20px 0;"><tr><td style="padding:8px;color:#6b7280;">Plan</td><td style="padding:8px;font-weight:bold;">${planName}</td></tr><tr><td style="padding:8px;color:#6b7280;">Amount</td><td style="padding:8px;font-weight:bold;">${amount}</td></tr><tr><td style="padding:8px;color:#6b7280;">Status</td><td style="padding:8px;color:#059669;font-weight:bold;">Paid</td></tr></table></div></div>`,
  }),
  testEmail: () => ({
    to: "",
    subject: "Test Email - AI Booking OS",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2563eb;color:white;padding:30px;border-radius:8px 8px 0 0;text-align:center;"><h1 style="margin:0;">Test Email</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;"><p>Email service is active!</p></div></div>`,
  }),
};

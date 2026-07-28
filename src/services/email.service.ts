import nodemailer from "nodemailer";

// Create transporter - uses SMTP configuration from environment
const createTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: log to console in development
  return null;
};

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!transporter) {
      // Log email details when no SMTP is configured
      console.log("=== EMAIL (SMTP not configured, logging instead) ===");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`HTML: ${options.html.substring(0, 200)}...`);
      console.log("================================================");
      return true;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@ai-booking-os.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error?.message || error);
    return false;
  }
};

// Email templates
export const templates = {
  welcome: (businessName: string, email: string) => ({
    to: email,
    subject: `Welcome to AI Booking OS - ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to AI Booking OS!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">Welcome, ${businessName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for signing up with AI Booking OS. Your account has been created successfully.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            You can now start managing your appointments, contacts, and bookings with the help of our AI assistant.
          </p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Getting Started</h3>
            <ul style="color: #4b5563; line-height: 1.6;">
              <li>Set up your business profile in Settings</li>
              <li>Add your first contacts</li>
              <li>Create your first booking</li>
              <li>Try the AI Chat assistant</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This is an automated email from AI Booking OS. If you have any questions, please contact support.
          </p>
        </div>
      </div>
    `,
  }),

  bookingConfirmation: (customerName: string, bookingDate: string, bookingTime: string, serviceName?: string) => ({
    to: "", // Will be set by caller
    subject: "Booking Confirmation - AI Booking OS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #4b5563;">Dear ${customerName},</p>
          <p style="color: #4b5563;">Your booking has been confirmed with the following details:</p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Date</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${bookingDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Time</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${bookingTime}</td>
            </tr>
            ${serviceName ? `<tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Service</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${serviceName}</td>
            </tr>` : ""}
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            If you need to make changes, please contact us directly.
          </p>
        </div>
      </div>
    `,
  }),

  bookingCancellation: (customerName: string, bookingDate: string, bookingTime: string) => ({
    to: "",
    subject: "Booking Cancellation - AI Booking OS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Booking Cancelled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #4b5563;">Dear ${customerName},</p>
          <p style="color: #4b5563;">Your booking has been cancelled. Here are the details:</p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Date</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${bookingDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Time</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${bookingTime}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Status</td>
              <td style="padding: 10px; color: #dc2626; font-weight: bold;">Cancelled</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            If this was done in error, please contact us to re-book.
          </p>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (customerName: string, planName: string, amount: string) => ({
    to: "",
    subject: "Payment Receipt - AI Booking OS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Payment Receipt</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #4b5563;">Dear ${customerName},</p>
          <p style="color: #4b5563;">Thank you for your subscription payment. Here's your receipt:</p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Plan</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${planName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Amount</td>
              <td style="padding: 10px; color: #1f2937; font-weight: bold;">${amount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; color: #6b7280;">Status</td>
              <td style="padding: 10px; color: #059669; font-weight: bold;">Paid</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This is your subscription payment receipt for AI Booking OS.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (email: string, resetUrl: string) => ({
    to: email,
    subject: "Password Reset - AI Booking OS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #4b5563;">We received a request to reset your password.</p>
          <p style="color: #4b5563;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  testEmail: () => ({
    to: "",
    subject: "Test Email - AI Booking OS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Test Email</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color: #4b5563;">This is a test email from AI Booking OS.</p>
          <p style="color: #4b5563;">If you received this email, your email configuration is working correctly.</p>
          <p style="color: #059669; font-weight: bold; margin-top: 20px;">Email service is active!</p>
        </div>
      </div>
    `,
  }),
};

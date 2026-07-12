# AI Booking OS Backend

A complete backend API for a simplified booking platform with AI chat, appointment scheduling, and SMS reminders.

## Features

- **Node.js + Express + TypeScript**
- **PostgreSQL** with Knex.js migrations
- **JWT Authentication** (Email/Password)
- **12 API Endpoints** for Businesses, Users, Contacts, Appointments, and Chat
- **Claude AI Integration** for automated FAQ-based customer chat
- **Twilio SMS Integration** for appointment reminders
- **Automated Cron Jobs** for sending reminders (24h and 1h before)

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Twilio Account (for SMS)
- Anthropic Claude API Key (for AI chat)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new business and owner
- `POST /api/auth/login` - Login to get JWT token

### Dashboard
- `GET /api/dashboard` - Get today's appointments and pending chats

### Contacts
- `POST /api/contacts` - Add a new customer
- `GET /api/contacts` - List all customers
- `PATCH /api/contacts/:id` - Edit customer details

### Appointments
- `POST /api/appointments` - Book an appointment
- `GET /api/appointments` - View all appointments (calendar view)
- `PATCH /api/appointments/:id` - Reschedule or cancel appointment

### Chat
- `POST /api/chat` - Send a message (AI responds automatically based on FAQ)
- `GET /api/chat/:contactId` - Get chat history for a contact

### Settings
- `POST /api/settings` - Save business FAQ and operating hours
- `GET /api/settings` - Get current business settings

## Project Structure

- `src/controllers`: Request handlers
- `src/routes`: API route definitions
- `src/middleware`: Auth, validation, and error handling
- `src/db`: Knex configuration and migrations
- `src/cron`: Reminder cron job logic
- `src/index.ts`: Application entry point

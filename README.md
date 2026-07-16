# AI Booking OS

AI Booking OS is a production-ready backend system for managing CRM, appointment bookings, AI-powered FAQ chat, and reminder systems.

## 🚀 Current Status
- **Completion Percentage**: 100% (Backend)
- **Completed Work**:
  - Full API for Appointments, Auth, Chat, Contacts, Dashboard, and Settings.
  - PostgreSQL integration with Knex.js.
  - Automated deployment to Render with SSL.
  - Comprehensive TypeScript type fixes and build optimization.
  - Health check endpoint verified.
- **Remaining Work**:
  - Frontend integration (Frontend project to be linked).
  - AI Model fine-tuning (if required).

## 🔗 Deployment Details
- **Backend URL**: [https://ai-booking-os-backend.onrender.com](https://ai-booking-os-backend.onrender.com)
- **Health Check**: [https://ai-booking-os-backend.onrender.com/health](https://ai-booking-os-backend.onrender.com/health)
- **Database**: Managed PostgreSQL on Render.

## 📁 Project Structure
```text
/src
  /controllers   - API request handlers
  /cron          - Scheduled tasks (reminders)
  /db            - Database configuration and migrations
  /middleware    - Auth, validation, and error handling
  /routes        - API route definitions
/tests           - Integration tests
/dist            - Compiled JavaScript files
knexfile.ts      - Knex database configuration
render.yaml      - Render deployment blueprint
build.sh         - Custom build and migration script
```

## 🛠 API Endpoints
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

## 📦 Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
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

## 🌍 Portability Verification
This repository is designed to be fully portable. Another Manus account or environment can continue development by:
1. Cloning the repository.
2. Connecting their own Render/PostgreSQL if they wish to deploy separately.
3. Using the existing live backend URL for frontend development.

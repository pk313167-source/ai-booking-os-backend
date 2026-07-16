# AI Booking OS - Frontend

A production-ready React frontend for the AI Booking OS application. Built with React 19, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Authentication**: Signup and login with JWT token management
- **Dashboard**: Overview of contacts, appointments, messages, and activity
- **Contacts Management**: Add, view, and manage business contacts
- **Appointments**: Schedule and manage appointments with contacts
- **AI Chat**: Send messages to contacts with AI-powered responses
- **Settings**: Configure business information and account settings

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **HTTP Client**: Axios with interceptors for API communication
- **Build Tool**: Vite 7
- **Package Manager**: pnpm

## Installation

```bash
cd frontend
pnpm install
```

## Development

```bash
pnpm run dev
```

The development server will start at `http://localhost:3000`

## Building

```bash
pnpm run build
```

This creates an optimized production build in the `dist/` directory.

## Environment Variables

The frontend automatically connects to the backend at:
```
https://ai-booking-os-backend.onrender.com/api
```

## Project Structure

```
client/
  src/
    pages/           # Page components (Login, Dashboard, etc.)
    components/      # Reusable UI components
    contexts/        # React contexts (Auth, Theme)
    lib/            # Utilities (API client)
    App.tsx         # Main app component with routing
    main.tsx        # React entry point
    index.css       # Global styles and Tailwind config
  public/           # Static assets
  index.html        # HTML template
```

## API Integration

The frontend communicates with the backend API using the following endpoints:

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Add new contact
- `PATCH /api/contacts/:id` - Update contact

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Book new appointment
- `PATCH /api/appointments/:id` - Update appointment

### Chat
- `GET /api/chat/:contactId` - Get chat history
- `POST /api/chat` - Send message

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

## Deployment

The frontend is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically build and deploy on push
3. The build command is: `pnpm run build`
4. The output directory is: `dist/public`

## Testing

To test the complete application:

1. Sign up with a new account
2. Add contacts
3. Schedule appointments
4. Send messages via AI Chat
5. Update settings

All features are fully integrated with the backend API.

## License

MIT

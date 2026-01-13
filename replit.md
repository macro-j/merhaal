# Marhal Trip - Saudi Travel Planning Application

## Overview
A full-stack trip planning application for Saudi Arabia featuring destination guides, activities, accommodations, and AI-powered trip planning.

## Tech Stack
- **Frontend**: React 19 with TypeScript, Vite 7, Tailwind CSS 4
- **Backend**: Express with tRPC
- **Database**: MySQL (using Drizzle ORM)
- **State Management**: TanStack React Query

## Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   └── App.tsx      # Main app entry
│   └── public/      # Static assets
├── server/          # Express backend
│   ├── _core/       # Core server utilities
│   ├── routers.ts   # tRPC routers
│   └── db.ts        # Database operations
├── shared/          # Shared types and constants
└── drizzle/         # Database schema and migrations
```

## Running the Application
- **Development**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Production**: `npm run start`

## Database
- Uses MySQL with Drizzle ORM
- Schema defined in `drizzle/schema.ts`
- Migrations: `npm run db:push`

## Environment Variables
- `DATABASE_URL`: MySQL connection string (required for database features)
- `PORT`: Server port (default: 5000)
- Optional: `VITE_APP_TITLE`, `VITE_APP_LOGO`, `VITE_ANALYTICS_ENDPOINT`

## Recent Changes
- 2026-01-13: Configured for Replit environment
  - Updated Vite to allow all hosts for proxy access
  - Set default port to 5000
  - Configured deployment settings

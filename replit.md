# Marhal Trip - Saudi Travel Planning Application

## Overview
A full-stack trip planning application for Saudi Arabia featuring destination guides, activities, accommodations, and AI-powered trip planning.

## Tech Stack
- **Frontend**: React 19 with TypeScript, Vite 7, Tailwind CSS 4
- **Backend**: Express with tRPC
- **Database**: PostgreSQL (Replit built-in, using Drizzle ORM)
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
- Uses PostgreSQL (Replit built-in) with Drizzle ORM
- Schema defined in `drizzle/schema.ts`
- Migrations: `npm run db:push`

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Replit)
- `PORT`: Server port (default: 5000)
- Optional: `VITE_APP_TITLE`, `VITE_APP_LOGO`, `VITE_ANALYTICS_ENDPOINT`

## User Tier System
- **Free**: 1 day max, 3 activities/day, 1 saved trip
- **Smart**: 10 days max, 5 activities/day, 3 saved trips
- **Professional**: Unlimited days, 10 activities/day, unlimited trips

## Admin Dashboard
- Located at `/admin` (admin role required)
- Manage cities: `/admin/cities`
- Manage activities/places: `/admin/activities`
- Manage users (tier/role updates): `/admin/users`

## Trip Generation
- Daily itinerary with Arabic day titles (اليوم الأول, اليوم الثاني, etc.)
- Time blocks: صباحًا (09:00), ظهرًا (12:00), عصرًا (15:00), مساءً (18:00)
- Activities strictly from selected city via destinationId
- Tier-enforced activity limits per day

## Recent Changes
- 2026-01-16: Fix discover city and user city display
  - Added automatic destination seeding on server startup (5 cities matching Home.tsx)
  - Fixed register mutation to return city in user object
  - City discovery now works (CityDetailModal fetches by nameAr/nameEn from DB)
  - User city displays correctly after registration (from auth.me endpoint)
- 2026-01-16: UX finalization and flow improvements
  - City field displayed in dashboard header with MapPin icon
  - Pricing page redirects to /login for unauthenticated users
  - CityDetailModal has "أنشئ خطة رحلتك" CTA with login redirect
  - Navbar shows different links when authenticated (Plan Trip, My Plans, Support)
  - Admin link visible only for admin role
  - Fixed CityDetailModal schema field mappings
- 2026-01-16: Trip generation and tier system
  - Added day titles and time periods to itinerary structure
  - Enforced tier-based activity limits per day
  - Added upgrade request flow (no payments)
  - Added optional city field to registration
  - Fixed Arabic tanween (ًا) across all UI
  - Fixed sidebar RTL support
  - Migrated database from MySQL to PostgreSQL
- 2026-01-15: Added MVP backend + admin dashboard
  - Admin CRUD routes for cities, activities, and users
  - Admin dashboard UI (AdminLayout, AdminDashboard, AdminCities, AdminActivities, AdminUsers)
  - Tier-based trip limits enforcement (day limits, saved plan limits)
  - MyPlans page for viewing saved trips
  - Role-aware navigation (admin link for admins)
  - DashboardLayout with dynamic menu items
- 2026-01-13: Configured for Replit environment
  - Updated Vite to allow all hosts for proxy access
  - Set default port to 5000
  - Configured deployment settings

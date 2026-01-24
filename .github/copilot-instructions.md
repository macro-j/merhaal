# Merhaal Codebase Guide for AI Agents

## Project Overview

**Merhaal** is a tourism planning platform for the Middle East (initially Saudi Arabia).  
It is a **daily trip planning engine**, not just a list of places.

The goal is to generate **logical, realistic, time-aware, and budget-aware itineraries**
based on user inputs such as city, days, budget, accommodation level, and interests.

**Architecture**: Full-stack TypeScript monorepo with:
- **Client**: React 19 + Vite + Tailwind + Shadcn UI + Wouter (routing)
- **Server**: Express + tRPC + PostgreSQL + Drizzle ORM
- **Database**: PostgreSQL with Drizzle migrations
- **Shared**: Common types via `shared/` directory

---

## Tech Stack & Critical Commands

### Build & Run
```bash
pnpm dev          # Start dev server (client + server with tsx watch)
pnpm build        # Build client (Vite) + server (esbuild) → dist/
pnpm start        # Run production server from dist/
pnpm check        # TypeScript validation (no emit)
pnpm test         # Vitest (jsdom environment)
pnpm format       # Prettier formatting
pnpm db:push      # Drizzle migrations (requires DATABASE_URL)
Core Dependencies
Express

tRPC

React Query (TanStack)

Drizzle ORM

Shadcn UI (via components.json)

Tailwind CSS

Zod

JWT (jsonwebtoken)

AWS S3 (storage)

Architecture Patterns
Data Flow: Client → Server → DB
Client: React components call tRPC hooks (client/src/lib/trpc.ts)

Server: server/routers.ts validates input (Zod) and executes planning logic

Database: Drizzle ORM (server/db.ts) with schema in drizzle/schema.ts

tRPC Procedures
publicProcedure: no auth required

protectedProcedure: authenticated user required

Admin access is enforced via protectedProcedure + explicit role checks
(user.role === 'admin') inside admin routers

Database Schema Overview
Key tables:

users: id, email, password, role (user/admin), tier (free/smart/professional)

destinations: cities with AR/EN content

activities: attractions, restaurants, experiences

accommodations: hotels with class & price range

trips: generated user plans

items: trip contents

Bilingual convention:

nameAr, nameEn

descriptionAr, descriptionEn

Enums often use Arabic strings.

Client-Side Patterns
Routing
Wouter routing in client/src/App.tsx

Pages live in client/src/pages/

Context Providers
LanguageContext (ar/en, RTL/LTR)

ThemeContext (dark/light)

UI Components
Shadcn UI components from client/src/components/ui

Tailwind-based styling

Do not change layout or theme unless explicitly requested

================================
RULES FOR AI / COPILOT CHANGES
================================
🔴 SAFETY RULES (MUST FOLLOW)
Make small, isolated changes only

One feature per change

Never refactor unrelated code

Never rewrite large sections unless explicitly asked

Always preserve existing behavior unless requested otherwise

🔴 WORKFLOW RULES
Every change must be testable locally (pnpm dev)

Prefer adding fields instead of renaming/removing existing ones

Keep commits small and reversible

Assume the project owner is not a programmer

🔴 FILE SCOPE RULES
UI changes → client/

Trip planning logic → server/routers.ts → trips.create

Shared logic/types → shared/

DO NOT TOUCH:

drizzle/ schema or migrations

database structure
unless explicitly requested

🔴 AUTH & SECURITY
Never rely on UI-only permission checks

Enforce tier and role rules on the server

Never expose API keys to the client

AI integrations must run server-side only

================================
TRIP PLANNING PRODUCT RULES
================================
The system is a planning engine, not a static generator.

1️⃣ Scheduling (HIGH PRIORITY)
No fixed time slots (e.g. 09:00, 12:00, 18:00)

Times must be computed dynamically using:

activity duration

travel buffer

Days may end at different times (e.g. 7pm, 9pm)

No overlapping activities

Each item must have:

startTime

endTime

period (morning / afternoon / evening) derived from time

2️⃣ Duration & Travel
Activity duration must be respected

If duration missing, use a reasonable default

Add travel buffer between activities (default 30 minutes)

3️⃣ Budget Logic
Each activity/accommodation should have an estimated cost

Calculate:

daily total cost

trip total cost

Total should be ≤ user budget (or show a clear warning)

Accommodation should consume the largest budget portion if luxury selected

4️⃣ Meals
Include:

breakfast

lunch

dinner

Meals should use restaurant activities when available

5️⃣ Maps
Each activity/accommodation should include:

Google Maps link if available

fallback Google search link if not

================================
TIER / PRICING RULES
================================
Free
1 trip

Short duration

Basic planning

No PDF export

No sharing

Smart
Multiple trips

Budget & interest customization

Save and regenerate plans

Share via link

Professional
Advanced time-aware planning

Unique/non-touristy places

Unlimited saved plans

PDF export

Priority access to new features

Tier rules must be enforced:

On the server (hard rules)

Reflected in the UI (disabled buttons + upgrade prompts)

Environment Variables
DATABASE_URL (required)

JWT_SECRET

OAuth vars (client-side)

AI keys must be server-side only

Debugging & Common Tasks
Type errors: pnpm check

Formatting: pnpm format

DB issues: verify DATABASE_URL

Auth issues: verify JWT token & expiry

Build issues: clear dist/ and rebuild

HOW TO TRACE FEATURES
Page → tRPC hook → router procedure → DB function → schema

Always follow this path when modifying or debugging features.

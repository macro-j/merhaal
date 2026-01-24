# Merhaal Codebase Guide for AI Agents

## Project Overview

**Merhaal** is a tourism planning platform for the Middle East (initially Saudi Arabia). It enables users to plan trips, explore destinations, activities, and accommodations with multi-language support (Arabic/English) and a tier-based pricing model (free/smart/professional).

**Architecture**: Full-stack TypeScript monorepo with:
- **Client**: React 19 + Vite + Tailwind + Shadcn UI + Wouter (routing)
- **Server**: Express + tRPC + PostgreSQL + Drizzle ORM
- **Database**: PostgreSQL with Drizzle migrations
- **Shared**: Common types via `shared/` directory

## Tech Stack & Critical Commands

**Build & Run**:
```bash
pnpm dev          # Start dev server (client + server with tsx watch)
pnpm build        # Build client (Vite) + server (esbuild) → dist/
pnpm start        # Run production server from dist/
pnpm check        # TypeScript validation (no emit)
pnpm test         # Vitest (jsdom environment)
pnpm format       # Prettier formatting
pnpm db:push      # Drizzle migrations (requires DATABASE_URL)
```

**Dependencies**: Express, tRPC, React Query (TanStack), Drizzle ORM, Shadcn UI (via components.json), Tailwind 4, Zod validation, JWT auth (jsonwebtoken), AWS S3 (storage).

## Architecture Patterns

### Data Flow: Client → Server → DB
1. **Client**: React components use `trpc` hooks (from `client/src/lib/trpc.ts`) to call server procedures
2. **Server**: tRPC routers (`server/routers.ts`) validate inputs with Zod, execute business logic
3. **Database**: Drizzle ORM (`server/db.ts`) executes queries; schema defined in `drizzle/schema.ts`

### tRPC Procedures (server/routers.ts)
Three procedure types with middleware-based auth:
- `publicProcedure`: No auth required
- `protectedProcedure`: Requires `ctx.user` (via `requireUser` middleware)
- `adminProcedure`: Requires `ctx.user.role === 'admin'`

**Auth Context** (`server/_core/context.ts`): Extracts user from JWT Bearer token or session cookie; resolves to `TrpcContext` with `user: User | null`.

### Database Schema (drizzle/schema.ts)
Key tables:
- `users`: id, email, password, role (user/admin), tier (free/smart/professional)
- `destinations`: Tourism sites (Riyadh, Jeddah, AlUla, Abha) with AR/EN names
- `activities`: Things to do (restaurants, heritage, nature, shopping, etc.)
- `accommodations`: Lodging options with price ranges
- `trips`: User-created trip plans
- `items`: Trip contents (destinations, activities, accommodations)

Enums use Arabic strings (e.g., `accommodationType: "فاخر" | "متوسط" | "اقتصادي"`).

### Shared Code
`shared/types.ts` re-exports schema types; `shared/const.ts` has error messages (`UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG`). Path aliases: `@/*` → `client/src/`, `@shared/*` → `shared/`.

## Client-Side Patterns

### Routing (Wouter)
`client/src/App.tsx` defines routes with `<Route>` components. Pages live in `client/src/pages/` (Home, Login, Dashboard, etc.). Admin routes protected in page components.

### Context Providers (client/src/contexts/)
- **LanguageContext**: `useLanguage()` hook for ar/en switching; updates `localStorage` and DOM `dir/lang` attributes
- **ThemeContext**: Dark/light mode management

Wrap entire app in providers at root for consistent state.

### UI Components
Use **Shadcn UI** (Radix-based) from `client/src/components/ui/`. Reference `components.json` for config. Examples: Button, Dialog, Card, Form, Input, Select. All styled with Tailwind classes.

### tRPC Client Usage
```typescript
const { data: destinations } = trpc.destinations.list.useQuery();
const createTrip = trpc.trips.create.useMutation();
```

Queries auto-cache via React Query; mutations invalidate related queries automatically in optimized routers.

## Testing

**Vitest** runs in jsdom environment. Example patterns:
- **Server tests** (`server/routers.test.ts`): Create mock `TrpcContext` with optional user, call procedures via `appRouter.createCaller(ctx)`
- **Client tests** (`client/src/pages/Home.test.tsx`): Render with tRPC Provider + QueryClientProvider + LanguageProvider/ThemeProvider wrappers

## Project-Specific Conventions

### Bilingual Content
- Database fields: `nameAr`, `nameEn`, `titleAr`, `titleEn`, `descriptionAr`, `descriptionEn`
- UI: Check `language` context; conditionally render/fetch based on locale
- Direction: Arabic (ar) = RTL; English (en) = LTR

### Error Handling
Use shared error messages from `shared/const.ts`. Server throws `TRPCError` with codes: `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, etc. Client shows toast via Sonner (`@/components/ui/sonner`).

### File Organization
- `client/src/_core/`: Internal hooks, utility functions
- `server/_core/`: tRPC setup (context, middleware), auth, external service integrations (LLM, maps, images)
- `server/`: Database logic, routers
- `drizzle/`: Schema, migrations

### Environment Variables
PostgreSQL: `DATABASE_URL` (required for db:push). OAuth: `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` (client-side). JWT: `JWT_SECRET` (server). See `.env` or deployment docs.

## Key Integration Points

- **AWS S3**: Presigned URLs via `@aws-sdk/*` (storage.ts)
- **OpenAI**: LLM integration (`server/_core/llm.ts`)
- **Google Maps**: Geocoding/routing (`server/_core/map.ts`)
- **Voice Transcription**: Speech-to-text (`server/_core/voiceTranscription.ts`)
- **PDF Export**: jsPDF library (pdfExport.ts)

## Debugging & Common Tasks

- **Type errors**: Run `pnpm check`
- **Lint issues**: Prettier (`pnpm format`)
- **DB issues**: Verify `DATABASE_URL` set; check migrations in `drizzle/` folder
- **Auth failures**: Check JWT expiry (7 days default); validate cookie/Bearer token in request
- **Build errors**: Clear `dist/` and rebuild; check Vite aliases in `vite.config.ts`

---

For implementation questions on specific features, trace: page component → tRPC hook → router procedure → db function → schema.

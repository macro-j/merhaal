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
- **Professional**: Unlimited days, 10 activities/day, unlimited trips, PDF export

## Admin Dashboard
- Located at `/admin` (admin role required)
- Manage cities: `/admin/cities`
- Manage activities/places: `/admin/activities`
- Manage accommodations: `/admin/accommodations`
- Manage users (tier/role updates): `/admin/users`

## Accommodation System
- Three-tier classification: economy (اقتصادي), mid (متوسط), luxury (فاخر)
- Fields: nameAr/nameEn, descriptionAr/descriptionEn, priceRange, googlePlaceId, googleMapsUrl
- Plan generation matches user's accommodation type preference to class
- Fallback: Any active accommodation if no class match; shows message if none exist

## Trip Generation
- Daily itinerary with Arabic day titles (اليوم الأول, اليوم الثاني, etc.)
- Time blocks: صباحًا (09:00), ظهرًا (12:00), عصرًا (15:00), مساءً (18:00)
- Activities strictly from selected city via destinationId
- Tier-enforced activity limits per day
- Smart scheduling: activities assigned to time slots based on `bestTimeOfDay` metadata

## Activity Metadata
Activities support enhanced metadata for smarter trip planning:
- **category**: مطاعم, تراث, طبيعة, تسوق, مغامرات, عائلي, ثقافة, ترفيه
- **tags**: Array of additional keywords for flexible matching
- **budgetLevel**: low, medium, high
- **bestTimeOfDay**: morning, afternoon, evening, anytime

## Data Seeding (Excel/CSV Schema)

For bulk imports, use XLSX files with these exact sheet names: **Cities**, **Activities**, **Accommodations**

### Cities Sheet Columns:
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| city_id | integer | Yes | Stable unique ID for upsert matching |
| name_ar | text | Yes | Arabic city name |
| name_en | text | Yes | English city name |
| description_ar | text | No | Arabic description |
| description_en | text | No | English description |
| image_url | text | No | Image URL |
| is_active | boolean | No | TRUE/FALSE, default: true |

### Activities Sheet Columns:
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| activity_id | integer | Yes | Stable unique ID for upsert matching |
| city_id | integer | Yes | City/destination ID |
| name_ar | text | Yes | Arabic activity name |
| name_en | text | No | English name |
| description_ar | text | No | Arabic description |
| category | text | Yes | مطاعم/تراث/طبيعة/تسوق/مغامرات/عائلي/ثقافة/ترفيه |
| tags | text | No | Comma-separated keywords |
| budget_level | text | No | low/medium/high |
| best_time | text | No | morning/afternoon/evening/anytime |
| duration_min | integer | No | Duration in minutes |
| is_indoor | boolean | No | TRUE/FALSE |
| is_unique | boolean | No | TRUE/FALSE |
| google_maps_url | text | No | Direct maps URL |
| tier_required | text | No | free/smart/professional |
| is_active | boolean | No | TRUE/FALSE, default: true |

### Accommodations Sheet Columns:
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| accommodation_id | integer | Yes | Stable unique ID for upsert matching |
| city_id | integer | Yes | City/destination ID |
| name_ar | text | Yes | Arabic name |
| name_en | text | No | English name |
| class | text | Yes | economy/mid/luxury |
| price_range | text | No | e.g., "300-500 ريال/ليلة" |
| description_ar | text | No | Arabic description |
| google_maps_url | text | No | Direct maps URL |
| tier_required | text | No | free/smart/professional |
| is_active | boolean | No | TRUE/FALSE, default: true |

**Import Behavior**: Upsert matching is based on stable IDs only (city_id, activity_id, accommodation_id). Existing records are updated; new IDs are inserted.

## Share Plan Feature
- Smart and Professional tier users can generate shareable URLs
- Token-based authentication using crypto.randomBytes(32)
- Public route: `/shared/:token` displays trip without auth
- Trip owners can cancel sharing anytime

## Recent Changes
- 2026-01-16: Unified Excel Import Option
  - Added "استيراد ملف شامل" tab for single-file upload containing all datasets
  - Automatic sheet detection: Cities, Activities, Accommodations (exact names required)
  - Arabic error messages when required sheets are missing
  - Per-sheet validation with preview in compact cards
  - Import order enforced: Cities → Activities → Accommodations
  - Consolidated results summary with admin page links
  - Existing separate-upload functionality preserved under "استيراد منفصل" tab
- 2026-01-16: Admin Bulk Import System
  - AdminImport page (/admin/import) with CSV and XLSX file support
  - Three-dataset upload: cities, activities, accommodations
  - Client-side validation with required headers check and preview display
  - Row-level validation for enums (tier, budgetLevel, bestTimeOfDay, class)
  - Server-side upsert logic: checks for existing records before insert/update
  - Statistics returned: inserted/updated counts per dataset
  - Sheet selection for multi-sheet Excel files
  - Upload icon added to admin navigation sidebar
- 2026-01-16: Admin Accommodations Management
  - AdminAccommodations page with city filtering and CRUD (create, edit, delete)
  - Accommodation class enum: economy (اقتصادي), mid (متوسط), luxury (فاخر)
  - Fields: nameAr/nameEn, descriptionAr/descriptionEn, priceRange, googlePlaceId, googleMapsUrl
  - Plan generation matches user's accommodationType to class; fallback to any active if no match
  - TripDetails shows accommodation class labels, priceRange, and Google Maps links
  - PDF export includes class label and priceRange; handles noAccommodationMessage gracefully
  - Hotel icon added to admin navigation sidebar
- 2026-01-16: Trip Details and Support System
  - TripDetails page (/trip/:id) with header, accommodation card, and daily itinerary breakdown
  - Google Maps search links for all activities and accommodations
  - Professional-only "best time to visit" labels with smart recommendations
  - Support messages system: schema table, public submit endpoint, admin inbox with resolve/reopen
  - AdminSupport page with unresolved/resolved count badges in admin navigation
  - Minimum 3 activities/day enforced, fallback activities when DB is empty
  - City card image fallback handler (falls back to Riyadh image on error)
- 2026-01-16: Server-side PDF Export with tier enforcement
  - Backend endpoint GET /api/plans/:id/pdf with authentication + tier + ownership checks
  - Generates PDF server-side using jsPDF with embedded Amiri Arabic font
  - PDF includes: destination, duration, dates, accommodation, daily itinerary (RTL Arabic)
  - Arabic day titles (اليوم الأول، اليوم الثاني...) and time periods (صباحًا، ظهرًا، عصرًا، مساءً)
  - Returns 403 with TIER_REQUIRED code if user is not professional tier
  - Client downloads PDF from server endpoint (not client-side generation)
  - Aligned Packages page tier IDs with database (free/smart/professional)
  - Removed all "Premium/بريميوم" naming, using "احترافي/Professional" consistently
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

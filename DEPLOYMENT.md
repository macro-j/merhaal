# Marhal Trip - Deployment Guide

## Prerequisites

- Node.js 22.x or higher
- PostgreSQL 14+ database
- pnpm package manager

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/marhal_trip

# JWT Secret (generate a random string - IMPORTANT: Use a strong random key in production)
JWT_SECRET=your-secret-key-here

# App Configuration (optional - defaults provided)
VITE_APP_TITLE=مرحال - مخطط الرحلات السياحية
VITE_APP_LOGO=/logo.png

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Note:** When deploying on Manus platform, most environment variables are auto-configured. For standalone deployment, you need to set DATABASE_URL and JWT_SECRET manually.

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb marhal_trip
```

2. Run database migrations:
```bash
pnpm db:push
```

3. Seed initial data:
```bash
node seed-data.mjs
```

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

## Running in Production

Start the production server:
```bash
pnpm start
```

The application will be available at `http://localhost:3000`

## Running in Development

Start the development server:
```bash
pnpm dev
```

## Project Structure

```
marhal-trip/
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── pages/       # Page components
├── server/              # Backend Node.js server
│   ├── _core/           # Core server functionality
│   ├── db.ts            # Database functions
│   └── routers.ts       # tRPC API routes
├── drizzle/             # Database schema
│   └── schema.ts
└── shared/              # Shared types and constants
```

## Features

- **Internal Authentication**: Email/password authentication with JWT tokens
- **Trip Planning**: Smart algorithm to generate personalized trip itineraries
- **Destinations**: Riyadh, Jeddah, AlUla, Abha with activities, hotels, and restaurants
- **Tour Guides**: Professional certified guides (Pro tier only)
- **Multi-language**: Arabic and English support
- **Dark Mode**: Theme switching support

## Database Schema

### Users
- id, email, password (hashed), name, phone, city, tier, created_at

### Destinations
- id, name, description, image, region

### Activities
- id, destination_id, name, description, type, duration, price, min_tier

### Hotels
- id, destination_id, name, description, stars, price_per_night

### Restaurants
- id, destination_id, name, cuisine, average_price

### Trips
- id, user_id, destination_id, days, budget, interests, tier, plan (JSON), created_at

### Favorites
- id, user_id, destination_id, created_at

## Deployment Platforms

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway
1. Create a new project
2. Add PostgreSQL database
3. Set environment variables
4. Deploy from GitHub

### VPS (Ubuntu)
1. Install Node.js and PostgreSQL
2. Clone repository
3. Set up environment variables
4. Run with PM2:
```bash
pm2 start "pnpm start" --name marhal-trip
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database user permissions

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Clear build cache: `rm -rf dist .vite`

### Port Already in Use
- Change PORT in .env file
- Kill process using the port: `lsof -ti:3000 | xargs kill`

## Support

For issues or questions, please create an issue in the GitHub repository.

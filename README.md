# Zillow Clone - Real Estate Platform

Full-stack real estate platform with a Laravel API backend and a React frontend.
It supports authentication, property listings, search and map features, favorites,
messaging, reviews, role-based dashboards, and Stripe-powered payments.

## Recent Additions

- Admin Location Management with persistent CRUD and seeded Italian locations.
- Admin Site and Email Settings with database persistence (`app_settings` table).
- Agent dashboard shared layout for agent-specific pages.
- Real-time notifications (Laravel broadcasting + Echo + Pusher/Reverb-compatible config).
- Admin Roles and Permissions management (Spatie Permission) with full backend CRUD and React UI.
- Comprehensive sample seeders for required business tables.

## Project Structure

- `backend` - Laravel 12 API, authentication (Sanctum), roles/permissions, Stripe integration
- `frontend` - React app (Create React App) for the client UI
- `documents` - implementation guides, setup notes, and Postman assets

## Tech Stack

- Backend: PHP 8.2+, Laravel 12, Sanctum, Spatie Permission, Stripe PHP
- Frontend: React, React Router, React Query, Tailwind CSS, Stripe Elements, Mapbox
- Database: SQLite by default (can be switched in backend `.env`)

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- A SQL database if you do not use SQLite

## Quick Start

### 1) Backend Setup

```bash
cd /home/yared/Desktop/Projects/Zillow/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm install
```

Run backend services:

```bash
# API only
php artisan serve

# Optional: run API + queue + logs + Vite watcher together
composer run dev
```

Default API URL: `http://localhost:8000`

### Seed Sample Data (All Required Tables)

To rebuild and seed everything in one command:

```bash
cd /home/yared/Desktop/Projects/Zillow/backend
php artisan migrate:fresh --seed --force
```

Seeders now include:

- Users (admin, agents, buyers, guest)
- Amenities
- Properties and property images
- Locations
- Reviews
- Favorites
- Saved searches
- Messages
- Subscription plans
- Featured listing packages
- Subscriptions
- Payments
- App settings (site/email)
- Notifications

### 2) Frontend Setup

```bash
cd /home/yared/Desktop/Projects/Zillow/frontend
npm install
cp .env.example .env
```

If `.env.example` is not present in `frontend`, create `.env` manually with:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start frontend:

```bash
npm start
```

Default app URL: `http://localhost:3000`

## Backend Environment Variables

Set these in `backend/.env` as needed:

- `APP_URL` (example: `http://localhost:8000`)
- `DB_*` variables for your database connection
- `SANCTUM_STATEFUL_DOMAINS` (for frontend auth cookies/session behavior)
- `SESSION_DOMAIN` (if you use custom/local domains)
- `GOOGLE_MAPS_API_KEY` (optional geocoding/maps features)
- `STRIPE_KEY`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- Broadcasting (for real-time notifications):
  - `BROADCAST_DRIVER`
  - `PUSHER_APP_ID`
  - `PUSHER_APP_KEY`
  - `PUSHER_APP_SECRET`
  - `PUSHER_APP_CLUSTER`
  - `PUSHER_HOST` (optional)
  - `PUSHER_PORT` (optional)
  - `PUSHER_SCHEME` (optional)

## Common Commands

Backend:

```bash
cd /home/yared/Desktop/Projects/Zillow/backend
php artisan test
composer run test
```

Frontend:

```bash
cd /home/yared/Desktop/Projects/Zillow/frontend
npm test
npm run build
```

## API and Docs

- API routes are defined in `backend/routes/api.php`
- Admin settings and management routes include:
  - `/api/admin/settings/*`
  - `/api/admin/locations/*`
  - `/api/admin/roles/*`
  - `/api/admin/permissions/*`
- Postman collection and environment:
  - `documents/postman_collection.json`
  - `documents/postman_environment.json`
- Setup guide:
  - `documents/POSTMAN_SETUP.md`

## Notes

- The backend and frontend currently contain default framework READMEs in
  `backend/README.md` and `frontend/README.md`.
- This root README is the primary entry point for running the full project.
- Roles & Permissions UI is available in the Admin Dashboard under `Settings > Roles & Permissions`.
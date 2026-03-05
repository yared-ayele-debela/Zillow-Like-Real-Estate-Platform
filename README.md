# Zillow Clone – Real Estate Platform

Full-stack real estate listing platform with a **Laravel API** backend and **React** frontend. It supports authentication, property search, favorites, messaging, reviews, role-based dashboards (Agent & Admin), Stripe payments, real-time notifications, and more.

---

## Features

### Public & Buyers

- **Home** – Featured properties, search by location/type
- **Property list** – Browse with filters (price, beds, baths, type, status, location), sort, map view (Mapbox)
- **Property detail** – Gallery (with default placeholder when images are missing), amenities, map, contact/inquire, favorite, compare
- **Compare properties** – Side-by-side comparison (`/compare?ids=1,2,3`)
- **Mortgage calculator** – Affordability and monthly payment estimate
- **Agent profile** – Public agent page with listings and contact
- **Auth** – Register, login, forgot/reset password, email verification
- **Profile** – Update profile and avatar, change password (main site `/profile`)
- **Favorites** – Save and manage favorite properties
- **Saved searches** – Save search criteria and get notified for new matches (optional job)
- **Messages** – Inbox, conversation threads, tour requests
- **Reviews** – Submit and view property reviews (pending approval)
- **Notifications** – Real-time (Pusher/Reverb) and in-app list
- **Payments** – Subscription plans, featured listing packages, payment history (Stripe)

### Agents

- **Agent dashboard** (`/agent/dashboard`) – Stats, recent leads, recent offers, quick links
- **My properties** – List, filter, add, edit, view stats
- **Add/Edit property** – Full form with image upload, reorder, primary image
- **Property stats** – Views and performance per property
- **Leads** – Inbox, view, reply, mark read, export
- **Offers** – Create, view, update, delete offers linked to properties/leads
- **Analytics** – Charts and metrics
- **Profile** – Profile and password update inside dashboard (`/agent/profile`)

### Admins

- **Admin dashboard** (`/admin/dashboard`) – Overview, pending properties, recent users
- **Users** – List, edit, delete
- **Properties** – List, approve, reject, feature
- **Reviews** – Moderate pending reviews (approve/reject)
- **Analytics** – Platform analytics
- **Reports** – Advanced reports with filters and export
- **Locations** – CRUD and sync from properties
- **Settings** – Site settings and email settings
- **Payment config** – Subscription plans and featured listing packages (CRUD)
- **Roles & permissions** – Full CRUD for roles and permissions (Spatie)
- **Profile** – Profile and password update inside dashboard (`/admin/profile`)

---

## Tech Stack

| Layer    | Stack |
|----------|--------|
| Backend  | PHP 8.2+, Laravel 12, Sanctum, Spatie Permission, Stripe, Intervention Image, Pusher (broadcasting) |
| Frontend | React 19, React Router 7, TanStack Query, Tailwind CSS, Zustand, Axios, Stripe Elements, Mapbox GL, Recharts, Laravel Echo, Heroicons |
| Database | SQLite by default (configurable via `.env`) |

---

## Project Structure

```
Zillow/
├── backend/          # Laravel 12 API (auth, properties, payments, admin, agent, notifications)
├── frontend/         # React SPA (Create React App, Tailwind)
├── documents/        # Postman collection, setup guides, feature suggestions
└── README.md
```

---

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- SQLite (or MySQL/PostgreSQL if you change backend config)

---

## Quick Start

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm install
```

Run API:

```bash
php artisan serve
# Or, with queue + logs + Vite: composer run dev
```

API base: **http://localhost:8000**

#### Fresh migrate + seed (all tables)

```bash
cd backend
php artisan migrate:fresh --seed --force
```

Seed data includes: users (admin, agents, buyers), amenities, properties & images, locations, reviews, favorites, saved searches, messages, subscription plans, featured packages, payments, app settings, notifications.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Ensure `frontend/.env` has at least:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start app:

```bash
npm start
```

App URL: **http://localhost:3000**

---

## Environment Variables

### Backend (`.env`)

- `APP_URL` – e.g. `http://localhost:8000`
- `DB_*` – Database connection (SQLite default)
- `SANCTUM_STATEFUL_DOMAINS` – For frontend auth
- `SESSION_DOMAIN` – If using custom/local domains
- `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
- **Broadcasting (notifications):** `BROADCAST_DRIVER`, `PUSHER_APP_*`, `PUSHER_HOST`, `PUSHER_PORT`, `PUSHER_SCHEME` (or Reverb equivalents)
- `GOOGLE_MAPS_API_KEY` – Optional for geocoding/maps

### Frontend (`.env`)

- `REACT_APP_API_URL` – Backend API base URL (e.g. `http://localhost:8000/api`)
- `REACT_APP_MAPBOX_TOKEN` – Mapbox map tiles
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key

---

## Main Routes (Frontend)

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/properties` | Property list (filters, map) |
| `/properties/:id` | Property detail |
| `/compare` | Compare properties (`?ids=1,2,3`) |
| `/mortgage-calculator` | Mortgage calculator |
| `/agents/:id` | Agent public profile |
| `/login`, `/register` | Auth |
| `/profile` | User profile (main site) |
| `/agent/dashboard` | Agent dashboard |
| `/agent/properties` | Agent properties |
| `/agent/leads` | Agent leads |
| `/agent/offers` | Agent offers |
| `/agent/analytics` | Agent analytics |
| `/agent/profile` | Agent profile (in dashboard) |
| `/admin/dashboard` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/properties` | Property moderation |
| `/admin/reviews` | Review moderation |
| `/admin/analytics` | Admin analytics |
| `/admin/reports` | Reports |
| `/admin/settings` | Site & email settings, roles/permissions, payment config |
| `/admin/profile` | Admin profile (in dashboard) |
| `/messages` | Messages |
| `/notifications` | Notifications |
| `/subscription` | Subscription plans |
| `/feature-listing` | Featured listing packages |
| `/payments/history` | Payment history |

---

## API Overview

- **Auth:** `POST /register`, `POST /login`, `POST /logout`, `GET /user`, forgot/reset password, email verification
- **Profile:** `GET/PUT /profile`, `POST /profile/change-password`
- **Properties:** `GET /properties`, `GET /properties/:id` (public); `POST/PUT/DELETE` (auth); images upload/reorder/delete
- **Agents:** `GET /agents/:id` (public)
- **Search:** `GET /search`, `GET /search/bounds`, filter options, suggestions
- **Favorites, saved searches, reviews, messages, notifications** – REST-style under `/api`
- **Payments:** `POST /payments`, confirm, history, refund; feature property; subscriptions
- **Agent:** `/agent/dashboard`, `/agent/properties`, `/agent/leads`, `/agent/offers`, property stats
- **Admin:** `/admin/*` – dashboard, users, properties, reviews, analytics, reports, locations, settings, payment config, roles & permissions

See `backend/routes/api.php` for full list. Postman: `documents/postman_collection.json`, `documents/postman_environment.json`; setup: `documents/POSTMAN_SETUP.md`.

---

## Default Property Image

When a property has no images or an image fails to load, the app uses a default placeholder from **`frontend/public/default_images/property-placeholder.svg`**. You can replace it with your own file (e.g. `property-placeholder.jpg`) and update `frontend/src/utils/defaultImages.js` to point to it.

---

## Commands

**Backend**

```bash
cd backend
php artisan test
composer run test
```

**Frontend**

```bash
cd frontend
npm test
npm run build
```

---

## Documentation

- **Root:** This README
- **Backend:** `backend/README.md` (Laravel)
- **Frontend:** `frontend/README.md` (project scripts and structure)

# Allo Inventory Reservation System

A full-stack inventory reservation platform built for the Allo Engineering Take-Home Assignment.

## Live Demo

https://allo-reservation-system-sage.vercel.app

---

# Features

- Product inventory management
- Multi-warehouse stock tracking
- Reservation system with expiry
- Reservation confirmation
- Reservation release/cancellation
- Concurrency-safe inventory reservation
- Live countdown timer
- Automatic stock restoration on expiry
- Modern responsive UI

---

# Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)

## Deployment
- Vercel
- Supabase

---

# Database Design

## Product
Stores product information.

## Warehouse
Stores warehouse information.

## Inventory
Tracks stock per product per warehouse.

Fields:
- totalUnits
- reservedUnits

Available stock is calculated as:

availableUnits = totalUnits - reservedUnits

## Reservation
Tracks temporary reservations.

Statuses:
- PENDING
- CONFIRMED
- RELEASED

---

# Concurrency Handling

The reservation endpoint is implemented using Prisma database transactions.

When a reservation request is made:

1. Inventory is fetched inside a transaction
2. Available stock is calculated
3. If stock is insufficient, API returns 409
4. Otherwise reservedUnits is incremented
5. Reservation record is created

This prevents overselling when multiple requests attempt to reserve the same inventory simultaneously.

---

# Reservation Expiry

Reservations expire after 10 minutes.

Expired reservations are automatically released using lazy cleanup logic.

Whenever products are fetched:
- expired PENDING reservations are detected
- reserved stock is restored
- reservation status becomes RELEASED

---

# API Endpoints

## GET /api/products
Returns all products with warehouse inventory.

## GET /api/warehouses
Returns all warehouses.

## POST /api/reservations
Creates reservation.

Returns:
- 409 if stock unavailable

## POST /api/reservations/:id/confirm
Confirms reservation.

Returns:
- 410 if reservation expired

## POST /api/reservations/:id/release
Releases reservation early.

---

# Local Setup

## 1. Clone repository

```bash
git clone <repo-url>
2. Install dependencies
npm install
3. Configure environment variables

Create .env

DATABASE_URL=your_supabase_connection_string
4. Run development server
npm run dev
Tradeoffs / Improvements

If given more time, I would improve:

background job based expiry cleanup using Vercel Cron
Redis-based distributed locking
Idempotency keys
Authentication
Better analytics/dashboard
Unit and integration testing
Optimistic UI updates
Better mobile responsiveness
Author

Anshika Babel


---

# NOW SAVE FILE

Then run:

```bash
git add .
git commit -m "Updated README"
git push

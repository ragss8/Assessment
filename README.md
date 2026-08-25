# KhateJao

KhateJao is a full-stack food discovery, ordering, and table-booking platform built as a portfolio-grade project. The product direction is inspired by food delivery and restaurant discovery apps, with an added booking layer where customers can inspect restaurant spaces and choose tables based on view preference.

## Product Highlights

- Customer discovery for restaurants, menu items, and delivery ordering.
- Table booking flow with preference matching for window view, projector view, terrace, quiet zone, private dining, and live-music view.
- 360-view-ready restaurant scenes with hotspot metadata for seating zones and table labels.
- Real restaurant names and optional Google Places customer-uploaded photos, stored as photo resource metadata in PostgreSQL and rendered through the backend.
- Restaurant operations dashboard for orders, bookings, table inventory, and view-led dining.
- NestJS API backed by PostgreSQL and Prisma.

## Tech Stack

- Frontend: React, Vite, React Router, Lucide icons
- Backend: NestJS, Prisma, PostgreSQL
- Tooling: Docker Compose, TypeScript, ESLint, Node test runner

## Frontend Setup

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Backend Setup

```bash
docker compose up -d postgres
cd backend
npm install
cp .env.example .env
# Replace JWT_SECRET with a random value of at least 32 characters.
npm run prisma:migrate
npm run seed
npm run dev
```

The backend runs at `http://localhost:8000/api`.

Public registration can create customer and restaurant-owner accounts only. Create an
administrator locally by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`,
then running:

```bash
cd backend
npm run admin:create
```

Use a password of at least 12 characters and do not run the demo seed in production.

## Real Restaurant Photos

Do not scrape images from Zomato, Google, Instagram, or customer review pages. This project uses the Google Places API path instead:

1. Add `GOOGLE_PLACES_API_KEY` to `backend/.env`.
2. Start the backend.
3. Sync real restaurants and photo resource metadata:

```bash
curl -X POST http://localhost:8000/api/places/sync-restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "city": "Bengaluru",
    "queries": [
      "Rim Naam MG Road Bengaluru",
      "Karavalli Residency Road Bengaluru",
      "Toit Indiranagar Bengaluru",
      "Mavalli Tiffin Rooms Lalbagh Bengaluru",
      "Vidyarthi Bhavan Basavanagudi Bengaluru",
      "Central Tiffin Room Malleshwaram Bengaluru",
      "Airlines Hotel Lavelle Road Bengaluru",
      "Truffles St Marks Road Bengaluru",
      "Nagarjuna Residency Road Bengaluru",
      "Meghana Foods Indiranagar Bengaluru"
    ]
  }'
```

The API stores restaurant/place metadata and Google photo resource names in Postgres. Images are rendered through `/api/place-photos/image`, which redirects to the authorized Google photo URL at runtime. If Google returns photo attributions, the frontend displays them next to the image.

Reference: Google Places Photo requests require a photo resource name plus `maxWidthPx` or `maxHeightPx`, and returned `authorAttributions` must be displayed wherever the photo is shown.

## Useful Commands

Frontend:

```bash
npm run build
npm audit
```

Backend:

```bash
cd backend
npm run prisma:generate
npm run build
npm run lint
npm test
npm audit
```

## Core API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/restaurants`
- `GET /api/restaurants/:idOrSlug`
- `GET /api/restaurants/:restaurantId/availability`
- `POST /api/bookings`
- `GET /api/bookings/restaurant/:restaurantId`
- `POST /api/orders`
- `GET /api/delivery/assignments`
- `POST /api/places/sync-restaurants`
- `GET /api/place-photos/image?name=...`

## Resume Positioning

Use this project as a primary portfolio project by framing it as:

> Built a NestJS/PostgreSQL restaurant discovery and table-booking platform with 360-view-ready seating metadata, preference-based table recommendations, food ordering, and restaurant operations workflows.

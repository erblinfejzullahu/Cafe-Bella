# ☕ Cafe Bella — Full-Stack Restaurant Website

A modern, production-ready café website with online ordering, real-time order tracking, and a full admin dashboard.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT via `jose` (admin) |
| State | Zustand (cart) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate menu data and sample reviews

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_EMAIL=admin@cafebella.com
ADMIN_PASSWORD=YourSecurePassword
ADMIN_JWT_SECRET=at-least-32-random-characters-here
```

> **Tip:** Generate a secure JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Enable Realtime in Supabase

Go to **Database → Replication** and ensure `orders` table is enabled for realtime.

### 5. Run the development server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📄 Pages & Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured menu, about, reviews, contact |
| `/menu` | Full menu with search, category filter, popular filter |
| `/cart` | Cart with quantity controls and item notes |
| `/checkout` | Order form — dine-in, takeaway, or delivery |
| `/order-success/[id]` | Real-time order tracking with progress steps |

### Admin (protected)
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard — stats overview, recent orders |
| `/admin/orders` | Live order management (accept/prepare/ready/deliver/reject) |
| `/admin/products` | Full product CRUD — add, edit, delete, toggle availability |
| `/admin/analytics` | Revenue charts, order breakdowns, type distribution |

---

## 🗄 Database Schema

```
categories      — Menu categories (Breakfast, Burgers, etc.)
products        — Menu items with price, image, availability
orders          — Customer orders with status tracking
order_items     — Line items per order
reviews         — Customer reviews (moderated)
reservations    — Table reservation requests
```

---

## 🔐 Admin Access

Login at `/admin/login` with the credentials from your `.env.local`:
- **Email:** `ADMIN_EMAIL`
- **Password:** `ADMIN_PASSWORD`

The session lasts 24 hours and is stored in an httpOnly cookie.

---

## 🛒 Ordering Flow

1. Customer browses `/menu` → adds items to cart
2. Cart persists in `localStorage` via Zustand
3. Checkout at `/checkout` → submits to `/api/orders`
4. Order created in Supabase → redirected to `/order-success/[id]`
5. Page subscribes to Supabase Realtime for live status updates
6. Admin sees new order in `/admin/orders` (Realtime + 20s polling fallback)
7. Admin accepts → preparing → ready → delivered
8. Customer sees each status change in real-time

---

## 📦 Project Structure

```
app/
  (public pages)
  admin/         → Protected admin routes
  api/           → REST API routes
components/
  admin/         → Admin-specific components
  ui/            → shadcn/ui components
lib/
  supabase/      → Browser + server clients
  store/         → Zustand cart store
  auth.ts        → JWT admin auth
  utils.ts       → Shared utilities
types/
  database.ts    → Supabase type definitions
  index.ts       → Shared types
supabase/
  schema.sql     → Run this first
  seed.sql       → Run this second
```

---

## 🎨 Customization

### Brand colors (in `app/globals.css`)
- **Primary:** Sage green `oklch(0.42 0.11 143)`
- **Accent:** Warm espresso `oklch(0.52 0.14 40)`
- Update these to match your brand

### Business info
Search for `Sheboygan` / `725 Indiana Ave` / `(920) 395-2354` across components and replace with your details.

### Tax rate
Change `TAX_RATE = 0.055` in `app/cart/page.tsx` and `app/checkout/page.tsx`.

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy — Vercel auto-detects Next.js

---

## 📋 Remaining Enhancements (optional)

- [ ] Email notifications on new order (Resend / SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Supabase Storage for product images
- [ ] Reservation management page in admin
- [ ] Review moderation in admin
- [ ] Stripe payment integration
- [ ] Loyalty program / discount codes

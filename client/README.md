# Bazaar — Multi-Vendor Marketplace Frontend

React 18 + Vite frontend for the multi-vendor-marketplace backend.

---

## Quick Start

### 1. Start the backend first
```bash
cd multi-vendor-marketplace-main
cp .env.example .env        # fill in DB credentials
npm install
node sql/seed.js            # seeds DB with demo data + admin user
npm start                   # runs on http://localhost:5000
```

### 2. Start the frontend
```bash
cd marketplace-frontend
npm install
npm run dev                 # opens http://localhost:3000
```

---

## Login Credentials (seeded)

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@marketplace.com     | Admin@123    |
| Vendor   | vendor@marketplace.com    | Vendor@123   |
| Customer | customer@marketplace.com  | Customer@123 |

---

## Full Flow to Test Products

1. **Login as Admin** → Admin Panel → Vendors tab
   - Approve the vendor account

2. **Login as Vendor** → Dashboard → Products tab
   - Click "+ New Product"
   - Fill name, price, stock qty
   - Set Status = **Active** (important — Draft won't show in shop)
   - Save

3. **Login as Customer** → Shop
   - Products now appear
   - Add to cart → Checkout → Place order

---

## Pages

| Page              | Role     | URL trigger    |
|-------------------|----------|----------------|
| Home              | Public   | /              |
| Shop              | Public   | /shop          |
| Product detail    | Public   | click product  |
| Checkout          | Customer | /checkout      |
| My Orders         | Customer | /orders        |
| Vendor Dashboard  | Vendor   | /vendor        |
| Admin Panel       | Admin    | /admin         |
| Login / Register  | Public   | /login         |

---

## Backend API (port 5000)

All API calls go to `http://localhost:5000/api`.
If your backend runs on a different port, change `BASE_URL` at the
top of `src/App.jsx`.

---

## Tech Stack

- **React 18** — UI
- **Vite 5** — dev server & bundler (no CRA)
- **Vanilla CSS-in-JS** — zero external UI libraries
- **Fetch API** — all HTTP calls

## Build for production
```bash
npm run build   # output → /dist
```

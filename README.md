# 1. Updated README.md

---

```markdown
# 🛍️ Bazaar — Multi-Vendor Marketplace

A full-stack multi-vendor marketplace platform built with **React + Tailwind CSS** 
on the frontend and **Node.js + Express + MySQL** on the backend. Features JWT 
authentication, role-based access control, vendor management, commission system, 
real-time analytics with charts, and complete order tracking.


---


## ⚙️ Tech Stack

### Frontend
| Technology        | Purpose                       |
|-------------------|-------------------------------|
| React 18          | UI framework                  |
| Vite 8            | Build tool and dev server     |
| Tailwind CSS      | Utility-first styling         | 
| React Router DOM  | Client-side routing           |
| Axios             | HTTP client with interceptors |
| Recharts          | Analytics charts              |
| Vitest            |  Unit and integration testing |
| Testing Library   | Component testing             |

### Backend
| Technology            | Purpose                               |
|-----------------------|---------------------------------------|
| Node.js               | JavaScript runtime                    |
| Express.js            | Web framework                         |
| MySQL 8               | Relational database                   |
| mysql2                | Database driver with connection pool  |
| JWT                   | Authentication tokens                 |
| bcryptjs              | Password hashing                      |
| express-validator     | Input validation                      |
| Jest + Supertest      | API testing                           |

---

## 🚀 Setup and Installation

### Prerequisites
- Node.js v18+
- MySQL 8+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/multi-vendor-marketplace.git
cd multi-vendor-marketplace
```

### 2. Backend setup
```bash
cd marketplace-backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets
```

### 3. Database setup
```bash
mysql -u root -p -e "CREATE DATABASE marketplace_db;"
npm run db:migrate
npm run db:seed
```

### 4. Start backend
```bash
npm run dev
# API running on http://localhost:5000
```

### 5. Frontend setup
```bash
cd ../client
npm install
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 6. Start frontend
```bash
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 Default Credentials

| Role      | Email                     | Password     |
|-----------|---------------------------|--------------|
| Admin     | admin@marketplace.com     | Admin@123    |
| Vendor    | vendor@marketplace.com    | Vendor@123   |
| Customer  | customer@marketplace.com  | Customer@123 |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Endpoints Summary

| Module      | Endpoints                                                                    | Auth Required |
|-------------|------------------------------------------------------------------------------|---------------|
| Auth        | POST /auth/register, /auth/login, /auth/logout, /auth/refresh, GET /auth/me  | Partial       |
| Products    | GET /products, GET /products/:slug, POST/PUT/DELETE /products/vendor/*       | Partial       |
| Categories  | GET/POST/PUT/DELETE /categories                                              | Partial       |
| Vendor      | GET/PUT /vendor/profile, /vendor/dashboard, /vendor/orders, /vendor/analytics| Vendor        |
| Orders      | POST/GET /orders, GET /orders/:uuid, PUT /orders/:uuid/cancel                | Customer      |
| Admin       |/admin/vendors,/admin/orders,/admin/commissions,/admin/analytics,/admin/users | Admin         |

**Total: 36 API endpoints**

---

## 🧪 Running Tests

### Backend Tests
```bash
cd marketplace-backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm run test:coverage
```

### Frontend Tests
```bash
cd client

# Run all tests
npm run test:run

# Watch mode
npm test

# With UI
npm run test:ui
```

### Test Coverage

| Module                         | Unit Tests | Integration Tests |
|--------------------------------|------------|-------------------|
| Backend JWT                    | 8 tests    | —                 |
| Backend Response               | 18 tests   | —                 |
| Backend Auth Middleware        | 10 tests   | —                 |
| Backend Auth Controller        | 8 tests    | —                 |
| Backend Auth API               | —          | 16 tests          |
| Backend Products API           | —          | 12 tests          |
| Frontend Badge                 | 18 tests   | —                 |
| Frontend Spinner               | 6 tests    | —                 |
| Frontend useCart               | 20 tests   | —                 |
| Frontend AuthContext           | 10 tests   | —                 |
| Frontend Login                 | —          | 16 tests          |
| Frontend Register              | —          | 10 tests          |
| Frontend Navbar                | —          | 14 tests          |
| **Total**                      | **98 tests** | **68 tests**    |

---

## 💰 Commission System

```
item_total        = unit_price × quantity
commission_amount = item_total × vendor_commission_rate / 100
vendor_earnings   = item_total − commission_amount
```

Example with 10% commission:
```
Order: iPhone 15 × 2 = ₹2,69,800
Commission (10%):      ₹26,980
Vendor earns:          ₹2,42,820
```

---

## 🗄️ Database Schema

| Table           | Purpose                                |
|-----------------|----------------------------------------|
| users           | All accounts — admin, vendor, customer |
| vendors         | Vendor shop profiles                   |
| categories      | Product categories                     |
| products        | Product listings                       |
| product_images  | Product images                         |
| orders          | Customer orders                        |
| order_items     | Per-vendor line items                  |
| commissions     | Commission ledger                      |
| reviews         | Product reviews                        |
| notifications   | User notifications                     |

---

## ✨ Key Features

- JWT auth with access + refresh tokens
- Role-based access — Admin / Vendor / Customer
- Vendor registration with admin approval workflow
- Product management with draft/active/inactive status
- Search with 500ms debounce and suggestions
- Order tracking with visual timeline
- Automatic commission calculation on every order
- MySQL transactions with rollback for order placement
- Analytics charts — Area, Bar, Line, Pie (Recharts)
- Paginated API responses with Load More UI
- Skeleton loading cards
- Toast notifications
- Cart with localStorage persistence
- 166 automated tests (unit + integration)

---

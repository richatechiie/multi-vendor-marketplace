# 🛍️ Multi-Vendor Marketplace — Backend API

A full-featured REST API built with **Node.js + Express + MySQL** featuring JWT authentication,
role-based access control, vendor management, commission system, and platform analytics.

---

## 📁 Project Structure

```
marketplace-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.js   # Register, Login, Refresh, Logout, Me
│   │   ├── vendor.controller.js # Vendor profile, dashboard, orders, analytics
│   │   ├── product.controller.js# Product CRUD (vendor) + public listing
│   │   ├── order.controller.js  # Place order, track, cancel
│   │   └── admin.controller.js  # Vendor approval, platform analytics, commission
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification + role-based authorization
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── vendor.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── admin.routes.js
│   │   └── category.routes.js
│   ├── utils/
│   │   ├── jwt.js               # Token generation & verification
│   │   └── response.js          # Standardised API response helpers
│   ├── app.js                   # Express app config
│   └── server.js                # Entry point
├── sql/
│   ├── schema.sql               # Full DB schema (10 tables)
│   ├── migrate.js               # Run migrations
│   └── seed.js                  # Seed default users & categories
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone & install
```bash
git clone <repo>
cd marketplace-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets
```

### 3. Create database & run migrations
```bash
mysql -u root -p -e "CREATE DATABASE marketplace_db;"
npm run db:migrate
npm run db:seed
```

### 4. Start server
```bash
npm run dev      # development (nodemon)
npm start        # production
```

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Roles
| Role     | Access                                      |
|----------|---------------------------------------------|
| admin    | Full platform access                        |
| vendor   | Own products, orders, analytics             |
| customer | Browse, purchase, track own orders          |

---

## 📡 API Reference

### Auth  `/api/auth`
| Method | Endpoint     | Auth     | Description              |
|--------|--------------|----------|--------------------------|
| POST   | /register    | Public   | Register customer/vendor |
| POST   | /login       | Public   | Login → tokens           |
| POST   | /refresh     | Public   | Refresh access token     |
| POST   | /logout      | Any role | Invalidate refresh token |
| GET    | /me          | Any role | Get current user profile |

---

### Products  `/api/products`
| Method | Endpoint            | Auth           | Description            |
|--------|---------------------|----------------|------------------------|
| GET    | /                   | Public         | List/search products   |
| GET    | /:slug              | Public         | Single product detail  |
| GET    | /vendor/my          | Vendor         | Vendor's own products  |
| POST   | /vendor/create      | Vendor         | Create product         |
| PUT    | /vendor/:uuid       | Vendor         | Update product         |
| DELETE | /vendor/:uuid       | Vendor         | Soft delete product    |

**Query params for GET /:** `page, limit, category, vendor, search, sort, order`

---

### Vendor Dashboard  `/api/vendor`
| Method | Endpoint               | Auth   | Description               |
|--------|------------------------|--------|---------------------------|
| GET    | /profile               | Vendor | Get vendor profile        |
| PUT    | /profile               | Vendor | Update shop info          |
| GET    | /dashboard             | Vendor | Stats + recent orders     |
| GET    | /orders                | Vendor | Paginated order items     |
| PUT    | /orders/:itemId/status | Vendor | Update shipping status    |
| GET    | /analytics             | Vendor | Sales analytics           |

---

### Orders  `/api/orders`
| Method | Endpoint       | Auth     | Description            |
|--------|----------------|----------|------------------------|
| POST   | /              | Customer | Place new order        |
| GET    | /              | Customer | My order history       |
| GET    | /:uuid         | Any      | Order detail + items   |
| PUT    | /:uuid/cancel  | Customer | Cancel pending order   |

**Place Order Body:**
```json
{
  "items": [{ "product_uuid": "xxx", "quantity": 2 }],
  "shipping": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "zip": "400001"
  },
  "payment_method": "cod"
}
```

---

### Admin  `/api/admin`
| Method | Endpoint                     | Auth  | Description              |
|--------|------------------------------|-------|--------------------------|
| GET    | /vendors                     | Admin | List all vendors         |
| PUT    | /vendors/:id/approve         | Admin | Approve vendor           |
| PUT    | /vendors/:id/reject          | Admin | Reject with reason       |
| PUT    | /vendors/:id/suspend         | Admin | Suspend vendor           |
| PUT    | /vendors/:id/commission      | Admin | Set commission rate      |
| GET    | /orders                      | Admin | All orders (filterable)  |
| PUT    | /orders/:uuid/status         | Admin | Update order status      |
| GET    | /commissions                 | Admin | Commission ledger        |
| PUT    | /commissions/:id/pay         | Admin | Mark commission paid     |
| GET    | /analytics                   | Admin | Platform-wide analytics  |
| GET    | /users                       | Admin | All users                |
| PUT    | /users/:id/toggle            | Admin | Activate/deactivate user |

---

### Categories  `/api/categories`
| Method | Endpoint | Auth   | Description         |
|--------|----------|--------|---------------------|
| GET    | /        | Public | All categories      |
| POST   | /        | Admin  | Create category     |
| PUT    | /:id     | Admin  | Update category     |
| DELETE | /:id     | Admin  | Deactivate category |

---

## 💰 Commission System

Commission is calculated automatically on every order:

```
commission_amount = item_total × vendor.commission_rate / 100
vendor_earnings   = item_total − commission_amount
```

- Each vendor has a configurable `commission_rate` (default: 10%)
- Commissions are stored per `order_item` in the `commissions` table
- Admin can view pending/cleared/paid commissions and mark them as paid
- Vendor earnings are tracked in `vendors.total_earnings`

---

## 🗄️ Database Schema (10 Tables)

```
users          → All accounts (admin / vendor / customer)
vendors        → Shop profiles linked to users
categories     → Product categories (nested)
products       → Product listings per vendor
product_images → Multiple images per product
orders         → Customer orders
order_items    → Per-vendor line items within an order
commissions    → Commission ledger per order item
reviews        → Product reviews from customers
notifications  → In-app notifications
```

---

## 🧪 Default Credentials (after seed)

| Role     | Email                       | Password     |
|----------|-----------------------------|--------------|
| Admin    | admin@marketplace.com       | Admin@123    |
| Vendor   | vendor@marketplace.com      | Vendor@123   |
| Customer | customer@marketplace.com    | Customer@123 |

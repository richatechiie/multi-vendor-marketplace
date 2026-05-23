# 1. Updated README.md

---

```markdown
# 🛍️ Bazaar — Multi-Vendor Marketplace

A full-stack multi-vendor marketplace platform built with **React + Tailwind CSS** 
on the frontend and **Node.js + Express + MySQL** on the backend. Features JWT 
authentication, role-based access control, vendor management, commission system, 
real-time analytics with charts, and complete order tracking.

---

## 📁 Project Structure

```
multi-vendor-marketplace/
├── client/                          ← React + Tailwind Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js             ← All 36 API endpoint calls (axios)
│   │   ├── components/
│   │   │   ├── Navbar.jsx           ← Sticky navbar with role-based links
│   │   │   ├── Badge.jsx            ← Status badge component
│   │   │   ├── Spinner.jsx          ← Loading spinner
│   │   │   └── ProtectedRoute.jsx   ← Route guard by role
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← Global auth state (login/logout/me)
│   │   ├── hooks/
│   │   │   ├── useCart.js           ← Cart state with localStorage
│   │   │   ├── useToast.jsx         ← Toast notification system
│   │   │   └── useDebounce.js       ← Search debounce (500ms)
│   │   ├── pages/
│   │   │   ├── Home.jsx             ← Landing page
│   │   │   ├── Login.jsx            ← Login with demo quick-fill
│   │   │   ├── Register.jsx         ← Customer / Vendor registration
│   │   │   ├── Shop.jsx             ← Product listing with debounce search
│   │   │   ├── ProductDetail.jsx    ← Product page with reviews
│   │   │   ├── Checkout.jsx         ← Cart checkout with price breakdown
│   │   │   ├── NotFound.jsx         ← 404 page
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.jsx  ← Admin tab layout
│   │   │   │   ├── Analytics.jsx    ← Charts: revenue, orders, vendors
│   │   │   │   ├── Vendors.jsx      ← Approve/reject/suspend vendors
│   │   │   │   ├── Orders.jsx       ← All orders management
│   │   │   │   ├── Commissions.jsx  ← Commission ledger + mark paid
│   │   │   │   ├── Users.jsx        ← User management
│   │   │   │   └── Categories.jsx   ← Category CRUD
│   │   │   ├── vendor/
│   │   │   │   ├── VendorLayout.jsx ← Vendor tab layout
│   │   │   │   ├── Overview.jsx     ← Dashboard stats + recent orders
│   │   │   │   ├── Products.jsx     ← Product CRUD modal
│   │   │   │   ├── VendorOrders.jsx ← Order items + status update
│   │   │   │   ├── Analytics.jsx    ← Charts: earnings, top products
│   │   │   │   └── Profile.jsx      ← Shop profile editor
│   │   │   └── customer/
│   │   │       ├── MyOrders.jsx     ← Order tracking with timeline
│   │   │       └── Profile.jsx      ← Customer profile
│   │   ├── test/
│   │   │   ├── setup.js
│   │   │   ├── unit/
│   │   │   │   ├── Badge.test.jsx
│   │   │   │   ├── Spinner.test.jsx
│   │   │   │   ├── useCart.test.js
│   │   │   │   └── AuthContext.test.jsx
│   │   │   └── integration/
│   │   │       ├── Login.test.jsx
│   │   │       ├── Register.test.jsx
│   │   │       └── Navbar.test.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── marketplace-backend/             ← Node.js + Express Backend
    ├── src/
    │   ├── config/
    │   │   └── database.js          ← MySQL connection pool
    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── vendor.controller.js
    │   │   ├── product.controller.js
    │   │   ├── order.controller.js
    │   │   └── admin.controller.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js   ← JWT verify + role guard
    │   │   └── validate.middleware.js
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── vendor.routes.js
    │   │   ├── product.routes.js
    │   │   ├── order.routes.js
    │   │   ├── admin.routes.js
    │   │   └── category.routes.js
    │   ├── utils/
    │   │   ├── jwt.js
    │   │   └── response.js
    │   ├── app.js
    │   └── server.js
    ├── sql/
    │   ├── schema.sql               ← 10 table definitions
    │   ├── migrate.js
    │   └── seed.js
    ├── tests/
    │   ├── unit/
    │   │   ├── jwt.test.js
    │   │   ├── response.test.js
    │   │   ├── auth.middleware.test.js
    │   │   └── auth.controller.test.js
    │   └── integration/
    │       ├── auth.integration.test.js
    │       └── products.integration.test.js
    └── package.json
```

---

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client with interceptors |
| Recharts | Analytics charts |
| Vitest | Unit and integration testing |
| Testing Library | Component testing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MySQL 8 | Relational database |
| mysql2 | Database driver with connection pool |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| Jest + Supertest | API testing |

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

| Role | Email | Password |
|---|---|---|
| Admin | admin@marketplace.com | Admin@123 |
| Vendor | vendor@marketplace.com | Vendor@123 |
| Customer | customer@marketplace.com | Customer@123 |

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

| Module | Endpoints | Auth Required |
|---|---|---|
| Auth | POST /auth/register, /auth/login, /auth/logout, /auth/refresh, GET /auth/me | Partial |
| Products | GET /products, GET /products/:slug, POST/PUT/DELETE /products/vendor/* | Partial |
| Categories | GET/POST/PUT/DELETE /categories | Partial |
| Vendor | GET/PUT /vendor/profile, /vendor/dashboard, /vendor/orders, /vendor/analytics | Vendor |
| Orders | POST/GET /orders, GET /orders/:uuid, PUT /orders/:uuid/cancel | Customer |
| Admin | /admin/vendors, /admin/orders, /admin/commissions, /admin/analytics, /admin/users | Admin |

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

| Module | Unit Tests | Integration Tests |
|---|---|---|
| Backend JWT | 8 tests | — |
| Backend Response | 18 tests | — |
| Backend Auth Middleware | 10 tests | — |
| Backend Auth Controller | 8 tests | — |
| Backend Auth API | — | 16 tests |
| Backend Products API | — | 12 tests |
| Frontend Badge | 18 tests | — |
| Frontend Spinner | 6 tests | — |
| Frontend useCart | 20 tests | — |
| Frontend AuthContext | 10 tests | — |
| Frontend Login | — | 16 tests |
| Frontend Register | — | 10 tests |
| Frontend Navbar | — | 14 tests |
| **Total** | **98 tests** | **68 tests** |

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

| Table | Purpose |
|---|---|
| users | All accounts — admin, vendor, customer |
| vendors | Vendor shop profiles |
| categories | Product categories |
| products | Product listings |
| product_images | Product images |
| orders | Customer orders |
| order_items | Per-vendor line items |
| commissions | Commission ledger |
| reviews | Product reviews |
| notifications | User notifications |

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

## 📄 License
MIT
```

---

---

# 2. PPT Content — Slide by Slide

---

## Slide 1 — Title Slide
```
BAZAAR
Multi-Vendor Marketplace Platform

Full Stack Web Application
React + Node.js + MySQL

Presented by: [Your Name]
Roll No: [Roll Number]
Course: [BCA / MCA / B.Tech]
College: [College Name]
Guided by: [Teacher Name]
Date: April 2026
```

---

## Slide 2 — Problem Statement
```
PROBLEM STATEMENT

❌ Small businesses struggle to reach customers online
❌ Building a custom e-commerce platform costs ₹5-50 lakhs
❌ No shared platform with proper vendor management
❌ No automated commission tracking system
❌ No transparency in vendor earnings

SOLUTION
A shared marketplace where multiple vendors can 
register, sell products, and track earnings — 
all managed through one secure platform.
```

---

## Slide 3 — Project Overview
```
BAZAAR MARKETPLACE

Type:        Full Stack Web Application
Frontend:    React + Tailwind CSS
Backend:     Node.js + Express.js
Database:    MySQL
Auth:        JWT (JSON Web Tokens)
Testing:     Vitest + Jest + Supertest

Key Numbers:
  36    API Endpoints
  10    Database Tables
   3    User Roles
 166    Automated Tests
   5    Chart Types
```

---

## Slide 4 — Tech Stack
```
TECHNOLOGY STACK

FRONTEND                    BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React 18        UI          Node.js      Runtime
Vite 8          Build       Express.js   Framework
Tailwind CSS    Styling     MySQL 8      Database
React Router    Routing     mysql2       DB Driver
Axios           HTTP        JWT          Auth
Recharts        Charts      bcryptjs     Security
Vitest          Testing     Jest         Testing
Testing Library Components  Supertest    API Testing
```

---

## Slide 5 — Three User Roles
```
THREE USER ROLES

👑 ADMIN
  • Approve or reject vendor registrations
  • Set commission rates per vendor
  • View platform analytics and revenue
  • Manage all orders and users

🏪 VENDOR
  • Register shop and await approval
  • Create and manage products
  • View own orders and update shipping
  • Sales analytics dashboard with charts

🛒 CUSTOMER
  • Browse and search products
  • Add to cart and checkout
  • Track orders with visual timeline
  • View order history and details
```

---

## Slide 6 — System Architecture
```
SYSTEM ARCHITECTURE

  Browser (React App)
       │
       ▼
  Navbar + Routes
  (React Router DOM)
       │
       ▼
  API Layer (Axios)
  Authorization Header: Bearer Token
       │
       ▼
  Express.js Server :5000
       │
  ┌────┴────┐
  │         │
  Middleware  Routes
  JWT Auth    /api/auth
  Role Guard  /api/products
  Validator   /api/vendor
  │           /api/orders
  │           /api/admin
  ▼
  Controllers (Business Logic)
       │
       ▼
  MySQL Database
  (10 Tables, Connection Pool)
```

---

## Slide 7 — Database Design
```
DATABASE SCHEMA — 10 TABLES

users          → Admin, Vendor, Customer accounts
vendors        → Shop profiles, status, commission rate
categories     → Product categories (parent/child)
products       → Listings with stock, price, status
product_images → Multiple images per product
orders         → Customer orders with shipping info
order_items    → Per-vendor line items per order
commissions    → Financial ledger per order item
reviews        → Customer product reviews + ratings
notifications  → In-app user notifications

Key Relationships:
users ──── vendors (1:1)
vendors ── products (1:many)
orders ─── order_items (1:many)
order_items ── commissions (1:1)
```

---

## Slide 8 — Key Features
```
KEY FEATURES

✦ JWT Authentication
  Access token (7 days) + Refresh token (30 days)
  Auto-logout on token expiry via Axios interceptors

✦ Search with Debounce
  500ms delay before API call
  Suggestions dropdown with highlighted text
  Active filter pills with clear buttons

✦ Order Tracking Timeline
  Visual step-by-step progress
  Animated pulse on current step
  Tracking numbers shown on shipped step
  Mini progress bar on order cards

✦ Commission System
  Auto-calculated on every order
  Separate ledger table
  Admin marks commissions as paid

✦ Analytics Charts (Recharts)
  Area charts, Bar charts, Line charts, Pie charts
  Vendor: earnings, orders, top products
  Admin: revenue, orders, vendor leaderboard
```

---

## Slide 9 — Frontend Pages
```
FRONTEND PAGES (20 PAGES)

PUBLIC               CUSTOMER            VENDOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Home                 My Orders           Overview
Login                Order Timeline      Products
Register             Profile             Orders
Shop                 Checkout            Analytics
Product Detail                           Profile

ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analytics Dashboard
Vendor Management
Order Management
Commission Ledger
User Management
Category Management
```

---

## Slide 10 — Commission System
```
COMMISSION CALCULATION

Every order auto-calculates:

  item_total  =  unit_price × quantity
  commission  =  item_total × rate / 100
  earnings    =  item_total − commission

Example:
  iPhone 15 × 2        = ₹2,69,800
  Commission (10%)     =   ₹26,980
  Vendor Earnings      = ₹2,42,820

Commission Flow:
  Order Placed → Commission Created (pending)
       ↓
  Admin Reviews → Commission Cleared
       ↓
  Admin Pays Vendor → Commission Paid ✓
```

---

## Slide 11 — Order Flow
```
ORDER PLACEMENT FLOW

Customer adds to cart → Proceeds to checkout
        ↓
System validates each product:
  • Product exists and is active?
  • Vendor is approved?
  • Sufficient stock?
        ↓
MySQL Transaction begins:
  1. Create order record
  2. Create order items
  3. Deduct stock from each product
  4. Create commission records
  5. Update vendor earnings
        ↓
Commit → Success   OR   Rollback → Error

Order Status Timeline:
Pending → Confirmed → Processing → Shipped → Delivered
```

---

## Slide 12 — Testing
```
AUTOMATED TESTING — 166 TESTS

BACKEND (Jest + Supertest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unit Tests:
  JWT utility           8 tests
  Response utility     18 tests
  Auth middleware      10 tests
  Auth controller       8 tests

Integration Tests:
  Auth API             16 tests
  Products API         12 tests

FRONTEND (Vitest + Testing Library)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unit Tests:
  Badge component      18 tests
  Spinner component     6 tests
  useCart hook         20 tests
  AuthContext          10 tests

Integration Tests:
  Login page           16 tests
  Register page        10 tests
  Navbar component     14 tests

Total: 166 Tests | All Passing ✅
```

---

## Slide 13 — Security
```
SECURITY MEASURES

🔐 Authentication
  JWT access tokens — 7 day expiry
  Refresh tokens — 30 day expiry
  Tokens invalidated on logout (DB cleared)
  Auto-logout via Axios 401 interceptor

🔑 Authorization
  3 middleware guards:
    authenticate() — verify JWT
    authorize()    — check role
    requireApprovedVendor() — vendor status

🛡️ Data Security
  bcrypt password hashing — 12 salt rounds
  Parameterized SQL queries — no SQL injection
  Input validation — express-validator
  Environment variables — no hardcoded secrets

🔒 Business Logic Security
  Vendors cannot see other vendor's data
  Customers only see their own orders
  Stock checked before order placement
  MySQL transactions with rollback
```

---

## Slide 14 — Advantages and Limitations
```
ADVANTAGES

✅ Clean MVC architecture — easy to maintain
✅ Automated commission — no manual calculation
✅ Transaction safety — no partial order data
✅ Role-based security — strict data isolation
✅ 166 automated tests — production ready
✅ Real-time analytics with interactive charts
✅ Debounced search — efficient API calls
✅ Visual order timeline — great UX

LIMITATIONS / FUTURE SCOPE

🔄 No real payment gateway (Razorpay/Stripe)
🔄 No email notifications (Nodemailer)
🔄 No image upload (AWS S3/Cloudinary)
🔄 No mobile app (React Native)
🔄 No real-time updates (Socket.io)
🔄 No Redis caching
🔄 No product variants
🔄 No coupon system
```

---

## Slide 15 — Conclusion
```
CONCLUSION

Bazaar is a complete full-stack multi-vendor 
marketplace that demonstrates:

  ✦ Modern React development with hooks and context
  ✦ RESTful API design with Node.js and Express
  ✦ Relational database design with MySQL
  ✦ JWT authentication and role-based authorization
  ✦ Automated commission calculation system
  ✦ MySQL transactions for data integrity
  ✦ Unit and integration testing (166 tests)
  ✦ Interactive analytics with Recharts
  ✦ Professional UI with Tailwind CSS
  ✦ Real-world features: debounce, timeline, charts

The project serves as a strong foundation for a 
production-ready e-commerce platform and demonstrates 
skills in full-stack development, database design, 
API security, and software testing.

THANK YOU
```

---

---

# 3. Final Project Report Content

---

## Title Page
```
BAZAAR — MULTI-VENDOR MARKETPLACE PLATFORM

Full Stack Web Application

Submitted By: [Your Name]
Roll Number:  [Roll No]
Course:       [BCA / MCA / B.Tech CSE]
College:      [College Name]
Guided By:    [Teacher Name]
Academic Year: 2025-2026
```

---

## Index
```
1. Problem Statement
2. Objective and Key Learnings
3. Functional Requirements and Non Functional Requirements
4. High Level and Low Level Design
5. Advantages and Disadvantages
6. Conclusion and Future Improvements: Potential Bottlenecks
7. References
```

---

## 1. Problem Statement

In today's digital economy, small businesses and independent sellers face major challenges reaching customers online. Building a dedicated e-commerce platform requires significant investment — typically between ₹5 lakhs to ₹50 lakhs for development alone, which is unaffordable for most small vendors.

Existing platforms like Shopify and WooCommerce charge high monthly fees, require non-technical setup, or do not provide clean REST APIs suitable for custom development. Amazon and Flipkart charge high commission rates and do not give vendors control over their own data.

Additionally, managing multiple vendors on one platform introduces several technical challenges:

- Controlling which sellers are allowed on the platform
- Automatically calculating commission without manual work
- Ensuring a customer's order from multiple vendors is processed correctly
- Giving each vendor visibility into only their own data
- Giving administrators complete control and platform-wide visibility
- Tracking order status from placement to delivery
- Providing real-time analytics for business decisions

This project solves all these problems by building a secure, scalable, and feature-complete full-stack marketplace platform called Bazaar using React, Node.js, Express, and MySQL.

---

## 2. Objective and Key Learnings

### Objectives

- Build a secure REST API with JWT authentication and refresh token mechanism
- Implement role-based access control for Admin, Vendor, and Customer
- Create a vendor registration system with admin approval workflow
- Develop a complete product management system with stock tracking
- Implement automated commission calculation on every order
- Build order management with visual tracking timeline
- Create interactive analytics dashboards with multiple chart types
- Implement debounced search with suggestions for better UX
- Write comprehensive unit and integration tests for both frontend and backend
- Follow MVC architecture for maintainable and scalable code

### Key Learnings

**Frontend:**
- Building React applications with hooks, context, and custom hooks
- Client-side routing with React Router DOM nested routes
- State management with Context API and localStorage
- HTTP interceptors with Axios for token handling and auto-logout
- Debouncing user input for efficient API calls
- Building interactive charts with Recharts library
- Component testing with Vitest and Testing Library
- Tailwind CSS utility-first styling approach

**Backend:**
- Designing and implementing REST APIs with Express.js
- Relational database design with MySQL — foreign keys, indexes, constraints
- JWT authentication with access and refresh token strategy
- Role-based middleware authorization
- MySQL transactions with rollback for data integrity
- bcrypt password hashing and secure credential storage
- Input validation with express-validator
- API testing with Jest and Supertest
- MVC architecture in production Node.js applications

---

## 3. Functional and Non-Functional Requirements

### Functional Requirements

**Authentication**
- Users register as customer or vendor with email and password
- Vendors default to pending status requiring admin approval
- Login returns JWT access token and refresh token
- Refresh token generates new access token without re-login
- Logout invalidates the refresh token in the database

**Vendor Module**
- Vendor registers with shop details — auto-creates pending vendor profile
- Admin approves, rejects, or suspends any vendor
- Approved vendor accesses dashboard, creates products, manages orders
- Vendor views sales analytics with charts — earnings, top products, daily data
- Admin sets individual commission rates per vendor

**Product Module**
- Vendors create products with name, price, stock, category, and images
- Products start as draft — vendor activates them manually
- Only active products from approved vendors appear in public listing
- Search with 500ms debounce and real-time suggestions dropdown
- Filter by category, sort by price, rating, newest, or best-selling
- Paginated listing with Load More functionality

**Order Module**
- Customer adds products from multiple vendors to single cart
- System validates stock and vendor approval before accepting order
- Automatic commission calculation per order item
- Stock deducted automatically on order placement
- MySQL transaction ensures all-or-nothing order creation
- Order tracking timeline — Pending → Confirmed → Processing → Shipped → Delivered
- Customer can cancel pending orders

**Admin Module**
- Platform analytics — revenue, commission, orders, users, vendors
- Monthly revenue area chart, order line chart, vendor bar chart
- Top vendor leaderboard with progress bars
- Commission ledger with mark-as-paid functionality
- User management with activate/deactivate toggle
- Category management with create and delete

### Non-Functional Requirements

- API response time under 200ms for standard queries
- Passwords hashed with bcrypt — 12 salt rounds
- All inputs validated with express-validator before processing
- Parameterized SQL queries — no SQL injection possible
- JWT secrets stored in environment variables
- MySQL connection pool — 20 simultaneous connections
- Transaction rollback on any order placement failure
- MVC architecture throughout backend codebase
- 166 automated tests covering unit and integration scenarios
- Axios interceptors handle token expiry and auto-logout
- Debounced search reduces API calls by ~80%

---

## 4. High Level and Low Level Design

### High Level Design

**System Components:**

```
User Browser
    ↓
React Frontend (Vite, port 5173)
    ├── Public Pages: Home, Shop, Product Detail
    ├── Customer Pages: Orders, Checkout, Profile
    ├── Vendor Dashboard: Overview, Products, Orders, Analytics, Profile
    └── Admin Panel: Analytics, Vendors, Orders, Commissions, Users, Categories
    ↓
Axios HTTP Client
    Headers: Authorization: Bearer <token>
    ↓
Express.js API Server (Node.js, port 5000)
    ├── CORS Middleware
    ├── JWT Authentication Middleware
    ├── Role Authorization Middleware
    ├── Input Validation Middleware
    └── Route Handlers → Controllers
    ↓
MySQL Database (port 3306)
    10 Tables with foreign key relationships
```

**Three User Roles and Their Access:**
- Admin: Full platform — vendors, orders, commissions, analytics, users, categories
- Vendor: Own data only — profile, products, orders, analytics (must be approved)
- Customer: Public + own data — browse products, cart, checkout, order history

### Low Level Design

**Authentication Flow:**
```
Register → hash password (bcrypt) → save user → return uuid
Login    → find user → compare password → generate access token (7d)
         → generate refresh token (30d) → save refresh in DB → return both
Request  → extract Bearer token → verify JWT → fetch user from DB → attach to req
Logout   → delete refresh token from DB → token permanently invalid
Auto     → Axios 401 interceptor → remove tokens → redirect to login
```

**Order Transaction Flow:**
```
1. Begin MySQL transaction
2. For each cart item:
   a. Fetch product + vendor + commission rate
   b. Check stock availability
   c. Calculate commission and vendor earnings
3. Create order record
4. For each item:
   a. Create order_item record
   b. Deduct stock from product
   c. Create commission record
   d. Update vendor total_sales and total_earnings
5. Commit → return order number
   OR
   Rollback → return error (no partial data saved)
```

**Debounce Search Flow:**
```
User types "iphone"
    ↓
useDebounce hook — 500ms timer starts
    ↓
User types another character → timer resets
    ↓
500ms with no new input → debouncedSearch updates
    ↓
useEffect detects debouncedSearch change → API call fires
    ↓
Results update → skeleton cards → products rendered
```

**Commission Calculation:**
```
item_total        = unit_price × quantity
commission_amount = item_total × commission_rate / 100
vendor_earnings   = item_total − commission_amount

Stored in: order_items + commissions tables
Tracked in: vendors.total_sales + vendors.total_earnings
```

**Frontend Route Protection:**
```
<ProtectedRoute role="admin">
    → No user: redirect to /login
    → Wrong role: show Access Denied
    → Correct role: render page
</ProtectedRoute>
```

**Database Table Relationships:**
```
users ──────────── vendors (1:1 via user_id)
vendors ─────────── products (1:many via vendor_id)
products ────────── product_images (1:many)
users ──────────── orders (1:many via customer_id)
orders ─────────── order_items (1:many via order_id)
vendors ─────────── order_items (1:many via vendor_id)
order_items ─────── commissions (1:1 via order_item_id)
products ────────── reviews (1:many)
users ──────────── notifications (1:many)
```

---

## 5. Advantages and Disadvantages

### Advantages

**Technical Advantages:**
- MVC architecture separates concerns cleanly — easy to add features without breaking existing code
- MySQL transactions ensure no partial data — if stock deduction fails the entire order rolls back
- JWT refresh token strategy — users stay logged in without security compromise
- Debounced search reduces API calls by approximately 80% compared to on-keystroke search
- Connection pool handles 20 simultaneous DB connections for high concurrency
- Parameterized queries prevent all SQL injection attacks
- 166 automated tests catch regressions before they reach users

**Business Advantages:**
- Commission calculated automatically on every order — zero manual work
- Commission rate is configurable per vendor — flexible business model
- Commission stored at time of order — accurate even if rates change later
- Vendor approval workflow — admin controls platform quality
- Admin can suspend vendors instantly — platform protection
- Real-time analytics help vendors make data-driven decisions
- Visual order timeline improves customer trust and reduces support queries

**UX Advantages:**
- Debounce search with suggestions — fast and intuitive product discovery
- Skeleton loading cards — professional feel during data fetch
- Toast notifications — non-blocking feedback for all actions
- Order timeline — customers know exactly where their order is
- Quick demo login buttons — easy evaluation and testing
- Load More instead of pagination — smooth browsing experience

### Disadvantages

- No real payment gateway — only Cash on Delivery is supported
- No email notifications — vendors and customers receive no email updates
- No image upload — product images are URLs only, no actual file upload
- No real-time updates — Socket.io not implemented, order updates require page refresh
- No mobile application — only web browser supported
- No Redis caching — product listings hit database on every request
- Single server deployment — no horizontal scaling or load balancing
- No coupon or discount system implemented
- No product variants like size or color options

---

## 6. Conclusion and Future Improvements

### Conclusion

Bazaar is a complete, production-ready full-stack multi-vendor marketplace platform that successfully demonstrates the practical application of modern web development technologies. The system implements all planned features including JWT authentication with refresh tokens, role-based authorization for three user types, vendor registration with admin approval workflow, product management with stock tracking, order placement with automatic commission calculation using MySQL transactions, visual order tracking timeline, interactive analytics dashboards with five chart types, debounced search with suggestions, and 166 automated unit and integration tests across both frontend and backend.

The project demonstrates real-world engineering decisions — using database transactions for data integrity, debouncing for API efficiency, JWT refresh tokens for security without friction, and Axios interceptors for seamless token management. The clean MVC architecture ensures the codebase is maintainable and ready for future enhancements.

### Future Improvements

**Payment and Commerce:**
- Integrate Razorpay or Stripe for real online payments
- Implement coupon and discount code system
- Add product variants — size, color, material with different prices
- Build a wishlist / save for later feature
- Add address book — multiple saved shipping addresses

**Communication:**
- Email notifications using Nodemailer and SMTP
- Real-time notifications using Socket.io
- SMS alerts using Twilio for order updates
- Weekly vendor earnings report via email

**Performance:**
- Redis caching for product listings and analytics
- Elasticsearch for advanced product search
- Image upload to AWS S3 or Cloudinary
- CDN for static assets

**Platform:**
- React Native mobile app for Android and iOS
- Docker containerization for easy deployment
- Kubernetes for horizontal scaling
- CI/CD pipeline with GitHub Actions
- Deploy on AWS or DigitalOcean

**Features:**
- Product reviews and ratings with order verification
- Vendor public shop page at /shop/vendor-slug
- Order invoice PDF download
- Product comparison feature
- Recently viewed products
- Vendor payout request system
- Admin product moderation workflow
- CSV export for orders and commissions

### Potential Bottlenecks

**Database Performance:** Complex analytics queries joining multiple tables will slow as data grows. Solution — add composite indexes and implement Redis caching for dashboard data.

**Connection Pool Exhaustion:** Under high traffic, 20 database connections may be insufficient. Solution — increase pool size and implement a Redis-based queue for background order processing.

**Concurrent Stock Updates:** If two customers simultaneously order the last item in stock, both might pass the stock check before either deducts it. Solution — implement SELECT FOR UPDATE inside the transaction for pessimistic locking.

**Token Storage Scalability:** Storing refresh tokens in MySQL works at small scale but becomes a bottleneck at high traffic. Solution — migrate refresh token storage to Redis with automatic TTL expiry.

**Single Process Limitation:** Node.js runs on a single process. Solution — use PM2 cluster mode or containerize with Docker and deploy behind an Nginx load balancer.

---

## 7. References

- React Official Documentation — https://react.dev
- Vite Documentation — https://vitejs.dev
- Tailwind CSS Documentation — https://tailwindcss.com/docs
- React Router Documentation — https://reactrouter.com
- Axios Documentation — https://axios-http.com/docs
- Recharts Documentation — https://recharts.org
- Vitest Documentation — https://vitest.dev
- Testing Library Documentation — https://testing-library.com
- Node.js Official Documentation — https://nodejs.org/docs
- Express.js Official Documentation — https://expressjs.com
- MySQL 8.0 Reference Manual — https://dev.mysql.com/doc
- JWT Official Documentation — https://jwt.io
- bcryptjs npm Package — https://npmjs.com/package/bcryptjs
- express-validator Documentation — https://express-validator.github.io
- Jest Official Documentation — https://jestjs.io/docs
- Supertest npm Package — https://npmjs.com/package/supertest
- REST API Design Best Practices — https://restfulapi.net
- MDN Web Docs — https://developer.mozilla.org
- Clean Code by Robert C. Martin — Software Engineering Reference
- Node.js Design Patterns — Mario Casciaro, Luciano Mammino
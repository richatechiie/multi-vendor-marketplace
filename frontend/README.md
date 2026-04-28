# MarketHub - Multi-Vendor Marketplace Frontend

A modern React/Next.js frontend for a multi-vendor marketplace platform with comprehensive customer and vendor interfaces.

## Features

### Customer Features
- **Product Browsing**: Browse and search products across multiple categories
- **Product Details**: View detailed product information, ratings, and customer reviews
- **Shopping Cart**: Add/remove items with persistent local storage
- **Checkout**: Complete multi-step checkout with shipping and payment information
- **Order Management**: Track order history and real-time order status
- **User Profile**: Manage personal account information
- **Reviews & Ratings**: Leave and view product reviews

### Vendor Features
- **Vendor Dashboard**: Complete overview with sales metrics, order count, and ratings
- **Product Management**: Add, edit, and delete products with inventory tracking
- **Order Management**: View, filter, and process customer orders
- **Shop Settings**: Customize shop information and branding
- **Sales Analytics**: Track performance metrics and customer reviews

### Authentication & Security
- Customer signup and login with email/password
- Vendor registration and management
- Role-based access control (customer/vendor/admin)
- Token-based authentication with localStorage persistence
- Protected routes based on user role

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with localStorage persistence
- **HTTP Client**: Axios with request/response interceptors
- **Data Fetching**: SWR for caching and synchronization

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
frontend/
├── app/                    # Next.js pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout
│   ├── login/signup/      # Auth pages
│   ├── profile/orders/    # User pages
│   └── vendor/            # Vendor pages
├── components/            # React components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── store.ts          # State management
└── public/               # Static assets
```

## State Management

### Auth Store
- User authentication state
- Login/logout functionality
- Token management

### Cart Store
- Shopping cart items
- Persistence to localStorage
- Price calculations

## Building & Deployment

### Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## API Endpoints

See `.env.local.example` for backend configuration. The frontend expects the following API structure:

**Auth**: `/auth/login`, `/auth/signup`, `/auth/vendor-signup`
**Products**: `/products`, `/products/:id`
**Cart**: `/cart`, `/cart/items`
**Orders**: `/orders`, `/orders/:id`
**Reviews**: `/reviews/product/:id`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (required) |

## Key Features

- ✅ Responsive design (mobile-first)
- ✅ Server-side rendering with Next.js
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Client-side state management with Zustand
- ✅ Role-based access control
- ✅ Shopping cart with persistence
- ✅ Complete checkout flow
- ✅ Vendor dashboard
- ✅ Product reviews and ratings

## Support & Documentation

For detailed API documentation, refer to the backend README. For frontend-specific issues, check the troubleshooting section in `.env.local.example`.

## License

Proprietary - MarketHub Platform

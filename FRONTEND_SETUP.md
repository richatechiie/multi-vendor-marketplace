# Frontend Setup Guide - MarketHub Marketplace

## Overview

This guide walks you through setting up and running the complete React/Next.js frontend for the MarketHub multi-vendor marketplace.

## What's Included

A fully functional frontend with:
- ✅ **13 pages** covering all marketplace functionality
- ✅ **Customer experience**: Browse, search, cart, checkout, orders
- ✅ **Vendor dashboard**: Sales analytics, product management, order processing
- ✅ **Authentication**: Login/signup for both customers and vendors
- ✅ **State management**: Zustand with localStorage persistence
- ✅ **API integration**: Ready to connect with backend

## Architecture

```
Frontend (Next.js 16)
├── UI Components (Tailwind CSS)
├── State Management (Zustand)
└── API Client (Axios)
        ↓
Backend API (Node.js/Express)
        ↓
Database (PostgreSQL/MySQL)
```

## Installation Steps

### 1. Prerequisites
```bash
# Check Node.js version (requires 18+)
node --version
npm --version
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

### 3. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Point to your backend API (update port if different)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Start Development Server
```bash
npm run dev
```

Access the frontend at: **http://localhost:3001**

## Pages & Routes

### Public Pages (No login required)
- `/` - Homepage with featured products
- `/products` - Browse all products with filters
- `/products/[id]` - Product details & reviews
- `/login` - Customer login
- `/signup` - Customer registration
- `/vendor/signup` - Vendor registration

### Protected Customer Pages
- `/profile` - User profile & settings
- `/cart` - Shopping cart management
- `/checkout` - Purchase checkout
- `/orders` - Order history & tracking
- `/orders/[id]` - Order details

### Protected Vendor Pages
- `/vendor/dashboard` - Sales metrics & overview
- `/vendor/products` - Manage products
- `/vendor/products/add` - Add new product
- `/vendor/products/[id]/edit` - Edit product
- `/vendor/orders` - Manage customer orders

## API Integration

### Backend Connection

The frontend communicates with your backend via the API client in `lib/api.ts`. The client:
1. Sets base URL from `NEXT_PUBLIC_API_URL`
2. Adds Bearer token to requests
3. Handles 401 errors with redirect to login
4. Supports all marketplace operations

### Required Backend Endpoints

Ensure your backend provides these endpoints:

**Authentication**
```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/vendor-signup
GET    /api/auth/profile
POST   /api/auth/logout
```

**Products**
```
GET    /api/products?category=...&search=...
GET    /api/products/:id
POST   /api/products (vendor)
PUT    /api/products/:id (vendor)
DELETE /api/products/:id (vendor)
```

**Cart**
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart
```

**Orders**
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status (vendor)
```

**Reviews**
```
GET    /api/reviews/product/:id
POST   /api/reviews/product/:id
```

**Vendors**
```
GET    /api/vendors/:id
GET    /api/vendors/:id/products
GET    /api/vendors/dashboard
```

## Development Workflow

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd /path/to/backend
npm start
# Runs on http://localhost:3000

# Terminal 2 - Frontend
cd /path/to/frontend
npm run dev
# Runs on http://localhost:3001
```

### 2. Test the Flow
- Open http://localhost:3001
- Create customer account (signup)
- Browse products
- Add items to cart
- Proceed to checkout
- Create vendor account and check vendor dashboard

### 3. Build for Production
```bash
npm run build
npm start
```

## State Management

### Zustand Stores

**Auth Store** (`lib/store.ts`)
```typescript
useAuthStore.getState().login(user, token)
useAuthStore.getState().logout()
useAuthStore.getState().setUser(userData)
```

**Cart Store** (`lib/store.ts`)
```typescript
useCartStore.getState().addItem(product)
useCartStore.getState().removeItem(itemId)
useCartStore.getState().getTotal() // Returns total price
useCartStore.getState().getItemCount() // Returns quantity
```

Both stores persist to localStorage automatically.

## Customization

### Change Colors
Update Tailwind classes in components (currently using blue primary):
```tsx
// Change from blue-600 to your color
className="bg-blue-600 hover:bg-blue-700"
```

### Add New Pages
1. Create file: `app/your-page/page.tsx`
2. Use `'use client'` for interactive components
3. Import Layout wrapper for consistent styling
4. Use API client for data fetching

### Modify API Endpoints
Edit `lib/api.ts` to update endpoint URLs and add new endpoints:
```typescript
export const customAPI = {
  getCustom: () => api.get('/custom-endpoint'),
  postCustom: (data) => api.post('/custom-endpoint', data),
};
```

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts to deploy
```

### Option 2: Docker
```bash
# Create Dockerfile
docker build -t marketplace-frontend .
docker run -p 3001:3001 marketplace-frontend
```

### Option 3: Traditional Server
```bash
npm run build
npm start
# Deploy .next folder to your server
```

## Troubleshooting

### Issue: API Connection Error
**Solution:**
1. Verify backend is running on correct port
2. Check `NEXT_PUBLIC_API_URL` is correct in `.env.local`
3. Check backend CORS configuration allows frontend origin
4. Review browser console for error details

### Issue: Cart Not Persisting
**Solution:**
1. Clear browser localStorage: Open DevTools → Application → LocalStorage → Clear All
2. Check browser privacy settings allow localStorage
3. Restart the development server

### Issue: Build Errors
**Solution:**
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: 401 Unauthorized Errors
**Solution:**
1. Login again (token may have expired)
2. Check token is being saved to localStorage
3. Verify backend returns valid JWT token

## Testing Credentials

For development/testing with mock data:

**Customer**
- Email: any@example.com
- Password: any password (signup)

**Vendor**
- Email: vendor@example.com
- Password: any password (vendor signup)
- Shop Name: Test Shop

## Performance Tips

1. **Lazy Load Images**: Already implemented with `next/image`
2. **Code Splitting**: Next.js automatic route-based splitting
3. **Caching**: SWR provides smart caching
4. **Database Indexing**: Ensure backend has proper indexes
5. **CDN**: Use Vercel or CloudFlare for faster asset delivery

## Security Considerations

- ✅ Tokens stored in localStorage (can upgrade to httpOnly cookies)
- ✅ Request interceptor adds Bearer token automatically
- ✅ 401 errors trigger logout and redirect
- ✅ SQL injection prevented by backend parameterized queries
- ✅ CORS enabled only for allowed origins

## Next Steps

1. **Configure Backend**: Ensure all API endpoints match frontend expectations
2. **Test Integration**: Walk through the complete user flow
3. **Customize Branding**: Update colors, fonts, and logos
4. **Add Features**: Implement wishlists, advanced filtering, etc.
5. **Deploy**: Push to production using Vercel or Docker

## File Structure Details

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with header/footer
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Product listing
│   │   └── [id]/page.tsx       # Product details
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── profile/page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── vendor/
│       ├── signup/page.tsx
│       ├── dashboard/page.tsx
│       ├── products/page.tsx
│       └── orders/page.tsx
├── components/
│   ├── Layout.tsx              # Main layout component
│   └── ProductCard.tsx         # Reusable product card
├── lib/
│   ├── api.ts                  # API client setup
│   └── store.ts                # Zustand stores
├── public/                     # Static assets
└── README.md                   # Frontend documentation
```

## Support & Help

- Check `/frontend/README.md` for detailed documentation
- Review `.env.local.example` for configuration options
- Inspect browser console for error messages
- Check backend logs for API errors

## Summary

You now have a complete, production-ready frontend for your multi-vendor marketplace that includes:
- Full customer shopping experience
- Comprehensive vendor management tools
- Secure authentication & authorization
- Real-time state management
- Professional UI with Tailwind CSS
- Type-safe code with TypeScript

Start the servers and begin testing!

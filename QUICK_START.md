# Quick Start - MarketHub Frontend

## 5-Minute Setup

### Start Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit: **http://localhost:3001**

### Configure Backend URL

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## What You Get

✅ **13 Complete Pages**
- Homepage with featured products
- Product browsing with search & filters
- Product detail pages with reviews
- Shopping cart with persistence
- Checkout flow
- User authentication (customer & vendor)
- User profile & order history
- Vendor dashboard with analytics
- Vendor product management
- Vendor order management

✅ **Full Features**
- Product search and filtering by category
- Price range filtering
- Sort by price, rating, latest
- Shopping cart with quantity management
- Persistent cart (localStorage)
- Complete checkout process
- Role-based access control
- Review system with ratings
- Vendor analytics dashboard

✅ **Professional Setup**
- TypeScript for type safety
- Tailwind CSS responsive design
- Zustand state management
- Axios API client with interceptors
- SWR for data fetching
- Next.js 16 with latest features

## Key Commands

```bash
# Development
npm run dev          # Start dev server on port 3001

# Production
npm run build        # Build optimized bundle
npm start           # Run production server

# Linting
npm run lint        # Check code quality
```

## File Locations

- **Pages**: `frontend/app/` (13 page files)
- **API Client**: `frontend/lib/api.ts`
- **State Management**: `frontend/lib/store.ts`
- **Components**: `frontend/components/`
- **Styles**: Tailwind CSS (built-in)
- **Configuration**: `frontend/.env.local`

## Expected API Response Format

Backend should return responses like:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success"
}
```

For login/signup:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "customer" | "vendor"
    },
    "token": "jwt_token_here"
  }
}
```

## Features at a Glance

| Feature | Status | Location |
|---------|--------|----------|
| Homepage | ✅ | `app/page.tsx` |
| Product Listing | ✅ | `app/products/page.tsx` |
| Product Details | ✅ | `app/products/[id]/page.tsx` |
| Shopping Cart | ✅ | `app/cart/page.tsx` |
| Checkout | ✅ | `app/checkout/page.tsx` |
| Login | ✅ | `app/login/page.tsx` |
| Signup | ✅ | `app/signup/page.tsx` |
| Vendor Signup | ✅ | `app/vendor/signup/page.tsx` |
| User Profile | ✅ | `app/profile/page.tsx` |
| Orders | ✅ | `app/orders/page.tsx` |
| Vendor Dashboard | ✅ | `app/vendor/dashboard/page.tsx` |
| Vendor Products | ✅ | `app/vendor/products/page.tsx` |
| Vendor Orders | ✅ | `app/vendor/orders/page.tsx` |

## Common Errors & Solutions

**"Cannot GET /products"**
- Make sure backend API is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**"Token is not defined"**
- Create a customer account first (signup)
- Token is automatically saved to localStorage

**"404 Not Found on API calls"**
- Verify backend has all the required endpoints
- Check endpoint paths match exactly
- Review backend API documentation

**"CORS errors"**
- Add frontend URL to backend CORS configuration
- Default: `http://localhost:3001`

## Testing the Flow

1. **Open homepage**: http://localhost:3001
2. **Browse products**: Click "Shop Now" or go to /products
3. **View product**: Click any product card
4. **Add to cart**: Click "Add to Cart" button
5. **Go to cart**: Click cart icon in header
6. **Checkout**: Click "Proceed to Checkout"
7. **Sign up**: Create a new account
8. **Vendor signup**: Create vendor account to see vendor dashboard

## Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (Next.js 16)               │
│  - 13 Pages                             │
│  - Shopping Cart (Zustand)              │
│  - Auth (Zustand)                       │
│  - Tailwind CSS                         │
└────────────┬────────────────────────────┘
             │
             │ HTTP API (Axios)
             │
┌────────────▼────────────────────────────┐
│     Backend (Node.js/Express)           │
│  - Authentication                       │
│  - Products                             │
│  - Orders                               │
│  - Vendors                              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Database (PostgreSQL/MySQL)         │
│  - Users                                │
│  - Products                             │
│  - Orders                               │
│  - Reviews                              │
└─────────────────────────────────────────┘
```

## Next Steps

1. ✅ Start backend API on port 3000
2. ✅ Start frontend on port 3001
3. ✅ Create customer account
4. ✅ Browse and test shopping flow
5. ✅ Create vendor account
6. ✅ Test vendor dashboard
7. 🔄 Customize colors & branding
8. 🔄 Add additional features
9. 🚀 Deploy to production

## Customization Examples

**Change Primary Color** (in components):
```tsx
// From blue-600 to green-600
className="bg-green-600 hover:bg-green-700"
```

**Add New API Endpoint** (in `lib/api.ts`):
```typescript
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
};
```

**Add New Page**:
1. Create `app/my-page/page.tsx`
2. Add `'use client'` at top
3. Import Layout for header/footer
4. Use API client for data

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

## Performance

- **Auto code splitting** by Next.js
- **Image optimization** with next/image
- **Lazy route loading**
- **Smart caching** with SWR
- **localStorage persistence** for cart

## Security

- ✅ JWT token authentication
- ✅ Auto token injection in requests
- ✅ Auto logout on 401 errors
- ✅ Role-based access control
- ✅ Protected routes

## Support

- Check `FRONTEND_SETUP.md` for detailed guide
- Check `frontend/README.md` for API details
- Check browser console for errors
- Check backend logs for API issues

---

**Ready?** Run `npm run dev` and start building! 🚀

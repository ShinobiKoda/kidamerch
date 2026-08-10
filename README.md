# KidaMerch – Premium Anime Merchandise Platform

A full-stack e-commerce platform specializing in premium anime merchandise, built with modern web technologies and designed for scalability, performance, and delightful user experience.

## 🎯 Project Overview

**KidaMerch** is a sophisticated storefront and admin system for selling high-quality anime merchandise including apparel, figures, collectibles, and more. The platform features:

- **Customer Storefront**: Browse products, manage cart, checkout, and order tracking
- **Admin Dashboard**: Manage products, inventory, orders, events, and business insights
- **Event Management**: Promotional events with special pricing and visibility
- **Inventory Tracking**: Real-time stock management with variants
- **Order Management**: Full order lifecycle from creation to fulfillment
- **Analytics & Insights**: Business metrics and performance tracking
- **Category Management**: Dynamic product categorization system

## 🛠️ Tech Stack

### Frontend

- **React 19** – Modern component framework
- **TanStack Router** – Type-safe client-side routing
- **TanStack Start** – Full-stack framework with SSR
- **TanStack Query** – Server state management & caching
- **Vite** – Lightning-fast build tool
- **TypeScript** – Type-safe code

### UI & Styling

- **Tailwind CSS** – Utility-first styling
- **Radix UI** – Accessible component primitives
- **Lucide React** – Icon library
- **Framer Motion** – Smooth animations
- **Embla Carousel** – Touch-friendly carousel component

### Backend & Database

- **Supabase** – PostgreSQL database + Auth
- **Nitro** – Server-side runtime (Cloudflare Workers compatible)
- **Cloudinary** – Image hosting & optimization
- **PostHog** – Product analytics & feature flags
- **WhatsApp API** – Customer notifications

### Development Tools

- **Bun** – JavaScript runtime & package manager
- **ESLint** – Code linting
- **Prettier** – Code formatting
- **TanStack Router Plugin** – Automatic route generation

## 📁 Project Structure

```
src/
├── api/                      # API routes (backend endpoints)
│   ├── auth.ts              # Authentication endpoints
│   ├── categories.ts        # Category queries
│   ├── events.ts            # Event management
│   ├── products.ts          # Product queries
│   ├── hero.ts              # Hero section data
│   └── admin/               # Admin-only endpoints
│       ├── categories.ts
│       ├── products.ts
│       ├── orders.ts
│       ├── inventory.ts
│       ├── events.ts
│       ├── insights.ts
│       └── settings.ts
├── components/              # Reusable React components
│   ├── ui/                  # Radix UI components
│   ├── admin/               # Admin-specific components
│   └── landing-page/        # Landing page sections
├── routes/                  # Page components (TanStack Router)
│   ├── index.tsx            # Home page
│   ├── shop.tsx             # Product listing
│   ├── product.$id.tsx      # Product detail
│   ├── cart.tsx             # Shopping cart
│   ├── checkout.tsx         # Checkout flow
│   ├── events.tsx           # Events page
│   ├── wishlist.tsx         # Saved items
│   ├── admin.tsx            # Admin shell
│   └── admin.*              # Admin pages
├── lib/                     # Utility functions & services
│   ├── supabase.ts          # Supabase client
│   ├── store.tsx            # Global state management
│   ├── data-store.tsx       # Data caching layer
│   ├── posthog.ts           # Analytics initialization
│   ├── whatsapp.ts          # WhatsApp integration
│   └── helpers.ts           # Shared utilities
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication state
│   ├── useProducts.ts       # Products data fetching
│   ├── useCategories.ts     # Categories data fetching
│   ├── useEvents.ts         # Events data fetching
│   └── use-mobile.tsx       # Responsive design hook
├── types/                   # TypeScript type definitions
│   ├── database.types.ts    # Auto-generated Supabase types
│   ├── storefront.ts        # Frontend types
│   └── admin.ts             # Admin types
├── data/                    # Static & seed data
│   ├── products.ts          # Product catalog
│   ├── events.ts            # Event data
│   └── seed-urls.json       # Image URLs for seeding
├── styles/                  # Global styles
├── server.ts                # SSR error handling
└── start.ts                 # App entry point

supabase/
├── migrations/              # Database schema migrations
└── seed.sql                 # Initial data seeding

public/                      # Static assets
scripts/                     # Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
  ```bash
  # Check if installed
  node --version
  npm --version
  ```
- **Supabase Account** (local or cloud)
- **Cloudinary Account** (for image hosting)
- **.env.local file** with required secrets (see [Environment Setup](#-environment-setup))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kidamerch
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up Supabase**

   ```bash
   # Using Supabase CLI (optional, for local development)
   supabase start

   # Run migrations (automatic on first connection)
   # Or manually: supabase db push
   ```

5. **Seed initial data**

   ```bash
   npm run upload-seed-images
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:8080`

## 🔧 Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary (image hosting)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PostHog (analytics)
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Note:** All `VITE_*` variables are exposed to the client. Only put non-sensitive public data there.

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR

# Building
npm run build            # Production build
npm run build:dev        # Development build

# Preview
npm run preview          # Test production build locally

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

## 🗄️ Database Schema

The Supabase PostgreSQL database includes:

### Core Tables

- **products** – Product catalog with pricing and metadata
- **product_variants** – Product sizes, colors, and variations
- **product_images** – Product images (linked to Cloudinary)
- **categories** – Product categories and collections

### E-Commerce

- **orders** – Customer orders with status tracking
- **order_items** – Individual items in orders
- **inventory** – Stock levels per variant

### Features

- **events** – Promotional events with custom pricing
- **profiles** – User profiles and preferences
- **insights_series** – Time-series analytics data

### Authentication & Security

- Uses Supabase Auth (built-in PostgreSQL security)
- Row-Level Security (RLS) policies for data access control
- Admin role distinction for authorization

**View migrations**: `/supabase/migrations/`

## 🔐 Authentication & Authorization

- **Supabase Auth** handles user registration, login, and session management
- **Admin Role** – Restricted access to admin dashboard
- **RLS Policies** – Database-level row security prevents unauthorized data access
- **Session Tokens** – JWT tokens managed automatically by Supabase

Admin check example:

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
const isAdmin = user?.user_metadata?.role === "admin";
```

## 📊 API Endpoints

All API endpoints use TanStack Start's file-based routing (src/api/):

### Public Endpoints

- `GET /api/products` – Fetch all products
- `GET /api/categories` – Fetch product categories
- `GET /api/events` – Fetch active events
- `GET /api/hero` – Hero section data

### Authenticated Endpoints

- `POST /api/orders` – Create new order
- `GET /api/orders/:id` – Fetch order details

### Admin Endpoints (Requires admin role)

- `POST /api/admin/products` – Create/update product
- `DELETE /api/admin/products/:id` – Delete product
- `POST /api/admin/categories` – Manage categories
- `GET /api/admin/orders` – View all orders
- `GET /api/admin/insights` – Analytics data
- `POST /api/admin/inventory` – Update stock levels
- `POST /api/admin/events` – Create/manage events

## 🎨 UI Component Library

We use **Radix UI** primitives with Tailwind CSS styling. Custom components are in `src/components/ui/`:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// ... many more available
```

See `src/components/ui/` for complete list.

## 🔄 State Management

### Server State (TanStack Query)

```typescript
import { useQuery } from "@tanstack/react-query";
const { data: products, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => fetch("/api/products").then((r) => r.json()),
});
```

### Client State (Store Context)

```typescript
import { useStore } from "@/lib/store";
const { user, setUser } = useStore();
```

### Data Caching (Data Store)

```typescript
import { getDataStore } from "@/lib/data-store";
const store = getDataStore();
store.cache("products", products);
```

## 🖼️ Image Handling

Images are hosted on **Cloudinary** and optimized for web:

```typescript
import { CldImage } from 'next-cloudinary'
<CldImage
  src="cloudinary-public-id"
  width={500}
  height={500}
  alt="Product image"
  crop="fill"
  gravity="auto"
/>
```

Admin can upload images, which are automatically synced to Cloudinary and linked in the database.

## 📈 Analytics & Monitoring

### PostHog Integration

```typescript
import { usePostHog } from "posthog-js/react";
const posthog = usePostHog();
posthog.capture("add_to_cart", { product_id: "123" });
```

- Event tracking for user actions
- Feature flags for A/B testing
- Error logging and performance monitoring

### Error Reporting

- Lovable error capture and reporting
- Centralized error page rendering
- SSR error handling with recovery

## 📱 Responsive Design

The `use-mobile` hook provides responsive utilities:

```typescript
import { useMobile } from '@/hooks/use-mobile'
const isMobile = useMobile()

return (
  <div className={isMobile ? 'grid grid-cols-1' : 'grid grid-cols-3'}>
    ...
  </div>
)
```

## 🧪 Testing & Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

- ESLint configuration in `eslint.config.js`
- Prettier for automatic formatting
- TypeScript strict mode enabled

## 🚢 Deployment

### Build for Production

```bash
bun run build
```

Outputs optimized bundles to `dist/`:

- Client bundle (JavaScript/CSS)
- Server bundle (for Nitro/Cloudflare Workers)

### Deployment Targets

- **Cloudflare Workers** (default via Nitro)
- **Vercel** (with adapter configuration)
- **Netlify** (with adapter configuration)
- **Traditional Node.js servers**

### Environment Variables in Production

Ensure all environment variables from `.env.local` are set in your hosting platform's config.

## 🐛 Debugging

### Development Tools

- TanStack Router DevTools (available in dev mode)
- React DevTools browser extension
- Supabase Dashboard for database inspection
- Cloudinary Dashboard for image management

### Common Issues

**"Cannot find module" errors**

- Run `npm install` to update dependencies
- Check `tsconfig.json` for path aliases (`@/` maps to `src/`)

**Supabase connection errors**

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check Supabase project is active in dashboard

**Image upload failures**

- Verify Cloudinary credentials
- Check file size limits (defaults to 10MB)
- Ensure Cloudinary upload preset is configured

**Admin access denied**

- Verify user has `admin` role in Supabase `profiles` table
- Clear browser localStorage and re-authenticate
- Check RLS policies in Supabase

## 📚 Additional Resources

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Radix UI Components](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Contributing

When picking up this project:

1. **Read this README** to understand the architecture
2. **Explore the routes** in `src/routes/` to see page structure
3. **Check API endpoints** in `src/api/` for backend logic
4. **Review migrations** in `supabase/migrations/` for schema understanding
5. **Run the dev server** and explore the UI
6. **Follow existing patterns** for new features and components

### Code Style

- Use TypeScript – no `any` types without good reason
- Follow existing component patterns
- Keep components focused and reusable
- Add comments for complex logic
- Test database queries in Supabase console first

## 📄 License

MIT

---

**Questions?** Check the existing code, Supabase docs, and component examples. Happy building! 🚀

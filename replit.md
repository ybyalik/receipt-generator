# ReceiptGen - Receipt Generator Application

## Overview

ReceiptGen is a Next.js-based web application that allows users to create, customize, and download professional receipts. The application provides pre-built templates for various business types (computer repair, restaurant, gas station) and offers a drag-and-drop interface for customizing receipt sections. Users can generate receipts with real-time preview, and premium users can download watermark-free versions.

## Current Status (MVP Complete - Admin/User System Implemented)

The application is fully functional with all core features implemented:
- ✅ Home page with hero section and feature showcase
- ✅ Templates listing page (/templates) with 3 pre-built templates
- ✅ Template customization (/template/[slug]) with drag-and-drop interface
- ✅ **Section management** - Add, remove, and duplicate sections when editing templates
- ✅ **Icon-based controls** - Alignment and divider styles use icon buttons instead of dropdowns
- ✅ **Global template settings** - Configure custom currency text, format, font style, text color, and realistic receipt background textures (creases, folds, wear) for entire templates
- ✅ Live receipt preview with watermark overlay
- ✅ PNG download functionality (with html2canvas)
- ✅ **Admin/User Role Separation**:
  - Admin panel (/admin) for managing global templates (create/edit/delete)
  - Admin-only template editor (/admin/templates/[id]) for global template modifications
  - User template customization (/template/[slug]) - saves to personal collection
  - "My Templates" page (/my-templates) for user's saved templates
  - Role-based access control via email whitelist
- ✅ **PostgreSQL database integration** - dual-table architecture:
  - `templates` table for global templates (admin-managed)
  - `user_templates` table for user customizations
- ✅ **API routes** with role-based access control
- ✅ Pricing page with free and premium tiers
- ✅ Firebase authentication (optional - requires setup)

## Setup Instructions

### Enable Firebase Authentication:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google authentication in Firebase Console
3. Add your Replit domain to Firebase authorized domains
4. Add these secrets to your Repl:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID

### Configure Admin Access:
1. Add admin email addresses to your secrets:
   - NEXT_PUBLIC_ADMIN_EMAILS (comma-separated list)
   - Example: "admin@example.com,manager@example.com"
2. Only users with these emails can create/edit/delete global templates

### Security Note:
⚠️ **Current Limitation**: User template APIs use client-provided userId. In production, implement proper server-side authentication:
- Use Firebase Admin SDK to verify ID tokens server-side
- Derive userId from verified session instead of trusting client input
- Add authentication middleware to all user-templates endpoints

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with TypeScript and React 19
- Pages Router architecture (not App Router)
- Server-side rendering capabilities for SEO and performance
- TypeScript for type safety across the application

**UI Components**:
- Modular component structure in `/components` directory
- Layout component wraps all pages with navigation and authentication state
- ReceiptPreview component handles real-time rendering of receipts
- SectionEditor provides customization interface for receipt sections

**Styling**: Tailwind CSS v4
- Utility-first CSS framework
- PostCSS integration for processing
- Responsive design patterns throughout
- Custom configuration in `tailwind.config.js`

**State Management**:
- React Context API for authentication state (AuthContext)
- TemplatesContext for shared template state across pages
- Syncs with PostgreSQL database via API routes
- Local component state with useState hooks for UI interactions

**Drag-and-Drop**: @dnd-kit library suite
- Core, sortable, and utilities packages
- Used for reordering receipt sections in template editor
- Touch and keyboard accessible

**Receipt Generation**:
- html2canvas for converting DOM elements to downloadable images
- JsBarcode for generating barcode elements
- date-fns for date formatting and manipulation

### Authentication Architecture

**Provider**: Firebase Authentication
- Google OAuth sign-in only
- Conditional initialization (gracefully handles missing credentials)
- User state managed through AuthContext
- Premium status tracked in user object (not yet persisted to database)

**Access Control**:
- **Admin Role**: Email-based whitelist (NEXT_PUBLIC_ADMIN_EMAILS)
  - Only admins can create/edit/delete global templates
  - Access admin panel and admin template editor
- **User Role**: All authenticated users
  - Can customize global templates and save to personal collection
  - Cannot modify global templates
- Download restrictions based on premium status (watermark logic)

### Data Architecture

**Database**: PostgreSQL with Drizzle ORM
- Replit-hosted PostgreSQL database (Neon-backed)
- Schema defined in `shared/schema.ts`
- **Dual-table architecture**:
  - `templates` table: Global templates (admin-managed)
  - `user_templates` table: User customizations (user-scoped)
- Database operations in `server/storage.ts`
- Migrations via `npm run db:push`

**Templates**:
- Stored in PostgreSQL database with full CRUD support
- Automatically seeded from `lib/mockTemplates.ts` on first run
- Template structure defined by TypeScript interfaces in `lib/types.ts`
- Unique slug for URL-friendly template access

**API Routes**:
- **Global Templates** (Admin-protected):
  - `/api/templates` - GET all templates (public), POST create template (admin-only)
  - `/api/templates/[id]` - GET template (public), PUT/DELETE (admin-only with userEmail verification)
  - `/api/templates/by-slug/[slug]` - GET template by slug (public)
- **User Templates** (User-scoped):
  - `/api/user-templates` - GET user's templates, POST create user template
  - `/api/user-templates/[id]` - GET/PUT/DELETE user template (scoped to userId)
- All routes handle database operations via storage layer

**Section Types**:
- Modular section-based architecture
- Supported sections: header, custom_message, items_list, payment, date_time, barcode
- Each section has its own configuration options and rendering logic
- Sections stored as JSONB array in database

**Data Flow**:
- **Admin Flow**:
  - Admin edits global templates at `/admin/templates/[id]`
  - Saves update global templates in `templates` table
  - Changes affect all users viewing that template
- **User Flow**:
  - User customizes template at `/template/[slug]` (loads from global templates)
  - "Save Template" creates copy in `user_templates` table
  - User edits saved templates at `/my-templates/[id]`
  - Changes only affect that user's personal collection

### Design Patterns

**Component Composition**:
- Higher-order Layout component pattern
- Presentational/Container component separation
- Props-based customization for flexibility

**Type Safety**:
- Comprehensive TypeScript interfaces for all data structures
- Discriminated unions for section types
- Strict typing disabled in tsconfig for development flexibility

**Conditional Features**:
- Firebase integration checks for environment variables before initialization
- Graceful degradation when services are unavailable
- User-friendly error messages for missing configurations

## External Dependencies

### Database & ORM

**PostgreSQL** (Replit-hosted):
- Fully-managed PostgreSQL 16 database hosted on Neon
- Connection via `DATABASE_URL` environment variable
- Instant setup through Replit's database tools
- Usage-based billing (compute time + storage)

**Drizzle ORM** (v0.44.7):
- Type-safe database queries and schema management
- Schema definition in `shared/schema.ts`
- Migration workflow via `drizzle-kit push`
- PostgreSQL driver: `postgres` (v3.4.7)

**Database Configuration**:
- Connection string: `process.env.DATABASE_URL`
- Configuration file: `drizzle.config.ts`
- Storage layer: `server/storage.ts` (CRUD operations)
- Environment variables automatically managed by Replit

### Authentication

**Firebase** (v12.4.0):
- Firebase Authentication for Google OAuth
- Conditional initialization (gracefully handles missing credentials)
- Configuration via environment variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- Optional integration - app functions without Firebase if not configured

### UI Libraries

**React Icons** (v5.5.0):
- Feather icons (Fi prefix) used throughout the application
- Provides consistent iconography

**@dnd-kit** (v6.3.1 core, v10.0.0 sortable):
- Accessible drag-and-drop functionality
- Used for reordering receipt sections in template editor

### Utilities

**html2canvas** (v1.4.1):
- Converts receipt preview DOM to downloadable PNG
- Client-side screenshot generation

**JsBarcode** (v3.12.1):
- Generates barcode graphics
- Used in barcode section type

**date-fns** (v4.1.0):
- Date formatting and manipulation
- Used for displaying timestamps and date sections

### Development Environment

**Replit-specific**:
- Custom dev server configuration (port 5000, hostname 0.0.0.0)
- REPLIT_DOMAINS environment variable handling in next.config.ts
- Configured for Replit hosting environment

**TypeScript & Linting**:
- TypeScript v5.8.2
- ESLint with Next.js core-web-vitals configuration
- Strict mode disabled for flexibility

### Future Enhancements

**User Data Persistence**:
- User preferences and settings
- Saved/favorite receipts
- Premium subscription status tracking

**Payment Processing**:
- Premium upgrade flow exists in UI
- Backend payment integration needed (Stripe recommended)
- Subscription management

**File Storage**:
- Logo uploads (currently not persisted)
- Receipt history storage
- Image optimization and CDN integration
# ReceiptGen - Receipt Generator Application

## Overview

ReceiptGen is a Next.js-based web application that allows users to create, customize, and download professional receipts. The application provides pre-built templates for various business types (computer repair, restaurant, gas station) and offers a drag-and-drop interface for customizing receipt sections. Users can generate receipts with real-time preview, and premium users can download watermark-free versions.

## Current Status (MVP Complete)

The application is fully functional with all core features implemented:
- ✅ Home page with hero section and feature showcase
- ✅ Templates listing page (/templates) with 3 pre-built templates
- ✅ Template editor (/template/[slug]) with drag-and-drop customization
- ✅ Live receipt preview with watermark overlay
- ✅ PNG download functionality (with html2canvas)
- ✅ Admin panel (/admin) for template management
- ✅ Pricing page with free and premium tiers
- ✅ Firebase authentication (optional - requires setup)

## Next Steps

To enable authentication:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google authentication in Firebase Console
3. Add your Replit domain to Firebase authorized domains
4. Add these secrets to your Repl:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID

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
- Local component state with useState hooks
- No global state management library (Redux/Zustand)

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
- Admin panel requires authenticated user
- Template customization available to all users
- Download restrictions based on premium status (watermark logic)

### Data Architecture

**Templates**:
- Currently uses mock data from `lib/mockTemplates.ts`
- No database persistence implemented yet
- Template structure defined by TypeScript interfaces in `lib/types.ts`

**Section Types**:
- Modular section-based architecture
- Supported sections: header, custom_message, items_list, payment, date_time, barcode
- Each section has its own configuration options and rendering logic

**Data Flow**:
- Templates loaded from mock data
- User modifications stored in component state
- No backend API calls for data persistence (placeholder for future implementation)

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

### Authentication & Database

**Firebase** (v12.4.0):
- Firebase Authentication for Google OAuth
- Firestore ready for future data persistence (initialized but not used)
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

### Missing/Future Integrations

**Database**: Firestore initialized but not actively used
- Template storage
- User preferences and saved receipts
- Premium subscription status persistence

**Payment Processing**: Not implemented
- Premium upgrade flow exists in UI
- Backend payment integration needed

**Storage**: No image/file storage
- Logo uploads not persisted
- Receipt downloads are client-side only
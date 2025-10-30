# ReceiptGen - Receipt Generator Application

## Overview

ReceiptGen is a Next.js-based web application enabling users to create, customize, and download professional receipts. It offers pre-built templates for various business types, a drag-and-drop interface for customization, and real-time preview. Key capabilities include section management, global template settings, and a dual admin/user role system with personalized template collections. Premium users can download watermark-free receipts. The application also includes a full-featured blog system with admin-managed content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application is built on Next.js 15 with TypeScript and React 19, utilizing the Pages Router for server-side rendering. UI components are modular, residing in the `/components` directory, with a `Layout` component wrapping pages. Styling is managed using Tailwind CSS v4, leveraging its utility-first approach and a single `globals.css` for color definitions. State management uses React Context API for authentication and template data, complemented by `useState` hooks for local UI interactions. Drag-and-drop functionality for reordering sections is provided by `@dnd-kit`. Receipt generation relies on `html2canvas` for image conversion, `JsBarcode` for barcodes, and `date-fns` for date manipulation.

### Authentication Architecture

Firebase Authentication handles user sign-in via Google OAuth. Access control is role-based: Admins (defined by `NEXT_PUBLIC_ADMIN_EMAILS` whitelist) can manage global templates, while regular users can customize and save templates to their personal collections. Download restrictions are based on premium status.

### Data Architecture

The application uses a PostgreSQL database, managed with Drizzle ORM, hosted on Replit (Neon-backed). It employs a multi-table architecture:
- `templates`: Admin-managed global receipt templates
- `user_templates`: User-specific template customizations
- `blog_posts`: Admin-managed blog content with title, content, featured images, and draft/published status
- `users`: User accounts with premium subscription tracking

API routes provide CRUD operations for templates, blog posts, and user data, with role-based access control. Templates are structured with modular sections (e.g., header, items_list, payment), stored as JSONB arrays. The data flow allows admins to modify global templates directly, while users create copies of global templates for personalized editing.

### Design Patterns

The architecture emphasizes component composition, including higher-order `Layout` components and separation of presentational/container components. TypeScript interfaces ensure type safety across data structures. Conditional feature initialization and graceful degradation are implemented for external services like Firebase.

## External Dependencies

### Database & ORM

-   **PostgreSQL**: Replit-hosted, Neon-backed database.
-   **Drizzle ORM** (v0.44.7): For type-safe database queries and schema management.
-   **Postgres.js** (v3.4.7): PostgreSQL driver.

### Authentication

-   **Firebase** (v12.4.0): For Google OAuth authentication.

### UI Libraries

-   **React Icons** (v5.5.0): For consistent iconography (Feather icons).
-   **@dnd-kit** (v6.3.1 core, v10.0.0 sortable): For drag-and-drop functionality.
-   **Tiptap** (v2.x): Rich text editor for blog content with visual and HTML editing modes.

### Utilities

-   **html2canvas** (v1.4.1): For converting DOM elements to downloadable PNGs.
-   **JsBarcode** (v3.12.1): For generating barcode graphics.
-   **date-fns** (v4.1.0): For date formatting and manipulation.

### Email Service

-   **Resend** (v4.0.0): Transactional email service for contact form submissions. Configured via Replit integration for secure API key management. Emails sent from/to `contact@receiptgenerator.net`.

## Recent Updates (October 30, 2025)

### AI Bulk Template Generator
Production-ready script for automated creation of industry-specific receipt templates with varied visual designs:
- **Script Location**: `scripts/generate-templates.ts`
- **Command**: `npm run generate-templates`
- **OpenAI Integration**: Uses GPT-4o to generate realistic business data, items, and pricing for each industry
- **Template Variety**: Creates 3 distinct visual styles that rotate through industries:
  - **Furniture-Style**: Barcode in middle, customer billing section, footer message, stars/dashed dividers, custom-receipt font
  - **Pawn Shop-Style**: Barcode at bottom, customer info section, website URL, double equals/stars dividers, ocrb-receipt font
  - **Minimal-Style**: Simple layout with fewer sections, dashed dividers only, bit-receipt font
- **Unique Slug Generation**: Automatically creates URL-safe slugs (e.g., "Mechanic Shop" → "mechanic-shop-receipt")
- **Duplicate Handling**: Checks for existing templates and skips duplicates, making re-runs safe
- **Environment Variables**: 
  - `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key (via Replit integration)
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL (via Replit integration)
  - `API_BASE_URL`: API endpoint (defaults to localhost:5000 for dev)
  - `NEXT_PUBLIC_ADMIN_EMAILS`: Admin email for template creation
- **Generated Templates**: Currently includes Mechanic Shop Receipt (furniture-style), Pawn Shop Receipt (pawn shop-style), and Carpet Cleaning Receipt (minimal-style)
- **Extensibility**: Add new industries by editing the `industries` array in the script - each gets a different style
- **SEO Note**: Generated templates require SEO content to be added manually via admin panel

### SEO Meta Tags Optimization
- **Server-Side Rendering Pattern**: Implemented proper Next.js Pages Router SSR pattern for meta tags via `_app.tsx`
  - Template pages pass `metaTags` through `getServerSideProps` → `pageProps` → `_app.tsx` Head component
  - Ensures meta tags are **always** in server-rendered HTML (no rendering inconsistencies)
  - Verified working for title, description, and Open Graph tags
- **Removed Keywords Meta Tags**: Eliminated outdated `name="keywords"` meta tags from all pages
  - Keywords meta tags haven't been used by search engines since 2009
  - Removed from: index.tsx, templates.tsx, ai.tsx, template/[id].tsx, and _app.tsx
  - Keeps codebase modern and focused on effective SEO practices

## Recent Updates (October 29, 2025)

### AI Receipt Generator (BETA)
New AI-powered feature that automatically creates receipt templates from uploaded images:
- **Upload Page** (`/ai`): User interface for uploading receipt images with BETA badge indicating feature status (PNG, JPG, GIF up to 10MB)
- **OpenAI Vision Integration**: Uses GPT-4o vision API via Replit AI Integrations gateway (no personal API key needed, charged to Replit credits)
- **Comprehensive Extraction**: AI extracts ALL visible text including business details, transaction IDs, approval codes, footer messages, and more
- **Smart Section Creation**: Only creates sections with actual data - no empty fields
- **Multi-Receipt Support**: Handles retail receipts, bank receipts, ATM receipts, and payment terminal receipts
- **Auto-Currency Detection**: Automatically detects currency (USD, THB, EUR, etc.) from receipt content
- **Template Mapping**: Converts AI response to complete receipt template structure with flexible sections:
  - `businessLines`: Captures ALL business info (branch, address, location)
  - `transactionDetails`: Host, TID, MID, Batch, Ref numbers
  - `approvalInfo`: Approval codes and status
  - `footerLines`: All footer text (refund policy, customer copy, etc.)
- **Result Page** (`/ai-result`): Full template editor matching regular template page functionality:
  - Same 60/40 layout design
  - Watermark for non-premium users
  - "Save Template" functionality to add to user's collection
  - "Download Sample" button for non-premium users
  - "Remove Watermark" button redirects to pricing for upgrade
  - Section editing with live preview
  - Session persistence until explicitly saved or user returns to AI page
- **Security**: Server-side validation for file size (10MB max), file type (images only), with proper error handling and cleanup
- **Data Safety**: Robust numeric parsing handles various AI response formats without crashes
- **Navigation**: "AI Generator" link added to main navigation

## Recent Updates (October 29, 2025)

### Contact Form Integration with Resend
The contact form now uses the Resend.com API for professional email handling:
- **API Integration**: Contact form submissions are sent via `/api/contact` endpoint using Resend
- **Email Delivery**: Emails sent from/to `contact@receiptgenerator.net` with user's email as reply-to
- **User Experience**: Real-time feedback with loading states, success messages, and error handling
- **Security**: API key managed through Replit's secure connection system
- **Technical**: Uses Replit's connection credentials with automatic token rotation

### Date & Time Field Enhancement
The Date & Time section now includes:
- **Calendar Picker**: Users can select date and time using a native `datetime-local` input instead of typing manually
- **"Use Current Date/Time" Button**: Quick button to populate with the current date and time
- **Multiple Display Formats**: Dropdown with 7 preset formats plus custom option:
  - MM/DD/YYYY, h:mm:ss A (e.g., 10/28/2025, 7:40:07 AM)
  - MM/DD/YYYY h:mm A (e.g., 10/28/2025 7:40 AM)
  - DD/MM/YYYY HH:mm (e.g., 28/10/2025 07:40)
  - YYYY-MM-DD HH:mm:ss (e.g., 2025-10-28 07:40:07)
  - MMMM D, YYYY h:mm A (e.g., October 28, 2025 7:40 AM)
  - MMM D, YYYY (e.g., Oct 28, 2025)
  - DD MMM YYYY HH:mm (e.g., 28 Oct 2025 07:40)
  - Custom format (uses date-fns format tokens)
- **Technical Implementation**: Date values stored as ISO 8601 strings, format string stored separately in `dateFormat` field

### Custom Receipt Fonts
Added 3 custom receipt fonts for authentic receipt styling:
- **Custom Receipt** (11pt): User-provided custom font #1
- **BIT Receipt** (10pt): User-provided custom font #2
- **OCRB Receipt** (10pt): User-provided custom font #3
- Font files stored in `public/fonts/` with @font-face declarations in `globals.css`
- Total of 7 font options available: Monospace, Receipt, Courier New 10pt, Consolas 11pt, Custom Receipt, BIT Receipt, OCRB Receipt

## Mobile Optimization (October 29, 2025)

The entire application has been comprehensively optimized for mobile devices:

### Mobile Navigation
- **Hamburger Menu**: Responsive navigation with hamburger icon on mobile (< 768px)
- **Slide-Out Menu**: Full-screen mobile menu with all navigation links and user options
- **Scroll Lock**: Prevents body scroll when mobile menu is open
- **Touch-Friendly**: Large tap targets (44px+) for all interactive elements

### Page-Specific Optimizations

**Template Editor Pages** (`/template/[id]`, `/ai-result`):
- Header buttons stack vertically on mobile (`flex-col sm:flex-row`)
- Grid layout stacks on mobile (`grid-cols-1 lg:grid-cols-[6fr_4fr]`)
- Preview panel is not sticky on mobile for better scrolling
- Reduced text sizes for small screens (`text-2xl sm:text-3xl`)

**AI Generator** (`/ai`):
- Responsive title and beta badge layout
- Adjusted padding for mobile (`py-8 sm:py-12`)
- Scaled typography (`text-3xl sm:text-4xl`)

**My Templates** (`/my-templates`):
- Header buttons stack on mobile
- Template list items reorganized for mobile:
  - Content stacks vertically
  - Action buttons shown as full-width with labels on mobile
  - Touch-friendly button sizing

**Blog Pages**:
- Responsive grid on index (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Scaled typography on post pages (`text-2xl sm:text-4xl`)
- Adjusted spacing for mobile viewports

**Global Patterns**:
- All button groups use `flex-col sm:flex-row gap-2 sm:gap-3`
- Consistent padding: `px-4 py-4 sm:py-8`
- Typography scales: `text-2xl sm:text-3xl`, `text-3xl sm:text-4xl`
- Grid stacking: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Touch targets: All buttons have `py-2` minimum (44px with padding)

## Blog System

The application includes a full-featured blog at `/blog` with the following capabilities:

### Admin Features (`/admin/blog`)
- Create, edit, and delete blog posts
- Rich text editing with Tiptap WYSIWYG editor
- Toggle between visual and HTML editing modes
- Draft/Published status management
- Featured image upload with live preview (supports PNG, JPG, GIF up to 10MB)
- Automatic slug generation from titles
- Automatic timestamp tracking (created, updated, published)

### Public Features
- Blog listing page at `/blog` showing published posts
- Individual post pages at `/blog/[slug]`
- Formatted publication dates
- Featured image display
- Full HTML content rendering

### Security
Blog write operations (create, update, delete) are protected with admin-only authorization following the project's MVP security model (client-provided email validation against `NEXT_PUBLIC_ADMIN_EMAILS`).
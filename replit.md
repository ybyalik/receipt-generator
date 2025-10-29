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
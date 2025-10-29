# ReceiptGen - Receipt Generator Application

## Overview

ReceiptGen is a Next.js-based web application enabling users to create, customize, and download professional receipts. It offers pre-built templates for various business types, a drag-and-drop interface for customization, and real-time preview. Key capabilities include section management, global template settings, and a dual admin/user role system with personalized template collections. Premium users can download watermark-free receipts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application is built on Next.js 15 with TypeScript and React 19, utilizing the Pages Router for server-side rendering. UI components are modular, residing in the `/components` directory, with a `Layout` component wrapping pages. Styling is managed using Tailwind CSS v4, leveraging its utility-first approach and a single `globals.css` for color definitions. State management uses React Context API for authentication and template data, complemented by `useState` hooks for local UI interactions. Drag-and-drop functionality for reordering sections is provided by `@dnd-kit`. Receipt generation relies on `html2canvas` for image conversion, `JsBarcode` for barcodes, and `date-fns` for date manipulation.

### Authentication Architecture

Firebase Authentication handles user sign-in via Google OAuth. Access control is role-based: Admins (defined by `NEXT_PUBLIC_ADMIN_EMAILS` whitelist) can manage global templates, while regular users can customize and save templates to their personal collections. Download restrictions are based on premium status.

### Data Architecture

The application uses a PostgreSQL database, managed with Drizzle ORM, hosted on Replit (Neon-backed). It employs a dual-table architecture: `templates` for admin-managed global templates and `user_templates` for user-specific customizations. API routes provide CRUD operations for both global and user templates, with role-based access control. Templates are structured with modular sections (e.g., header, items_list, payment), stored as JSONB arrays. The data flow allows admins to modify global templates directly, while users create copies of global templates for personalized editing.

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

### Utilities

-   **html2canvas** (v1.4.1): For converting DOM elements to downloadable PNGs.
-   **JsBarcode** (v3.12.1): For generating barcode graphics.
-   **date-fns** (v4.1.0): For date formatting and manipulation.
# ReceiptGen - Receipt Generator Application

## Overview

ReceiptGen is a Next.js-based web application designed for creating, customizing, and downloading professional receipts. It features pre-built templates, a drag-and-drop interface, real-time previews, and a dual admin/user role system. Key functionalities include section management, global template settings, personalized template collections, and a robust blog system. Premium users can download watermark-free receipts. The project aims to provide a versatile and user-friendly tool for businesses to generate high-quality receipts efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application uses Next.js 15, TypeScript, and React 19 with the Pages Router for SSR. UI components are modular, styled with Tailwind CSS v4. State management is handled by React Context API for global state and `useState` hooks for local interactions. Drag-and-drop functionality is provided by `@dnd-kit`. Receipt generation utilizes `html2canvas` for image conversion, `JsBarcode` for barcodes, and `date-fns` for date manipulation.

### Authentication Architecture

Firebase Authentication manages user sign-in via Google OAuth. Access control is role-based, with admins (whitelisted emails) managing global templates and users customizing personal templates. Premium status gates watermark-free downloads.

### Data Architecture

A PostgreSQL database, managed by Drizzle ORM on Replit (Neon-backed), stores application data. This includes `templates` (global), `user_templates` (personal), `blog_posts`, and `users` (with premium tracking). API routes provide CRUD operations with role-based access. Templates use modular JSONB arrays for sections.

### Design Patterns

The architecture emphasizes component composition, including higher-order `Layout` components and separation of concerns. TypeScript interfaces ensure type safety. Conditional feature initialization is implemented for external services.

### UI/UX Decisions

The application provides a responsive design optimized for both desktop and mobile. Mobile navigation features a hamburger menu and slide-out panel. The template editor, AI generator, and blog pages are all adjusted for optimal mobile viewing with responsive typography, stacking layouts, and touch-friendly elements. Three custom receipt fonts are included for authentic styling.

### Feature Specifications

-   **AI Bulk Template Generator**: Admins can generate industry-specific receipt templates with randomized designs, fonts, divider styles, barcode positions, and optional sections using GPT-4o. AI-generated logos are created via gpt-image-1 and stored persistently in AWS S3.
-   **AI Receipt Generator (BETA)**: Users can upload receipt images for AI (GPT-4o Vision) to extract data and create editable templates, including auto-currency detection and smart section mapping.
-   **SEO Meta Tags Optimization**: Meta tags are server-rendered via `_app.tsx` for consistent SEO, with outdated keywords meta tags removed.
-   **Date & Time Field Enhancement**: The date/time input includes a calendar picker, "Use Current Date/Time" button, and multiple display format options.
-   **Blog System**: A full-featured blog with admin-managed posts (create, edit, delete, rich text editing with Tiptap, draft/published status, featured images, automatic slug generation) and public-facing content.
-   **Homepage Feature Sections**: Two dedicated sections highlighting Templates and AI Generator features with screenshots, detailed descriptions, bullet points, and CTA buttons positioned above "How It Works" section.
-   **Performance Optimizations**: Lazy loading for AuthModal and TipTap editor, modern image formats (WebP/AVIF), compression, production console removal, bundle analyzer integration, and instant login state detection.
-   **WWW Redirect**: Middleware automatically redirects www subdomain to apex domain with 301 permanent redirect for SEO.
-   **Blog Webhook Integration**: Secure webhook endpoint (`/api/webhooks/blog`) for automatic blog article publishing from third-party services. Features Bearer token authentication, comprehensive payload validation, duplicate handling, and batch processing (up to 50 articles per request).

## External Dependencies

### Database & ORM

-   **PostgreSQL**: Replit-hosted, Neon-backed.
-   **Drizzle ORM**: For type-safe database interaction.
-   **Postgres.js**: PostgreSQL driver.

### Authentication

-   **Firebase**: For Google OAuth.

### UI Libraries

-   **React Icons**: For iconography.
-   **@dnd-kit**: For drag-and-drop functionality.
-   **Tiptap**: Rich text editor.

### Utilities

-   **html2canvas**: For converting DOM to PNG.
-   **JsBarcode**: For barcode generation.
-   **date-fns**: For date formatting and manipulation.

### AI Services

-   **OpenAI (GPT-4o, gpt-image-1)**: Accessed via Replit AI Integrations for bulk template generation, data extraction from images, and logo generation.

### Object Storage

-   **AWS S3**: For persistent storage and serving of AI-generated logos and feature images. Configured with public read access for images.

### Email Service

-   **Resend**: Transactional email service for contact form submissions.
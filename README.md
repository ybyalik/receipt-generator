# Receipt Generator

A full-stack Next.js application for creating, customizing, and downloading professional receipts.

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth
- **Payments**: Stripe
- **Storage**: AWS S3

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project (for authentication)
- Stripe account (for payments)
- AWS S3 bucket (for file storage)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── components/     # React components
├── contexts/       # React Context providers
├── lib/            # Utilities and configurations
├── pages/          # Next.js pages and API routes
├── public/         # Static assets
├── server/         # Database and business logic
├── shared/         # Shared types and schemas
└── styles/         # Global CSS styles
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)

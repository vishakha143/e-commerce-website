# Fashion E-Commerce Website

Full-stack fashion e-commerce platform built with Next.js.

See [docs/architecture.md](docs/architecture.md) for the full architecture and implementation plan.

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI` (MongoDB Atlas connection string) and `AUTH_SECRET` (`openssl rand -base64 32`).
2. Seed the database with the sample catalog, categories, and an admin user:
   ```bash
   npm run seed
   ```
   Creates an admin login at `admin@fashion.test` / `--------`.
3. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

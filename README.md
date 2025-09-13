This project benchmarks Drizzle ORM vs Prisma (rust-free, ESM-first) on Vercel Fluid Compute with a Neon Postgres database.

## Getting Started

First, set `DATABASE_URL` to your Neon connection string (the HTTP protocol works best, e.g. `postgresql://...` from Neon). Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Use the UI to prepare the table and run benchmarks for Drizzle and Prisma. API routes:

- `POST /api/prepare` — creates `bench_items` and seeds initial rows
- `POST /api/bench-drizzle` — runs Drizzle benchmark (Fluid Compute default)
- `POST /api/bench-prisma` — runs Prisma benchmark (Node runtime)

Prisma is configured to use the rust-free engine and the ESM-first client generator with Neon HTTP adapter. See the announcement for details: [Rust-free Prisma ORM is Ready for Production](https://www.prisma.io/blog/rust-free-prisma-orm-is-ready-for-production).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

On Vercel, add an Environment Variable `DATABASE_URL` with your Neon Postgres connection string. The app uses Vercel's Fluid Compute by default; the Prisma route opts into Node runtime as required by Prisma client. Then deploy.

# cdn2.slicedrive

Full-stack URL shortener dengan Next.js App Router, Server Actions, Prisma, Neon Postgres, NextAuth, Tailwind CSS, dan komponen UI bergaya shadcn/ui.

## Setup Lokal

1. Install dependencies:

```bash
npm install
```

2. Isi environment variables di `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
```

3. Jalankan migration dan seed admin:

```bash
npm run db:migrate
npm run db:seed
```

4. Jalankan development server:

```bash
npm run dev
```

## Fitur

- Redirect publik dari `/{slug}` ke URL asli.
- Custom 404 saat slug tidak ditemukan.
- Admin login di `/admin/login`.
- CRUD shortlink di `/admin/links`.
- Search, pagination, dan click counter.

## Deploy Vercel

1. Push project ke GitHub.
2. Import repository di Vercel.
3. Tambahkan env production: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Jalankan migration production dari lokal atau CI:

```bash
npm run db:deploy
npm run db:seed
```

5. Deploy dengan build command default:

```bash
npm run build
```

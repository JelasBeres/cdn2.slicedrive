import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Shortlink Platform
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
          URL pendek, cepat, dan gampang dikelola.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-8 text-slate-300">
          Dibangun dengan Next.js App Router, Prisma, Neon Postgres, Auth.js,
          Tailwind CSS, dan komponen UI modern.
        </p>
        <Button asChild size="lg">
          <Link href="/admin/links">Masuk Admin Panel</Link>
        </Button>
      </section>
    </main>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="max-w-md text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          404
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Shortlink tidak ditemukan
        </h1>
        <p className="mb-8 text-slate-300">
          Link mungkin sudah dihapus, salah ketik, atau belum pernah dibuat.
        </p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </section>
    </main>
  );
}

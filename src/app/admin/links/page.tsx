import Link from "next/link";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { CalendarDays, Link2, Plus, Search, Video, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { LinkForm } from "./link-form";
import { LinksTable } from "./links-table";

type LinksPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 10;

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const query = params.q?.trim() ?? "";
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const skip = (page - 1) * PAGE_SIZE;
  const where = query
    ? {
        OR: [
          { slug: { contains: query, mode: "insensitive" as const } },
          { originalUrl: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [links, total, totalLinks, clickAggregate, linksToday] = await Promise.all([
    prisma.link.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: PAGE_SIZE }),
    prisma.link.count({ where }),
    prisma.link.count(),
    prisma.link.aggregate({ _sum: { clicks: true } }),
    prisma.link.count({ where: { createdAt: { gte: today } } }),
  ]);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const totalClicks = clickAggregate._sum.clicks ?? 0;

  function pageHref(targetPage: number) {
    const search = new URLSearchParams();
    search.set("page", String(targetPage));
    if (query) search.set("q", query);
    return `/admin/links?${search.toString()}`;
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-3 gap-2 md:gap-4">
        <StatCard color="blue" icon={<Link2 className="h-9 w-9" />} label="Total Link" value={totalLinks.toLocaleString("id-ID")} sub="Aktif tersimpan" />
        <StatCard color="pink" icon={<Zap className="h-9 w-9" />} label="Total Klik" value={totalClicks.toLocaleString("id-ID")} sub="Semua waktu" />
        <StatCard color="yellow" icon={<CalendarDays className="h-9 w-9" />} label="Hari Ini" value={linksToday.toLocaleString("id-ID")} sub="Link baru dibuat" />
      </section>

      <section className="panel-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3 md:px-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Video className="h-4 w-4 text-[var(--panel-pink)]" />
            Video Links
          </div>
          <span className="rounded border border-[var(--panel-pink-border)] bg-[var(--panel-pink-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--panel-pink)]">
            {total} links
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--panel-border)] px-4 py-3 md:px-5">
          <span className="text-xs text-[var(--panel-faint)]">Tampilkan</span>
          <span className="rounded border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)] px-2 py-1 text-xs text-white">10</span>
          <span className="text-xs text-[var(--panel-faint)]">data</span>
          <form className="ml-0 flex w-full gap-2 md:ml-auto md:w-auto">
            <div className="flex w-full items-center gap-2 rounded-md border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)] px-3 md:w-[220px]">
              <Search className="h-3.5 w-3.5 text-[var(--panel-faint)]" />
              <Input name="q" placeholder="Cari link..." defaultValue={query} className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0" />
            </div>
            <Button type="submit">Cari</Button>
          </form>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4" /> New Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Link Baru</DialogTitle>
              </DialogHeader>
              <LinkForm />
            </DialogContent>
          </Dialog>
        </div>
        <LinksTable links={links} baseUrl={baseUrl} />
        <div className="flex items-center justify-between px-4 py-3 md:px-5">
          <p className="text-xs text-[var(--panel-faint)]">Halaman {page} dari {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1)}>Prev</Link></Button> : <Button variant="outline" disabled>Prev</Button>}
            {page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(page + 1)}>Next</Link></Button> : <Button variant="outline" disabled>Next</Button>}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ color, icon, label, value, sub }: { color: "blue" | "pink" | "yellow"; icon: ReactNode; label: string; value: string; sub: string }) {
  const colorClass = {
    blue: "text-blue-400 before:bg-[linear-gradient(90deg,transparent,var(--panel-blue),transparent)]",
    pink: "text-[var(--panel-pink)] before:bg-[linear-gradient(90deg,transparent,var(--panel-pink),transparent)]",
    yellow: "text-[var(--panel-yellow)] before:bg-[linear-gradient(90deg,transparent,var(--panel-yellow),transparent)]",
  }[color];

  return (
    <div className={`panel-card relative overflow-hidden px-3 py-3 before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 md:px-5 md:py-4 ${colorClass}`}>
      <div className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[var(--panel-faint)] md:text-[11px]">{label}</div>
      <div className="text-lg font-bold md:text-[28px]">{value}</div>
      <div className="mt-1 text-[10px] text-[var(--panel-faint)] md:text-[11px]">{sub}</div>
      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 opacity-10 md:block">{icon}</div>
    </div>
  );
}

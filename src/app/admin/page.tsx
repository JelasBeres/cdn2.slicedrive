import type { ReactNode } from "react";
import { Activity, CalendarDays, Link2, MousePointerClick, Users } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClickDelegate } from "@/lib/click-events";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const clickDelegate = getClickDelegate();

  const [totalLinks, clickAggregate, clicksToday, topLinks, recentClicks] = await Promise.all([
    prisma.link.count(),
    prisma.link.aggregate({ _sum: { clicks: true } }),
    clickDelegate?.count({ where: { createdAt: { gte: today } } }) ?? Promise.resolve(0),
    prisma.link.findMany({ orderBy: { clicks: "desc" }, take: 5 }),
    clickDelegate?.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { link: { select: { slug: true, originalUrl: true } } },
    }) ?? Promise.resolve([]),
  ]);

  const totalClicks = clickAggregate._sum.clicks ?? 0;
  const uniqueVisitors = new Set(recentClicks.map((click) => click.ip).filter(Boolean)).size;

  return (
    <AdminShell>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-xs text-[var(--panel-faint)]">Ringkasan performa shortlink dan aktivitas klik terbaru.</p>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard title="Total Link" value={totalLinks.toLocaleString("id-ID")} icon={<Link2 className="h-8 w-8" />} color="blue" />
          <MetricCard title="Total Klik" value={totalClicks.toLocaleString("id-ID")} icon={<MousePointerClick className="h-8 w-8" />} color="pink" />
          <MetricCard title="Klik Hari Ini" value={clicksToday.toLocaleString("id-ID")} icon={<CalendarDays className="h-8 w-8" />} color="yellow" />
          <MetricCard title="IP Unik" value={uniqueVisitors.toLocaleString("id-ID")} icon={<Users className="h-8 w-8" />} color="green" />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-[var(--panel-border)] px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-[var(--panel-pink)]" /> Top Link
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Klik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLinks.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="py-8 text-center text-[var(--panel-faint)]">Belum ada link.</TableCell></TableRow>
                  ) : (
                    topLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium text-white">/{link.slug}</TableCell>
                        <TableCell className="max-w-48 truncate text-[var(--panel-faint)]">{link.originalUrl}</TableCell>
                        <TableCell className="text-right text-[var(--panel-pink)]">{link.clicks.toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[var(--panel-border)] px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MousePointerClick className="h-4 w-4 text-[var(--panel-pink)]" /> Click Log Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="panel-scrollbar overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentClicks.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="py-8 text-center text-[var(--panel-faint)]">Belum ada klik.</TableCell></TableRow>
                  ) : (
                    recentClicks.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="whitespace-nowrap text-[var(--panel-faint)]">{new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(click.createdAt)}</TableCell>
                        <TableCell className="font-medium text-white">/{click.link.slug}</TableCell>
                        <TableCell className="text-[var(--panel-faint)]">{click.ip ?? "-"}</TableCell>
                        <TableCell className="max-w-48 truncate text-[var(--panel-faint)]">{click.userAgent ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: ReactNode; color: "blue" | "pink" | "yellow" | "green" }) {
  const colors = {
    blue: "text-blue-400 before:bg-[linear-gradient(90deg,transparent,var(--panel-blue),transparent)]",
    pink: "text-[var(--panel-pink)] before:bg-[linear-gradient(90deg,transparent,var(--panel-pink),transparent)]",
    yellow: "text-[var(--panel-yellow)] before:bg-[linear-gradient(90deg,transparent,var(--panel-yellow),transparent)]",
    green: "text-[var(--panel-green)] before:bg-[linear-gradient(90deg,transparent,var(--panel-green),transparent)]",
  }[color];

  return (
    <Card className={`relative overflow-hidden before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 ${colors}`}>
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--panel-faint)]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-2xl font-bold">{value}</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">{icon}</div>
      </CardContent>
    </Card>
  );
}

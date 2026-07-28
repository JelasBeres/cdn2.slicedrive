import type { ReactNode } from "react";
import { BarChart3, ExternalLink, MousePointerClick, Users } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";

const HISTATS_ID = "5038177";
const HISTATS_VIEW_URL = `https://www.histats.com/viewstats/?sid=${HISTATS_ID}&ccid=101`;
const HISTATS_DASHBOARD_URL = "https://www.histats.com";

export default function HistatsPage() {
  return (
    <AdminShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <BarChart3 className="h-5 w-5 text-[var(--panel-pink)]" /> Histats Traffic
            </h2>
            <p className="text-xs text-[var(--panel-faint)]">
              Statistik visitor dari script Histats ID {HISTATS_ID} yang sudah dipasang global.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href={HISTATS_VIEW_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Buka Stats
              </a>
            </Button>
            <Button asChild>
              <a href={HISTATS_DASHBOARD_URL} target="_blank" rel="noreferrer">
                Login Histats
              </a>
            </Button>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoCard icon={<Users className="h-8 w-8" />} title="Visitors" text="Visitor, negara, browser, device" />
          <InfoCard icon={<MousePointerClick className="h-8 w-8" />} title="Hits" text="Pageview dan hit halaman" />
          <InfoCard icon={<BarChart3 className="h-8 w-8" />} title="Realtime" text="Data diambil dari dashboard Histats" />
        </section>

        <section className="panel-card overflow-hidden">
          <div className="border-b border-[var(--panel-border)] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-[var(--panel-pink)]" /> Embedded Histats View
            </div>
          </div>
          <div className="bg-[var(--panel-bg-2)] p-3">
            <iframe
              src={HISTATS_VIEW_URL}
              title="Histats statistics"
              className="h-[720px] w-full rounded-md border border-[var(--panel-border-2)] bg-white"
            />
            <p className="mt-3 text-xs text-[var(--panel-faint)]">
              Kalau embed tidak tampil karena diblokir Histats, klik tombol `Buka Stats` di atas.
            </p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="panel-card relative overflow-hidden p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--panel-faint)]">{title}</div>
      <p className="mt-2 text-sm text-[var(--panel-muted)]">{text}</p>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--panel-pink)] opacity-10">{icon}</div>
    </div>
  );
}

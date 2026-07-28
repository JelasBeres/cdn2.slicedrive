import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Grid2X2, Link2, Plus, Settings } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <header className="sticky top-0 z-40 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
        <div className="flex h-[52px] items-center justify-between px-3 md:px-5">
          <Link href="/admin/links" className="flex items-center gap-2 text-[15px] font-bold">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[var(--panel-pink)]">
              <Grid2X2 className="h-4 w-4" />
            </span>
            CDNPanel
            <span className="rounded border border-[var(--panel-border-2)] bg-[var(--panel-bg-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--panel-faint)]">
              v2
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/admin/links">
                <Plus className="h-4 w-4" /> New Link
              </Link>
            </Button>
            <Link
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-2)] hover:bg-[var(--panel-bg-3)]"
              href="/admin"
              title="Dashboard"
            >
              <Grid2X2 className="h-4 w-4 text-[var(--panel-muted)]" />
            </Link>
            <Link
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-2)] hover:bg-[var(--panel-bg-3)]"
              href="/admin/links"
              title="Links"
            >
              <Link2 className="h-4 w-4 text-[var(--panel-muted)]" />
            </Link>
            <Link
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-2)] hover:bg-[var(--panel-bg-3)]"
              href="/admin/settings"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-[var(--panel-muted)]" />
            </Link>
            <Link
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-2)] hover:bg-[var(--panel-bg-3)]"
              href="/admin/histats"
              title="Histats"
            >
              <BarChart3 className="h-4 w-4 text-[var(--panel-muted)]" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex items-center gap-2 border-b border-[#1a3a1a] bg-[#0d1a0d] px-3 py-1.5 text-[11px] text-[#4ade80] md:px-5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--panel-green)]" />
        <span>Neon Postgres Database · Multi Domain ready</span>
      </div>
      <main className="mx-auto max-w-[960px] px-3 py-5 md:px-5 md:py-6">{children}</main>
    </div>
  );
}

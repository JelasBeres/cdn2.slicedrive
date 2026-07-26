"use client";

import { signOut } from "next-auth/react";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-2)] hover:bg-[var(--panel-bg-3)]"
      title="Logout"
      onClick={() => void signOut({ callbackUrl: "/admin/login" })}
    >
      <LogOut className="h-4 w-4 text-[var(--panel-muted)]" />
    </button>
  );
}

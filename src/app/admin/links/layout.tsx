import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin-shell";

type AdminLinksLayoutProps = {
  children: ReactNode;
};

export default function AdminLinksLayout({ children }: AdminLinksLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}

import { Globe2, KeyRound, ShieldCheck, Star, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { createDomain, deleteDomain, resetAdminPassword, setPrimaryDomain, updateDomain } from "./actions";

export const dynamic = "force-dynamic";

async function createDomainFormAction(formData: FormData) {
  "use server";
  await createDomain(formData);
}

async function updateDomainFormAction(formData: FormData) {
  "use server";
  await updateDomain(formData);
}

async function setPrimaryDomainFormAction(formData: FormData) {
  "use server";
  await setPrimaryDomain(formData);
}

async function deleteDomainFormAction(formData: FormData) {
  "use server";
  await deleteDomain(formData);
}

async function resetAdminPasswordFormAction(formData: FormData) {
  "use server";
  await resetAdminPassword(formData);
}

export default async function SettingsPage() {
  const domains = await prisma.domain.findMany({
    orderBy: [{ isPrimary: "desc" }, { hostname: "asc" }],
    include: { _count: { select: { links: true } } },
  });

  return (
    <AdminShell>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          <p className="text-xs text-[var(--panel-faint)]">Kelola subdomain/domain shortlink dan password admin.</p>
        </div>

        <section className="panel-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Globe2 className="h-4 w-4 text-[var(--panel-pink)]" /> Domains & Subdomains
            </div>
            <span className="rounded border border-[var(--panel-pink-border)] bg-[var(--panel-pink-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--panel-pink)]">
              {domains.length} domain
            </span>
          </div>

          <div className="space-y-3 p-5">
            {domains.length === 0 ? (
              <p className="rounded-md border border-dashed border-[var(--panel-border-2)] p-5 text-center text-sm text-[var(--panel-faint)]">Belum ada domain.</p>
            ) : (
              domains.map((domain) => (
                <div key={domain.id} className={`rounded-md border p-4 ${domain.isPrimary ? "border-[var(--panel-pink-border)] bg-[var(--panel-pink-bg)]" : "border-[var(--panel-border-2)] bg-[var(--panel-bg-2)]"}`}>
                  <form action={updateDomainFormAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <input type="hidden" name="id" value={domain.id} />
                    <div>
                      <Label htmlFor={`hostname-${domain.id}`}>Hostname</Label>
                      <Input id={`hostname-${domain.id}`} name="hostname" defaultValue={domain.hostname} placeholder="cdn.videy.fun" />
                    </div>
                    <div>
                      <Label htmlFor={`label-${domain.id}`}>Label</Label>
                      <Input id={`label-${domain.id}`} name="label" defaultValue={domain.label ?? ""} placeholder="CDN 1" />
                    </div>
                    <Button type="submit" variant="outline">Simpan</Button>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--panel-border)] pt-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--panel-faint)]">
                      {domain.isPrimary ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--panel-pink)] px-2 py-1 font-bold text-white"><Star className="h-3 w-3 fill-white" /> PRIMARY</span>
                      ) : null}
                      <span>{domain._count.links} link memakai domain ini</span>
                    </div>
                    <div className="flex gap-2">
                      {!domain.isPrimary ? (
                        <form action={setPrimaryDomainFormAction}>
                          <input type="hidden" name="id" value={domain.id} />
                          <Button type="submit" variant="outline" size="sm"><Star className="h-3.5 w-3.5" /> Jadikan Primary</Button>
                        </form>
                      ) : null}
                      {!domain.isPrimary ? (
                        <form action={deleteDomainFormAction}>
                          <input type="hidden" name="id" value={domain.id} />
                          <Button type="submit" variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5" /> Hapus</Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[var(--panel-border)] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Globe2 className="h-4 w-4 text-[var(--panel-pink)]" /> Tambah Subdomain</h3>
            <form action={createDomainFormAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <Label htmlFor="hostname">Hostname</Label>
                <Input id="hostname" name="hostname" placeholder="cdn3.videy.fun" required />
              </div>
              <div>
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" placeholder="CDN 3" />
              </div>
              <Button type="submit">Tambah Domain</Button>
            </form>
            <p className="mt-3 text-xs text-[var(--panel-faint)]">
              Pastikan DNS Cloudflare punya wildcard A record `*.videy.fun` ke IP VPS agar subdomain baru langsung resolve.
            </p>
          </div>
        </section>

        <section className="panel-card overflow-hidden">
          <div className="border-b border-[var(--panel-border)] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="h-4 w-4 text-[var(--panel-yellow)]" /> Reset Password Admin
            </div>
          </div>
          <form action={resetAdminPasswordFormAction} className="grid gap-4 p-5 md:grid-cols-3 md:items-end">
            <div>
              <Label htmlFor="currentPassword">Password Lama</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Konfirmasi</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" className="w-full md:w-auto"><ShieldCheck className="h-4 w-4" /> Ganti Password</Button>
            </div>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

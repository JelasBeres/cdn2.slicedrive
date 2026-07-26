"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLink, updateLink } from "./actions";

type LinkFormProps = {
  mode?: "create" | "edit";
  link?: { id: string; originalUrl: string; slug: string; domainId?: string | null };
  domains?: { id: string; hostname: string; label: string | null; isPrimary: boolean }[];
  baseUrl?: string;
  onDone?: () => void;
};

export function LinkForm({ mode = "create", link, domains = [], baseUrl = "https://videy.fun", onDone }: LinkFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [slug, setSlug] = useState(link?.slug ?? "");
  const [domainId, setDomainId] = useState(link?.domainId ?? domains.find((domain) => domain.isPrimary)?.id ?? domains[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === domainId),
    [domainId, domains],
  );
  const previewHost = selectedDomain?.hostname ?? new URL(baseUrl).host;
  const previewSlug = slug.trim() || "[auto-id].mp4";

  function handleSubmit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = mode === "edit" && link ? await updateLink(link.id, formData) : await createLink(formData);
      setMessage(result.message);
      if (result.ok) {
        formRef.current?.reset();
        onDone?.();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor={mode === "edit" ? `domainId-${link?.id}` : "domainId"}>Domain</Label>
        <div className="relative">
          <select
            id={mode === "edit" ? `domainId-${link?.id}` : "domainId"}
            name="domainId"
            value={domainId}
            onChange={(event) => setDomainId(event.target.value)}
            className="panel-input h-12 appearance-none px-4 text-base font-semibold"
          >
            {domains.length === 0 ? <option value="">{new URL(baseUrl).host}</option> : null}
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.hostname}{domain.isPrimary ? " ★" : ""}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-[var(--panel-faint)]">▼</span>
        </div>
        <p className="mt-1 text-xs text-[var(--panel-faint)]">Domain untuk shortlink ini. Tambah domain di Settings.</p>
      </div>

      <div>
        <Label htmlFor={mode === "edit" ? `originalUrl-${link?.id}` : "originalUrl"}>Target URL</Label>
        <Input
          id={mode === "edit" ? `originalUrl-${link?.id}` : "originalUrl"}
          name="originalUrl"
          type="url"
          placeholder="https://..."
          defaultValue={link?.originalUrl}
          className="h-12 px-4 text-base"
          required
        />
      </div>
      <div>
        <Label htmlFor={mode === "edit" ? `slug-${link?.id}` : "slug"}>
          Custom ID <span className="text-[var(--panel-faint)] normal-case tracking-normal">(opsional)</span>
        </Label>
        <div className="relative">
          <Input
            id={mode === "edit" ? `slug-${link?.id}` : "slug"}
            name="slug"
            placeholder="videos/2026/nama"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="h-12 px-4 pr-16 text-base"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--panel-faint)]">.mp4</span>
        </div>
        {mode === "create" ? (
          <p className="mt-1 text-xs text-[var(--panel-faint)]">Kosongkan untuk ID acak. Boleh pakai / contoh: videos/2026/nama</p>
        ) : null}
      </div>
      {mode === "create" ? (
        <input type="hidden" name="suffix" value=".mp4" />
      ) : null}
      <div className="rounded-md border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)] px-4 py-3 text-sm text-[var(--panel-faint)]">
        Preview: <span className="font-semibold text-[var(--panel-muted)]">https://{previewHost}/{previewSlug}</span>
      </div>
      {message ? <p className="text-sm text-[var(--panel-muted)]">{message}</p> : null}
      <Button type="submit" disabled={isPending} className="h-12 w-full text-base font-bold">
        <Zap className="h-5 w-5" /> {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan" : "Buat Sekarang"}
      </Button>
    </form>
  );
}

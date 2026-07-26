"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLink, updateLink } from "./actions";

type LinkFormProps = {
  mode?: "create" | "edit";
  link?: { id: string; originalUrl: string; slug: string };
  onDone?: () => void;
};

export function LinkForm({ mode = "create", link, onDone }: LinkFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

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
        <Label htmlFor={mode === "edit" ? `originalUrl-${link?.id}` : "originalUrl"}>Target URL</Label>
        <Input
          id={mode === "edit" ? `originalUrl-${link?.id}` : "originalUrl"}
          name="originalUrl"
          type="url"
          placeholder="https://example.com"
          defaultValue={link?.originalUrl}
          required
        />
      </div>
      <div>
        <Label htmlFor={mode === "edit" ? `slug-${link?.id}` : "slug"}>Custom ID</Label>
        <Input
          id={mode === "edit" ? `slug-${link?.id}` : "slug"}
          name="slug"
          placeholder="videos/2026/nama atau file.mp4"
          defaultValue={link?.slug}
        />
        {mode === "create" ? (
          <p className="mt-1 text-[11px] text-[var(--panel-faint)]">Kosongkan untuk ID acak. Bisa pakai suffix seperti .mp4.</p>
        ) : null}
      </div>
      {mode === "create" ? (
        <div>
          <Label htmlFor="suffix">Suffix untuk slug acak</Label>
          <div className="relative">
            <Input id="suffix" name="suffix" placeholder=".mp4" className="pr-14" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--panel-faint)]">opsi</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--panel-faint)]">
            Dipakai hanya jika Custom Slug kosong. Contoh hasil: abc123.mp4
          </p>
        </div>
      ) : null}
      {message ? <p className="text-sm text-[var(--panel-muted)]">{message}</p> : null}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}

"use client";

import { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Grid2X2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signIn("credentials", {
        password: formData.get("password"),
        callbackUrl: "/admin/links",
        redirect: true,
      });

      if (result?.error) {
        setError("Password salah.");
        return;
      }
    });
  }

  return (
    <div className="panel-card w-full max-w-[340px] px-8 py-9 text-center">
      <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)]">
        <Grid2X2 className="h-7 w-7 text-[var(--panel-pink)]" />
      </div>
      <div className="text-xl font-bold">CDN Panel</div>
      <div className="mb-6 text-xs text-[var(--panel-faint)]">Shortlink Management System</div>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password Admin</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <p className="min-h-[18px] text-xs text-[var(--panel-red)]">{error}</p>
          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Masuk..." : "Masuk Dashboard"}
          </Button>
        </form>
    </div>
  );
}

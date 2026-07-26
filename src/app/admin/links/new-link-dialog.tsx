"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Domain } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LinkForm } from "./link-form";

type NewLinkDialogProps = {
  domains: Domain[];
  baseUrl: string;
};

export function NewLinkDialog({ domains, baseUrl }: NewLinkDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4" /> New Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[520px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--panel-pink)] text-[var(--panel-pink)]">+</span>
            Buat Link Baru
          </DialogTitle>
        </DialogHeader>
        <LinkForm domains={domains} baseUrl={baseUrl} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

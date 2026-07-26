"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type CopyLinkButtonProps = {
  url: string;
};

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function copy() {
    startTransition(async () => {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={copy}>
      {copied ? "Tersalin" : "Salin Link"}
    </Button>
  );
}

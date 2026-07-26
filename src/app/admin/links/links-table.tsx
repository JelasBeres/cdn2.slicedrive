"use client";

import { useState, useTransition } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { Link as LinkModel } from "@prisma/client";
import { Copy, Edit3, Play, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteLink } from "./actions";
import { LinkForm } from "./link-form";

type LinksTableProps = { links: LinkModel[]; baseUrl: string };

export function LinksTable({ links, baseUrl }: LinksTableProps) {
  const [editingLink, setEditingLink] = useState<LinkModel | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!window.confirm("Yakin ingin menghapus shortlink ini?")) return;
    startTransition(async () => {
      await deleteLink(id);
    });
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
  }

  function formatClicks(clicks: number) {
    return clicks >= 1000 ? clicks.toLocaleString("id-ID") : String(clicks);
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(date);
  }

  return (
    <>
      <div className="panel-scrollbar hidden overflow-x-auto md:block">
      <Table className="text-white">
        <TableHeader>
          <TableRow>
            <TableHead className="px-5 text-[11px] uppercase tracking-[0.08em] text-[var(--panel-faint)]">File</TableHead>
            <TableHead className="px-5 text-[11px] uppercase tracking-[0.08em] text-[var(--panel-faint)]">Destination</TableHead>
            <TableHead className="px-5 text-[11px] uppercase tracking-[0.08em] text-[var(--panel-faint)]">Tanggal</TableHead>
            <TableHead className="px-5 text-[11px] uppercase tracking-[0.08em] text-[var(--panel-faint)]">Klik</TableHead>
            <TableHead className="px-5 text-right text-[11px] uppercase tracking-[0.08em] text-[var(--panel-faint)]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-[var(--panel-faint)]">
                Belum ada shortlink.
              </TableCell>
            </TableRow>
          ) : (
            links.map((link) => (
              <TableRow key={link.id} className="panel-table-row hover:bg-[var(--panel-bg-2)]">
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <a href={`${baseUrl}/${link.slug}`} target="_blank" rel="noreferrer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--panel-pink-border)] bg-[var(--panel-pink-bg)]">
                      <Play className="ml-0.5 h-3 w-3 fill-[var(--panel-pink)] text-[var(--panel-pink)]" />
                    </a>
                    <div className="min-w-0">
                      <div className="max-w-[180px] truncate text-[13px] font-medium">{link.slug}</div>
                      <div className="mt-0.5 text-[11px] text-[var(--panel-pink)] opacity-80">{new URL(baseUrl).host}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px] truncate px-5 py-3 text-xs text-[var(--panel-faint)]" title={link.originalUrl}>{link.originalUrl}</TableCell>
                <TableCell className="whitespace-nowrap px-5 py-3 text-xs text-[var(--panel-faint)]">{formatDate(link.createdAt)}</TableCell>
                <TableCell className="px-5 py-3">
                  <span className={`inline-block min-w-[52px] rounded px-2.5 py-1 text-center text-xs font-bold ${link.clicks > 1000 ? "bg-[#2a1040] text-[#b94fd6]" : "bg-[#1a2a1a] text-[var(--panel-green)]"}`}>
                    {formatClicks(link.clicks)}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-1">
                  <IconButton title="Salin" onClick={() => void copyUrl(`${baseUrl}/${link.slug}`)}>
                    <Copy className="h-3.5 w-3.5" />
                  </IconButton>
                  <Dialog open={editingLink?.id === link.id} onOpenChange={(open) => setEditingLink(open ? link : null)}>
                    <DialogTrigger asChild>
                      <IconButton title="Edit">
                        <Edit3 className="h-3.5 w-3.5" />
                      </IconButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Shortlink</DialogTitle>
                      </DialogHeader>
                      <LinkForm mode="edit" link={link} onDone={() => setEditingLink(null)} />
                    </DialogContent>
                  </Dialog>
                  <IconButton title="Hapus" danger disabled={isPending} onClick={() => handleDelete(link.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      <div className="flex flex-col gap-2 p-3 md:hidden">
        {links.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[var(--panel-faint)]">Belum ada shortlink.</div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="rounded-md border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <a href={`${baseUrl}/${link.slug}`} target="_blank" rel="noreferrer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--panel-pink-border)] bg-[var(--panel-pink-bg)]">
                  <Play className="ml-0.5 h-3 w-3 fill-[var(--panel-pink)] text-[var(--panel-pink)]" />
                </a>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{link.slug}</div>
                  <div className="text-[11px] text-[var(--panel-pink)]">{new URL(baseUrl).host}</div>
                </div>
                <span className={`rounded px-2.5 py-1 text-xs font-bold ${link.clicks > 1000 ? "bg-[#2a1040] text-[#b94fd6]" : "bg-[#1a2a1a] text-[var(--panel-green)]"}`}>
                  {formatClicks(link.clicks)}
                </span>
              </div>
              <div className="mb-2 break-all text-xs leading-5 text-[var(--panel-faint)]">{link.originalUrl}</div>
              <div className="flex items-center justify-between border-t border-[var(--panel-border)] pt-2">
                <span className="text-[11px] text-[var(--panel-faint)]">{formatDate(link.createdAt)}</span>
                <div className="flex gap-1">
                  <IconButton title="Salin" onClick={() => void copyUrl(`${baseUrl}/${link.slug}`)}><Copy className="h-3.5 w-3.5" /></IconButton>
                  <Dialog open={editingLink?.id === link.id} onOpenChange={(open) => setEditingLink(open ? link : null)}>
                    <DialogTrigger asChild><IconButton title="Edit"><Edit3 className="h-3.5 w-3.5" /></IconButton></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Edit Shortlink</DialogTitle></DialogHeader><LinkForm mode="edit" link={link} onDone={() => setEditingLink(null)} /></DialogContent>
                  </Dialog>
                  <IconButton title="Hapus" danger disabled={isPending} onClick={() => handleDelete(link.id)}><Trash2 className="h-3.5 w-3.5" /></IconButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function IconButton({ children, danger, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      className={`flex h-7 w-7 items-center justify-center rounded-md border border-[var(--panel-border-2)] bg-[var(--panel-bg-2)] text-[var(--panel-muted)] hover:bg-[var(--panel-bg-3)] ${danger ? "hover:bg-red-500/15 hover:text-[var(--panel-red)]" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

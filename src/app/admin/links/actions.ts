"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { generateSlug, RESERVED_SLUGS } from "@/lib/slug";
import { linkSchema } from "@/lib/validations";

type ActionResult = { ok: boolean; message: string };

function normalizeSlug(slug?: string) {
  const value = slug?.trim();
  return value ? value : undefined;
}

function validateReservedSlug(slug: string) {
  return !RESERVED_SLUGS.has(slug.toLowerCase().split("/")[0] ?? slug.toLowerCase());
}

async function createUniqueSlug(suffix = "") {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = `${generateSlug()}${suffix}`;
    const existing = await prisma.link.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
  }
  throw new Error("Unable to generate unique slug");
}

export async function createLink(formData: FormData): Promise<ActionResult> {
  const parsed = linkSchema.safeParse({
    originalUrl: formData.get("originalUrl"),
    domainId: normalizeSlug(String(formData.get("domainId") ?? "")),
    slug: normalizeSlug(String(formData.get("slug") ?? "")),
    suffix: normalizeSlug(String(formData.get("suffix") ?? "")),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const slug = parsed.data.slug ?? (await createUniqueSlug(parsed.data.suffix));
    if (!validateReservedSlug(slug)) {
      return { ok: false, message: "Slug tersebut tidak boleh digunakan." };
    }

    const domain = parsed.data.domainId
      ? await prisma.domain.findUnique({ where: { id: parsed.data.domainId }, select: { id: true } })
      : await prisma.domain.findFirst({ where: { isPrimary: true }, select: { id: true } });

    await prisma.link.create({
      data: { originalUrl: parsed.data.originalUrl, slug, domainId: domain?.id },
    });
    revalidatePath("/admin/links");
    return { ok: true, message: "Shortlink berhasil dibuat." };
  } catch {
    return { ok: false, message: "Gagal membuat shortlink. Slug mungkin sudah digunakan." };
  }
}

export async function updateLink(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = linkSchema.safeParse({
    originalUrl: formData.get("originalUrl"),
    domainId: normalizeSlug(String(formData.get("domainId") ?? "")),
    slug: normalizeSlug(String(formData.get("slug") ?? "")),
    suffix: undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }
  if (!parsed.data.slug) return { ok: false, message: "Slug wajib diisi saat edit." };
  if (!validateReservedSlug(parsed.data.slug)) {
    return { ok: false, message: "Slug tersebut tidak boleh digunakan." };
  }

  try {
    await prisma.link.update({
      where: { id },
      data: {
        originalUrl: parsed.data.originalUrl,
        slug: parsed.data.slug,
        domainId: parsed.data.domainId || null,
      },
    });
    revalidatePath("/admin/links");
    return { ok: true, message: "Shortlink berhasil diperbarui." };
  } catch {
    return { ok: false, message: "Gagal memperbarui shortlink. Slug mungkin sudah digunakan." };
  }
}

export async function deleteLink(id: string): Promise<ActionResult> {
  try {
    await prisma.link.delete({ where: { id } });
    revalidatePath("/admin/links");
    return { ok: true, message: "Shortlink berhasil dihapus." };
  } catch {
    return { ok: false, message: "Gagal menghapus shortlink." };
  }
}

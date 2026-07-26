"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult = {
  ok: boolean;
  message: string;
};

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function normalizeHostname(value: FormDataEntryValue | null) {
  return normalize(value)
    ?.replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function isValidHostname(hostname: string) {
  return /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/i.test(hostname);
}

async function requireAdminEmail() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");
  return email;
}

export async function createDomain(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdminEmail();
    const hostname = normalizeHostname(formData.get("hostname"));
    const label = normalize(formData.get("label"));

    if (!hostname || !isValidHostname(hostname)) {
      return { ok: false, message: "Domain/subdomain tidak valid." };
    }

    const hasPrimary = await prisma.domain.findFirst({ where: { isPrimary: true }, select: { id: true } });

    await prisma.domain.create({
      data: {
        hostname,
        label,
        isPrimary: !hasPrimary,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/links");
    return { ok: true, message: "Domain berhasil ditambahkan." };
  } catch {
    return { ok: false, message: "Gagal menambahkan domain. Mungkin sudah ada." };
  }
}

export async function updateDomain(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdminEmail();
    const id = normalize(formData.get("id"));
    const hostname = normalizeHostname(formData.get("hostname"));
    const label = normalize(formData.get("label"));

    if (!id || !hostname || !isValidHostname(hostname)) {
      return { ok: false, message: "Input domain tidak valid." };
    }

    await prisma.domain.update({
      where: { id },
      data: { hostname, label },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/links");
    return { ok: true, message: "Domain berhasil diperbarui." };
  } catch {
    return { ok: false, message: "Gagal memperbarui domain." };
  }
}

export async function setPrimaryDomain(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdminEmail();
    const id = normalize(formData.get("id"));
    if (!id) return { ok: false, message: "Domain tidak ditemukan." };

    await prisma.$transaction([
      prisma.domain.updateMany({ data: { isPrimary: false } }),
      prisma.domain.update({ where: { id }, data: { isPrimary: true } }),
    ]);

    revalidatePath("/admin/settings");
    revalidatePath("/admin/links");
    return { ok: true, message: "Primary domain diperbarui." };
  } catch {
    return { ok: false, message: "Gagal mengubah primary domain." };
  }
}

export async function deleteDomain(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdminEmail();
    const id = normalize(formData.get("id"));
    if (!id) return { ok: false, message: "Domain tidak ditemukan." };

    const domain = await prisma.domain.findUnique({ where: { id }, select: { isPrimary: true } });
    if (domain?.isPrimary) {
      return { ok: false, message: "Primary domain tidak bisa dihapus. Jadikan domain lain primary dulu." };
    }

    await prisma.domain.delete({ where: { id } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/links");
    return { ok: true, message: "Domain berhasil dihapus." };
  } catch {
    return { ok: false, message: "Gagal menghapus domain." };
  }
}

export async function resetAdminPassword(formData: FormData): Promise<ActionResult> {
  try {
    const email = await requireAdminEmail();
    const currentPassword = normalize(formData.get("currentPassword"));
    const newPassword = normalize(formData.get("newPassword"));
    const confirmPassword = normalize(formData.get("confirmPassword"));

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { ok: false, message: "Semua field password wajib diisi." };
    }
    if (newPassword.length < 8) {
      return { ok: false, message: "Password baru minimal 8 karakter." };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, message: "Konfirmasi password tidak sama." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: false, message: "User admin tidak ditemukan." };

    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrentPassword) {
      return { ok: false, message: "Password lama salah." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    revalidatePath("/admin/settings");
    return { ok: true, message: "Password admin berhasil diganti." };
  } catch {
    return { ok: false, message: "Gagal mengganti password." };
  }
}

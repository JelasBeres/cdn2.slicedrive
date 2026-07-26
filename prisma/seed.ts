import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: { email, password: hashedPassword, name: "Admin" },
  });

  const domains = [
    { hostname: "videy.fun", label: "Main", isPrimary: true },
    { hostname: "cdn.videy.fun", label: "CDN", isPrimary: false },
    { hostname: "media.videy.fun", label: "Media", isPrimary: false },
    { hostname: "video.videy.fun", label: "Video", isPrimary: false },
    { hostname: "cdn2.videy.fun", label: "CDN 2", isPrimary: false },
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { hostname: domain.hostname },
      update: { label: domain.label, isPrimary: domain.isPrimary },
      create: domain,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;

        const user = adminEmail
          ? await prisma.user.findUnique({ where: { email: adminEmail } })
          : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
        if (!user) return null;

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!validPassword) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
};

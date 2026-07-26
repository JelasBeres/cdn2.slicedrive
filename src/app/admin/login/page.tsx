import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/admin/links");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_50%_30%,rgba(150,0,80,.2)_0%,transparent_65%),var(--background)] px-6">
      <LoginForm />
    </main>
  );
}

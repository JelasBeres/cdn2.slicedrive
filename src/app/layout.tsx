import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortlink",
  description: "Modern URL shortener built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

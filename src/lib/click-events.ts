import { prisma } from "@/lib/prisma";

type ClickDelegate = {
  count: typeof prisma.link.count;
  findMany: (args: {
    orderBy: { createdAt: "desc" };
    take: number;
    include: { link: { select: { slug: true; originalUrl: true } } };
  }) => Promise<RecentClick[]>;
  create: (args: {
    data: {
      linkId: string;
      ip: string | null;
      userAgent: string | null;
      referrer: string | null;
    };
  }) => Promise<unknown>;
};

export type RecentClick = {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
  link: {
    slug: string;
    originalUrl: string;
  };
};

export function getClickDelegate() {
  return (prisma as unknown as { click?: ClickDelegate }).click;
}

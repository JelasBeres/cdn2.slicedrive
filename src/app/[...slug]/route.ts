import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { getClickDelegate } from "@/lib/click-events";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");

  const link = await prisma.link.findUnique({
    where: { slug },
    select: { id: true, originalUrl: true },
  });

  if (!link) notFound();

  const clickDelegate = getClickDelegate();

  if (clickDelegate) {
    await Promise.all([
      prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } },
      }),
      clickDelegate.create({
        data: {
          linkId: link.id,
          ip: getClientIp(request),
          userAgent: request.headers.get("user-agent"),
          referrer: request.headers.get("referer"),
        },
      }),
    ]);
  } else {
    await prisma.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });
  }

  return NextResponse.redirect(link.originalUrl, 302);
}

import { notFound } from "next/navigation";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LINK_CACHE_TTL_MS = 60_000;
const CLICK_FLUSH_DELAY_MS = 5_000;

type CachedLink = {
  id: string;
  originalUrl: string;
  expiresAt: number;
};

const globalForRedirects = globalThis as unknown as {
  shortlinkCache?: Map<string, CachedLink>;
  pendingClicks?: Map<string, number>;
  clickFlushTimer?: ReturnType<typeof setTimeout>;
};

const linkCache = globalForRedirects.shortlinkCache ?? new Map<string, CachedLink>();
const pendingClicks = globalForRedirects.pendingClicks ?? new Map<string, number>();

globalForRedirects.shortlinkCache = linkCache;
globalForRedirects.pendingClicks = pendingClicks;

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

function trackingRedirectHtml(targetUrl: string, slug: string) {
  const safeTargetUrl = JSON.stringify(targetUrl);
  const safeSlug = slug.replace(/[<>&"]/g, "");

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Loading • ${safeSlug}</title>
  <script type="text/javascript">
    var _Hasync = _Hasync || [];
    _Hasync.push(['Histats.start', '1,5038177,4,0,0,0,00010000']);
    _Hasync.push(['Histats.fasi', '1']);
    _Hasync.push(['Histats.track_hits', '']);
    (function() {
      var hs = document.createElement('script');
      hs.type = 'text/javascript';
      hs.async = true;
      hs.src = '//s10.histats.com/js15_as.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
    })();
    window.setTimeout(function() {
      window.location.replace(${safeTargetUrl});
    }, 650);
  </script>
  <noscript>
    <meta http-equiv="refresh" content="1;url=${targetUrl.replace(/"/g, "&quot;")}" />
  </noscript>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#aaa;font-family:system-ui,sans-serif}
    .box{display:flex;align-items:center;gap:10px;font-size:13px}
    .dot{width:8px;height:8px;border-radius:999px;background:#e91e8c;animation:pulse 1s infinite}
    @keyframes pulse{50%{opacity:.35}}
  </style>
</head>
<body>
  <div class="box"><span class="dot"></span><span>Loading...</span></div>
  <noscript><a href=${safeTargetUrl}>Continue</a></noscript>
</body>
</html>`;
}

async function getLink(slug: string) {
  const cached = linkCache.get(slug);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached;
  }

  try {
    const link = await prisma.link.findUnique({
      where: { slug },
      select: { id: true, originalUrl: true },
    });

    if (!link) return null;

    const fresh = { ...link, expiresAt: now + LINK_CACHE_TTL_MS };
    linkCache.set(slug, fresh);

    return fresh;
  } catch (error) {
    console.error("Failed to load redirect link", error);

    if (cached) {
      cached.expiresAt = now + CLICK_FLUSH_DELAY_MS;
      return cached;
    }

    throw error;
  }
}

function queueClick(linkId: string) {
  pendingClicks.set(linkId, (pendingClicks.get(linkId) ?? 0) + 1);

  if (globalForRedirects.clickFlushTimer) return;

  globalForRedirects.clickFlushTimer = setTimeout(() => {
    const clicks = Array.from(pendingClicks.entries());
    pendingClicks.clear();
    globalForRedirects.clickFlushTimer = undefined;

    for (const [id, count] of clicks) {
      void prisma.link
        .update({
          where: { id },
          data: { clicks: { increment: count } },
        })
        .catch(() => {
          pendingClicks.set(id, (pendingClicks.get(id) ?? 0) + count);
        });
    }
  }, CLICK_FLUSH_DELAY_MS);
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");

  const link = await getLink(slug).catch(() => null);

  if (!link) notFound();

  queueClick(link.id);

  return new Response(trackingRedirectHtml(link.originalUrl, slug), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

// Compteur de visites pour /admin, sans cookie ni IP stockée : le visiteur est
// une empreinte HMAC de son IP et de son navigateur, salée par le jour (on ne
// peut pas suivre quelqu'un d'un jour à l'autre). Appelé par src/proxy.ts,
// après la réponse : une panne ici ne touche jamais la page.
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { parisDay } from "@/lib/paris-time";
import { ipFromHeaders } from "@/lib/request-guard";

// Robots, aperçus de liens et outils : pas des visiteurs.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python|node|headless|lighthouse|vercel/i;

// Page vue : un chargement de page par le navigateur (pas l'API ni /admin),
// ni robot. Le proxy ne voit pas les en-têtes internes de Next : un
// préchargement de lien ressemble à une navigation. On ne compte donc que les
// chargements complets (sec-fetch-dest: document), pas les changements de page
// à l'intérieur du site.
function isPageView(request: NextRequest): boolean {
  if (request.method !== "GET") return false;
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api") || path.startsWith("/admin") || path.startsWith("/auth")) return false;
  const headers = request.headers;
  if (headers.get("sec-fetch-dest") !== "document" || headers.get("sec-purpose")?.includes("prefetch")) return false;
  const ua = headers.get("user-agent") ?? "";
  return ua.length > 0 && !BOT.test(ua);
}

export async function recordSiteVisit(request: NextRequest): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isPageView(request)) return;
  const day = parisDay();
  const ip = ipFromHeaders(request.headers) ?? "";
  const visitor = createHmac("sha256", key)
    .update(`${day}|${ip}|${request.headers.get("user-agent")}`)
    .digest("base64url")
    .slice(0, 24);
  const res = await fetch(`${url}/rest/v1/rpc/record_site_visit`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_day: day, p_visitor: visitor, p_path: request.nextUrl.pathname }),
    cache: "no-store",
  });
  if (!res.ok) console.error(`Visite non comptée : ${res.status} ${await res.text()}`);
}

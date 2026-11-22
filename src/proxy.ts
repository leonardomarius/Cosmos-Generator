import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { recordSiteVisit } from "@/lib/site-visits";

// Rafraîchit la session Supabase avant chaque page : les pages (composants
// serveur) peuvent lire les cookies mais pas les réécrire. Compte aussi la
// visite pour /admin (src/lib/site-visits.ts), après la réponse.
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(recordSiteVisit(request).catch((err) => console.error("Visite non comptée", err)));
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    // Ni les fichiers statiques, ni les webhooks (appelés par Mollie, sans session).
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};

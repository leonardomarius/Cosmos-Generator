// Clients Supabase, uniquement côté serveur.
// - sessionClient : agit au nom de l'utilisateur connecté (cookies de session).
// - adminClient : clé service_role, contourne les règles RLS. Seul le serveur
//   écrit les abonnements et les tokens : elle ne doit jamais aller au navigateur.
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} manquant dans .env.local`);
  return value;
}

export async function sessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        // Impossible pendant le rendu d'une page : le proxy (src/proxy.ts)
        // s'occupe alors de rafraîchir la session.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

// Utilisateur connecté, vérifié auprès de Supabase, ou null.
export async function currentUser(): Promise<User | null> {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

let admin: ReturnType<typeof createClient<Database>> | null = null;

export function adminClient() {
  admin ??= createClient<Database>(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

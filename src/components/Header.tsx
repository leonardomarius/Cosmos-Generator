import Link from "next/link";
import { Suspense } from "react";
import { PRODUCT } from "@/config/product";
import { currentUser } from "@/lib/supabase";

const LINK = "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center";

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full py-2 pl-4 pr-2 sm:pl-5">
        <Link href="/" className="whitespace-nowrap text-[15px] font-semibold tracking-tight pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center sm:text-[17px]">
          {PRODUCT.siteName}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/creer"
            className={`liquid-glass liquid-glass--interactive liquid-glass--accent sm:px-4 ${LINK}`}
          >
            Créer ma vidéo
          </Link>
          {/* La session se lit dans les cookies : rendu à la demande, le reste du header reste statique. */}
          <Suspense fallback={<span aria-hidden="true" className="size-9 pointer-coarse:size-11" />}>
            <AccountLink />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

// "Connexion" pour un visiteur ; une fois connecté, son compte (initiale + nom).
async function AccountLink() {
  const user = await currentUser();
  if (!user) {
    return (
      <Link href="/connexion?next=/compte" className={`text-secondary ${LINK}`}>
        Connexion
      </Link>
    );
  }

  // Nom fourni par Google, sinon le début de l'email.
  const name = (user.user_metadata.full_name as string | undefined)?.split(" ")[0] || user.email?.split("@")[0] || "Compte";
  return (
    <Link
      href="/compte"
      aria-label={`Mon compte (${user.email})`}
      className="liquid-glass liquid-glass--interactive flex items-center gap-2 rounded-full p-1 text-sm font-semibold sm:pr-3 pointer-coarse:min-h-11"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-white/15 uppercase pointer-coarse:size-9">
        {name[0]}
      </span>
      <span className="hidden max-w-32 truncate sm:inline">{name}</span>
    </Link>
  );
}

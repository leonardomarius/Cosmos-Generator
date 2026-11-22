"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { MODEL_NAME } from "@/config/product";

// Pop-up de première visite : annonce que le modèle de génération est gratuit
// jusqu'à décembre. Affiché une seule fois par navigateur (localStorage), et
// plus du tout à partir du 1er décembre à minuit, heure de Paris. Simple
// annonce : ne change aucun prix.

const SEEN_KEY = "cosmos-free-model-popup-seen";
const ENDS_AT = Date.parse("2026-12-01T00:00:00+01:00");
// Pages où il ne s'affiche pas (et ne compte pas comme vu) : le Père Noël
// n'utilise pas le modèle, l'admin et la connexion ne s'y prêtent pas.
const HIDDEN_ON = ["/noel", "/admin", "/auth", "/connexion"];

export function FreeModelPopup() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (Date.now() >= ENDS_AT) return;
    if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Stockage bloqué (navigation privée) : on affiche quand même.
    }
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [pathname]);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="free-model-title"
      aria-describedby="free-model-text"
      // Clic hors de la carte (sur le fond assombri) : fermeture.
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-visible bg-transparent p-0 text-foreground backdrop:bg-[rgb(31_26_21/0.28)] backdrop:backdrop-blur-[3px]"
    >
      <div className="liquid-glass rounded-[28px] px-5 pb-6 pt-7 text-center transition duration-300 ease-(--ease-soft) starting:scale-95 starting:opacity-0 sm:px-8 sm:pb-8 sm:pt-9">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-secondary transition-colors hover:bg-white/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
          </svg>
        </button>

        <span className="glass-icon mx-auto" aria-hidden="true">
          <SparkIcon />
        </span>
        <p className="mt-5 text-sm font-semibold text-(--brand)">Offre de lancement</p>
        <h2 id="free-model-title" className="mt-1.5 text-balance text-2xl font-semibold leading-snug">
          Notre modèle {MODEL_NAME} est gratuit jusqu&apos;à décembre
        </h2>
        <p id="free-model-text" className="mt-2 text-pretty text-base leading-relaxed text-secondary">
          Images et vidéos&nbsp;: profite de notre modèle de génération gratuitement jusqu&apos;au 30&nbsp;novembre.
        </p>
        <Link
          href="/chat"
          onClick={close}
          className="liquid-glass liquid-glass--interactive liquid-glass--accent mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-base font-semibold sm:w-auto"
        >
          Commencer à créer
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </dialog>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </svg>
  );
}

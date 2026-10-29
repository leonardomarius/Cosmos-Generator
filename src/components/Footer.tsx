import Link from "next/link";
import { PRODUCT } from "@/config/product";

export function Footer() {
  return (
    <footer className="border-t border-white/10 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:justify-between">
        <p>{PRODUCT.siteName} — Vidéos générées par intelligence artificielle.</p>
        <nav className="flex gap-4">
          <Link href="/cgu" className="hover:text-white">CGU</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
        </nav>
      </div>
    </footer>
  );
}

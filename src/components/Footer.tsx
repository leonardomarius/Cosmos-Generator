import Link from "next/link";
import { PRODUCT } from "@/config/product";

const LINK = "hover:text-white pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)] text-sm text-tertiary">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between md:gap-6">
        <p>{PRODUCT.siteName} — Vidéos générées par intelligence artificielle.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/cgu" className={LINK}>CGU</Link>
          <Link href="/confidentialite" className={LINK}>Confidentialité</Link>
          <Link href="/mentions-legales" className={LINK}>Mentions légales</Link>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { PRODUCT } from "@/config/product";

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full py-2 pl-4 pr-2 sm:pl-5">
        <Link href="/" className="whitespace-nowrap text-[15px] font-semibold tracking-tight pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center sm:text-[17px]">
          {PRODUCT.siteName}
        </Link>
        <Link
          href="/creer"
          className="liquid-glass liquid-glass--interactive liquid-glass--accent whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center sm:px-4"
        >
          Créer ma vidéo
        </Link>
      </div>
    </header>
  );
}

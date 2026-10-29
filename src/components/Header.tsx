import Link from "next/link";
import { PRODUCT } from "@/config/product";

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-2 pl-5 pr-2">
        <Link href="/" className="text-[17px] font-semibold tracking-tight">
          {PRODUCT.siteName}
        </Link>
        <Link
          href="/creer"
          className="liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-4 py-2 text-sm font-semibold"
        >
          Créer ma vidéo
        </Link>
      </div>
    </header>
  );
}

import Link from "next/link";
import { PRODUCT } from "@/config/product";

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {PRODUCT.siteName}
        </Link>
        <Link
          href="/creer"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
        >
          Créer ma vidéo
        </Link>
      </div>
    </header>
  );
}

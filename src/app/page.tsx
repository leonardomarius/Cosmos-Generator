import Link from "next/link";
import { ExampleVideo } from "@/components/ExampleVideo";
import { PRODUCT, formatPrice } from "@/config/product";

const STEPS = [
  { title: "1. Ta photo", text: "Envoie une photo nette de ton visage, de face." },
  { title: "2. Paiement", text: `${formatPrice()} — paiement sécurisé par Stripe.` },
  { title: "3. Ta vidéo", text: "Reçue par lien et par email en quelques minutes." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            {PRODUCT.tagline}
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Une vidéo de {PRODUCT.videoDurationSeconds} secondes où c&apos;est
            toi qui enchaînes les sauts sur les toits. Aucun texte à écrire.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
            <Link
              href="/creer"
              className="rounded-full bg-orange-500 px-8 py-4 text-lg font-bold text-black hover:bg-orange-400"
            >
              Créer ma vidéo — {formatPrice()}
            </Link>
            <p className="text-xs text-zinc-500">
              Paiement unique · Vidéo disponible {PRODUCT.retentionDays} jours ·
              Photo supprimée sous {PRODUCT.retentionDays} jours
            </p>
          </div>
        </div>
        <ExampleVideo />
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{step.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

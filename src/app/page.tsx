import Link from "next/link";
import { ExampleVideo } from "@/components/ExampleVideo";
import { PRODUCT, formatPrice } from "@/config/product";

const STEPS = [
  { title: "1. Ta photo", text: "Envoie une photo nette de ton visage, de face." },
  { title: "2. Paiement", text: `${formatPrice()} — paiement sécurisé par Stripe.` },
  { title: "3. Ta vidéo", text: "Reçue par lien et par email en quelques minutes." },
];

// Icônes décoratives des étapes (même ordre que STEPS).
const STEP_ICONS = [
  <path key="photo" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  <path key="pay" d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9ZM3 10h18M7 14.5h4" />,
  <path key="video" d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8a.8.8 0 0 0-1.2.7Z" />,
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:pt-20">
      <section className="flex flex-col items-center gap-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="text-[40px] font-semibold leading-[1.05] sm:text-[56px]">
            {PRODUCT.tagline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-secondary sm:text-xl">
            Une vidéo de {PRODUCT.videoDurationSeconds} secondes où c&apos;est
            toi qui enchaînes les sauts sur les toits. Aucun texte à écrire.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 md:items-start">
            <Link
              href="/creer"
              className="liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-8 py-4 text-lg font-semibold"
            >
              Créer ma vidéo — {formatPrice()}
            </Link>
            <p className="text-xs text-tertiary">
              Paiement unique · Vidéo disponible {PRODUCT.retentionDays} jours ·
              Photo supprimée sous {PRODUCT.retentionDays} jours
            </p>
          </div>
        </div>
        <ExampleVideo />
      </section>

      <section className="mt-24 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="liquid-glass liquid-glass--interactive cursor-default rounded-[28px] p-6"
          >
            <span className="glass-icon mb-5" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {STEP_ICONS[i]}
              </svg>
            </span>
            <h2 className="text-[17px] font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{step.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

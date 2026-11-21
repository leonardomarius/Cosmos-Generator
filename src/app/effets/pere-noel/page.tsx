import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { SantaForm } from "@/components/SantaForm";
import { SANTA_EFFECT } from "@/config/effects";
import { guestPurchase, type GuestPurchase } from "@/lib/guest-video";
import { currentUser } from "@/lib/supabase";
import { availableVideoPurchases } from "@/lib/video-purchases";

export const metadata: Metadata = { title: SANTA_EFFECT.title, description: SANTA_EFFECT.subtitle };

const price = SANTA_EFFECT.priceEur.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function AccountOrder({ userId, email, balance }: { userId: string; email: string; balance: number }) {
  const purchases = await availableVideoPurchases(userId, SANTA_EFFECT.id);
  return <SantaForm email={email} balance={balance} purchases={purchases} />;
}

// Avec un compte : achat à l'unité ou tokens. Sans compte (ni connexion ni
// inscription) : achat à l'unité seulement, retrouvé au retour de Mollie par
// l'identifiant du paiement dans l'adresse (src/lib/guest-video.ts).
async function SantaOrder({ searchParams }: { searchParams: SearchParams }) {
  const user = await currentUser();
  if (user?.email) {
    return (
      <AccountGate next={`/effets/${SANTA_EFFECT.slug}`} what="la vidéo du Père Noël" tokensRequired={false}>
        {(account) => <AccountOrder {...account} />}
      </AccountGate>
    );
  }
  const { paiement } = await searchParams;
  const paymentId = typeof paiement === "string" ? paiement : null;
  const purchase: GuestPurchase | null = paymentId
    ? await guestPurchase(SANTA_EFFECT, paymentId).catch((err): GuestPurchase => {
        console.error(err);
        return { state: "pending" };
      })
    : null;
  return (
    <SantaForm
      email={null}
      balance={0}
      purchases={purchase?.state === "available" ? 1 : 0}
      guest={{
        paymentId: purchase?.state === "invalid" ? null : paymentId,
        createdUrl: purchase?.state === "used" ? purchase.url : null,
      }}
    />
  );
}

export default function SantaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">{SANTA_EFFECT.title}</h1>
      <p className="mt-3 text-lg text-secondary">
        {SANTA_EFFECT.seconds} secondes de magie : le Père Noël découvre le
        visage de ton enfant et sa liste de cadeaux, puis lui sourit.
      </p>
      <p className="mt-3 text-lg font-semibold">{price} à l&apos;unité, sans abonnement.</p>
      <div className="relative mx-auto mt-8 aspect-[9/16] w-full max-w-[min(20rem,calc(85dvh*9/16))] overflow-hidden rounded-[24px] bg-foreground/8">
        <video
          src={SANTA_EFFECT.preview.video}
          poster={SANTA_EFFECT.preview.poster}
          aria-label="Extrait d'une vidéo du Père Noël"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <SantaOrder searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

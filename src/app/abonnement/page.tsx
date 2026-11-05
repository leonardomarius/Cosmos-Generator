import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentHelp, SuspendedNotice } from "@/components/AccountNotices";
import { TokenShop, type ShopViewer } from "@/components/TokenShop";
import { supportEmail } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

export const metadata: Metadata = { title: "Boutique de tokens" };

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 xl:max-w-7xl">
      <h1 className="text-title font-semibold">Boutique de tokens</h1>
      <p className="mt-3 max-w-3xl text-lg text-secondary">
        Abonne-toi pour payer tes tokens moins cher, ou achète-les une seule fois. Si une génération échoue, ses tokens
        te sont rendus.
      </p>
      <Suspense fallback={<TokenShop viewer={null} />}>
        <AccountShop />
      </Suspense>
      <div className="mt-8 space-y-2 text-sm leading-relaxed text-secondary">
        <p>
          Prix TTC. Paiement par carte bancaire, sécurisé par Mollie. L&apos;abonnement annuel est payé en une fois, sans
          remboursement de l&apos;année en cours, et se renouvelle chaque année : tu reçois un email avant l&apos;échéance.
        </p>
        <PaymentHelp contact={supportEmail()} />
      </div>
    </div>
  );
}

// La boutique connaît l'abonnement en cours pour dire ce que fait chaque bouton.
async function AccountShop() {
  const user = await currentUser();
  if (!user) return <TokenShop viewer={null} signedOut />;
  const account = await getAccount(user.id);
  if (account.blocked) {
    return (
      <div className="mt-10">
        <SuspendedNotice contact={supportEmail()} />
      </div>
    );
  }
  const subscribed = hasActiveSubscription(account) && account.plan && account.currentPeriodEnd;
  const viewer: ShopViewer | null = subscribed
    ? {
        plan: account.plan!,
        interval: account.interval,
        canceled: account.cancelAtPeriodEnd,
        nextPlan: account.nextPlan,
        nextInterval: account.nextInterval,
        periodEndIso: account.currentPeriodEnd!,
        periodEnd: new Date(account.currentPeriodEnd!).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }),
      }
    : null;
  return <TokenShop viewer={viewer} />;
}

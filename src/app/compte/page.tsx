import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CancelButton } from "@/components/CancelButton";
import { PLANS, formatTokens } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

export const metadata: Metadata = { title: "Mon compte" };

const STATUS_LABELS: Record<string, string> = {
  active: "actif",
  past_due: "dernier prélèvement refusé",
  canceled: "résilié",
  none: "aucun",
};

export default function AccountPage({ searchParams }: PageProps<"/compte">) {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Mon compte</h1>
      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <AccountDetails searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AccountDetails({ searchParams }: Pick<PageProps<"/compte">, "searchParams">) {
  const user = await currentUser();
  if (!user) redirect("/connexion?next=/compte");
  const [account, params] = await Promise.all([getAccount(user.id), searchParams]);
  const subscribed = hasActiveSubscription(account);
  const renewal = account.currentPeriodEnd
    ? new Date(account.currentPeriodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : null;

  return (
    <div className="mt-10 space-y-6">
      {params.abonnement === "ok" && (
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-base leading-relaxed text-secondary sm:text-sm">
          Merci ! Dès que Mollie confirme ton paiement, tes tokens arrivent :
          quelques secondes par carte, quelques jours par prélèvement. Recharge
          la page s&apos;ils ne s&apos;affichent pas encore.
        </p>
      )}
      {params.abonnement === "changement" && (
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-base leading-relaxed text-secondary sm:text-sm">
          Changement de plan enregistré. Une montée de plan est facturée au
          prorata du mois restant et ses tokens arrivent dès le paiement
          confirmé ; une baisse s&apos;applique au prochain renouvellement.
        </p>
      )}

      <div className="liquid-glass space-y-2 rounded-[28px] p-6">
        <p className="text-sm text-secondary">{user.email}</p>
        <p className="text-title font-semibold">{formatTokens(account.balance)}</p>
        <p className="text-secondary">
          {account.plan ? `Plan ${PLANS[account.plan].label}` : "Aucun plan"} · abonnement{" "}
          {STATUS_LABELS[account.status] ?? account.status}
        </p>
        {subscribed && renewal && (
          <p className="text-secondary">
            {account.cancelAtPeriodEnd
              ? `Se termine le ${renewal}.`
              : account.nextPlan
                ? `Passe au plan ${PLANS[account.nextPlan].label} le ${renewal} : ${formatTokens(PLANS[account.nextPlan].monthlyTokens)}.`
                : `Prochaine recharge le ${renewal} : ${formatTokens(account.plan ? PLANS[account.plan].monthlyTokens : 0)}.`}
          </p>
        )}
      </div>

      {/* Mobile : boutons empilés pleine largeur ; dès 640 px, sur une ligne. */}
      <div className="grid gap-3 text-center sm:flex sm:flex-wrap sm:items-center">
        {subscribed ? (
          <>
            <Link
              href="/abonnement"
              className="liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-5 py-3 font-semibold"
            >
              {account.cancelAtPeriodEnd ? "Se réabonner" : "Changer de plan"}
            </Link>
            {!account.cancelAtPeriodEnd && <CancelButton until={renewal} />}
          </>
        ) : (
          <Link
            href="/abonnement"
            className="liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-5 py-3 font-semibold"
          >
            Choisir un abonnement
          </Link>
        )}
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="liquid-glass liquid-glass--interactive w-full rounded-full px-5 py-3 font-semibold sm:w-auto">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

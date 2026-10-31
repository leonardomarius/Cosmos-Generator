import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PortalButton } from "@/components/PortalButton";
import { PLANS } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription } from "@/lib/tokens";

export const metadata: Metadata = { title: "Mon compte" };

const STATUS_LABELS: Record<string, string> = {
  active: "actif",
  trialing: "actif",
  past_due: "paiement en attente",
  unpaid: "impayé",
  canceled: "résilié",
  incomplete: "paiement à finaliser",
  incomplete_expired: "paiement non abouti",
  paused: "en pause",
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
        <p className="liquid-glass rounded-[24px] px-5 py-4 text-sm leading-relaxed text-secondary">
          Merci ! Ton paiement est validé. Tes tokens arrivent dans quelques
          secondes : recharge la page s&apos;ils ne s&apos;affichent pas encore.
        </p>
      )}

      <div className="liquid-glass space-y-2 rounded-[28px] p-6">
        <p className="text-sm text-secondary">{user.email}</p>
        <p className="text-4xl font-semibold">{account.balance} tokens</p>
        <p className="text-secondary">
          {account.plan ? `Plan ${PLANS[account.plan].label}` : "Aucun plan"} · abonnement{" "}
          {STATUS_LABELS[account.status] ?? account.status}
        </p>
        {subscribed && renewal && (
          <p className="text-secondary">
            {account.cancelAtPeriodEnd
              ? `Se termine le ${renewal}.`
              : `Prochaine recharge le ${renewal} : ${account.plan ? PLANS[account.plan].monthlyTokens : 0} tokens.`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {subscribed ? (
          <PortalButton />
        ) : (
          <Link
            href="/abonnement"
            className="liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-5 py-3 font-semibold"
          >
            Choisir un abonnement
          </Link>
        )}
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="liquid-glass liquid-glass--interactive rounded-full px-5 py-3 font-semibold">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

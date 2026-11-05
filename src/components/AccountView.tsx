import Link from "next/link";
import { PaymentHelp, SuspendedNotice } from "@/components/AccountNotices";
import { PLANS, formatTokens, planPriceEur, supportEmail } from "@/config/product";
import { hasActiveSubscription, type Account } from "@/lib/tokens";

const STATUS_LABELS: Record<string, string> = {
  active: "actif",
  past_due: "dernier prélèvement refusé",
  canceled: "résilié",
};
const INTERVAL_LABELS = { month: "mensuel", year: "annuel" };
const NOTICE = "liquid-glass rounded-[24px] px-5 py-4 text-base leading-relaxed text-secondary sm:text-sm";
const PRIMARY = "liquid-glass liquid-glass--interactive liquid-glass--accent rounded-full px-5 py-3 font-semibold";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button type="submit" className="liquid-glass liquid-glass--interactive w-full rounded-full px-5 py-3 font-semibold sm:w-auto">
        Se déconnecter
      </button>
    </form>
  );
}

// Contenu de /compte. params : abonnement et achat, posés au retour de Mollie.
export function AccountView({
  email,
  account,
  params,
}: {
  email: string | undefined;
  account: Account;
  params: Record<string, string | string[] | undefined>;
}) {
  if (account.blocked) {
    return (
      <div className="mt-10 space-y-6">
        <p className="text-sm text-secondary">{email}</p>
        <SuspendedNotice contact={supportEmail()} />
        <LogoutButton />
      </div>
    );
  }

  const subscribed = hasActiveSubscription(account);
  const periodEnd = account.currentPeriodEnd ? formatDate(account.currentPeriodEnd) : null;

  return (
    <div className="mt-10 space-y-6">
      {params.abonnement === "ok" && (
        <p className={NOTICE}>
          Merci ! Dès que Mollie confirme ton paiement, tes tokens arrivent :
          quelques secondes par carte, quelques jours par prélèvement. Recharge
          la page s&apos;ils ne s&apos;affichent pas encore.
        </p>
      )}
      {params.abonnement === "changement" && (
        <p className={NOTICE}>
          Changement de plan enregistré. La différence au prorata de la période
          restante est prélevée tout de suite et tes tokens arrivent dès le
          paiement confirmé.
        </p>
      )}
      {params.abonnement === "programme" && (
        <p className={NOTICE}>
          Changement enregistré : il s&apos;applique à ton prochain renouvellement,
          à la date de prélèvement prévue.
        </p>
      )}
      {params.abonnement === "reprise" && (
        <p className={NOTICE}>
          Te revoilà ! Ton abonnement reprend à la fin de la période déjà payée,
          sans aucun paiement d&apos;ici là.
        </p>
      )}
      {params.achat === "ok" && (
        <p className={NOTICE}>
          Merci pour ton achat ! Tes tokens arrivent dès que Mollie confirme ton
          paiement, en général en quelques secondes. Ils n&apos;expirent jamais :
          ils t&apos;attendent aussi longtemps qu&apos;il le faudra. Recharge la page
          s&apos;ils ne s&apos;affichent pas encore.
        </p>
      )}

      <div className="liquid-glass space-y-2 rounded-[28px] p-6">
        <p className="text-sm text-secondary">{email}</p>
        <p className="text-title font-semibold">{formatTokens(account.balance)}</p>
        {(subscribed || account.purchasedBalance > 0) && (
          <ul className="space-y-1 text-secondary">
            {subscribed && <li>Abonnement : {formatTokens(account.subscriptionBalance)}</li>}
            {account.purchasedBalance > 0 && (
              <li>
                Achetés : {formatTokens(account.purchasedBalance)}.{" "}
                <span className="text-sm">Ils n&apos;expirent jamais.</span>
              </li>
            )}
          </ul>
        )}
        {subscribed && account.plan ? (
          <SubscriptionDetails account={account} plan={account.plan} periodEnd={periodEnd} />
        ) : (
          <p className="text-secondary">Pas d&apos;abonnement en cours.</p>
        )}
      </div>

      {/* Mobile : boutons empilés pleine largeur ; dès 640 px, sur une ligne. */}
      <div className="grid gap-3 text-center sm:flex sm:flex-wrap sm:items-center">
        <Link href="/abonnement" className={PRIMARY}>
          {!subscribed ? "Choisir un programme" : account.cancelAtPeriodEnd ? "Se réabonner" : "Boutique de tokens"}
        </Link>
        <LogoutButton />
      </div>

      <PaymentHelp contact={supportEmail()} />
    </div>
  );
}

function SubscriptionDetails({ account, plan, periodEnd }: { account: Account; plan: keyof typeof PLANS; periodEnd: string | null }) {
  const nextPlan = account.nextPlan ?? plan;
  const nextInterval = account.nextInterval ?? account.interval;
  // La recharge qui tombe au renouvellement est déjà au nouveau plan.
  const rechargePlan = account.nextRecharge === account.currentPeriodEnd ? nextPlan : plan;
  const changes = account.nextPlan !== null || account.nextInterval !== null;

  return (
    <>
      <p className="text-secondary">
        Plan {PLANS[plan].label} {INTERVAL_LABELS[account.interval]} · {STATUS_LABELS[account.status] ?? account.status}
      </p>
      {account.nextRecharge && (
        <p className="text-secondary">
          Prochaine recharge : {formatDate(account.nextRecharge)}, {formatTokens(PLANS[rechargePlan].monthlyTokens)}.
        </p>
      )}
      {periodEnd &&
        (account.cancelAtPeriodEnd ? (
          <p className="text-secondary">Se termine le {periodEnd}, sans nouveau prélèvement.</p>
        ) : (
          <p className="text-secondary">
            Prochain prélèvement : {periodEnd}, {euros(planPriceEur(nextPlan, nextInterval))}.
            {changes && ` Tu passes alors au plan ${PLANS[nextPlan].label} ${INTERVAL_LABELS[nextInterval]}.`}
          </p>
        ))}
    </>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { SuspendedNotice } from "@/components/AccountNotices";
import { supportEmail } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasActiveSubscription, hasPaid } from "@/lib/tokens";

// Un formulaire de génération n'apparaît qu'aux comptes connectés qui ont des
// tokens (ou un abonnement en cours, pour voir leur solde même à 0).
// next : page où revenir après la connexion ; what : ce que le client va créer.
// tokensRequired : false si la page propose aussi un achat sans tokens.
// upsell : le compte n'a jamais payé, l'offre payante suit le résultat.
export async function AccountGate({
  next,
  what,
  tokensRequired = true,
  children,
}: {
  next: string;
  what: string;
  tokensRequired?: boolean;
  children: (account: { userId: string; email: string; balance: number; upsell: boolean }) => ReactNode;
}) {
  const user = await currentUser();
  if (!user?.email) {
    return <Gate text={`Connecte-toi pour créer ${what}.`} href={`/connexion?next=${next}`} label="Se connecter" />;
  }
  const [account, paid] = await Promise.all([getAccount(user.id), hasPaid(user.id)]);
  if (account.blocked) {
    return (
      <div className="mt-10">
        <SuspendedNotice contact={supportEmail()} />
      </div>
    );
  }
  if (tokensRequired && !hasActiveSubscription(account) && account.balance === 0) {
    return (
      <Gate
        text="Il te faut des tokens : avec un abonnement rechargé chaque mois, ou un achat unique sans expiration."
        href="/abonnement"
        label="Recharger mes tokens"
      />
    );
  }
  return children({ userId: user.id, email: user.email, balance: account.balance, upsell: !paid });
}

function Gate({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="liquid-glass mt-10 space-y-5 rounded-[28px] p-6 text-center">
      <p className="text-secondary">{text}</p>
      <Link
        href={href}
        className="liquid-glass liquid-glass--interactive liquid-glass--accent inline-block rounded-full px-6 py-3 font-semibold"
      >
        {label}
      </Link>
    </div>
  );
}

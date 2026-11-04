import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountView } from "@/components/AccountView";
import { currentUser } from "@/lib/supabase";
import { getAccount } from "@/lib/tokens";

export const metadata: Metadata = { title: "Mon compte" };

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
  return <AccountView email={user.email} account={account} params={params} />;
}

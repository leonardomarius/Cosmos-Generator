import type { Metadata } from "next";
import { ViewTransition } from "react";
import { CosmosChat, type ChatAccount } from "@/components/CosmosChat";
import { supportEmail } from "@/config/product";
import { currentUser } from "@/lib/supabase";
import { getAccount, hasPaid } from "@/lib/tokens";

export const metadata: Metadata = { title: "Chat" };

// Le chat s'affiche tout de suite (arrivée depuis l'accueil, le client est en
// train d'écrire) ; le compte arrive ensuite, sans bloquer la page.
export default function ChatPage() {
  return (
    <ViewTransition enter={{ "to-chat": "chat-enter", default: "none" }} default="none">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl flex-col px-4 sm:px-5">
        <CosmosChat account={loadAccount()} />
      </div>
    </ViewTransition>
  );
}

async function loadAccount(): Promise<ChatAccount | null> {
  const user = await currentUser();
  if (!user?.email) return null;
  const [account, paid] = await Promise.all([getAccount(user.id), hasPaid(user.id)]);
  return {
    email: user.email,
    balance: account.balance,
    suspendedContact: account.blocked ? supportEmail() : null,
    upsell: !paid,
  };
}

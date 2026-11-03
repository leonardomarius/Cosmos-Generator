"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { chooseChatKind, type GenerationKind } from "@/lib/chat-draft";

// Lien vers le chat dans un mode donné : le mode est passé en mémoire pour
// être là dès l'affichage du chat, et reste dans l'adresse (?type=) pour un
// chargement direct.
export function ChatLink({ kind, className, children }: { kind: GenerationKind; className: string; children: ReactNode }) {
  return (
    <Link
      href={`/chat?type=${kind}`}
      transitionTypes={["to-chat"]}
      onClick={() => chooseChatKind(kind)}
      className={className}
    >
      {children}
    </Link>
  );
}

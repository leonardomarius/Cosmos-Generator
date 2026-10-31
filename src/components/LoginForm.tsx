"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EMAIL_RULES } from "@/config/product";

const ERRORS: Record<string, string> = {
  lien: "Ce lien a expiré ou a déjà servi : demande-en un nouveau.",
  google: "Connexion avec Google annulée ou impossible : réessaie, ou utilise ton email.",
};

// Connexion sans mot de passe : avec Google, ou par un lien envoyé par email.
export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/creer";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(ERRORS[params.get("erreur") ?? ""] ?? null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), next }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <p className="liquid-glass mt-10 rounded-[24px] px-5 py-4 text-center leading-relaxed text-secondary">
        Lien envoyé à <strong className="text-white">{sentTo}</strong>. Ouvre-le dans ce navigateur pour te connecter.
      </p>
    );
  }

  const emailValid = email.trim().length <= EMAIL_RULES.maxLength && EMAIL_RULES.pattern.test(email.trim());
  return (
    <div className="mt-10 space-y-6">
      <form action="/api/auth/google" method="post">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="liquid-glass liquid-glass--interactive flex w-full items-center justify-center gap-3 rounded-full py-4 text-lg font-semibold"
        >
          <GoogleIcon />
          Continuer avec Google
        </button>
      </form>
      <p className="flex items-center gap-4 text-sm text-secondary before:h-px before:flex-1 before:bg-white/15 after:h-px after:flex-1 after:bg-white/15">
        ou par email
      </p>
      <form className="space-y-6" onSubmit={onSubmit}>
        <label className="liquid-glass block rounded-[24px] p-5 text-sm text-secondary">
          <span>Ton email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={EMAIL_RULES.maxLength}
            autoComplete="email"
            placeholder="toi@exemple.fr"
            required
            className="mt-2 w-full rounded-full border border-white/15 bg-black/30 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-2 focus:outline-offset-2 focus:outline-white/70"
          />
        </label>
        {error && (
          <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}
        <button
          type="submit"
          disabled={!emailValid || sending}
          className="liquid-glass liquid-glass--interactive liquid-glass--accent w-full rounded-full py-4 text-lg font-semibold disabled:opacity-60 disabled:saturate-50"
        >
          {sending ? "Envoi…" : "Recevoir mon lien de connexion"}
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

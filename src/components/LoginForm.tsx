"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EMAIL_RULES } from "@/config/product";

// Connexion sans mot de passe : un lien est envoyé par email.
export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/creer";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("erreur") === "lien" ? "Ce lien a expiré ou a déjà servi : demande-en un nouveau." : null,
  );

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
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
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
  );
}

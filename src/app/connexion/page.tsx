import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Connexion</h1>
      <p className="mt-3 text-lg text-secondary">
        Pas de mot de passe : entre ton email, tu reçois un lien pour te
        connecter. Ton compte est créé au premier lien.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

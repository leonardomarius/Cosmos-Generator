import type { Metadata } from "next";
import { UploadForm } from "@/components/UploadForm";

export const metadata: Metadata = { title: "Créer ma vidéo" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">Créer ma vidéo</h1>
      <p className="mt-3 text-lg text-secondary">
        Une ou deux photos du proche à faire apparaître, nettes et bien
        éclairées, avec une seule personne visible. Idéalement : une de face,
        et une en pied.
      </p>
      <UploadForm />
    </div>
  );
}

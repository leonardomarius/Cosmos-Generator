import type { Metadata } from "next";
import { UploadForm } from "@/components/UploadForm";

export const metadata: Metadata = { title: "Créer ma vidéo" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-4xl font-semibold">Créer ma vidéo</h1>
      <p className="mt-3 text-lg text-secondary">
        Une photo de face, bien éclairée, avec un seul visage visible.
      </p>
      <UploadForm />
    </div>
  );
}

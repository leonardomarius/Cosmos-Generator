import type { Metadata } from "next";
import { UploadForm } from "@/components/UploadForm";

export const metadata: Metadata = { title: "Créer ma vidéo" };

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold">Créer ma vidéo</h1>
      <p className="mt-2 text-zinc-400">
        Une photo de face, bien éclairée, avec un seul visage visible.
      </p>
      <UploadForm />
    </div>
  );
}

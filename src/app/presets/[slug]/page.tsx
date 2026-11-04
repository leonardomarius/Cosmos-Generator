import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccountGate } from "@/components/AccountGate";
import { PresetForm } from "@/components/PresetForm";
import { PRESETS, presetBySlug } from "@/config/presets";
import { canOrderPreset } from "@/lib/presets/jobs";
import type { PresetSpec } from "@/lib/presets/spec";
import { currentUser } from "@/lib/supabase";

export function generateStaticParams() {
  return PRESETS.map((preset) => ({ slug: preset.slug }));
}

export async function generateMetadata({ params }: PageProps<"/presets/[slug]">): Promise<Metadata> {
  const preset = presetBySlug((await params).slug);
  if (!preset) return {};
  return {
    title: preset.name,
    description: preset.subtitle,
    // Tant qu'un preset n'est pas publié, sa page reste hors des moteurs de recherche.
    robots: preset.status === "published" ? undefined : { index: false },
  };
}

export default async function PresetPage({ params }: PageProps<"/presets/[slug]">) {
  const preset = presetBySlug((await params).slug);
  if (!preset) notFound();

  return (
    <div className="mx-auto max-w-xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">{preset.name}</h1>
      <p className="mt-3 text-lg text-secondary">{preset.pitch}</p>

      <div className="liquid-glass mx-auto mt-8 w-full max-w-[min(20rem,calc(70dvh*9/16))] rounded-[32px] p-2">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-foreground/8">
          <video
            src={preset.preview_video}
            poster={preset.thumbnail}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
            Généré par Cosmos
          </span>
        </div>
      </div>

      <section className="liquid-glass mt-8 rounded-[28px] p-6">
        <h2 className="text-xl font-semibold">Ta photo</h2>
        <p className="mt-3 text-base leading-relaxed text-secondary">{preset.source_requirements.notes_for_user}</p>
      </section>

      <Suspense fallback={<p className="mt-10 text-secondary">Chargement…</p>}>
        <PresetGate preset={preset} />
      </Suspense>
    </div>
  );
}

// Tant que le preset n'est pas ouvert à ce compte, pas de formulaire. Les visiteurs
// non connectés passent par AccountGate, qui les envoie vers la connexion.
async function PresetGate({ preset }: { preset: PresetSpec }) {
  const user = await currentUser();
  if (user?.email && !(await canOrderPreset(preset, user.email))) return <Unavailable />;
  if (!user?.email && preset.status !== "published") return <Unavailable />;

  return (
    <AccountGate next={`/presets/${preset.slug}`} what="ta vidéo">
      {({ email, balance }) => (
        <PresetForm
          slug={preset.slug}
          name={preset.name}
          tokens={preset.economics.tokens}
          maxPhotos={preset.source_requirements.photos.max}
          minPhotoSide={preset.source_requirements.min_short_side_px}
          email={email}
          balance={balance}
        />
      )}
    </AccountGate>
  );
}

function Unavailable() {
  return (
    <p className="liquid-glass mt-10 rounded-[28px] p-6 text-center text-secondary">
      Cette vidéo arrive bientôt.
    </p>
  );
}

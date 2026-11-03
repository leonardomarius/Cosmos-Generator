"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ExampleImage } from "@/config/examples";

// Délais de l'arrivée : reflet sur la photo de départ, puis le curseur glisse
// jusqu'au milieu et découpe l'image vers la génération.
const INTRO_DELAY_MS = 550;
const INTRO_MS = 1000;
// Ensuite, va-et-vient automatique de 12 % à 88 %.
const LOOP_MS = 5000;
const LOOP_AMPLITUDE = 38;

const easeOut = (k: number) => 1 - (1 - k) ** 3;

// Comparaison avant / après qui défile seule (aperçu de la carte image de
// l'accueil, elle-même un lien : rien à manipuler) : la photo de départ
// par-dessus, découpée à la position --pos, la génération dessous.
// Remplit son parent, qui fixe le format.
export function BeforeAfter({ before, after }: { before: ExampleImage; after: ExampleImage }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current!;
    const setPos = (pos: number) => frame.style.setProperty("--pos", `${pos}%`);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos(50);
      return;
    }
    let phase: "waiting" | "intro" | "loop" = "waiting";
    let start = 0;
    let frameId = 0;

    const tick = (now: number) => {
      if (phase === "intro") {
        const k = Math.min(1, Math.max(0, (now - start - INTRO_DELAY_MS) / INTRO_MS));
        setPos(100 - 50 * easeOut(k));
        if (k < 1) {
          frameId = requestAnimationFrame(tick);
          return;
        }
        phase = "loop";
        start = now;
      }
      // Part du milieu vers la photo de départ, sans à-coup.
      setPos(50 - LOOP_AMPLITUDE * Math.sin(((now - start) / LOOP_MS) * 2 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    // Rien ne bouge hors de l'écran (batterie) ; l'arrivée attend que la
    // comparaison soit bien visible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frameId);
        if (!entry.isIntersecting) return;
        if (phase === "waiting") {
          phase = "intro";
          start = performance.now();
          frame.dataset.intro = "";
        }
        frameId = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      // Départ : la photo de départ entière (le curseur glisse ensuite).
      style={{ "--pos": "100%" } as React.CSSProperties}
      className="compare absolute inset-0 select-none"
    >
      <ComparePhoto image={after} label="Généré par Cosmos" labelSide="right" />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--pos)) 0 0)" }}>
        <ComparePhoto image={before} label="Photo de départ" labelSide="left" />
        <span className="compare-shine" aria-hidden="true" />
      </div>

      {/* Ligne de découpe et sa poignée en verre */}
      <div className="pointer-events-none absolute inset-y-0 left-(--pos) w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgb(0_0_0/0.35)]" aria-hidden="true">
        <span className="glass-icon absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 6-4 4 4 4M13 6l4 4-4 4" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ComparePhoto({ image, label, labelSide }: { image: ExampleImage; label: string; labelSide: "left" | "right" }) {
  return (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
        unoptimized
        draggable={false}
        style={image.position ? { objectPosition: image.position } : undefined}
        className="object-cover"
      />
      <span
        className={`absolute bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md ${labelSide === "left" ? "left-3" : "right-3"}`}
      >
        {label}
      </span>
    </>
  );
}

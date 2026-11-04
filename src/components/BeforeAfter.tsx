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
// Après un glissé à la main, l'animation reprend seule, en repassant par le
// milieu.
const RESUME_AFTER_MS = 3000;
const RETURN_MS = 800;
// En dessous, c'est un clic : la carte ouvre le chat.
const DRAG_THRESHOLD_PX = 4;

const easeOut = (k: number) => 1 - (1 - k) ** 3;
const setPos = (frame: HTMLElement, pos: number) => frame.style.setProperty("--pos", `${pos}%`);

// Comparaison avant / après (aperçu de la carte image de l'accueil) : la photo
// de départ par-dessus, découpée à la position --pos, la génération dessous.
// Elle défile seule, et se glisse aussi à la souris ou au doigt. La carte
// étant un lien, un glissé n'ouvre pas le chat ; un simple clic, si.
// Remplit son parent, qui fixe le format.
export function BeforeAfter({ before, after }: { before: ExampleImage; after: ExampleImage }) {
  const frameRef = useRef<HTMLDivElement>(null);
  // Abscisse du début du glissé, null hors glissé.
  const dragStartX = useRef<number | null>(null);
  const dragged = useRef(false);
  // Commandes de l'animation, posées par l'effet ci-dessous.
  const animation = useRef<{ hold: () => void; release: () => void } | null>(null);

  useEffect(() => {
    const frame = frameRef.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos(frame, 50);
      return;
    }
    let phase: "waiting" | "glide" | "loop" | "held" = "waiting";
    let visible = false;
    let start = 0;
    let frameId = 0;
    let resumeTimer = 0;
    // Glissement vers le milieu : l'arrivée, puis chaque reprise.
    let glide = { from: 100, delay: INTRO_DELAY_MS, duration: INTRO_MS };

    const tick = (now: number) => {
      if (phase === "glide") {
        const k = Math.min(1, Math.max(0, (now - start - glide.delay) / glide.duration));
        setPos(frame, glide.from + (50 - glide.from) * easeOut(k));
        if (k < 1) {
          frameId = requestAnimationFrame(tick);
          return;
        }
        phase = "loop";
        start = now;
      }
      // Part du milieu vers la photo de départ, sans à-coup.
      setPos(frame, 50 - LOOP_AMPLITUDE * Math.sin(((now - start) / LOOP_MS) * 2 * Math.PI));
      frameId = requestAnimationFrame(tick);
    };

    animation.current = {
      hold() {
        phase = "held";
        clearTimeout(resumeTimer);
        cancelAnimationFrame(frameId);
      },
      release() {
        clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(() => {
          glide = { from: parseFloat(frame.style.getPropertyValue("--pos")), delay: 0, duration: RETURN_MS };
          phase = "glide";
          start = performance.now();
          if (visible) frameId = requestAnimationFrame(tick);
        }, RESUME_AFTER_MS);
      },
    };

    // Rien ne bouge hors de l'écran (batterie) ; l'arrivée attend que la
    // comparaison soit bien visible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(frameId);
        if (!visible || phase === "held") return;
        if (phase === "waiting") {
          phase = "glide";
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
      clearTimeout(resumeTimer);
      animation.current = null;
    };
  }, []);

  function endDrag() {
    if (dragStartX.current === null) return;
    dragStartX.current = null;
    animation.current?.release();
  }

  return (
    <div
      ref={frameRef}
      // Départ : la photo de départ entière (le curseur glisse ensuite).
      style={{ "--pos": "100%" } as React.CSSProperties}
      // Défilement vertical laissé au navigateur ; le glissé horizontal compare.
      className="compare absolute inset-0 cursor-ew-resize touch-pan-y select-none"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        animation.current?.hold();
        dragStartX.current = e.clientX;
        dragged.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragStartX.current === null) return;
        if (!dragged.current && Math.abs(e.clientX - dragStartX.current) < DRAG_THRESHOLD_PX) return;
        dragged.current = true;
        const rect = e.currentTarget.getBoundingClientRect();
        setPos(e.currentTarget, Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // Le lien de la carte ne suit pas un glissé.
      onClickCapture={(e) => {
        if (!dragged.current) return;
        dragged.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ComparePhoto image={after} />
      <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
        Généré par Cosmos
      </span>
      <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--pos)) 0 0)" }}>
        <ComparePhoto image={before} />
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

function ComparePhoto({ image }: { image: ExampleImage }) {
  return (
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
  );
}

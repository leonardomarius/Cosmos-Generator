"use client";

import { useEffect } from "react";

const MAX_TILT = 14; // degrés

// Incline les icônes .glass-icon selon la position de la souris sur leur
// carte (ou sur l'icône seule). Purement visuel : pose --tilt-x / --tilt-y
// (voir globals.css), uniquement avec une souris et sans réduction des
// animations.
export function GlassTilt() {
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let current: HTMLElement | null = null;

    const reset = () => {
      current?.style.removeProperty("--tilt-x");
      current?.style.removeProperty("--tilt-y");
      current = null;
    };

    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || !(event.target instanceof Element)) return;
      const host = event.target.closest<HTMLElement>(".glass-icon, .liquid-glass");
      const icon = host?.classList.contains("glass-icon") ? host : host?.querySelector<HTMLElement>(".glass-icon");
      if (icon !== current) reset();
      if (!host || !icon) return;

      const rect = host.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      icon.style.setProperty("--tilt-x", `${(-y * 2 * MAX_TILT).toFixed(1)}deg`);
      icon.style.setProperty("--tilt-y", `${(x * 2 * MAX_TILT).toFixed(1)}deg`);
      current = icon;
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      reset();
    };
  }, []);

  return null;
}

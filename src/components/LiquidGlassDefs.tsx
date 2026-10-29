"use client";

import { useEffect, useRef } from "react";

// Carte de déplacement : gris neutre au centre, dégradés rouge (axe x)
// et bleu (axe y) sur les bords → seul le contour courbe l'arrière-plan.
function displacementMap(w: number, h: number, r: number) {
  const edge = Math.min(w, h) * 0.08;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="black"/>
<rect width="${w}" height="${h}" rx="${r}" fill="url(#r)"/>
<rect width="${w}" height="${h}" rx="${r}" fill="url(#b)" style="mix-blend-mode:difference"/>
<rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${Math.max(r - edge, 0)}" fill="hsl(0 0% 50% / 0.93)" style="filter:blur(10px)"/>
</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// Un déplacement par canal (R, V, B) avec un léger décalage :
// donne le liseré irisé de la réfraction.
function filterMarkup(id: string, w: number, h: number, r: number) {
  const scale = -Math.min(110, Math.max(40, Math.min(w, h) * 0.45));
  const channel = (name: string, offset: number, matrix: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale + offset}" xChannelSelector="R" yChannelSelector="B" result="d${name}"/>
<feColorMatrix in="d${name}" type="matrix" values="${matrix}" result="${name}"/>`;
  return `<filter id="${id}" color-interpolation-filters="sRGB">
<feImage x="0" y="0" width="${w}" height="${h}" href="${displacementMap(w, h, r)}" result="map"/>
${channel("red", 0, "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0")}
${channel("green", 8, "0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0")}
${channel("blue", 16, "0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0")}
<feBlend in="red" in2="green" mode="screen" result="rg"/>
<feBlend in="rg" in2="blue" mode="screen" result="rgb"/>
<feGaussianBlur in="rgb" stdDeviation="0.6"/>
</filter>`;
}

// Sélecteur unique d'un élément par sa position dans le DOM : permet de lui
// appliquer son filtre sans toucher à ses attributs (gérés par React).
function selectorFor(el: Element) {
  const parts: string[] = [];
  for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
    const index = Array.prototype.indexOf.call(node.parentElement!.children, node) + 1;
    parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
  }
  return `body > ${parts.join(" > ")}`;
}

// Décor purement visuel : filtres SVG de réfraction, un par surface
// .liquid-glass, à la taille exacte de chacune (voir globals.css).
export function LiquidGlassDefs() {
  const svgRef = useRef<SVGSVGElement>(null);
  const styleRef = useRef<HTMLStyleElement>(null);

  // backdrop-filter: url(#…) n'est rendu que par Chromium ; ailleurs,
  // on garde le repli flou + saturation.
  useEffect(() => {
    if (!("userAgentData" in navigator)) return;
    const svg = svgRef.current!;
    const style = styleRef.current!;

    let frame = 0;
    const build = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const filters: string[] = [];
        const rules: string[] = [];
        document.querySelectorAll<HTMLElement>(".liquid-glass").forEach((el, i) => {
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          if (!w || !h) return;
          const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
          const id = `liquid-glass-${i}`;
          filters.push(filterMarkup(id, w, h, Math.min(radius, w / 2, h / 2)));
          rules.push(
            `${selectorFor(el)}{backdrop-filter:blur(var(--glass-blur)) url(#${id}) saturate(var(--glass-sat)) brightness(0.78)}`,
          );
          resizes.observe(el);
        });
        svg.innerHTML = filters.join("");
        // Réfraction réservée aux écrans assez larges, pour la performance.
        style.textContent = `@media (min-width: 768px){${rules.join("")}}`;
      });
    };

    const resizes = new ResizeObserver(build);
    const mutations = new MutationObserver((records) => {
      if (records.some((r) => !svg.contains(r.target) && !style.contains(r.target) && r.target !== style)) build();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    build();

    return () => {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
    };
  }, []);

  return (
    <>
      <style ref={styleRef} />
      <svg ref={svgRef} width="0" height="0" aria-hidden="true" className="absolute" />
    </>
  );
}

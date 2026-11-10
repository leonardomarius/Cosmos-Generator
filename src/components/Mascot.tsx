"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./Mascot.css";

// Orbi, la mascotte du chat : purement décorative. Elle lit l'état de la
// génération (busy, done) sans jamais le modifier, et écoute la frappe dans le
// formulaire qui la contient. Réglages : durées ci-dessous, taille et position
// dans Mascot.css (--orbi-w, left/bottom/right).

// Présence d'Orbi après le chargement de la page : il danse et joue avec le
// curseur, puis il en a marre et s'en va (pas pendant une frappe ou une
// génération : il attend qu'elles finissent).
const INTRO_MS = 20_000;
// Départ : soupir (1,2 s) puis sortie en sautillant vers la droite (2,2 s),
// comme dans Mascot.css.
const LEAVE_MS = 3_400;
// Distance du curseur à laquelle Orbi s'anime (antennes qui s'allument).
const NEAR_PX = 110;
// Retour au repos après la dernière frappe.
const TYPING_IDLE_MS = 1_500;
// Clignement des yeux : intervalle aléatoire entre ces deux valeurs.
const BLINK_MIN_MS = 3_000;
const BLINK_MAX_MS = 6_000;
// Déplacement maximal des yeux vers le curseur, en pixels du dessin (grille
// de 16 × 21) : 1 = tout l'espace libre autour des yeux.
const EYE_MAX = 1;
// Durées des animations ponctuelles (identiques à celles du CSS).
const ACTION_MS = { jump: 600, done: 1_000, dance: 2_000 } as const;

export function Mascot({ busy, done }: { busy: boolean; done: boolean }) {
  const anchorRef = useRef<HTMLDivElement>(null);

  // Au-dessus d'autres champs (mensurations de la vidéo de star), Orbi les
  // masquerait sur mobile : il s'efface. Relu à chaque rendu du chat.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const above = anchor?.closest("form")?.previousElementSibling;
    if (anchor) anchor.toggleAttribute("data-crowded", !!above?.querySelector("input, select, textarea"));
  });

  return (
    <div ref={anchorRef} className="orbi-anchor">
      <Orbi busy={busy} done={done} />
    </div>
  );
}

function Orbi({ busy, done }: { busy: boolean; done: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const blinkRef = useRef<SVGGElement>(null);
  const typingRef = useRef(false);
  const moveEyes = useRef<() => void>(undefined);
  const actionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [introOver, setIntroOver] = useState(false);
  const [typing, setTyping] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const filterId = `orbi-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const mode = leaving ? "leaving" : busy ? "generating" : typing ? "typing" : introOver ? "idle" : "intro";

  // Animation ponctuelle (saut, fin, danse) : posée sur le DOM, sans rendu React.
  function play(action: keyof typeof ACTION_MS) {
    const root = rootRef.current;
    if (!root || root.dataset.mode === "leaving") return;
    clearTimeout(actionTimer.current);
    delete root.dataset.action;
    // Relance l'animation CSS si la même action est déjà en cours.
    void root.offsetWidth;
    root.dataset.action = action;
    actionTimer.current = setTimeout(() => delete root.dataset.action, ACTION_MS[action]);
  }

  // Fin de l'intro.
  useEffect(() => {
    const timer = setTimeout(() => setIntroOver(true), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  // Il en a marre : départ dès que rien ne le retient (frappe, génération).
  useEffect(() => {
    if (!introOver || busy || typing || leaving) return;
    const timer = setTimeout(() => setLeaving(true), 400);
    return () => clearTimeout(timer);
  }, [introOver, busy, typing, leaving]);

  // Sortie jusqu'au bord de la fenêtre (sans le dépasser : pas de défilement
  // horizontal), puis Orbi est retiré de la page. À droite s'il y a la place
  // (grand écran), sinon vers la gauche, le long du champ (mobile).
  useLayoutEffect(() => {
    if (!leaving) return;
    const root = rootRef.current;
    if (root) {
      const rect = root.getBoundingClientRect();
      const right = window.innerWidth - rect.right - 12;
      const distance = right >= 120 ? right : -Math.max(0, rect.left - 12);
      root.dataset.exit = distance >= 0 ? "right" : "left";
      root.style.setProperty("--orbi-exit", `${Math.round(distance)}px`);
    }
    const timer = setTimeout(() => setGone(true), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  // Saut de joie au lancement, saut et antennes allumées à la fin.
  const wasBusy = useRef(busy);
  const wasDone = useRef(done);
  useEffect(() => {
    if (busy && !wasBusy.current) play("jump");
    else if (done && !wasDone.current) play("done");
    wasBusy.current = busy;
    wasDone.current = done;
  }, [busy, done]);

  useEffect(() => () => clearTimeout(actionTimer.current), []);

  // Frappe dans le champ du chat : Orbi se penche et regarde le texte.
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onInput = (e: Event) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      typingRef.current = true;
      setTyping(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        typingRef.current = false;
        setTyping(false);
        // Les yeux reviennent vers le curseur.
        moveEyes.current?.();
      }, TYPING_IDLE_MS);
    };
    form.addEventListener("input", onInput);
    return () => {
      form.removeEventListener("input", onInput);
      clearTimeout(timer);
    };
  }, []);

  // Clignement aléatoire : un attribut posé 140 ms, sans rendu React.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        blinkRef.current?.setAttribute("data-closed", "");
        timer = setTimeout(() => {
          blinkRef.current?.removeAttribute("data-closed");
          schedule();
        }, 140);
      }, BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Les yeux suivent le curseur (ou le champ pendant la frappe), avec une
  // interpolation douce, une seule mise à jour par image. Gardé en mouvement
  // réduit : quelques pixels, guidés par le curseur.
  useEffect(() => {
    let pointer: { x: number; y: number } | null = null;
    let current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      frame = 0;
      const root = rootRef.current;
      const eyes = eyesRef.current;
      if (!root || !eyes) return;
      const rect = root.getBoundingClientRect();
      const unit = EYE_MAX;
      let target = { x: 0, y: 0 };
      if (root.dataset.mode === "leaving") {
        // Il regarde vers la sortie.
        target = { x: root.dataset.exit === "left" ? -unit : unit, y: 0 };
        root.removeAttribute("data-near");
      } else if (typingRef.current) {
        // Le texte est à sa gauche, plus bas.
        target = { x: -unit, y: unit * 0.7 };
      } else if (pointer) {
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height * 0.45);
        const length = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, length / 160);
        target = { x: (dx / length) * unit * reach, y: (dy / length) * unit * reach };
        root.toggleAttribute("data-near", length < NEAR_PX);
      }
      current = { x: current.x + (target.x - current.x) * 0.2, y: current.y + (target.y - current.y) * 0.2 };
      eyes.style.transform = `translate(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px)`;
      if (Math.abs(target.x - current.x) > 0.005 || Math.abs(target.y - current.y) > 0.005) {
        frame = requestAnimationFrame(tick);
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      request();
    };
    const form = rootRef.current?.closest("form");
    moveEyes.current = request;
    window.addEventListener("pointermove", onMove, { passive: true });
    form?.addEventListener("input", request);
    return () => {
      moveEyes.current = undefined;
      window.removeEventListener("pointermove", onMove);
      form?.removeEventListener("input", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Les yeux se tournent vers la sortie.
  useEffect(() => {
    if (leaving) moveEyes.current?.();
  }, [leaving]);

  if (gone) return null;
  return (
    <div ref={rootRef} className="orbi" data-mode={mode}>
      <div
        className="orbi-stage"
        aria-hidden="true"
        onClick={() => play("dance")}
        // Le curseur arrive sur lui : petit saut de bonjour.
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse" && !rootRef.current?.dataset.action) play("jump");
        }}
      >
        <div className="orbi-lean">
          <div className="orbi-hop">
            <svg viewBox="0 0 16 21" className="orbi-body" shapeRendering="crispEdges" focusable="false">
              <defs>
                <filter id={filterId} x="-1" y="-1" width="3" height="3">
                  <feGaussianBlur stdDeviation="0.9" />
                </filter>
              </defs>
              {/* Halo des pointes d'antennes */}
              <g className="orbi-glow" filter={`url(#${filterId})`} shapeRendering="auto">
                <rect x="3" y="-1" width="5" height="4" rx="2" />
                <rect x="8" y="-1" width="5" height="4" rx="2" />
              </g>
              <g className="orbi-antenna orbi-antenna-left">
                <Px x={5} y={2} h={3} c="brand" />
                <Px x={4} y={0} w={3} h={2} c="tip" className="orbi-tip" />
              </g>
              <g className="orbi-antenna orbi-antenna-right">
                <Px x={10} y={2} h={3} c="brand" />
                <Px x={9} y={0} w={3} h={2} c="tip" className="orbi-tip" />
              </g>
              {PIXELS.map(([x, y, w, h, c], i) => (
                <Px key={i} x={x} y={y} w={w} h={h} c={c} />
              ))}
              {/* Yeux : le groupe extérieur suit le curseur, l'intérieur cligne. */}
              <g ref={eyesRef}>
                <g ref={blinkRef} className="orbi-blink">
                  <Px x={5} y={8} w={2} h={3} c="ink" />
                  <Px x={9} y={8} w={2} h={3} c="ink" />
                  <Px x={6} y={8} c="shine" />
                  <Px x={10} y={8} c="shine" />
                </g>
              </g>
              {TOGA.map(([x, y, w, h, c], i) => (
                <Px key={i} x={x} y={y} w={w} h={h} c={c} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Dessin : grille de 16 × 21, couleurs du site (Mascot.css) ----------

type Color =
  | "sky" | "skyShade" | "skyLight" | "brand" | "gold" | "goldLight" | "tip"
  | "ink" | "shine" | "peach" | "ivory" | "ivoryShade" | "purple";
type Cell = [x: number, y: number, w: number, h: number, c: Color];

function Px({ x, y, w = 1, h = 1, c, className }: { x: number; y: number; w?: number; h?: number; c: Color; className?: string }) {
  return <rect x={x} y={y} width={w} height={h} className={className} style={{ fill: `var(--orbi-${c})` }} />;
}

// Corps, couronne de laurier, visage (hors yeux), jambes et sandales.
const PIXELS: Cell[] = [
  [4, 5, 8, 1, "sky"],
  [3, 6, 10, 12, "sky"],
  [12, 6, 1, 12, "skyShade"],
  [4, 7, 1, 3, "skyLight"],
  // Couronne de laurier d'or
  [3, 6, 10, 1, "gold"],
  [2, 5, 2, 1, "goldLight"], [12, 5, 2, 1, "goldLight"],
  [2, 6, 1, 1, "goldLight"], [13, 6, 1, 1, "goldLight"],
  [4, 6, 1, 1, "goldLight"], [6, 6, 1, 1, "goldLight"],
  [9, 6, 1, 1, "goldLight"], [11, 6, 1, 1, "goldLight"],
  // Joues et bouche
  [4, 12, 1, 1, "peach"], [11, 12, 1, 1, "peach"],
  [7, 12, 2, 1, "ink"],
  // Jambes et sandales à lanières d'or
  [4, 18, 2, 3, "brand"], [10, 18, 2, 3, "brand"],
  [4, 19, 2, 1, "gold"], [10, 19, 2, 1, "gold"],
  [3, 20, 4, 1, "gold"], [9, 20, 4, 1, "gold"],
];

// Toge prétexte : drapé ivoire sur l'épaule, bordure pourpre.
const TOGA: Cell[] = [
  [10, 14, 3, 1, "ivory"], [7, 15, 6, 1, "ivory"],
  [4, 16, 9, 1, "ivory"], [3, 17, 10, 1, "ivory"],
  [12, 14, 1, 4, "ivoryShade"], [9, 16, 1, 1, "ivoryShade"], [6, 17, 1, 1, "ivoryShade"],
  [10, 13, 3, 1, "purple"], [7, 14, 3, 1, "purple"],
  [4, 15, 3, 1, "purple"], [3, 16, 1, 1, "purple"],
];

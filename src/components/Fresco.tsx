"use client";

import Image from "next/image";
import { useState } from "react";

// Fond du site : la fresque sans bras, puis les deux bras détourés posés
// par-dessus. Les bras entrent en rebondissant une seule fois, quand les deux
// images sont chargées. Le layout reste monté pendant la navigation : il faut
// recharger la page pour revoir l'animation.
// Positions en % de l'image d'origine (1672 × 941), voir globals.css.
const ARMS = [
  { side: "left", src: "/fresque/arm-left.webp", width: 704, height: 314 },
  { side: "right", src: "/fresque/arm-right.webp", width: 716, height: 373 },
] as const;

export function Fresco() {
  const [loaded, setLoaded] = useState(0);

  return (
    <div aria-hidden="true" className="fresco">
      <div className="fresco-stage" data-ready={loaded >= ARMS.length || undefined}>
        {ARMS.map((arm) => (
          <Image
            key={arm.side}
            src={arm.src}
            alt=""
            width={arm.width}
            height={arm.height}
            loading="eager"
            unoptimized
            draggable={false}
            onLoad={() => setLoaded((n) => n + 1)}
            className={`fresco-arm fresco-arm--${arm.side}`}
          />
        ))}
      </div>
    </div>
  );
}

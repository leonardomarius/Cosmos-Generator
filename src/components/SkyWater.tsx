"use client";

import { useEffect, useRef } from "react";

// Décor purement visuel : océan et ciel rendus en WebGL (sans librairie),
// réglés pour passer pour une prise de vue réelle.
// - Surface : 64 vagues, de la houle d'une centaine de mètres aux rides de
//   quelques centimètres, chacune à sa vraie vitesse (relation de dispersion).
//   Crêtes pointues, et les grandes vagues entraînent les petites : pas de
//   motif régulier.
// - Une vague plus fine qu'un pixel n'est pas effacée : sa pente devient de la
//   rugosité. Au loin, les reflets s'étirent et le soleil trace un chemin de
//   lumière qui scintille ; au premier plan, il donne des paillettes nettes.
// - Reflets du ciel et des nuages (Fresnel), bleu profond sous la surface,
//   brume à l'horizon, caméra qui dérive et flotte très légèrement, grain.
// Le curseur laisse dans l'eau des ronds qui se propagent comme des vrais.

const TAU = Math.PI * 2;
const HORIZON = 0.2; // horizon à 30 % du bas de l'écran
const FOCAL = 1.6;
const GRAVITY = 2.45; // unité de longueur : hauteur de la caméra (≈ 4 m)
const TENSION = 1.1e-6; // tension superficielle, mêmes unités
const WAVE_COUNT = 64;
const DRAG = 1.5; // entraînement des petites vagues par les grandes
const CHUNK = 8;
const MAX_RIPPLES = 24;
const RIPPLE_LIFE = 4.5; // s
const RIPPLE_REUSE = 3.6; // âge à partir duquel un rond presque éteint peut être remplacé
const RIPPLE_SIZE = 0.16;
const DRIFT = 0.22; // avance de la caméra, unités/s

// Soleil haut, devant à droite (hors cadre) : son scintillement reste sur le
// bord droit, à l'écart du texte.
const SUN = direction(0.52, 0.6);

function direction(azimuth: number, elevation: number) {
  return [
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ];
}

const num = (n: number) => n.toFixed(6);
const vec3 = (v: number[]) => `vec3(${v.map(num).join(", ")})`;
// Couleur donnée telle qu'affichée (sRGB) → valeur linéaire pour l'éclairage.
const srgb = (r: number, g: number, b: number) => vec3([r, g, b].map((c) => Math.pow(c, 2.2)));

type Wave = {
  dx: number;
  dz: number;
  k: number;
  shape: number;
  amp: number;
  omega: number;
  phase: number;
  varX: number;
  varZ: number;
};

// Spectre fixe (graine constante) : même mer à chaque visite.
function buildWaves(): Wave[] {
  let seed = 0x2f6b1d3;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const kMin = 0.25;
  const kMax = 420;
  const wind = 2.35; // vagues qui viennent en diagonale vers la caméra
  return Array.from({ length: WAVE_COUNT }, (_, i) => {
    const f = i / (WAVE_COUNT - 1);
    const k = kMin * Math.pow(kMax / kMin, f) * (0.94 + 0.12 * rand());
    // Houle à crêtes courtes autour du vent, petites rides dans tous les sens.
    const angle = wind + (0.9 + 0.6 * f) * (rand() + rand() - 1) * 1.2;
    // Comme en mer réelle, l'essentiel de la pente vient des petites rides.
    const steep = (0.008 + 0.046 * f) * (0.7 + 0.6 * rand());
    const dx = Math.sin(angle);
    const dz = Math.cos(angle);
    // Profil exp(sin θ − 1) : même pente moyenne qu'une sinusoïde de pente "steep".
    const shape = steep / 0.464;
    return {
      dx,
      dz,
      k,
      shape,
      amp: shape / k,
      omega: Math.sqrt(GRAVITY * k + TENSION * k * k * k),
      phase: rand() * TAU,
      varX: 0.5 * steep * steep * dx * dx,
      varZ: 0.5 * steep * steep * dz * dz,
    };
  });
}

const WAVES = buildWaves();

// Vagues déroulées par paquets de 8 (du plus long au plus court) : un paquet
// entièrement plus fin que le pixel est sauté, sa pente comptée en rugosité.
function waveCode() {
  const lines: string[] = [];
  for (let c = 0; c < WAVES.length; c += CHUNK) {
    const chunk = WAVES.slice(c, c + CHUNK);
    const kMin = Math.min(...chunk.map((w) => w.k));
    const varX = chunk.reduce((s, w) => s + w.varX, 0);
    const varZ = chunk.reduce((s, w) => s + w.varZ, 0);
    lines.push(`if (fx * ${num(kMin)} < 2.3) {`);
    chunk.forEach((w, j) => {
      const i = c + j;
      const phase = `uPhase[${i >> 2}].${"xyzw"[i & 3]}`;
      lines.push(
        `  wave(vec2(${num(w.dx)}, ${num(w.dz)}), ${num(w.k)}, ${num(w.shape)}, ${num(w.amp)}, ${phase}, vec2(${num(w.varX)}, ${num(w.varZ)}), pos, fx, ly, g, h, v);`,
      );
    });
    lines.push(`} else { v += vec2(${num(varX)}, ${num(varZ)}); }`);
  }
  return lines.join("\n");
}

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uCam; // x, y : visée ; z : hauteur de la caméra
uniform vec4 uPhase[${WAVE_COUNT / 4}];
uniform vec4 uRipples[${MAX_RIPPLES}]; // position relative, âge, intensité

const float PI = 3.14159265;
const float HORIZON = ${num(HORIZON)};
const float FOCAL = ${num(FOCAL)};
const float GRAVITY = ${num(GRAVITY)};
const float RIPPLE_SIZE = ${num(RIPPLE_SIZE)};
const float DRAG = ${num(DRAG)};
const vec3 SUN = ${vec3(SUN)};
const vec3 SUN_COL = vec3(1.0, 0.95, 0.88);
const float SUN_POWER = 0.7;

const vec3 ZENITH = ${srgb(0.03, 0.13, 0.34)};
const vec3 MID = ${srgb(0.1, 0.29, 0.57)};
const vec3 HAZE = ${srgb(0.46, 0.61, 0.8)};
const vec3 CLOUD_LIT = ${srgb(0.97, 0.97, 0.98)};
const vec3 CLOUD_SHADE = ${srgb(0.52, 0.6, 0.73)};
const vec3 DEEP = ${srgb(0.01, 0.08, 0.23)};
const vec3 SCATTER = ${srgb(0.02, 0.2, 0.32)};

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Bruit fractal ; les octaves au-delà de "detail" sont remplacées par leur moyenne.
float fbm(vec2 p, float detail) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 7; i++) {
    float w = clamp(detail - float(i), 0.0, 1.0);
    float n = 0.5;
    if (w > 0.0) n = mix(0.5, noise(p), w);
    v += a * n;
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 skyGradient(vec3 d) {
  float e = max(d.y, 0.0);
  vec3 col = ZENITH + (MID - ZENITH) * exp(-e * 3.2) + (HAZE - MID) * exp(-e * 18.0);
  float mu = max(dot(d, SUN), 0.0);
  col += vec3(0.75, 0.85, 1.0) * (0.04 * pow(mu, 6.0) + 0.08 * pow(mu, 48.0));
  return mix(col, HAZE, exp(-e * 25.0) * 0.3);
}

// Cirrus d'altitude : voiles fibreux étirés par le vent, semi-transparents.
// "blur" adoucit leur reflet sur une eau agitée.
vec4 clouds(vec3 d, float blur) {
  if (d.y < 0.01) return vec4(0.0);
  float dist = 1.0 / d.y;
  vec2 uv = d.xz * dist * 0.3 + vec2(uTime * 0.006, uTime * 0.0015);
  vec2 sp = mat2(0.94, -0.34, 0.34, 0.94) * uv;
  float detail = clamp(7.0 - log2(dist) * 1.3 - blur * 12.0, 1.0, 7.0);
  float warp = fbm(sp * vec2(0.6, 1.2) + 4.7, 3.0);
  float mass = fbm(sp * vec2(0.45, 1.3) + vec2(warp * 1.2, 0.0), 4.0);
  float fib = fbm(sp * vec2(1.2, 7.0) + vec2(warp * 3.0, mass * 2.0), detail);
  float n = mass + (fib - 0.5) * 0.55;
  float cover = smoothstep(0.5, 0.78, n);
  if (cover <= 0.0) return vec4(0.0);
  float mu = max(dot(d, SUN), 0.0);
  vec3 c = mix(CLOUD_SHADE, CLOUD_LIT, 0.65 + 0.35 * smoothstep(0.6, 0.85, n)) + SUN_COL * pow(mu, 5.0) * 0.5;
  return vec4(c, cover * 0.75 * exp(-dist * 0.04));
}

vec3 sky(vec3 d, float blur, float mask) {
  vec4 c = clouds(d, blur);
  return mix(skyGradient(d), c.rgb, c.a * mask);
}

// Reflet du ciel par une eau dont les rides fines (non résolues) éparpillent
// la lumière : dégradé moyenné sur la hauteur de la tache de reflet. Ce qui
// part sous l'horizon rencontre une autre vague et prend la teinte du large.
vec3 reflection(vec3 rd, float spread, float blur) {
  vec3 acc = vec3(0.0);
  for (int i = -1; i <= 1; i++) {
    float e = rd.y + float(i) * spread;
    vec3 c = skyGradient(normalize(vec3(rd.x, max(e, 0.0), rd.z)));
    acc += mix(c, HAZE * 0.6, smoothstep(0.0, -0.08, e)) * (i == 0 ? 0.5 : 0.25);
  }
  vec4 cl = clouds(normalize(vec3(rd.x, max(rd.y, 0.0), rd.z)), blur);
  return mix(acc, cl.rgb, cl.a);
}

// Une vague à crête pointue (profil exp(sin)) : pente (g) et hauteur (h).
// Elle déplace le point vu par les vagues plus courtes (pos), qui se
// resserrent sur ses crêtes comme sur une vraie houle. Plus fine que le pixel,
// sa pente perdue devient de la rugosité (v).
void wave(vec2 w, float k, float shape, float amp, float phase, vec2 vr,
          inout vec2 pos, float fx, vec2 ly,
          inout vec2 g, inout float h, inout vec2 v) {
  float rate = k * length(vec2(w.x * fx, dot(w, ly)));
  float f = smoothstep(1.1, 0.3, rate);
  float th = k * dot(w, pos) + phase;
  float e = exp(sin(th) - 1.0);
  float d = e * cos(th) * f;
  g += w * (shape * d);
  h += amp * (e - 0.466) * f;
  pos -= w * (amp * DRAG * d);
  v += vr * (1.0 - f * f);
}

vec3 tonemap(vec3 c) {
  vec3 x = max(c - 0.55, 0.0);
  return min(c, 0.55) + 0.45 * (1.0 - exp(-x / 0.45));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 r = vec3(p.x + uCam.x, p.y + HORIZON + uCam.y, FOCAL);
  vec3 d = normalize(r);
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 col;

  if (r.y >= 0.0) {
    // Moins de nuages derrière le texte (gauche sur grand écran, partout sur mobile).
    float mask = uRes.x < uRes.y ? 0.6 : mix(0.45, 1.0, smoothstep(0.35, 0.8, uv.x));
    col = sky(d, 0.0, mask);
  } else {
    float s = uCam.z / -r.y;
    vec2 local = r.xz * s;   // point d'eau visé, relatif à la caméra
    float fx = s / uRes.y;   // taille d'un pixel sur l'eau (horizontalement)
    vec2 ly = local * (fx / uCam.z);
    vec2 pos = local;
    vec2 g = vec2(0.0);
    float h = 0.0;
    vec2 v = vec2(0.0);

${waveCode()}

    // Ronds laissés par le curseur : paquet d'ondes dispersif (Cauchy-Poisson),
    // les longueurs d'onde longues partent devant, les courtes suivent.
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 rp = uRipples[i];
      if (rp.w <= 0.0) continue;
      vec2 dv = local - rp.xy;
      float rad = length(dv) + 0.003;
      vec2 dir = dv / rad;
      float ph = GRAVITY * rp.z * rp.z / (4.0 * rad);
      float kl = ph / rad;
      float ka = kl * RIPPLE_SIZE;
      float rate = kl * length(vec2(dir.x * fx, dot(dir, ly)));
      float amp = rp.w * ka * ka * exp(1.0 - ka * ka) * smoothstep(1.8, 0.6, rate) / (1.0 + rad * 0.8);
      g += dir * (2.0 * amp * smoothstep(0.0, 0.5, rp.z) * sin(ph));
    }

    vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
    vec2 sig2 = v + 0.0006;
    float rough = sqrt(sig2.x + sig2.y);
    vec3 V = -d;

    vec2 along = normalize(d.xz);
    float spread = 2.4 * sqrt(along.x * along.x * v.x + along.y * along.y * v.y);
    vec3 refl = reflection(reflect(d, n), spread, rough);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, V), 0.0), 5.0);

    // Lumière qui remonte de l'eau : bleu profond, crêtes éclairées par transparence.
    float back = pow(max(dot(normalize(d.xz), normalize(SUN.xz)), 0.0), 2.0);
    vec3 body = DEEP + SCATTER * clamp(h * 2.5 + 0.2, 0.0, 1.2) * (0.35 + 0.65 * back);
    vec3 water = mix(body, refl, fres);

    // Soleil : distribution des pentes (Cox-Munk) → paillettes au premier plan,
    // chemin de lumière diffus au loin.
    vec3 hv = normalize(SUN + V);
    vec2 dl = n.xz / n.y - hv.xz / hv.y;
    float P = exp(-0.5 * (dl.x * dl.x / sig2.x + dl.y * dl.y / sig2.y)) / (2.0 * PI * sqrt(sig2.x * sig2.y));
    float fs = 0.02 + 0.98 * pow(1.0 - max(dot(hv, V), 0.0), 5.0);
    float hy = hv.y * hv.y;
    // Masquage (Smith) : pas d'éblouissement au ras de l'horizon.
    float tan2 = (1.0 - V.y * V.y) / max(V.y * V.y, 1e-4);
    float masking = 2.0 / (1.0 + sqrt(1.0 + 2.0 * sig2.y * tan2));
    float spec = SUN_POWER * fs * P * masking / (4.0 * hy * hy * max(V.y, 0.02));
    // Paillettes plus petites que le pixel : elles scintillent comme sur un
    // capteur vidéo, sans changer la luminosité moyenne.
    float unresolved = (v.x + v.y) / (sig2.x + sig2.y);
    float sparkle = pow(hash(floor(gl_FragCoord.xy) + floor(uTime * 24.0) * vec2(7.13, 3.71)), 10.0) * 11.0;
    water += SUN_COL * spec * mix(1.0, sparkle, unresolved * 0.85);

    float dist = s * length(r);
    col = mix(water, HAZE * 0.88, 1.0 - exp(-dist * 0.012));
  }

  col = pow(tonemap(col), vec3(1.0 / 2.2));
  // Vignettage léger et grain de capteur.
  vec2 c = (uv - 0.5) * vec2(1.0, 0.8);
  col *= 1.0 - 0.22 * smoothstep(0.25, 0.75, length(c));
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("SkyWater:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Caméra tenue à la main sur un bateau qui avance lentement.
function camera(t: number) {
  return {
    x: 0.35 * Math.sin(t * 0.031),
    z: t * DRIFT,
    height: 1 + 0.012 * Math.sin(t * 0.53) + 0.006 * Math.sin(t * 1.21 + 1.3),
    viewX: 0.0022 * Math.sin(t * 0.23 + 0.4) + 0.0009 * Math.sin(t * 0.71 + 2),
    viewY: 0.0028 * Math.sin(t * 0.47 + 2.1) + 0.0012 * Math.sin(t * 1.07 + 0.7),
  };
}

type Ripple = { x: number; z: number; born: number; strength: number };

export function SkyWater() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return; // repli : dégradé CSS de .scene
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!precision || precision.precision === 0) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uCam = gl.getUniformLocation(program, "uCam");
    const uPhase = gl.getUniformLocation(program, "uPhase");
    const uRipples = gl.getUniformLocation(program, "uRipples");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phases = new Float32Array(WAVE_COUNT);
    const rippleData = new Float32Array(MAX_RIPPLES * 4);
    const ripples: Ripple[] = [];
    const start = performance.now();
    const now = () => (still ? 20 : (performance.now() - start) / 1000);
    let cam = camera(now());
    let frame = 0;
    let quality = 1;
    let lastFrame = 0;
    let frameCount = 0;
    let frameTotal = 0;
    let lastSpawn: { x: number; y: number; at: number } | null = null;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Plafond de pixels calculés, puis baisse auto si la machine peine.
      const budget = w < 768 ? 0.9e6 : 2.3e6;
      const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(budget / (w * h))) * quality;
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = () => {
      const t = now();
      cam = camera(t);
      // Phases calculées ici en double précision : pas de dérive au fil des heures.
      for (let i = 0; i < WAVE_COUNT; i++) {
        const w = WAVES[i];
        const ph = w.phase - w.omega * t + w.k * (w.dx * cam.x + w.dz * cam.z);
        phases[i] = ph - TAU * Math.floor(ph / TAU);
      }
      rippleData.fill(0);
      let n = 0;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = t - r.born;
        if (age > RIPPLE_LIFE) {
          ripples.splice(i, 1);
          continue;
        }
        const end = Math.min(1, Math.max(0, (RIPPLE_LIFE - age) / (RIPPLE_LIFE - 2)));
        const fade = Math.exp(-age * 0.35) * end * end * (3 - 2 * end);
        rippleData.set([r.x - cam.x, r.z - cam.z, age, r.strength * fade], n++ * 4);
      }
      gl.uniform1f(uTime, t % 10000);
      gl.uniform4f(uCam, cam.viewX, cam.viewY, cam.height, 0);
      gl.uniform4fv(uPhase, phases);
      gl.uniform4fv(uRipples, rippleData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (time: number) => {
      const dt = time - lastFrame;
      lastFrame = time;
      // Sous ~40 images/s (mesuré sur 1 s), on calcule moins de pixels.
      if (quality > 0.4 && time - start > 1500 && dt > 0 && dt < 1000) {
        frameTotal += dt;
        frameCount++;
        if (frameTotal >= 1000) {
          if (frameTotal / frameCount > 24) {
            quality = Math.max(0.4, quality * 0.75);
            resize();
          }
          frameCount = 0;
          frameTotal = 0;
        }
      }
      draw();
      frame = requestAnimationFrame(loop);
    };

    // Même projection que le shader : pixel écran → point sur l'eau (monde).
    const toWater = (clientX: number, clientY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rx = (clientX - w / 2) / h + cam.viewX;
      const ry = (h / 2 - clientY) / h + HORIZON + cam.viewY;
      if (ry > -0.004) return null;
      const s = cam.height / -ry;
      return { x: rx * s + cam.x, z: FOCAL * s + cam.z };
    };

    // Le curseur (ou le doigt) laisse un sillage de ronds en survolant l'eau.
    const onMove = (e: PointerEvent) => {
      const at = performance.now();
      if (lastSpawn && at - lastSpawn.at < 150) return;
      const moved = lastSpawn ? Math.hypot(e.clientX - lastSpawn.x, e.clientY - lastSpawn.y) : 40;
      if (moved < 6) return;
      const spot = toWater(e.clientX, e.clientY);
      if (!spot) {
        lastSpawn = null;
        return;
      }
      const t = now();
      if (ripples.length >= MAX_RIPPLES) {
        const oldest = ripples.reduce((a, b) => (a.born < b.born ? a : b));
        if (t - oldest.born < RIPPLE_REUSE) return;
        ripples.splice(ripples.indexOf(oldest), 1);
      }
      const speed = lastSpawn ? moved / Math.max(at - lastSpawn.at, 16) : 0.3;
      ripples.push({ ...spot, born: t, strength: Math.min(1, 0.35 + speed * 0.4) });
      lastSpawn = { x: e.clientX, y: e.clientY, at };
    };

    const onResize = () => {
      resize();
      if (still) draw();
    };

    resize();
    if (still) {
      draw();
    } else {
      frame = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

// Décor purement visuel : scène 3D (WebGL, sans librairie) — ciel nuageux
// et océan qui le reflète, avec des ondes qui suivent le curseur.
// Ciel et eau sont calculés dans le même shader : l'horizon se fond dans
// la brume, sans démarcation.

const HORIZON_OFFSET = 0.2; // horizon à 30 % du bas de l'écran
const FOCAL = 1.6;
const MAX_RIPPLES = 16;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uRipples[${MAX_RIPPLES}];

const float HORIZON_OFFSET = ${HORIZON_OFFSET.toFixed(3)};
const float FOCAL = ${FOCAL.toFixed(3)};
const vec3 ZENITH = vec3(0.035, 0.15, 0.37);
const vec3 MID = vec3(0.11, 0.30, 0.58);
const vec3 HAZE = vec3(0.42, 0.57, 0.77);
const vec3 DEEP = vec3(0.015, 0.07, 0.17);
const vec3 SUN = vec3(0.31, 0.33, 0.89);

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// Ciel : dégradé + nuages projetés sur un plan en altitude (perspective réelle).
vec3 sky(vec3 d, float cloudMask) {
  float e = max(d.y, 0.0);
  vec3 col = mix(HAZE, MID, smoothstep(0.0, 0.09, e));
  col = mix(col, ZENITH, smoothstep(0.08, 0.5, e));
  if (d.y > 0.002) {
    float t = 1.6 / d.y;
    vec2 uv = d.xz * t * 0.32 + vec2(uTime * 0.010, uTime * 0.003);
    float n = fbm(uv);
    float cover = smoothstep(0.52, 0.8, n);
    float shade = smoothstep(0.5, 0.9, n + 0.15 * (n - fbm(uv + SUN.xz * 0.06)));
    vec3 cloud = mix(vec3(0.66, 0.75, 0.88), vec3(0.98, 0.99, 1.0), shade);
    col = mix(col, cloud, cover * exp(-t * 0.03) * 0.92 * cloudMask);
  }
  return mix(col, HAZE * 1.05, exp(-e * 45.0) * 0.4);
}

// Pente de la surface : houle directionnelle + ondes du curseur.
vec2 slope(vec2 p, float footprint) {
  vec2 g = vec2(0.0);
  vec4 waves[5];
  waves[0] = vec4(0.8, 0.6, 1.3, 0.05);
  waves[1] = vec4(-0.6, 0.8, 2.1, 0.03);
  waves[2] = vec4(0.2, -0.98, 3.7, 0.015);
  waves[3] = vec4(0.96, -0.29, 6.3, 0.008);
  waves[4] = vec4(-0.91, -0.41, 11.0, 0.004);
  for (int i = 0; i < 5; i++) {
    vec4 w = waves[i];
    // On efface les vagues plus fines qu'un pixel : pas de scintillement à l'horizon.
    float fade = 1.0 - smoothstep(0.25, 0.9, w.z * footprint);
    float phase = dot(w.xy, p) * w.z + uTime * sqrt(w.z) * 1.1;
    g += w.xy * (w.w * w.z * cos(phase) * fade);
  }
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 5.0) continue;
    vec2 dv = p - r.xy;
    float dist = length(dv) + 1e-4;
    float x = dist - age * 0.75;
    float env = exp(-x * x * 7.0) * exp(-age * 0.9) * r.w / (1.0 + dist * 1.5);
    float k = 24.0;
    g += (dv / dist) * (cos(x * k) * k * env * 0.01 * (1.0 - smoothstep(0.3, 1.0, k * footprint)));
  }
  return g;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 d = normalize(vec3(p.x, p.y + HORIZON_OFFSET, FOCAL));
  vec3 hz = HAZE * 1.02;
  vec3 col;

  if (d.y >= 0.0) {
    // Moins de nuages derrière le texte (gauche sur grand écran, partout sur mobile).
    vec2 uv = gl_FragCoord.xy / uRes;
    float mask = uRes.x < uRes.y ? 0.6 : mix(0.45, 1.0, smoothstep(0.35, 0.8, uv.x));
    col = sky(d, mask);
  } else {
    float t = 1.0 / -d.y;
    vec2 pos = vec2(0.0, 0.0) + d.xz * t;
    float footprint = t * t / (FOCAL * uRes.y);
    vec2 g = slope(pos, footprint);
    vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 rd = reflect(d, n);
    rd.y = abs(rd.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -d), 0.0), 5.0);
    vec3 refl = sky(rd, 1.0);
    vec3 water = mix(DEEP + vec3(0.02, 0.09, 0.13) * (0.5 + 0.5 * n.x), refl, clamp(fres * 1.25 + 0.12, 0.0, 1.0));
    water += vec3(1.0, 0.98, 0.94) * pow(max(dot(rd, SUN), 0.0), 220.0) * 1.2;
    col = mix(water, hz, 1.0 - exp(-t * 0.028));
  }

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0; // anti-banding
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function SkyWater() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return; // repli : dégradé CSS de .scene

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
    const uRipples = gl.getUniformLocation(program, "uRipples");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ripples = new Float32Array(MAX_RIPPLES * 4);
    const start = performance.now();
    let next = 0;
    let frame = 0;
    let lastDrop = 0;
    let last: { x: number; z: number; at: number } | null = null;

    const now = () => (still ? 20 : (performance.now() - start) / 1000);

    const addRipple = (x: number, z: number, strength: number) => {
      ripples.set([x, z, now(), strength], next * 4);
      next = (next + 1) % MAX_RIPPLES;
    };

    // Même projection que le shader : pixel écran → point sur le plan d'eau.
    const toWater = (clientX: number, clientY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const px = (clientX - w / 2) / h;
      const py = (h / 2 - clientY) / h + HORIZON_OFFSET;
      if (py > -0.004) return null;
      const t = FOCAL / -py;
      return { x: (px / FOCAL) * t, z: t };
    };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25) * (window.innerWidth < 768 ? 0.6 : 0.8);
      canvas.width = Math.round(window.innerWidth * scale);
      canvas.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = () => {
      gl.uniform1f(uTime, now());
      gl.uniform4fv(uRipples, ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (time: number) => {
      if (time - lastDrop > 1600) {
        lastDrop = time;
        const spot = toWater(Math.random() * window.innerWidth, window.innerHeight * (0.78 + Math.random() * 0.2));
        if (spot) addRipple(spot.x, spot.z, 0.35);
      }
      draw();
      frame = requestAnimationFrame(loop);
    };

    // Le curseur (ou le doigt) laisse un sillage d'ondes en survolant l'eau.
    const onMove = (e: PointerEvent) => {
      const spot = toWater(e.clientX, e.clientY);
      if (!spot) {
        last = null;
        return;
      }
      const at = performance.now();
      const moved = last ? Math.hypot(spot.x - last.x, spot.z - last.z) : 1;
      if (last && moved < 0.12 && at - last.at < 120) return;
      addRipple(spot.x, spot.z, Math.min(1, 0.45 + moved * 1.5));
      last = { ...spot, at };
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

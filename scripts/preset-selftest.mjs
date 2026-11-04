// Tests sans aucune dépense de la chaîne des presets : un faux fournisseur
// remplace fal, et l'assemblage tourne pour de vrai sur la vidéo de référence.
//   node scripts/preset-selftest.mjs
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": path.resolve("src") } });
const spec = await jiti.import("../src/lib/presets/spec.ts");
const { advance, newJob } = await jiti.import("../src/lib/presets/machine.ts");
const { ProviderRefusedError } = await jiti.import("../src/lib/presets/provider.ts");
const { applyRules, judge, missingFields, parseVisionJson } = await jiti.import("../src/lib/presets/vision.ts");
const { assembleVideo, assembleGraph } = await jiti.import("../src/lib/presets/assemble.ts");

const run = promisify(execFile);
const preset = JSON.parse(await readFile("presets/arrivee-star/preset.json", "utf8"));
const asEnforced = { ...preset, qa: { ...preset.qa, mode: "enforce" } };

// Les erreurs journalisées font partie de ce qui est testé ici.
console.error = () => {};

let passed = 0;
async function test(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

// --- Faux fournisseur --------------------------------------------------------

function fakeWorld({ keyframeVerdicts = [], videoVerdict = [], statuses = {}, submitError = null, outputUrl = "https://exemple.test/sortie.mp4" } = {}) {
  const world = { submits: [], settled: [], notified: 0, saved: 0, assembled: 0, judged: [] };
  const queue = [...keyframeVerdicts];
  const provider = {
    submit: async (endpoint, input) => {
      if (submitError) throw submitError;
      world.submits.push({ endpoint, input });
      return `req-${world.submits.length}`;
    },
    status: async (_endpoint, requestId) => statuses[requestId] ?? { state: "done" },
    result: async () => ({ url: outputUrl, data: {} }),
    cancel: async () => {},
    run: async () => ({}),
  };
  world.deps = {
    provider: () => provider,
    save: async () => {
      world.saved++;
    },
    values: async () => ({
      source_url: "https://exemple.test/source.mp4",
      photo_1: "https://exemple.test/p1.jpg",
      photo_2: null,
      hero_face: "https://exemple.test/hero.jpg",
      hero_face_frame: 169,
      duration: 10,
    }),
    webhookUrl: () => null,
    judge: async (check) => {
      world.judged.push(check);
      const refusals = check === "keyframe" ? (queue.shift() ?? []) : videoVerdict;
      return { fields: {}, refusals, costUsd: null };
    },
    assemble: async () => {
      world.assembled++;
      return { url: "https://exemple.test/final.mp4", sheetUrl: "https://exemple.test/planche.jpg" };
    },
    settle: async (job) => {
      world.settled.push(job.status);
    },
    notify: async () => {
      world.notified++;
    },
  };
  return world;
}

console.log("Machine :");

await test("sans image-clé : une seule génération, puis assemblage", async () => {
  const world = fakeWorld();
  const job = newJob("a", preset, "kling4-raw");
  await advance(job, preset, world.deps);
  assert.equal(world.submits.length, 1);
  assert.equal(job.status, "running");
  await advance(job, preset, world.deps);
  assert.equal(job.status, "done");
  assert.equal(job.resultUrl, "https://exemple.test/final.mp4");
  assert.deepEqual(world.settled, ["done"]);
});

await test("appels répétés (webhook rejoué, suivi du navigateur) : jamais de seconde génération", async () => {
  const world = fakeWorld({ statuses: { "req-1": { state: "running" } } });
  const job = newJob("a", preset, "kling4-raw");
  for (let i = 0; i < 5; i++) await advance(job, preset, world.deps);
  assert.equal(world.submits.length, 1);
  assert.equal(job.status, "running");
});

await test("avec image-clé : deux étapes payantes, et l'image-clé part dans la requête vidéo", async () => {
  const world = fakeWorld({ outputUrl: "https://exemple.test/cle.jpg" });
  const job = newJob("a", preset, "kling4-raw-kf");
  assert.equal(job.stage, "keyframe");
  await advance(job, preset, world.deps);
  await advance(job, preset, world.deps);
  assert.equal(world.submits.length, 2);
  assert.equal(world.submits[0].endpoint, "fal-ai/nano-banana-2.1/edit");
  assert.ok(JSON.stringify(world.submits[1].input).includes("https://exemple.test/cle.jpg"));
  await advance(job, preset, world.deps);
  assert.equal(job.status, "done");
});

await test("envoi sans identifiant (coupure pendant l'appel) : échec et remboursement, jamais de relance", async () => {
  const world = fakeWorld();
  const job = newJob("a", preset, "kling4-raw");
  job.steps.video = { endpoint: "x", submittedAt: "t", requestId: null, attempts: 1, outputUrl: null, verdict: null };
  await advance(job, preset, world.deps);
  assert.equal(world.submits.length, 0);
  assert.equal(job.status, "failed");
  assert.deepEqual(world.settled, ["failed"]);
});

await test("fournisseur injoignable : la tâche reste ouverte, sans nouvel appel", async () => {
  const world = fakeWorld();
  const job = newJob("a", preset, "kling4-raw");
  await advance(job, preset, world.deps);
  const provider = world.deps.provider();
  provider.status = async () => {
    throw new Error("fal indisponible");
  };
  await assert.rejects(advance(job, preset, world.deps));
  assert.equal(job.status, "running");
  assert.equal(world.submits.length, 1);
  assert.deepEqual(world.settled, []);
});

await test("assemblage en panne : repris ensuite sans repayer la vidéo", async () => {
  const world = fakeWorld();
  const job = newJob("a", preset, "kling4-raw");
  await advance(job, preset, world.deps);
  const working = world.deps.assemble;
  world.deps.assemble = async () => {
    throw new Error("stockage indisponible");
  };
  await assert.rejects(advance(job, preset, world.deps));
  assert.equal(job.stage, "finish");
  world.deps.assemble = working;
  await advance(job, preset, world.deps);
  assert.equal(job.status, "done");
  assert.equal(world.submits.length, 1);
});

await test("remboursement en panne : la tâche reste ouverte pour réessayer", async () => {
  const world = fakeWorld({ statuses: { "req-1": { state: "failed", error: "modèle en panne", refused: false } } });
  const job = newJob("a", preset, "kling4-raw");
  await advance(job, preset, world.deps);
  const working = world.deps.settle;
  world.deps.settle = async () => {
    throw new Error("base indisponible");
  };
  const copy = structuredClone(job);
  await assert.rejects(advance(copy, preset, world.deps));
  world.deps.settle = working;
  await advance(job, preset, world.deps);
  assert.equal(job.status, "failed");
  assert.deepEqual(world.settled, ["failed"]);
});

await test("refus du filtre du modèle : à l'envoi comme pendant la génération", async () => {
  const atSubmit = fakeWorld({ submitError: new ProviderRefusedError("content_policy_violation") });
  const job = newJob("a", preset, "kling4-raw");
  await advance(job, preset, atSubmit.deps);
  assert.equal(job.errorKind, "refused");
  assert.deepEqual(atSubmit.settled, ["failed"]);

  const during = fakeWorld({ statuses: { "req-1": { state: "failed", error: "content_policy_violation", refused: true } } });
  const other = newJob("b", preset, "kling4-raw");
  await advance(other, preset, during.deps);
  await advance(other, preset, during.deps);
  assert.equal(other.errorKind, "refused");
});

await test("image-clé refusée en mode enforce : une seule reprise, puis échec propre", async () => {
  const world = fakeWorld({ keyframeVerdicts: [["autre personne"], ["autre personne"]] });
  const job = newJob("a", asEnforced, "kling4-raw-kf");
  for (let i = 0; i < 4; i++) await advance(job, asEnforced, world.deps);
  assert.equal(world.submits.length, 2);
  assert.equal(job.status, "failed");
  assert.ok(world.submits.every((call) => call.endpoint === "fal-ai/nano-banana-2.1/edit"));
});

await test("image-clé refusée en mode shadow : noté, sans rien bloquer", async () => {
  const world = fakeWorld({ keyframeVerdicts: [["autre personne"]] });
  const job = newJob("a", preset, "kling4-raw-kf");
  for (let i = 0; i < 3; i++) await advance(job, preset, world.deps);
  assert.equal(job.status, "done");
  assert.deepEqual(job.steps.keyframe.verdict.refusals, ["autre personne"]);
});

await test("vidéo refusée en mode enforce : remboursement, jamais de nouvelle génération", async () => {
  const world = fakeWorld({ videoVerdict: ["vidéo : visage déformé"] });
  const job = newJob("a", asEnforced, "kling4-raw");
  for (let i = 0; i < 3; i++) await advance(job, asEnforced, world.deps);
  assert.equal(job.status, "failed");
  assert.equal(world.submits.length, 1);
  assert.deepEqual(world.settled, ["failed"]);
});

await test("vision indisponible : la vidéo déjà payée est livrée", async () => {
  const world = fakeWorld();
  world.deps.judge = async () => {
    throw new Error("vision en panne");
  };
  const job = newJob("a", asEnforced, "kling4-raw");
  for (let i = 0; i < 2; i++) await advance(job, asEnforced, world.deps);
  assert.equal(job.status, "done");
});

console.log("Format du preset :");

await test("le preset de la vidéo est sans erreur", async () => {
  const problems = spec.presetProblems(preset, {
    exists: () => true,
    benchmark: null,
    maskApproved: false,
    uploaded: () => false,
  });
  assert.deepEqual(problems, []);
});

await test("gabarits : photo 2 absente, repli sur la photo 1, image-clé absente retirée", async () => {
  const input = spec.renderInput(preset.models.kling4.input, {
    prompt: "p",
    source_url: "s",
    photo_1: "un",
    photo_2: null,
    keyframe: null,
  });
  assert.deepEqual(input.elements, [{ frontal_image_url: "un", reference_image_urls: ["un"] }]);
  assert.equal(input.resolution, "720p");
});

await test("gabarits : un texte contenant des accolades n'est pas interprété", async () => {
  const input = spec.renderInput({ prompt: "{prompt}", other: "garde {photo_1} tel quel" }, { prompt: "{source_url}", photo_1: "x" });
  assert.equal(input.prompt, "{source_url}");
  assert.equal(input.other, "garde {photo_1} tel quel");
});

await test("prompts : le bon nom de la personne pour chaque modèle", async () => {
  assert.ok(spec.promptFor(preset, "replace_depth", preset.models.seedance25).includes("@Image1"));
  assert.ok(!spec.promptFor(preset, "replace_depth", preset.models.seedance25).includes("@Element1"));
  assert.ok(spec.promptFor(preset, "replace_raw", preset.models.kling4).includes("@Element1"));
});

await test("coûts : les tarifs relevés le 4 novembre 2026", async () => {
  const approx = (a, b) => assert.ok(Math.abs(a - b) < 0.001, `${a} au lieu de ${b}`);
  approx(spec.modelCostUsd(preset.models.kling4, 10), 1.88);
  approx(spec.modelCostUsd(preset.models.kling4, 5), 0.94);
  approx(spec.modelCostUsd(preset.models.kling_o3, 10), 1.4);
  approx(spec.modelCostUsd(preset.models.recast, 10), 3);
  approx(spec.modelCostUsd(preset.models.pixverse_swap, 10), 0.4);
  approx(spec.modelCostUsd(preset.models.pixverse_swap, 5), 0.2);
});

await test("publication interdite sans benchmark ni critères atteints", async () => {
  const published = { ...preset, status: "published" };
  const ok = { version: preset.version, variant: preset.selected_variant, raters: 5, pairs: 10, win_or_tie_rate: 0.8, failure_rate: 0.1, margin_rate: 0.61, date: "2026-11-04" };
  const deps = { exists: () => true, maskApproved: false, uploaded: () => true };
  assert.ok(spec.presetProblems(published, { ...deps, benchmark: null }).some((p) => p.includes("publication interdite")));
  assert.deepEqual(spec.presetProblems(published, { ...deps, benchmark: ok }), []);
  assert.ok(spec.presetProblems(published, { ...deps, benchmark: { ...ok, failure_rate: 0.3 } }).some((p) => p.includes("échecs")));
  assert.ok(spec.presetProblems(published, { ...deps, benchmark: { ...ok, version: "0.0.1" } }).some((p) => p.includes("version")));
  assert.ok(spec.presetProblems(published, { ...deps, benchmark: { ...ok, raters: 3 } }).some((p) => p.includes("votants")));
});

console.log("Vérifications par vision :");

await test("réponse du modèle : JSON entouré de texte", async () => {
  assert.deepEqual(parseVisionJson('Voici :\n```json\n{"a": 1}\n```'), { a: 1 });
  assert.throws(() => parseVisionJson("aucun JSON"));
});

await test("règles de refus de la photo", async () => {
  const check = preset.qa.photo_gate;
  const good = { people_count: 1, face_visible: true, face_sharp: true, face_covered: false, full_body: true, apparent_adult: true, sexual_content: false, is_photo: true, famous_person: false };
  assert.deepEqual(applyRules(check, good), []);
  assert.equal(applyRules(check, { ...good, apparent_adult: false }).length, 1);
  assert.equal(applyRules(check, { ...good, people_count: 2 }).length, 1);
  assert.equal(applyRules(check, { ...good, famous_person: true }).length, 1);
  assert.equal(applyRules(check, { ...good, sexual_content: true, is_photo: false })[0], "Cette photo ne peut pas être utilisée.");
  // Le modèle répond parfois "true" ou "1" au lieu du bon type.
  assert.deepEqual(applyRules(check, { ...good, people_count: "1", apparent_adult: "true" }), []);
  assert.equal(applyRules(check, { ...good, apparent_adult: "false" }).length, 1);
});

await test("réponse incomplète : jamais de photo acceptée sans vérification", async () => {
  const check = preset.qa.photo_gate;
  assert.ok(missingFields(check, { people_count: 1 }).includes("apparent_adult"));
  const provider = { run: async () => ({ output: '{"people_count": 1}', usage: null }) };
  await assert.rejects(judge(provider, preset, check, ["https://exemple.test/p.jpg"]), /incomplète/);
  const complete = { people_count: 1, face_visible: true, face_sharp: true, face_covered: false, apparent_adult: true, sexual_content: false, is_photo: true, famous_person: false };
  const fine = { run: async () => ({ output: JSON.stringify(complete), usage: { cost: 0.001 } }) };
  assert.deepEqual((await judge(fine, preset, check, ["https://exemple.test/p.jpg"])).refusals, []);
});

console.log("Assemblage (ffmpeg, vrais fichiers) :");

const dir = await mkdtemp(path.join(tmpdir(), "preset-selftest-"));
// Empreinte de chaque paquet audio, sans réencodage.
const audioPackets = async (file) => {
  const { stdout } = await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-i", file, "-map", "0:a", "-c:a", "copy", "-f", "framemd5", "-"], { maxBuffer: 10 * 1024 * 1024 });
  return stdout.split("\n").filter((line) => line && !line.startsWith("#")).map((line) => line.trim().split(/\s+/).at(-1));
};
// Le début exact de la piste d'origine, sur toute la durée de la vidéo.
const assertOriginalAudio = async (file) => {
  const final = await audioPackets(file);
  const original = await audioPackets("presets/arrivee-star/assets/audio.m4a");
  assert.ok(final.length >= 430, `${final.length} paquets audio seulement`);
  assert.deepEqual(final, original.slice(0, final.length));
  return final;
};
const probe = async (file) => {
  const { stderr } = await run(ffmpegPath, ["-hide_banner", "-i", file, "-map", "0", "-c", "copy", "-f", "null", "-"], { maxBuffer: 10 * 1024 * 1024 });
  return stderr;
};

try {
  // Fausse sortie de modèle : la vidéo de référence en plus petit, en 768p pour
  // le format de Recast, avec un autre son généré.
  const fake = path.join(dir, "fake.mp4");
  await run(ffmpegPath, [
    "-y", "-hide_banner", "-loglevel", "error", "-threads", "4",
    "-i", "presets/arrivee-star/assets/source.mp4",
    "-f", "lavfi", "-t", "10", "-i", "sine=frequency=880:sample_rate=44100",
    "-vf", "scale=768:1364", "-shortest", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-c:a", "aac",
    "-metadata", 'AIGC={"Label":"1","ContentProducer":"test"}', "-movflags", "+use_metadata_tags", fake,
  ]);
  const generated = await readFile(fake);

  let video;
  let sheet;
  await test("vidéo entière : assemblée au format de référence", async () => {
    const started = Date.now();
    ({ video, sheet } = await assembleVideo(preset, generated));
    console.log(`      (${((Date.now() - started) / 1000).toFixed(1)} s sur ce PC, ${(video.length / 1e6).toFixed(1)} Mo)`);
    await writeFile(path.join(dir, "final.mp4"), video);
    await mkdir(path.join(".cache", "presets", "arrivee-star"), { recursive: true });
    await writeFile(path.join(".cache", "presets", "arrivee-star", "selftest-planche.jpg"), sheet);
    await writeFile(path.join(".cache", "presets", "arrivee-star", "selftest-final.mp4"), video);
    const info = await probe(path.join(dir, "final.mp4"));
    assert.ok(info.includes("720x1280"), "720x1280 attendu");
    assert.ok(info.includes("24 fps"), "24 fps attendu");
    assert.match(info, /Duration: 00:00:10\.0/);
    assert.ok(info.includes("Video generee par intelligence artificielle"), "métadonnée IA attendue");
    assert.ok(info.includes("ContentProducer"), "marquage du modèle conservé");
  });

  await test("le son est celui d'origine, à l'octet près, jamais le son généré", async () => {
    const final = await assertOriginalAudio(path.join(dir, "final.mp4"));
    assert.notDeepEqual(final, await audioPackets(fake));
  });

  await test("extrait du Preset Lab : audio et durée recoupés", async () => {
    const short = path.join(dir, "short.mp4");
    await run(ffmpegPath, ["-y", "-hide_banner", "-loglevel", "error", "-threads", "4", "-ss", "4.5", "-t", "5", "-i", fake, "-c", "copy", short]);
    const { video: clipVideo } = await assembleVideo(preset, await readFile(short), { clip: [4.5, 9.5] });
    await writeFile(path.join(dir, "clip.mp4"), clipVideo);
    const info = await probe(path.join(dir, "clip.mp4"));
    assert.match(info, /Duration: 00:00:0[45]\./);
  });

  await test("recollage du décor : le graphe fonctionne avec un masque", async () => {
    const maskPath = path.join("presets", "arrivee-star", preset.reference.assets.mask);
    let hadMask = true;
    await readFile(maskPath).catch(() => {
      hadMask = false;
    });
    // Masque d'essai : un rectangle blanc au centre, retiré à la fin du test.
    if (!hadMask) {
      await run(ffmpegPath, [
        "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=720x1280:r=24:d=10",
        "-vf", "drawbox=x=200:y=300:w=320:h=900:color=white:t=fill", "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", maskPath,
      ]);
    }
    try {
      const withMask = { ...preset, post: { ...preset.post, composite_mask: true } };
      assert.ok(assembleGraph(withMask).includes("alphamerge"));
      // Vidéo générée toute rouge : le rouge ne doit se voir que dans le masque.
      const red = path.join(dir, "red.mp4");
      await run(ffmpegPath, ["-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=red:s=720x1280:r=24:d=10", "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-pix_fmt", "yuv420p", red]);
      const { video: merged } = await assembleVideo(withMask, await readFile(red));
      await writeFile(path.join(dir, "merged.mp4"), merged);
      const info = await probe(path.join(dir, "merged.mp4"));
      assert.ok(info.includes("720x1280"));
      await assertOriginalAudio(path.join(dir, "merged.mp4"));

      // Pixel moyen d'un carré de 8 px à l'image 120.
      const pixel = async (file, x, y) => {
        const { stdout } = await run(
          ffmpegPath,
          ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `select='eq(n,120)',crop=8:8:${x}:${y}`, "-vsync", "0", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
          { encoding: "buffer", maxBuffer: 1024 * 1024 },
        );
        const mean = [0, 0, 0];
        for (let i = 0; i < stdout.length; i++) mean[i % 3] += stdout[i] / (stdout.length / 3);
        return mean;
      };
      const inside = await pixel(path.join(dir, "merged.mp4"), 360, 700);
      assert.ok(inside[0] > 200 && inside[1] < 40 && inside[2] < 40, `rouge attendu dans le masque : ${inside}`);
      const outside = await pixel(path.join(dir, "merged.mp4"), 60, 100);
      const scene = await pixel("presets/arrivee-star/assets/source.mp4", 60, 100);
      assert.ok(outside.every((value, i) => Math.abs(value - scene[i]) < 12), `décor d'origine attendu hors du masque : ${outside} / ${scene}`);
    } finally {
      if (!hadMask) await rm(maskPath, { force: true });
    }
  });

  await test("un serveur de test sert bien la vidéo comme le ferait fal (lecture distante)", async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "video/mp4" });
      res.end(generated);
    });
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/x.mp4`);
    const body = Buffer.from(await res.arrayBuffer());
    server.close();
    assert.equal(createHash("md5").update(body).digest("hex"), createHash("md5").update(generated).digest("hex"));
  });
} finally {
  await rm(dir, { recursive: true, force: true });
}

console.log(`\n${passed} tests réussis, aucun appel payant.`);

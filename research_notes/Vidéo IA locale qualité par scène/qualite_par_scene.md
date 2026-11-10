# AI video quality by scene / subject type: does per-subject model routing help? (state as of 2026-11-10)

Context reminder: local deployment via WanGP on RTX 5070 Ti 16 GB. Current models: MiniMax H3 (open build runs at 768p locally) and LTX-2.5. Quality only. Many sources below are secondary/aggregator pages; flagged where relevant.

## 1. Do leaderboards publish per-category (per-subject) results?

### Takeaway
Mostly no. Artificial Analysis (the source of the H3 Elo 1161 figure) publishes only "Overall" plus audio/no-audio and open-weights filters, with no subject categories. The only usable per-category data comes from narrow academic benchmarks (HumanScore for human motion, Physics-IQ for physics, VBench-2.0 dimensions) and from the TasteRoute routing paper. Almost none of them include MiniMax H3, LTX-2.5 or Kandinsky 6 yet.

### Cited Findings
- AA T2V v2.1 open-weights board: MiniMax H3 (768p) 1161 ±13 (7,638 samples, released Jul 2026); Pika H3 Flex 1125 ±15 (Oct 2026); LTX-2.5 Fast 943 ±15 and LTX-2.5 Pro 939 ±15 (Aug 2026); LTX-2.3 Pro 884; LTX-2.3 Fast 841. The only filters are "Category: Overall", "With Audio / No Audio" and "All / Open weights". No subject breakdown (people, landscapes, animals, physics, style) is visible. Kandinsky, Wan 2.2 and HunyuanVideo are not in the visible table. The page has no explicit date, but its newest entry is Oct 2026 — [Artificial Analysis T2V open weights](https://artificialanalysis.ai/video/leaderboard/text-to-video/open-weights)
- AA I2V open weights: MiniMax H3 (768p) 1132, Hyperflow H3 1120, Pika H3 Flex 1114. Silent I2V: Hyperflow H3 1122, MiniMax H3 1114, Pika H3 Flex 1101. On the overall T2V board, the closed Wan 3.0 (~1175) sits just above H3. These figures come from search snapshots, and the cached pages differ by a few Elo points — [AA I2V open weights](https://artificialanalysis.ai/video/leaderboard/image-to-video/open-weights); [AA T2V](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- AA reportedly ranks H3 first in video editing (secondary reporting) — [autoae.online](https://autoae.online/blog/minimax-h3-examples)
- Arena (formerly LMArena) video arenas are split by task (T2V, I2V, Video Edit since Mar 2026), not by subject. No license or open-weights filter was found — [Arena blog Mar 2026](https://arena.ai/blog/march-2026-arena-updates/); [llm-stats](https://llm-stats.com/leaderboards/best-ai-for-video-generation)
- A third-party tracker puts H3 at 1452.74 Elo on LMArena T2V, 5th of 20, as of late Aug 2026 (secondary) — [gradually.ai](https://www.gradually.ai/ki-modelle/minimax-h3/)
- **HumanScore** (Stanford, NeurIPS 2026 D&B track; arXiv 2604.20157, v2 dated 3 Nov 2026) scores the biomechanical plausibility of human motion over 51 motion types, each in a gentle and an intense variant. Leaderboard (Anatomy / Kinematic / Kinetic / Overall):
  - Seedance 1.0 Pro fast (closed): 93.9 / 84.7 / 94.3 / **91.1**
  - **HunyuanVideo 1.5 (open)**: 95.3 / 83.0 / 94.9 / **91.1**, tied for 1st
  - Kling 2.5 Turbo Pro: 90.8
  - Ray 3.0: 87.7
  - **Kandinsky 5.0 Pro (open)**: 86.5
  - Sora-2: 86.1
  - **Wan 2.2 (open)**: 94.0 / 78.8 / 85.6 / 86.1
  - Veo 3.1 fast: 85.9
  - Hailuo 02: 85.8
  - PixVerse 5.5: 85.5
  - Wan 2.6: 84.8
  - Pika 2.2: 81.6
  - CogVideoX-5B (open): 74.8

  MiniMax H3, LTX-2.x and Kandinsky 6 were not evaluated. The lowest-scoring example clips are acrobatic or inverted moves (backflips, cartwheels, handstands) — [HumanScore project page](https://cs.stanford.edu/~xtiange/projects/humanscore/); [arXiv](https://arxiv.org/abs/2604.20157)
- The HumanScore abstract reports "consistent gaps between perceptual plausibility and biomechanical fidelity". Recurring failures are temporal jitter, implausible poses and motion drift — [arXiv abstract](https://arxiv.org/abs/2604.20157)
- A separate human-motion benchmark (HuM-Bench) reports that Wan2.2-14B and SANA-Video 2B reach top scores (0.78 and 0.89 on anatomy/motion). Its scale is not comparable to HumanScore — [emergentmind summary](https://www.emergentmind.com/papers/2604.25361) (secondary, via search snippet)
- VBench-2.0 (original paper): HunyuanVideo, the only open model in its table, is "generally weaker across many intrinsic faithfulness dimensions" but strong on Human Fidelity and Motion Rationality. Wan was not in that table — [VBench-2.0 arXiv](https://arxiv.org/html/2503.21755v2)
- A VBench-2.0 top-10 snapshot dated 2026-08-09 (inside arXiv 2608.13546) has Human Anatomy and Physics columns. I could only read the Sora-480p row (Human Fidelity 87.72, Physics 57.18); the open-model rows were truncated — [Alaya-EVOKE arXiv](https://arxiv.org/pdf/2608.13546)
- Physics-IQ has Verified and Original boards. The top entries are physics-specialised pipelines on the video-to-video track, not general T2V models: Magi-1 24B + GeoPhys (best-of-N) scores 58.2 ±1.8 (Verified, added 2026-06-19) and 64.5% (Original), and Cosmos3-Super + WMReward scores 63.4% (Original). Odyssey-3's claimed 66.1 is vendor-reported and unreproduced — [Physics-IQ GitHub](https://github.com/google-deepmind/physics-IQ-benchmark); [orcarouter Odyssey-3](https://www.orcarouter.ai/blog/odyssey-3-research-preview-launch)
- Kandinsky 6.0 is reported as absent from the Physics-IQ leaderboard — [orcarouter comparison](https://www.orcarouter.ai/vi/blog/odyssey-3-vs-kandinsky-6-0-video)

### Inferences
- No public per-subject Elo exists for the open models the user can run (H3, Pika H3 Flex, LTX-2.5, Kandinsky 6). Any routing table would have to be built from narrow benchmarks, anecdotes, or the user's own A/B tests.
- On human body motion, the best measured open model is HunyuanVideo 1.5, which ties the best closed model. But H3 was never measured on HumanScore, and H3's overall Elo lead over older open models is large. That HunyuanVideo 1.5 beats H3 on people is therefore unproven.
- Physics leaders are physics-reward or best-of-N pipelines. The lesson there is generate several and select, not switch to another base model.

### Gaps
- I found no AA, Arena or DesignArena subject-category filter. The DesignArena video categories were not checked (no results surfaced).
- I could not extract VBench / VBench-2.0 per-dimension scores for Wan 2.2, HunyuanVideo 1.5, H3 or LTX-2.5.
- VideoPhy and T2V-CompBench results for 2026 open models were not found within the search budget.
- HumanScore did not include H3, LTX-2.5, Kandinsky 6, MagiHuman or SkyReels.

## 2. Subject-specialised open models and fine-tunes

### Takeaway
Real specialisation exists mainly for humans (daVinci-MagiHuman, HunyuanVideo 1.5's strength on body mechanics), for physics (reward or best-of-N pipelines), and for camera moves (Wan 2.1/2.2 camera LoRAs). None has evidence of beating H3 on its own subject. MagiHuman's published comparisons stop at LTX-2.3, and the camera LoRAs exist only for the Wan family.

### Cited Findings
- **daVinci-MagiHuman** (15B, joint audio and video, Apache 2.0, arXiv 2603.21986). Its model card scores visual quality / text alignment / physical consistency / WER as follows:
  - MagiHuman: 4.80 / 4.18 / 4.52 / 14.60%
  - LTX-2.3: 4.76 / 4.12 / 4.56 / 19.23%
  - Ovi 1.1: 4.73 / 4.10 / 4.41 / 40.45%

  In 2,000 pairwise human comparisons it won 80.0% vs Ovi 1.1 and 60.9% vs LTX-2.3. These are the authors' own numbers, and there is no comparison with Wan or H3 — [HF model card mirror](https://huggingface.co/Nour-Fayed/daVinci-MagiHuman); [arXiv](https://arxiv.org/abs/2603.21986)
- MagiHuman takes about 38 s per 5 s clip at 1080p on one H100 (vendor figure). SynthForensics measured about 2.5 min per 5 s at 1920×1088 on Blackwell — [SynthForensics arXiv](https://arxiv.org/pdf/2602.04939)
- HunyuanVideo 1.5 vs Wan 2.2: an anecdotal review found Wan 2.2 "not as anatomically good, especially regarding the skater's arms", with Hunyuan 1.5 slightly better in tricky anatomy. This matches HumanScore (91.1 vs 86.1) — [gradually.ai comparison](https://www.gradually.ai/en/ai-video-model-comparison/wan-2-2-a14b-vs-hunyuan-video-1-5/)
- Camera-move LoRAs exist for the Wan family:
  - Wan 2.2 I2V A14B drone-camera and earth-zoom-out LoRAs, plus a cinematic arc/orbit LoRA (unofficial mirrors) — [WAN 2.2 LoRA collection mirror](https://hface.pages.dev/wangkanai/wan22-fp8-i2v-loras)
  - An orbit LoRA applied only to Wan 2.2's low-noise expert — [HF Space code](https://www.huggingface.co/spaces/rahul7star/wan2-2-T2V-EXP/blame/main/app1.py)
  - A DroneShot LoRA for Wan 2.1 14B I2V 720p, trigger "FIRST PERSON VIEW SHOT" — [dtf.ru](https://dtf.ru/id595875/3906268-effekt-dronov-v-video-lora-model-droneshot-wan)
  - A push-in camera LoRA for Wan 2.1 — [HF](https://huggingface.co/Bn53/Motion-Lora-Camera-Push-In-Wan-14B-720p-I2V)
- A guide notes that the official Wan documentation warns that LoRAs trained on Wan 2.2 can be unstable for some tasks, such as animation — [mindstudio](https://www.mindstudio.ai/blog/what-is-wan-2-2-video-open-source)
- Anime/stylised: one launch-week Reddit poster ranked an H3 R2V anime fight scene above Wan 2.2 and LTX 2.3. This is a single opinion — [autoae.online](https://autoae.online/blog/minimax-h3-examples)
- Physics specialisation: the Physics-IQ leaders are Magi-1 + GeoPhys and Cosmos3-Super + WMReward, both run with best-of-N — [Physics-IQ GitHub](https://github.com/google-deepmind/physics-IQ-benchmark)

### Inferences
- The only plausible specialist routes to test against H3 are:
  - (a) HunyuanVideo 1.5 or MagiHuman for full-body or acrobatic human motion and talking heads;
  - (b) Wan 2.2 plus a camera LoRA when a precise drone or orbit move is required. This trades base quality for camera control, since Wan 2.2 sits well below H3 overall.
- I found no landscape, nature or architecture fine-tune of any video model with published evaluations.

### Gaps
- No evidence on SkyReels (V2/V3), LongCat-Video, Pika H3 Flex or "H3 Singularity" per subject. I found no evaluation sources for H3 Singularity at all.
- I found no Civitai or community-reported quality comparison of the Wan camera LoRAs against H3's native camera control (H3 can copy camera motion from a reference video).
- I found no 2026 anime benchmark for open video models.

## 3. Community and third-party comparisons: H3 vs LTX-2.5 vs Kandinsky 6 vs Wan 2.2

### Takeaway
Sparse, mostly anecdotal evidence. It consistently places H3 ahead for complex motion, camera choreography, physical interaction and atmosphere. LTX-2.5 is credited with sharp individual frames, slower simple shots and talking subjects. Kandinsky 6 Pro loses to H3 on visuals in its own report. I found no community comparison split by landscapes vs people.

### Cited Findings
- From an LTX-hosted comparison blog (checked 13 Aug 2026, undated Reddit citations):
  - "Early community evidence leans toward MiniMax H3 for demanding motion" (running, fighting, object interaction, camera choreography).
  - LTX 2.5 "remains competitive for simpler animations, slower shots, talking subjects".
  - One Reddit summary: "LTX looking better in individual moments while H3 flowed better through motion". Other users said LTX kept props and clothing more coherent.
  - On an RTX 5090 at the same settings, LTX took 2 min 34 s vs 17 min 29 s for H3.

  — [ltx23.org](https://ltx23.org/blog/ltx-2-5-vs-minimax-h3) (vendor-adjacent; treat with caution)
- **Kandinsky 6.0 technical report** (arXiv, 4 Oct 2026; release 6 Oct 2026, MIT; Pro 29B and Lite 3B; base 864×480 with a separate super-resolution model up to 1080p or 2K; 5 s clips). Human side-by-side results, about 200+ comparisons per criterion:
  - **vs MiniMax H3:** H3 is significantly preferred on visual quality, artifacts, motion realism, prompt following, audio quality and task solving. K6 Pro is only ahead or tied on speech quality, camera motion and synchronisation (not significant).
  - **vs LTX 2.5:** K6 Pro is preferred on visual quality, artifacts, motion realism, prompt following, task solving and speech (significant on visual quality, task solving and speech).
  - The authors write that "a gap remains to the strongest proprietary systems in visual quality".

  — [miraflow summary of the K6 report](https://miraflow.ai/blog/kandinsky-6-0-video-explained-open-source-audio-video-model-2026)
- Kandinsky 6 VABench vs LTX 2.5 (unmatched resolutions; Kandinsky at 512×768): K6 Pro visual realism 4.485 vs LTX 2.5 4.366. LTX 2.5 wins VLM-judged alignment (4.527 vs 4.329) and expressiveness (4.360 vs 4.312) — [miraflow](https://miraflow.ai/blog/kandinsky-6-0-video-explained-open-source-audio-video-model-2026)
- One aggregator says no independent benchmark data exists for Kandinsky 6.0 Video yet — [madebyagents](https://www.madebyagents.com/models/kandinsky-6-0-video-pro)
- A Venice AI launch-week tester said H3 T2V output "is a little bit 'blurry'" but called the motion "very accurate" (hosted, not local) — [autoae.online](https://autoae.online/blog/minimax-h3-examples)

### Inferences
- The ranking holds across criteria: H3 > Kandinsky 6 Pro > LTX-2.5 on visuals, artifacts and motion realism. Only speech, lip-sync and camera motion favour K6 vs H3, and not significantly. Nothing suggests LTX-2.5 or K6 would beat H3 on any visual subject category, except possibly LTX for slow talking-head shots and prop or clothing consistency (anecdotal).

### Gaps
- No r/StableDiffusion, Banodoco or YouTube blind test split by scene type was found within the budget.
- No Wan 2.2 vs H3 head-to-head was found beyond the AA overall gap and one anime anecdote.

## 4. Known weaknesses of MiniMax H3 and LTX-2.5

### Takeaway
H3's documented weaknesses are about content correctness, not look. Text and signage, hands and object counts, ball and sports trajectories, game logic, fast whip-pans and talking-head speech are weak or failing. Landscapes, atmosphere, lighting and broad camera travel are its strongest categories. LTX-2.5's documented weaknesses are complex or fast motion and audio artefacts.

### Cited Findings
- **Independent local H3 evaluation**: one RTX 4090, FP8, mostly 608×352 with a 768×432 probe, 6 Aug 2026, about 54 clips over 6 suites, reviewed by eye and ear plus Whisper. Category verdicts:
  - Landscapes and atmosphere: **strong** (mountain valley, rainy street).
  - Broad camera travel: **among the strongest**; whip-pan and camera-assembly clips had continuity problems.
  - City scenes: mood strong, signage/text unreliable.
  - Product text: **failure** (composite text in post).
  - Calligraphy: **failure** (extra writing).
  - Hands: **failure** (wrong card shape, count and relations; a third hand in a cooking clip).
  - Animals/pets: **weak** (dog-and-ball trajectory lost).
  - Sports: **failure** (boxing A/V mismatch, broken basketball and soccer logic).
  - Talking portrait: speech **failure** (repeated meaningless words).

  Quotes: "scenes have richer lighting, deeper atmosphere, more convincing materials"; "H3 is more reliable at making a shot look finished than at making every fact inside the shot correct"; "a supervised draft generator rather than an unattended final-video generator". It is riskier "when the viewer must count objects, read text, verify a rule, follow a procedure, or trust a precise trajectory" — [minimaxh3.co review](https://minimaxh3.co/blog/minimax-h3-review-en). This is a single tester at below-768p resolution and not an official MiniMax site, so treat it with caution.
- The open build runs locally at 768p; full 2K output needs the hosted API (H3-Regenerate-2K). That stage could rebuild small text better than an upscaler, but as of Aug 2026 it is "not yet available as a fully local open-weight module" — [ltx23.org](https://ltx23.org/blog/ltx-2-5-vs-minimax-h3); [segmind](https://blog.segmind.com/minimax-h3-release-date-open-weights-and-api-pricing-explained/)
- The H3 licence restricts local deployment in the US, EU, UK and South Korea and caps commercial use at $20M revenue (sources differ; check the licence) — [minimaxh3.co open weights](https://minimaxh3.co/open-source/open-weights); [SCMP](https://www.scmp.com/tech/article/3362540/video-ai-minimax-challenges-bytedance-low-price-open-weights-new-h3-model)
- MiniMax had not published the promised H3 technical report as of launch coverage, so there is no official per-category evaluation — [search summary of runtimewire](https://runtimewire.com/article/minimax-h3-open-weights-promise)
- LTX-2.5:
  - Weaker on demanding motion, competitive on "simpler animations, slower shots, talking subjects".
  - Some users describe its audio as "metallic or noisy".
  - Praised for sharp single frames.

  — [ltx23.org](https://ltx23.org/blog/ltx-2-5-vs-minimax-h3)

### Inferences
- For the user's use case (likely people-centric), H3's weakest points are hands and object interaction, talking-head speech, and fast sports-like motion. These are where an alternative might help. HunyuanVideo 1.5 (body mechanics) and MagiHuman (talking humans, lower WER) are the only open candidates with any supporting evidence, and neither has been compared directly with H3.
- H3's weaknesses (text, counts, trajectories) are failure modes shared by all current models. Post compositing (text overlays) or best-of-N selection is likely a better fix than switching models.

### Gaps
- No systematic test of H3 crowds, faces/close-up identity or fast motion at 768p local was found.
- No sourced list of LTX-2.5 weaknesses by scene beyond the motion and audio remarks above.

## 5. Evidence for or against multi-model routing per subject

### Takeaway
The best evidence is TasteRoute (arXiv 2610.05896, Oct 2026), a router built on human preference labels over 30 commercial video endpoints. With models of similar strength, the best model does change by subject on 5 of 12 attributes, but routing on coarse categories barely beats always using the best single model (37.0% vs 36.6% Top-1). Gains need prompt-specific learned routing and are modest (+3.3 points). With the user's pool, where H3 leads the next local option by about 220 Elo, the expected gain from subject routing is small.

### Cited Findings
- **TasteRoute** (30 generator endpoints priced from Google/fal catalogs, so mostly closed/API models; T2V and I2V):
  - Veo 3.1 Lite has the highest consensus utility but loses 5 of 12 prompt attributes: face close-ups (to Seedance 2.0 Mini), animals (to Kling 2.5 Pro), and product/UI, quoted text and camera motion (to Grok Imagine).
  - The leader changes on 5/12 attributes in T2V and 8/12 in I2V.
  - Top-1: global best single generator 36.6%; per-attribute lookup table 37.0%; learned TasteRoute-Generic 39.9%; 42.0% at a $2 cap (vs kNN 39.7%, FrugalGPT 38.2%).
  - "Prompt attributes alone are insufficient": editing one attribute phrase changes the top generator in 5–55% of cases (25% on average).
  - Router accuracy ranges from 48.6% on cartoon/3D prompts to 30.4% on rendered-text prompts.
  - Annotator agreement rises for cartoon/3D (+18%) and falls most for exact on-screen text (−10%).

  — [TasteRoute arXiv HTML](https://arxiv.org/html/2610.05896)
- Older related work:
  - PAK-UCB frames prompt-aware generator selection as a contextual bandit, but its T2V experiments are synthetic — [arXiv 2410.13287](https://arxiv.org/pdf/2410.13287)
  - SPAgent picks video tools per task from capability statistics — [arXiv 2411.18983](https://arxiv.org/pdf/2411.18983)
  - DAK-UCB adds diversity-aware routing — [arXiv 2603.23140](https://arxiv.org/pdf/2603.23140)
- A test-time-scaling approach (retrieval, prompt refinement and ranking of candidates) is an alternative to model switching — [arXiv 2603.01509](https://arxiv.org/html/2603.01509v1)
- Physics-IQ's top entries all use best-of-N with a physics or world-model reward, which supports selecting among several generations — [Physics-IQ GitHub](https://github.com/google-deepmind/physics-IQ-benchmark)

### Inferences
- Routing pays off when candidate models are close in overall quality and have complementary strengths, as in TasteRoute's pool of frontier closed models. Locally the gap is large: H3 at 1161 vs Pika H3 Flex at 1125 vs LTX-2.5 at about 940, and Kandinsky 6 Pro loses to H3 on every visual criterion in its own report. Subject routing is therefore unlikely to raise average quality, except possibly:
  - (a) Pika H3 Flex, the only open model within about 36 Elo of H3, so a complementary per-subject profile is possible but unmeasured;
  - (b) human-body-motion or talking-head jobs (HunyuanVideo 1.5 or MagiHuman), to be confirmed by the user's own A/B tests.
- Because time is not a constraint, generating several H3 takes per job and picking the best (manually or with a VLM or reward model) is better supported than per-subject routing. Physics-IQ's best-of-N leaders and TasteRoute's finding that coarse categories don't predict the winner both point that way.
- Text and signage should be composited in post rather than routed. Every model is weak there, and router accuracy is lowest on rendered text (30.4%).

### Gaps
- No production-studio account of per-subject model routing with measured results was found.
- TasteRoute's pool is not classified open/closed and does not include H3, LTX-2.5 or Kandinsky 6, so its per-attribute winners do not transfer directly.
- No per-subject profile was found for Pika H3 Flex, the closest open challenger to H3.

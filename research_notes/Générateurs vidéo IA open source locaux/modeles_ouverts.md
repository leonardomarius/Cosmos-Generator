# Open-weight video generation models as of November 2026: inventory, rankings, 16 GB feasibility, licenses

Research date: 2026-11-10. The user's setup: a single RTX 5070 Ti with 16 GB, running WanGP. They currently use LTX-2.5 (NVFP4), MiniMax H3 (Ref2VA / FL2VA pruned) and Qwen Image Edit 2511. Their output is 1080p vertical clips of 4 to 10 s with audio, with face likeness to an uploaded photo. They sell outputs commercially from France (EU).

Source caveat: most 2026 facts come from secondary sources (comfyui-wiki, aggregators, news blogs). A few pages are primary or near-primary: the Hugging Face model cards, Artificial Analysis and The Batch. Several aggregator sites publish SEO content about rumored models, Wan 3.0 especially, so I flag every unverified claim.

## 1. Which open-weight video models exist and are current (Nov 2026)?

### Takeaway
There are three tiers of current open-weight video+audio models:
- **MiniMax H3 family** (33B, Aug 2026), plus its derivatives: Pika H3 Flex, Singularity, the NVIDIA Open-H3-Regenerate-2K refiner and Sol-H3-VAE.
- **LTX-2.5** (22B, Aug 2026).
- **Kandinsky 6.0 Video** (29B Pro / 3B Lite, Oct 6 2026, MIT, native audio). This is the only significant *new base model* the user does not run yet.

Alibaba has published no new open Wan base model since Wan 2.2 (Jul 2025). Wan 2.5, 2.6, 2.7 and 3.0 are API-only.

### Cited Findings

**MiniMax H3 (base, open first stage)**
- API launched July 31 2026. Weights went to Hugging Face on Aug 3 2026 under the "MiniMax H3 Community License". About 33B params, multimodal input (text, image, video, audio), 4–15 s clips at 24 fps, native stereo audio. Self-hosted output caps at about 768p because the 2K upscaler and the context-translation layer stay proprietary — [Kompozy](https://kompozy.io/news/minimax-h3-first-open-model-tops-video-ranking)
- Three modules: H3-Context-IR (prompt-rewriting reasoning, proprietary), the base video/audio transformer (the only downloadable part), and H3-Regenerate-2K (proprietary). Base output is 768p (1792×768 at max 21:9). Inputs: up to 12 files. Output: up to 15 s with audio and captions. Modes: T2V, first/last-frame I2V, and image/audio/video references in any mix. The exact param count is listed as "undisclosed" while 33B appears in the specs (internal conflict). Repo: `huggingface.co/MiniMaxAI/MiniMax-H3` — [The Batch / DeepLearning.AI, Aug 14 2026](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open)
- Described as a 33B dense transformer with native 32 kHz stereo audio. The reference deployment uses 4 GPUs — [Fuser, license verified Oct 23 2026](https://fuser.studio/articles/best-open-source-video-models)
- Full-precision footprint is 123.6 GB. The optimized int8 "convrot" plus pruned build is 42.5 GB; the pruning replaces modulation weights (about 40% of params) with a lookup table. ComfyUI repack: `Comfy-Org/MiniMax-H3` — [AI Video Sensei, Aug 3 2026](https://aivideosensei.com/guides/minimax-h3-run-locally)
- WanGP lists H3 FL2VA and Ref2VA workflows, Pruned models, Singularity (33B, pruned 20B, V1.3), Pika H3 Flex, FastH3 Omni (Oct 21 2026), HyperFlow Flash (Nov 8 2026; "smaller 14B models need less RAM"), DMAD accelerators (Nov 9) and an NVFP4 variant. The H3 distilled text encoder is about 5 GB in INT8, versus 27 GB for the standard one — [WanGP GitHub README/changelog](https://github.com/deepbeepmeep/Wan2GP)

**H3 derivatives / add-ons (Sep–Nov 2026)**
- **Pika H3 Flex** (Oct 29 2026): two LoRA adapters (FL2VA, Ref2VA, about 2 GB each) on the H3 base, distilled from 50 steps to 6. Local output is 480p/768p, 5–15 s, 24 fps, 32 kHz stereo audio, with up to 12 references (9 images / 3 videos / 3 audio). Repo: https://huggingface.co/Pika-Labs/Pika-H3-Flex — [Kombitz roundup Oct 31 2026](https://www.kombitz.com/2026/10/31/ai-image-video-model-news-roundup-october-31-2026/); [ExplainX](https://explainx.ai/blog/pika-h3-flex-open-weight-video-audio-model-minimax-h3-six-steps-designarena-7-comfyui-license-2026)
- **Open-H3-Regenerate-2K** (NVIDIA Sana team, Oct 27 2026): a refiner LoRA on the frozen H3 transformer. It takes a 384p–768p draft to 768p/1080p/2K/4K in 3 denoising steps. Timing for a 5 s clip from 768p to 2K: 22.45 s on one B200, versus 87.26 s on the standard path. Repo: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K. There are no official ComfyUI nodes yet; Kijai published a rank-384 LoRA. — [Kombitz](https://www.kombitz.com/2026/10/31/ai-image-video-model-news-roundup-october-31-2026/)
- **Sol-H3-VAE** (NVIDIA): a distilled 24-layer decoder. A 2K decode drops from 14.5 s to 0.89 s on GB200. Repo: https://huggingface.co/Efficient-Large-Model/Sol-H3-VAE. Also listed: an H3 latent upscaler at https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler — [Kombitz](https://www.kombitz.com/2026/10/31/ai-image-video-model-news-roundup-october-31-2026/)
- **H3 Singularity** (community, by WarmBloodAban, around Sep 7 2026): a merge plus fine-tune plus prune of the H3 ref/FL checkpoints, described as "HDR fusion". INT8 pruned file is 19.6 GB (recommended), full file 31.7 GB. "20B" refers to file size, not param count. A community GGUF Q4_K_M reportedly runs on 12 GB GPUs — [search summary of ComfyUI Wiki KO](https://comfyui-wiki.com/ko/news/2026-09-07-h3-singularity); [multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)

**LTX-2.5 (Lightricks / LTX)**
- Released Aug 11 2026. 22B asymmetric dual-stream DiT with joint audio-video generation through bidirectional cross-attention. Gemma 4 12B text encoder. Features: native multi-shot, 4K HDR pipelines, T2AV/A2V, duration auto-predicted from the action. Files: dev BF16, distilled BF16, int8-convrot and NVFP4 distilled, video and audio VAEs, 2× spatial and 2× temporal latent upscalers. Weights at https://huggingface.co/Lightricks/LTX-2.5 (gated by a contact-info agreement) — [ComfyUI Wiki](https://comfyui-wiki.com/en/news/2026-08-11-ltx-2-5-open-weights-release); gating noted in the [search summary](https://www.gradually.ai/en/ai-models/ltx-2-5/)
- Predecessor LTX-2.3 (Mar 5 2026): 22B (14B video + 5B audio), up to 4K, 50 fps, up to 20 s, audio in a single pass — [Thunder Compute, updated Oct 1 2026](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)

**Kandinsky 6.0 Video (Sber Kandinsky Lab), the main new base model**
- Released Oct 6 2026 with code, checkpoints and an arXiv report (2610.05608). Pro is 29B, Lite is 3B, plus a separate video super-resolution model. 5 s clips with synchronized 44 kHz audio, up to 1920×1080 through the SR stage. Modes: T2AV and I2AV. Dual-stream CrossDiT, RL post-training (speech WER −47%), distilled to 10 steps. MIT license. Repos: https://github.com/kandinskylab/kandinsky-6 and https://github.com/kandinskylab/kandinsky-6-sr — [ExplainX](https://explainx.ai/blog/kandinsky-6-video-open-source-29b-audio-video-mit-license-2026)
- Support in Diffusers, ComfyUI, vLLM-Omni, SGLang and FastVideo was reported at launch — [Kompozy](https://kompozy.io/news/kandinsky-6-0-video-open-source-synchronized-audio)
- Predecessor Kandinsky 5.0 family (image + video), Nov 2025 — [arXiv 2511.14993](https://arxiv.org/html/2511.14993v1)

**Wan (Alibaba): no new open weights since Wan 2.2**
- Wan 2.1 and 2.2 (T2V-A14B, I2V-A14B, TI2V-5B, Animate-14B, S2V-14B) are open under Apache 2.0. Wan-Dancer-14B (music-to-dance I2V) was created Jul 10 2026. Wan 2.5, 2.6, 2.7 and 3.0 have no repo; they are API only (wan2.7-t2v on QwenCloud at $0.10–0.15/s) — [Digital Applied, Aug 2026](https://www.digitalapplied.com/blog/wan-3-0-reality-check-rumor-vs-shipped)
- Wan 3.0 is on Artificial Analysis as "Open Weights: No", released Aug 2026 — [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video). The Oct 31 2026 roundup still calls Wan 2.2 the newest downloadable Wan — [Kombitz](https://www.kombitz.com/2026/10/31/ai-image-video-model-news-roundup-october-31-2026/)
- Contradiction: wan27.org-type sites claim Apache 2.0 Wan 2.7/3.0 weights. Atlas Cloud reported "33 repos checked, 0 weights found". Treat those claims as SEO rumors — [Digital Applied](https://www.digitalapplied.com/blog/wan-3-0-reality-check-rumor-vs-shipped); [Atlas Cloud](https://www.atlascloud.ai/blog/tips/is-wan-3.0-open-source)
- Wan 2.2 A14B is MoE (27B total, 14B active) at 480p/720p with no audio. TI2V-5B is 720p. Release Jul 29 2025 — [Fuser](https://fuser.studio/articles/best-open-source-video-models); [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)

**Other open models (mostly 2025, older)**
- **HunyuanVideo 1.5** (Tencent), released Nov 20 2025: 8.3B DiT, 480p/720p base with SR to 1080p, 121 frames by default, no audio mentioned, minimum 14 GB with offload. License tag: `tencent-hunyuan-community` — [HF model card](https://huggingface.co/tencent/HunyuanVideo-1.5). No HunyuanVideo 2.0 open release was found.
- **daVinci-MagiHuman** (SII-GAIR + Sand.ai, arXiv 2603.21986, Mar 2026): 15B single-stream joint audio-video model for talking humans. Full stack released: base, distilled, SR and inference code. Self-reported 80.0% win rate vs Ovi 1.1 and 60.9% vs LTX 2.3. Apache 2.0 per secondary sources and an HF mirror — [HF paper page](https://huggingface.co/papers/2603.21986); [WaveSpeed](https://wavespeed.ai/blog/posts/davinci-magihuman-open-source-digital-human-lip-sync-2026). WanGP lists "MagiHuman" — [WanGP](https://github.com/deepbeepmeep/Wan2GP)
- **LongCat-Video** (Meituan, arXiv 2510.22200, Oct 2025): 13.6B dense, MIT. LongCat-Video-Avatar-1.5 released May 21 2026 — [search summary of official repo](https://arxiv.org/abs/2510.22200v1); ComfyUI conversion at [Kijai/LongCat-Video_comfy](https://huggingface.co/Kijai/LongCat-Video_comfy)
- **SkyReels V3** (Skywork, around Jan 2026): reference-image-to-video (1–4 refs), video extension and audio-guided generation. GitHub: github.com/SkyworkAI/SkyReels-V3. License not confirmed — [Cinevva guide](https://app.cinevva.com/fr/guides/long-reference-video-models). SkyReels V4 (Mar 2026) is on AA as closed — [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- **MAGI-2 Preview** (Sep 2026) is listed on AA as not open weights — [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- **CogVideoX** (2B Apache 2.0 / 5B CogVideoX License, up to 720p). **Mochi 1** (10B, Apache 2.0, 480p). **Stable Video Diffusion** (Nov 2023). None of these have audio — [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)
- **Ovi** (twin-backbone audio-video, built on Wan 2.2) — [ComfyUI Wiki search result](https://comfyui-wiki.com/en/resource/comfyui-official-resources)
- **WanGP "interactive world" models** (Oct 27 2026): Hy-Nomas 8B (text start) and EVOKE Turbo 14B (image start, 640×384). Both claim "8 GB VRAM to get started". Not relevant to clip production — [WanGP](https://github.com/deepbeepmeep/Wan2GP)
- **Upscalers in WanGP** (not generators): FlashVSR+ Turbo (Oct 21 2026; 1× refine to 4×) and RelayVSR (Nov 8 2026; native ×2 and ×4) — [WanGP](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- For the user, the only genuinely new base model they do not already run is **Kandinsky 6.0 Video**. It is MIT, has audio, I2AV and 1080p through SR. Everything else that is new in 2026 is either H3 ecosystem tooling (Flex, Singularity, Regenerate-2K, Sol-VAE, HyperFlow, FastH3 Omni) or closed.
- **Open-H3-Regenerate-2K** is the missing piece for getting 1080p out of H3 locally, since the H3 base caps at 768p. Its real VRAM need on 16 GB is unknown.

### Gaps
- No primary-source verification for: Ovi / Ovi 1.1 specs and license, SkyReels V3 params and license, MAGI-1, Step-Video-T2V, Open-Sora 2.0. They were not researched in depth, and all are from 2025 or older.
- I did not check what "HyperFlow Flash" and "FastH3 Omni" are. WanGP is the only source, and it gives no params or license.
- Kandinsky 6 facts come from secondary sources, not the GitHub README.

## 2. How do they rank on quality?

### Takeaway
On the Artificial Analysis T2V arena (Nov 2026), **MiniMax H3 (768p) is the best open-weight model by far**: #3 overall at Elo 1161, close behind closed Wan 3.0 (1175) and ahead of Seedance 2.5, Kling 3.0 (1000) and Veo 3.1 (965). Pika H3 Flex scores 1125. LTX-2.5 sits about 220 Elo lower (943 / 939). An open model is now effectively at the closed SOTA, at least at 768p.

### Cited Findings
- AA-Video-T2V v2.1 overall Elo (blind votes), open-weights rows:
  - MiniMax H3 (768p) 1161 (#3)
  - Pika H3 Flex 1125 (#13)
  - LTX-2.5 Fast 943 (#27)
  - LTX-2.5 Pro 939
  - LTX-2.3 Pro 884
  - LTX-2.3 Fast 841
- Closed references on the same board: Wan 3.0 1175 (#1), Utopai X 1168, Seedance 2.5 1155, FLUX 3 Max 1155, HeyGen Video 1 1153, H3 Max 1147, SkyReels V4 1138, Wan 2.7 1037, Kling 3.0 Omni 1021, Kling 3.0 Pro 1000 (anchor), Veo 3.1 965. Sora is not listed.
- Silent board: H3 (768p) 1122, Pika H3 Flex 1097, LTX-2.5 Pro 929. Kandinsky 6, Hunyuan and Wan 2.2 are not on this board.
- Source for all three bullets above: [Artificial Analysis T2V leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- H3 ranks #1 on AA video editing and #2 (tied within margin) in T2V and I2V — [The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open)
- DesignArena T2V (Oct 29 2026): Pika H3 Flex 1293 (#7, top open model), base H3 1277, Gemini Omni 1.1 Flash 1360, Wan 3.0 1324 — [ExplainX](https://explainx.ai/blog/pika-h3-flex-open-weight-video-audio-model-minimax-h3-six-steps-designarena-7-comfyui-license-2026)
- Kandinsky 6 Pro is self-reported (first-party human study) as preferred over LTX 2.5 on visual quality, motion, prompt following and artifacts, with a significant speech advantage over LTX 2.5. It has not been independently reproduced — [ExplainX](https://explainx.ai/blog/kandinsky-6-video-open-source-29b-audio-video-mit-license-2026)
- MagiHuman is self-reported at 60.9% win vs LTX 2.3 and 80% vs Ovi 1.1 on talking humans — [WaveSpeed](https://wavespeed.ai/blog/posts/davinci-magihuman-open-source-digital-human-lip-sync-2026)
- An earlier snapshot (before Aug 2026) had LTX-2.3 Fast as the top open model with audio at Elo 976. Those were different board versions, so the Elo numbers are not comparable across snapshots — [search summary of AA page](https://artificialanalysis.ai/video/leaderboard/text-to-video)

### Inferences
- The user's current stack (H3 + LTX-2.5) already contains the #1 and #2 open families on public arenas. On the evidence available, no open model beats H3 on quality.
- Kandinsky 6 is the only plausible challenger to LTX-2.5, which is the user's fast or 1080p path. Its claims are first-party only.

### Gaps
- I found no 2026 VBench / VBench-2.0 table that covers H3, LTX-2.5 or Kandinsky 6.
- I found no r/StableDiffusion or Banodoco consensus thread (search did not surface Reddit).
- I found no independent face-identity / reference-likeness benchmark (Ref2V) across open models, which is the metric the user's product needs.

## 3. Which run on 16 GB VRAM, and at what speed?

### Takeaway
LTX-2.5 (distilled int8/NVFP4) runs comfortably on 16 GB through WanGP offloading. H3 only runs with heavy block-swap to system RAM (64 GB RAM advised), and there are no credible consumer-GPU speed figures. Kandinsky 6 Pro is very slow on a 16 GB Blackwell card: 2716 s for a 5 s HD clip non-distilled on an RTX 5060 Ti. HunyuanVideo 1.5 fits at 14 GB with offload.

### Cited Findings
- LTX 2.5 22B distilled int8 in WanGP on an RTX 4090: about 5.9 GiB peak VRAM and about 39 s per 5 s clip. The guide recommends offloaded LTX 2.5 in WanGP / LTX Desktop for 16 GB cards — [Techiehub search summary](https://techiehub.blog/best-local-ai-video-generator/)
- LTX-2.3 needs 16 GB for distilled NVFP4, 32 GB for distilled FP8 and 80 GB for dev BF16 — [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)
- WanGP on RTX 50xx: PyTorch 2.10 + Triton 3.6 are needed for its INT8/NVFP4 kernels. The H3 NVFP4 variant "should bring the RTX 5090 close to real-time". LTX-2.5 VAE encode/decode/upscale is 4.8–6.8× faster (Oct 21 2026) — [WanGP](https://github.com/deepbeepmeep/Wan2GP)
- H3: optimized build is 42.5 GB, which does not fit 12 or 16 GB, so it is block-swapped through RAM. 64 GB system RAM is "comfortable". The guide says no credible seconds-per-clip figure exists for 12–16 GB paths and suggests 8–16 GB users skip H3 — [AI Video Sensei, Aug 3 2026](https://aivideosensei.com/guides/minimax-h3-run-locally) (older than WanGP's Oct–Nov pruned/NVFP4/HyperFlow work)
- Pika H3 Flex was tested on one H100 80 GB with a CPU-offload flag, about 215 GB of downloads. ComfyUI reports about 1 min for a 5 s 1344×768 clip on one card (presumably datacenter-class) — [ExplainX](https://explainx.ai/blog/pika-h3-flex-open-weight-video-audio-model-minimax-h3-six-steps-designarena-7-comfyui-license-2026)
- Kandinsky 6 Pro (HD, non-distilled), 5 s clip: 292 s on H100 and 2716 s on RTX 5060 Ti. Consumer Blackwell needs self-compiled SageAttention 2.2.0. The guide advises Lite for limited VRAM, with no VRAM figure given — [ExplainX](https://explainx.ai/blog/kandinsky-6-video-open-source-29b-audio-video-mit-license-2026)
- HunyuanVideo 1.5: 14 GB minimum with offloading — [HF card](https://huggingface.co/tencent/HunyuanVideo-1.5)
- Wan 2.2: 5B fits on consumer GPUs (8 GB GGUF to 24 GB BF16). A14B needs 40–48 GB per one source and 80 GB single-GPU per another, with offload options — [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models); [Fuser](https://fuser.studio/articles/best-open-source-video-models)

### Inferences
- The 2716 s figure for Kandinsky 6 Pro is non-distilled. The default `pro-distill` at 10 steps should be several times faster, but no measured number exists. It would need a single local test, and WanGP support for Kandinsky 6 is not confirmed (WanGP lists only "Kandinsky" generically).

### Gaps
- No RTX 5070 Ti measurements exist for any model.
- No measured 16 GB timing for H3 pruned / NVFP4 / HyperFlow in WanGP.
- No VRAM figure for Kandinsky 6 Lite or for Open-H3-Regenerate-2K.

## 4. License per model (outputs sold in a paid service from France/EU)

### Takeaway
**The MiniMax H3 Community License excludes the EU (plus the US, UK and South Korea) from its "Applicable Territory".** Several independent sources report that users there must apply to MiniMax for a license. That makes the user's current H3 use in France unlicensed unless they obtain one. Derivatives (Pika H3 Flex, Singularity, the NVIDIA refiner on H3) are presumably bound by the base license. LTX-2.5 is worldwide and free under $10M revenue. Kandinsky 6, LongCat and Wan 2.2 are permissive (MIT / Apache 2.0).

### Cited Findings
- **MiniMax H3:**
  - Rights apply "solely within the Applicable Territory", defined as worldwide excluding the EU, UK, South Korea and US.
  - Commercial products above $20M yearly revenue need written authorisation.
  - "MiniMax H3" must be displayed prominently in the UI.
  - Outputs may not be used to train other models.
  - Sources: [Fuser (verified Oct 23 2026)](https://fuser.studio/articles/best-open-source-video-models); [The Batch](https://www.deeplearning.ai/the-batch/minimaxs-state-of-the-art-video-model-is-only-minimally-open) ("Users there must apply to MiniMax for a license"); [Kompozy](https://kompozy.io/news/minimax-h3-first-open-model-tops-video-ranking)
  - One analysis says MiniMax's license FAQ contradicts the operative text on territories; the license text governs — [search summary, Atlas Cloud / dev.to](https://dev.to/breachprotocol/minimax-shipped-h3s-weights-and-kept-the-best-part-hosted-2aag)
- **Pika H3 Flex:** under the MiniMax H3 Community License per llmreference, and Pika may have added terms (unconfirmed) — [search summary](https://www.llmreference.com/model/pika-h3-flex); [ExplainX](https://explainx.ai/blog/pika-h3-flex-open-weight-video-audio-model-minimax-h3-six-steps-designarena-7-comfyui-license-2026)
- **H3 Singularity:** ComfyUI Wiki claims Apache 2.0, while critics note the base H3 license is not Apache, so the claim is doubtful — [search summary](https://comfyui-wiki.com/ko/news/2026-09-07-h3-singularity)
- **LTX-2.5:** LTX-2.x Community License (Aug 11 2026), worldwide and royalty-free. Entities with ≥ $10M annual revenue need a paid license. Outputs may not be used to train other AI models commercially — [Fuser](https://fuser.studio/articles/best-open-source-video-models)
- **Kandinsky 6.0 Video:** MIT for code, checkpoints and diffusers integration, with no territory restrictions — [ExplainX](https://explainx.ai/blog/kandinsky-6-video-open-source-29b-audio-video-mit-license-2026)
- **Wan 2.1 / 2.2 / Wan-Dancer:** Apache 2.0, with no field, revenue or territory limits — [Fuser](https://fuser.studio/articles/best-open-source-video-models); [Digital Applied](https://www.digitalapplied.com/blog/wan-3-0-reality-check-rumor-vs-shipped)
- **HunyuanVideo 1.5:** `tencent-hunyuan-community` (custom). ComfyUI Wiki says Apache 2.0, which conflicts — [HF card](https://huggingface.co/tencent/HunyuanVideo-1.5); [ComfyUI Wiki](https://comfyui-wiki.com/en/models/hunyuan/hunyuan-1-5). Thunder Compute summarizes it as "free under 100M MAU" — [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)
- **LongCat-Video:** MIT, with no trademark or patent grant — [search summary of official repo](https://arxiv.org/abs/2510.22200v1)
- **daVinci-MagiHuman:** Apache 2.0 per secondary sources and an HF mirror, unverified on the official repo — [HF mirror](https://huggingface.co/Nour-Fayed/daVinci-MagiHuman)
- **CogVideoX:** 2B Apache 2.0, 5B CogVideoX License. **Mochi 1:** Apache 2.0 — [Thunder Compute](https://www.thundercompute.com/blog/best-open-source-ai-video-generation-models)

### Inferences
- For a business operating from France, the H3 family (base, pruned, Singularity, Pika Flex, FastH3, HyperFlow) carries a direct territorial licensing problem. Every source agrees the EU is excluded. Alternatives with clean licenses: LTX-2.5 (fine under $10M revenue), Kandinsky 6 (MIT), Wan 2.2 (Apache) and LongCat (MIT).
- Earlier Tencent Hunyuan community licenses were known to exclude the EU/UK/KR. I could not confirm the HunyuanVideo-1.5 territory clause, so it needs checking before any use.

### Gaps
- I did not read the actual MiniMax H3 LICENSE file on Hugging Face, so the exact wording is unverified (secondary sources agree, though).
- The HunyuanVideo-1.5 LICENSE territory clause is unverified.
- SkyReels V3 and Ovi licenses are not confirmed.

## 5. New in the last 6 months (May–Nov 2026)

### Takeaway
The open releases were: LongCat-Video-Avatar-1.5 (May 21), Wan-Dancer-14B (Jul 10), MiniMax H3 (Aug 3), LTX-2.5 (Aug 11), H3 Singularity (around Sep 7), Kandinsky 6.0 Video (Oct 6), the NVIDIA Open-H3-Regenerate-2K and Sol-H3-VAE (Oct 27–28), Pika H3 Flex (Oct 29), and WanGP's H3 accelerators (FastH3 Omni Oct 21, HyperFlow Flash Nov 8, DMAD Nov 9). Closed in the same period: Wan 2.7, Wan 3.0, Seedance 2.5, FLUX 3 video, MAGI-2 preview, HeyGen Video 1 and H3 Max.

### Cited Findings
- Dates and items as listed in sections 1–2 — [WanGP](https://github.com/deepbeepmeep/Wan2GP); [Kombitz Oct 31 2026](https://www.kombitz.com/2026/10/31/ai-image-video-model-news-roundup-october-31-2026/); [ComfyUI Wiki LTX-2.5](https://comfyui-wiki.com/en/news/2026-08-11-ltx-2-5-open-weights-release); [ExplainX Kandinsky 6](https://explainx.ai/blog/kandinsky-6-video-open-source-29b-audio-video-mit-license-2026); [Digital Applied](https://www.digitalapplied.com/blog/wan-3-0-reality-check-rumor-vs-shipped); [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- FLUX 3 Video is API-only; an open FLUX 3 Dev backbone was "announced but not released" — [Fuser](https://fuser.studio/articles/best-open-source-video-models)

### Inferences
- Watch list: a possible FLUX 3 Dev open release, Wan 3.0 weights (none so far), and WanGP integration of Kandinsky 6 and of Open-H3-Regenerate-2K.

### Gaps
- Nothing was found for Nov 1–10 2026 beyond the WanGP changelog entries.

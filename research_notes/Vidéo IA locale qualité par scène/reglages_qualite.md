# Quality-maximising settings and post-processing for MiniMax H3 and LTX-2.5 in WanGP (as of 2026-11-10)

Research date: 2026-11-10. Context: WanGP v19.25, RTX 5070 Ti 16 GB, Windows 11. Production preset: `minimax_h3_ref2va_pruned_pdd`, 704x1280 decoded with `h3_vae*1.5` to 1056x1920, 24 fps, audio on; LTX-2.5 in NVFP4; final H.264 CRF 19. Quality only, render time ignored.

Caveat on sources: almost no controlled quality metrics (VBench, LPIPS, identity scores) exist for H3 or LTX-2.5 settings. Most evidence is author or vendor claims, community guides, and one-off Reddit/forum reports. This is flagged item by item below.

## 1. Precision: bf16 / fp8 / int8 / NVFP4 / GGUF, and pruned vs full H3

### Takeaway
"Pruned" H3 (the multimodalart fold) is numerically almost identical to the released model. It is a reparametrisation, not a lossy distillation, so it is not a quality lever. The precision ranking that the evidence supports is bf16 ≥ fp8 scaled / int8 (ConvRot) > NVFP4 (post-training). NVFP4 is the most likely source of visible loss on LTX-2.5. Nobody has published a direct H3 or LTX-2.5 precision benchmark.

### Cited Findings
- **What the pruned H3 changes.** It folds the AdaLN input projections (`adaln_proj.linear`, Linear 2688→96768, in each of 50 blocks, plus `norm_out.linear`) onto a rank-8 affine subspace, with a 1025-entry interpolated timestep table. That covers 13.03B parameters, 39.3% of the checkpoint. The DiT goes from 33.14B to 20.11B parameters per partition. The Qwen3-VL text encoder is truncated (layers 51-63 and the LM head dropped) — [multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- **Fidelity of the pruned fold.** Worst-case projection error is 1.715e-3 against 1.751e-3 for the released weights, so the pruned version is closer to exact float64 in 51 of 51 modules. Same-seed video latents give cosine 0.99128 pruned vs released. The control (released, attention backend swapped) gives 0.99248, so the pruning difference is about the size of an attention-backend change. Audio latents give cosine 0.99911 against a 0.99964 control. The author says "no visible change in output", but the card shows no visual A/B — [multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- **int8 with ConvRot on H3.** Video latent cosine is 0.9893, against 0.9940 for the bf16 control. The author calls compilation "not optional" for int8 — [multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- **Official checkpoint precision.** The official H3 checkpoints are BF16 and "CFG-distilled" — [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- **Precision options in WanGP.** WanGP lists "Pruned 20B" as joining H3 "for those who prefer its look" (v19.25, 2026-11-08). WanGP supports int8, fp8, gguf, NV FP4 and Nunchaku checkpoints, and its README makes no quality comparison between them — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- **Community claims on H3 GGUF and FP8.**
  - GGUF Q5_K_M is called "closest-to-full quality" on 24 GB and Q4_K_M "near-full" on 16 GB, with no measured score behind either claim.
  - Dynamic FP8 in vLLM-Omni scored SSIM 0.881 and PSNR 26.6 dB against BF16. That run was combined with Cache-DiT, so the figures may not isolate FP8.
  - NVFP4 has no quality data.

  [awesome-minimax-H3 performance guide](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **H3 VAE precision.** The H3 audio VAE "must stay fp32 or A/V desyncs" (community guide) — [awesome-minimax-H3 performance guide](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **Attention backend and Sage.** Sekushi recommends the bf16 file with Comfy Kitchen attention to fix morphing or garbled text seen with Sage Attention. Comfy Kitchen attention does not support the `int8_convrot` files (third-party blog, 2026-10-11) — [Sekushi H3 settings](https://sekushi.ai/blog/minimax-h3-settings)
- **Precision tests on other models.**
  - FLUX image tests (Jan 2026): FP8 scaled was "nearly indistinguishable" from BF16, while NVFP4 showed "some quality degradation" — [FurkanGozukara discussion #357](https://github.com/FurkanGozukara/Stable-Diffusion/discussions/357)
  - A video-model ablation found that post-training NVFP4 quantisation caused a clear quality drop, while models trained with NVFP4 in mind stayed close to BF16 — [LongLive-2.0 arXiv](https://arxiv.org/pdf/2605.18739)
- **LTX-2.3 NVFP4 reports.** Users on r/StableDiffusion (2026-03) described LTX-2.3 NVFP4 as "noticeably worse output than the DEV version, texture smearing and motion artifacts" (prior note, anecdotal) — [r/StableDiffusion snapshot](https://reddit.sentinel-team.org/posts/1s0bi7r/snapshots/2026-03-28T05%3A33%3A01.316841Z)

### Inferences
- Keep the pruned H3. Its measured deviation is about the size of an attention-backend change, and the 20B DiT is far easier to offload on 16 GB VRAM plus RAM.
- The real quality lever for H3 is the compute dtype of the DiT. bf16 with offload is best, and int8 ConvRot is close behind (cosine 0.989 vs 0.994). Avoid NVFP4 and GGUF below Q8 for final renders.
- LTX-2.5 in NVFP4 is the weakest link in the current pipeline from a quality standpoint. For finals, switch to the bf16 or fp8-scaled (or "mixed") dev/distilled checkpoint with RAM offload. Time is not a constraint, so the only cost is longer renders.
- Use the full Qwen3-VL text encoder rather than the INT8 distilled text encoder (WanGP v19.14) if prompt adherence suffers. No quality data exists for that encoder either way.

### Gaps
- No published side-by-side (VBench, LPIPS or visual) of bf16 vs fp8 vs int8 vs NVFP4 vs GGUF Q8 for H3 or LTX-2.5.
- The "Pruned 20B" in WanGP v19.25 is not described on the WanGP page. I assume it is the multimodalart fold or a derivative, but I could not confirm this.

## 2. Steps and distillation: 50-step H3 vs PDD 8, HyperFlow Flash, DMAD; sampler, CFG, shift, negatives

### Takeaway
The released H3 weights are CFG-distilled, so guidance stays at 1 and negative prompts do nothing or hurt. Quality rises with steps on the non-accelerated model: 20 is the community baseline, 25-32 helps reference adherence and audio, and up to 50 helps fine detail. Distilled accelerators (PDD, HyperFlow, DMAD, Turbo) consistently degrade audio first, then fast motion and detail. For maximum quality, the best H3 setup is the non-accelerated Ref2VA at 30-50 steps with res_multistep/simple and shifts 12/3. If an accelerator is kept, DMAD 8 or PDD 8 beats HyperFlow 4/6.

### Cited Findings
- **Official step and sampler settings.** The MiniMax model card gives no step, sampler or shift values. It says "The released checkpoints are CFG-distilled Omni Transformer model weights" and "full attention only" — [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- **Step counts (Sekushi, 2026-10-11).**
  - 20 steps is the default. 12-16 steps is enough for simple shots.
  - About 25 steps when reference-following drifts. Fine repeating detail improves up to about 50 steps.
  - Speech is "weakest at 8 steps, usable from about 12".
  - More steps do not add sharpness beyond native size.

  [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
- **Vanilla H3 step count.** Vanilla H3's original step count is 50 (WanGP note on Pika H3: 6 steps "instead of vanilla H3's original 50"). The multimodalart diffusers example also uses 50 steps — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP); [multimodalart/MiniMax-H3-Pruned](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- **Steps vs time and audio (community).**
  - "Minimax team recommends 30-50 steps; ComfyUI's 20 is a speed compromise." I could not verify this against an official MiniMax page.
  - "32 steps improves audio/motion for only +15-20% time vs 20."
  - Ref2VA needs at least 20 steps for decent audio, and 25 is a common floor.

  [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **Accelerator quality costs (community).**
  - 4-step distillation hurts "the quietest/sustained vocal registers", regresses accents toward generic, and smears hard cuts into dissolves.
  - "Audio degrades under Turbo" is consistent across threads. The recommended workflow is Turbo for drafts, then the same seed without Turbo for the final.

  [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **Turbo LoRA results.** The ComfyUI turbo (lightx2v) LoRA gives "slightly lower sound and motion quality". At 4 steps the reference "may be barely applied". A speed-up clip is a different clip from the 20-step one at the same seed — [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
- **WanGP accelerator notes (README).**
  - DMAD: "choose 4 for speed or 8 for better quality" (2026-11-09).
  - HyperFlow Flash: 4/6/8 steps, 6 by default, about 1/3 faster than PDD 8. H3 LoRAs work, "though their effect can be weaker" (2026-11-08).
  - PTD RefAsymOPD: "another high-quality PDD 8 steps", a different LoRA per step, about 11 GB extra RAM (v18.84, 2026-10-27).
  - FastH3 Omni: "quality of the PDD process with VSA sparse attention".
  - Pika H3 Flex claims better aesthetics, anatomy and audio, per Pika's own evaluations.
  - No independent quality measurement exists for any of these.

  [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- **CFG and negative prompts.**
  - Keep CFG at 1. At CFG 1, negative prompts are unused, and raising CFG doubles compute with "no benefit documented" — [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
  - ComfyUI's H3 prompt guide says not to use negative prompts. `BasicGuider` runs at cfg 1 with no negative branch, "so ban lists add the unwanted concepts"; state what should appear instead — [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **Shift.**
  - The default is video shift 12 and audio shift 3. ComfyUI FastH3 templates use 10/3, and the lightx2v 768p LoRAs use 6/3.
  - An 8-step speed-up build run at video shift 3 instead of 10 shows grid artifacts.

  [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
- **Audio shift.** Audio shift 6 "helps loudness" but runs about 9 dB hot on whispers. I found no separate "audio guidance" parameter in any source, which fits the CFG-distilled weights — [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **Sampler and scheduler.**
  - res_multistep with the simple scheduler is the default in all ComfyUI H3 templates. Avoid the `normal` scheduler, which reportedly applies the shift twice. Accelerator LoRAs may expect euler, so use the LoRA author's settings — [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
  - euler/simple, er_sde and euler/beta also appear, but none is ranked on quality — [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)
- **Caching and attention speed-ups.** EasyCache is "~lossless vs final" but cannot combine with Turbo LoRAs. Spectrum is lossy and "tanks quality" near 10 steps. Sol-Attn is "bit-identical" — [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)

### Inferences
- **Max-quality H3 recipe.** Use the non-accelerated pruned Ref2VA in bf16 (or int8 ConvRot) at 30-50 steps, CFG 1, no negative prompt, res_multistep/simple, shift 12/3, and no step cache. This needs an "H3 Ref2VA pruned" preset without the PDD LoRA, plus a custom step count. WanGP exposes Custom Sigmas for H3 (v18.888).
- If a distilled path is kept for practical reasons, prefer DMAD 8 or PDD 8 / PTD RefAsymOPD 8 over HyperFlow 6/4, because more steps means better audio in every report.
- The cheapest quality check is an A/B on the same seed and prompt: PDD 8 vs vanilla 30 steps. Look at lips and teeth, held vowels, and fast hand motion. Run one test at a time, per the user's budget rule.

### Gaps
- No official MiniMax recommended step, sampler or shift values were found. The model card is silent, and the "30-50 steps" claim is second-hand.
- No measured comparison of PDD vs HyperFlow vs DMAD vs vanilla on H3.
- No WanGP doc on how the "audio guidance" field, if any, behaves with CFG-distilled H3.

## 3. Resolution and upscaling to 1080x1920: native vs Regenerate 2K vs VAE upsampling vs Sol-H3-VAE vs VSR

### Takeaway
H3's native size is 768 px on the short side (768x1344 for 9:16), so 704x1280 is about 13% below native pixel count. The H3-native refiner, Regenerate 2K IC in WanGP, re-denoises with the H3 transformer itself. The WanGP author claims it gives "better identity preservation and fewer hallucinated details" than earlier Regenerate passes, and it is the most model-consistent route to 1080x1920. No source compares it with SeedVR2, FlashVSR or VAE upsampling. Sol-H3-VAE is a faster, slightly less exact decoder, not a quality upgrade.

### Cited Findings
- **Native resolution.** "The shorter side is set to 768 pixels by default", and the official 2K module (H3-Regenerate-2K) is not open-sourced — [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- **Size limits (Sekushi).** Native is about 1 MP with a short side of 768. The upper limit is 768x1344 per ComfyUI, and 1376x768 exceeds it. Larger sizes are unsupported by the open files — [Sekushi](https://sekushi.ai/blog/minimax-h3-settings)
- **ComfyUI guidance.** "Use the native resolution and frame count", with 1344x768 for 16:9, multiples of 32, and length 17k+5 frames (124 = about 5 s) — [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **WanGP Regenerate passes (README).**
  - Regenerate 2K IC (v19.25, 2026-11-09): "better identity preservation and fewer hallucinated details" than before. Up to 2560x1440 in 3 extra steps (6+3 HyperFlow Ref2VA or 8+3 Ref2VA preset). Tiling "works much better here than before."
  - Regenerate 2K Detail: "faces can change."
  - Regenerate 2K 2 Phases: "enhances fine detail while preserving the first pass's soundtrack."
  - Face Refiner (v19.25): sharpens lips, teeth, skin and eyes on up to 5 faces. "Best on close-ups; mouth movements can change."

  [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- **NVIDIA Open-H3-Regenerate-2K.**
  - A refiner LoRA on the frozen H3 transformer (rank 576 on 312 linears), taking a 768p draft (1344x768, 121 frames) to 2560x1440 in 3 Euler steps.
  - Sigmas [0.909375, 0.857143, 0.666667, 0], CFG 1, init = 0.0906·upscaled + 0.909·noise.
  - The card contains no quality metrics, no comparison with SeedVR2, FlashVSR or native, and no limitations section, only speed numbers.

  [Open-H3-Regenerate-2K](https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K)
- **Sol-H3-VAE.** A distilled decoder at PSNR 45.4 dB on held-out latents and 38.2 dB on a generated 768p clip versus the H3 VAE, "close to the H3 VAE decoder but not identical". It "returns the same frames", meaning no upsampling. On an RTX 5090 at 768p it takes 5.0 s vs 12.5 s. It is non-causal and needs about 24 GiB at 720p for 5 s — [Sol-H3-VAE](https://huggingface.co/Efficient-Large-Model/Sol-H3-VAE)
- **External VSR (prior research).**
  - SeedVR2 is the "quality reference" for degraded sources, and FlashVSR is best on clean sources (vendor blog).
  - WanGP offers RelayVSR (x2 default), FlashVSR+ Turbo ("restores richer detail"), SeedVR, Lanczos and RIFE.
  - No measured comparison exists.

  [Upsampler blog](https://upsampler.com/blog/seedvr-vs-flashvsr-ai-video-super-resolution-2026); [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- **Upscalers the community guide mentions.** RealESRGAN 2x and RTX Super Resolution are mentioned, with no quality data. SeedVR2, FlashVSR and Sol-H3-VAE are not covered — [awesome-minimax-H3](https://github.com/wildminder/awesome-minimax-H3/blob/main/guides/minimax-h3-performance.md)

### Inferences
- **Step 1: generate at the native 768x1344 (9:16 grid).** This adds about 14.5% more pixels than 704x1280 at no theoretical cost in coherence, since it is the trained size. 1344/768 = 1.75 vs 9:16 = 1.778, so a final 1080x1920 needs a slight crop (a few px horizontally) or a pad. This is my inference from the cited limits.
- **Step 2: upscale with a generative H3-native refine.** Regenerate 2K IC at 1080p, or a 1.5x target ≈ 1152x2016 then downscale to 1080x1920, should beat the VAE `h3_vae*1.5` decode for real detail. The VAE path can only interpolate decoded detail and adds no new detail. This is an inference: no source measures `h3_vae*1.5`, and it is not documented in the sources read.
- **Face fidelity.** IC is the variant claimed to preserve identity. Avoid "Regenerate 2K Detail" ("faces can change") and use Face Refiner only on close-ups while checking lip sync.
- **External VSR as a safe fallback.** If the refine changes the face, use FlashVSR+ or SeedVR2. These are non-generative with respect to identity, so they cannot change the person but add less real detail.
- **Sol-H3-VAE.** Don't use it for quality, since it is a lossy distillation of the decoder. Keep the original H3 VAE.

### Gaps
- No metric or visual comparison of Regenerate 2K IC vs SeedVR2 vs FlashVSR vs RelayVSR vs VAE upsampling, on detail or identity.
- `h3_vae*1.5` (the WanGP VAE-upsampling decode) is not documented in any source I read.
- TaoMate-FVSR: no sources found.

## 4. LTX-2.5 quality settings: dev vs distilled, latent upscaler, two-stage, steps/CFG

### Takeaway
For maximum quality, use the LTX-2.5 dev checkpoint in a two-stage pipeline. Stage 1 runs at half resolution with about 30-40 steps and CFG about 3-4. Then apply the official x2 latent spatial upscaler. Stage 2 runs about 3-4 steps with the distilled LoRA and no CFG. Use bf16 or fp8 rather than NVFP4. The step and CFG numbers vary by source.

### Cited Findings
- **Two-stage recipes.** The distilled checkpoint runs at CFG 1 with a fixed sigma schedule: stage 1 takes 8 steps, then the x2 spatial upscaler, then stage 2 takes 4 steps with no guidance. Dev two-stage needs the spatial upscaler plus the distilled LoRA for stage 2 — [Lightricks/LTX-2.5-Diffusers](https://huggingface.co/Lightricks/LTX-2.5-Diffusers); [LTX blog workflow guide](https://ltx.io/blog/ltx-2-image-to-video-text-to-video-workflow) (via search summary; pages not fully read)
- **Dev settings.** Dev "(full, 30 steps, CFG 3)" is one community setup. Other sources put CFG at about 3.0-3.5 or about 4, and the LTX blog cites 40 steps for a guided two-stage baseline. The sources conflict — [ltx23.app dev vs distilled](https://ltx23.app/blog/ltx-2-5-distilled-vs-dev); [LTX blog: model distillation](https://ltx.io/blog/what-is-model-distillation) (search summary; direct fetch failed)
- **Dev vs distilled gap.** One blog says the distilled vs dev quality gap "has narrowed" and recommends distilled unless you need dev two-stage quality. The GGUF card recommends the official stage-2 latent upscalers "for maximum fidelity" — [ltx23.app](https://ltx23.app/blog/ltx-2-5-distilled-vs-dev); [unsloth/LTX-2.5-GGUF](https://huggingface.co/unsloth/LTX-2.5-GGUF)
- **LTX-2 architecture (prior research).** LTX-2 runs stage 1 at half resolution, then a 2x LatentUpsampler, then stage 2 at full resolution (3 steps, no CFG, distilled LoRA). Dimensions must be divisible by 32 — [LTX-2 two-stage deep dive](https://instagit.com/Lightricks/LTX-2/ltx-2-two-stage-generation-process/)
- **NVFP4 on LTX.** Users reported texture smearing and motion artifacts with LTX-2.3 NVFP4 vs dev bf16 (anecdotal, 2026-03) — [r/StableDiffusion snapshot](https://reddit.sentinel-team.org/posts/1s0bi7r/snapshots/2026-03-28T05%3A33%3A01.316841Z)
- **WanGP coverage.** The WanGP README gives no LTX-2.5 quality guidance (steps, CFG, dev vs distilled). It only gives VAE speed-ups (v18.21) — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- For finals, use dev bf16 or fp8, two-stage, with the official x2 latent upscaler. Use about 30-40 stage-1 steps at CFG about 3-4. Then test one value at a time.
- Swapping NVFP4 for fp8 or bf16 is likely the single biggest LTX quality gain available.

### Gaps
- No official Lightricks benchmark of dev vs distilled for 2.5. The ltx.io distillation post could not be fetched (header overflow).
- No sourced recommendation for LTX-2.5 audio guidance or STG values.

## 5. Prompting H3 for quality

### Takeaway
MiniMax ships two official prompt-writing guides in the HF repo: base (T2VA/I2VA/FL2VA) and reference (Ref2VA). ComfyUI's summary describes a structured format:
- an English scene description, then numbered timed shots with single cut timestamps;
- `overall_soundscape` and `non_diegetic_music` fields;
- dialogue in `<d>` tags with speaker IDs;
- no negative prompts.

MiniMax recommends running prompts through its H3-Context-IR rewriter, which is proprietary.

### Cited Findings
- **Official guides and rewriter.** The model card links `VIDEO_PROMPT_WRITING_GUIDE_base_en.md` and `VIDEO_PROMPT_WRITING_GUIDE_ref_en.md` and recommends H3-Context-IR in the pipeline. The Ref2VA example wraps spoken lines in `<d>` tags. H3 supports 11 languages stably and up to 9 images, 3 videos and 3 audio references (12 files) — [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- **Prompt structure.**
  - Scene first, then `[Shot 1]`, `[Shot 2] At 00:03.500, the camera cuts to...`, using single timestamps, not ranges.
  - Start a new shot when the subject, space, viewpoint or time changes. Small reframes stay as camera motion.
  - Write in English, and keep on-screen text verbatim in quotes.

  [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **Audio fields.**
  - `overall_soundscape` takes 1-4 sentences of ambience and SFX.
  - `non_diegetic_music` takes 1-3 sentences of score, or N/A.
  - Dialogue and diegetic music go inside the shot paragraphs. Fill both fields explicitly to prevent unwanted speech.

  [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **Dialogue tags.**
  - Use speaker IDs `(S1)` outside `<d>`, and a language tag plus verbatim words inside.
  - Keep normal punctuation, and avoid ellipses, which hurt intelligibility.
  - Off-screen voice: write "says in an off-screen voiceover" and state that the lips stay closed.

  [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **Ref2VA prompting.**
  - Use `<Subject N>` and `<Picture N>` labels, plus retention fields (`fully_preserved`, `partially_preserved`).
  - Label audio references `fully_copy`, `partially_copy`, `reference` or `weak_reference`.
  - Describe each panel of a reference sheet.

  [ComfyUI H3 prompt guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3-prompt-guide.md)
- **Prompt length.** One secondary source gives a maximum prompt length of 7000 characters. Section-order advice from a third party: References → Retention → Scene → Timeline → Camera → Audio → Constraints — [Kapwing](https://www.kapwing.com/resources/how-to-prompt-minimax-h3-hailuo-3-0-a-guide-for-ai-video-creators/) (search snippet only)

### Inferences
- Rewrite the Cosmos prompt templates into the official structured format. Use explicit `fully_preserved` for the face reference and filled audio fields. This is free and well documented, while the effect of most other levers is unproven.

### Gaps
- The raw official MiniMax guide files were not read directly, only ComfyUI's summary. There is no measured quality effect of prompt structure.

## 6. Final encoding: H.264 CRF 19 vs alternatives

### Takeaway
CRF 18-19 x264 is near visually lossless for most content. The most likely visible issue in AI video is banding in smooth gradients (skies, skin, bokeh), which 10-bit encoding reduces. But 10-bit H.264 has poor device and browser support. A safe quality upgrade is CRF 16-17 with `-preset slow` (or slower), 8-bit yuv420p for delivery. Keep an archival master at a higher quality if needed.

### Cited Findings
- CRF 18 is commonly described as visually lossless, and the sane x264 range is 18-28 with a default of 23 — [slhck CRF guide](https://slhck.info/video/2017/02/24/crf-guide.html)
- 10-bit encoding removes banding with a slightly larger file (x265 bug thread). The benefit is strongest on gradient-heavy content. 10-bit H.264 playback support is uneven — [x265 banding issue](https://bitbucket.org/multicoreware/x265_git/issues/266/banding-problem); [Doom9 10-bit vs 8-bit](https://forum.doom9.org/archive/index.php/t-165936.html)
- Platforms (TikTok, Instagram) re-encode all uploads. Claimed targets are about 2-4 Mbps (TikTok) and at least 10 Mbps for Reels, from unverified blogs — [thepostflow export settings](https://thepostflow.com/post-production/post-production-workflows/export-settings-youtube-instagram-tiktok/)

### Inferences
- Moving from CRF 19 to CRF 16-17 with a slow preset is a cheap, safe gain. For web delivery, 8-bit H.264 stays the most compatible choice. H.265 10-bit is only worth it if every playback target supports it.
- Add a little film grain (`-tune film` or slight noise) before encoding if banding shows. This is an inference, not sourced.

### Gaps
- No measurement of visible loss at CRF 19 specifically on H3 or LTX output.

## 7. Frame interpolation vs native 24 fps

### Takeaway
H3 is trained and output at 24 fps. Interpolation adds no information and can create artifacts on fast motion or occlusion. GIMM-VFI is reported to ghost less than RIFE, but there is no rigorous comparison. For quality, stay at native 24 fps unless smoother motion is explicitly wanted.

### Cited Findings
- H3 outputs at 24 fps — [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- GIMM-VFI is reported to hold up better than RIFE on fast pans and occlusions, where RIFE ghosts and smears. Community timings: RIFE about 9 s vs GIMM 25-53 s on one clip. On calm footage the results are "hard to tell apart" — [comfy.icu GIMM-VFI node](https://comfy.icu/node/GIMMVFI_interpolate)
- Reddit anecdote: GIMM-VFI "has fewer artifacts than RIFE" (single user) — [r/StableDiffusion snapshot](https://reddit.sentinel-team.org/posts/1r84aes/snapshots/2026-02-27T15%3A30%3A06.548433Z)
- VideoHelp: "many VFI projects are only marginally better or worse than RIFE" — [VideoHelp forum](https://forum.videohelp.com/showthread.php?p=2758942)
- WanGP offers RIFE but does not list GIMM — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- Keep native 24 fps. The user's own 24 fps rule (normal shutter, slow motion at 120 fps played back at 24) already matches the model's training distribution. If interpolation is ever wanted, use GIMM-VFI outside WanGP and avoid RIFE on fast action.

### Gaps
- No controlled 24→48 fps quality test on AI-generated video.

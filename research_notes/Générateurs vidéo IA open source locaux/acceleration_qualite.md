# Speeding up local AI video generation on a consumer GPU (RTX 5070 Ti, 16 GB, Blackwell sm_120, Windows 11), as of November 2026

Research date: 2026-11-10. User context: WanGP (deepbeepmeep/Wan2GP), LTX-2.5 NVFP4 and MiniMax H3, 4-10 s clips at 704x1280 upscaled to 1080x1920 with audio. Each clip takes about 7-15 min, and the PC hard-resets at peaks around 300 W.

Source caveat: most speedup figures come from the authors themselves (papers, vendor blogs) or from Reddit anecdotes. I found no independent, controlled benchmark on an RTX 5070 Ti for any of the techniques below.

## Quantization: NVFP4, FP8, INT8, GGUF, SVDQuant/Nunchaku. Speed vs quality, and which models have such weights

### Takeaway
NVFP4 is the fastest format on Blackwell. NVIDIA claims up to 3x speed and 60% less VRAM, versus 2x and 40% for FP8. Community users report visible quality loss with NVFP4 on LTX-2.3 (smeared textures, motion artifacts), so FP8 or INT8 is the safer quality choice whenever the model fits in 16 GB. WanGP already loads int8, fp8, GGUF, NVFP4 and Nunchaku checkpoints.

### Cited Findings
- NVIDIA (CES, 2026-01-05): in ComfyUI on RTX 50, NVFP4 gives up to 3x speed with 60% less VRAM, and NVFP8 gives 2x with 40% less VRAM. General ComfyUI optimizations added about +40% over the preceding months. The baseline precision is not stated, and the post says nothing about quality — [NVIDIA blog, CES 2026](https://blogs.nvidia.com/?p=88691)
- NVIDIA says NVFP4/NVFP8 checkpoints exist for LTX-2 (Lightricks), FLUX.1/FLUX.2, Qwen-Image and Z-Image — [NVIDIA blog, CES 2026](https://blogs.nvidia.com/?p=88691)
- The GDC 2026 follow-up gives up to 2.5x and 60% less memory for FLUX.2 Klein, with NVFP4 support for LTX-2.3 then still announced as "coming soon" — [NVIDIA blog GDC](https://blogs.nvidia.com/blog/rtx-ai-garage-flux-ltx-video-comfyui-gdc/)
- WanGP supports "int8, fp8, gguf, NV FP4 and Nunchaku" checkpoints. It added an NVFP4 LTX-2 checkpoint in v10.98x (March 2026) and a FastH3 Omni NVFP4 variant on 2026-10-21 (v18.21), aimed at near-real-time generation on an RTX 5090 — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP); [Wan2GP mirror (March 2026)](https://gitee.com/github-awesome/Wan2GP)
- WanGP v19.14 (2026-11-04) ships a distilled INT8 Qwen3-VL-4B text encoder for H3: about 5 GB instead of 27 GB, and roughly half the encoding time — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- LTX-2.3 NVFP4 quality, anecdotal reports on r/StableDiffusion: "noticeably worse output than the DEV version, texture smearing and motion artifacts", and "the quality is shit, keep the dev bf16". Another user found INT8 better than NVFP4 on a 3080 Ti, which has no FP4 hardware — [r/StableDiffusion snapshots via search, 2026](https://reddit.sentinel-team.org/posts/1s0bi7r/snapshots/2026-03-28T05%3A33%3A01.316841Z); [Comparison NVFP4 vs NVFP8 LTX-2](https://wavespeed.ai/blog/posts/blog-ltx-2-nvfp4-vs-nvfp8)
- Community "fp8mixed" and "nvfp4mixed" variants of LTX-2.3-distilled-1.1 (2026-04-14) keep some layers at higher precision to limit the loss — [Hippotes/LTX-2.3-various-formats](https://hugface-5b9.pages.dev/Hippotes/LTX-2.3-various-formats)
- SVDQuant/Nunchaku: the official releases found are 4-bit image models (FLUX, Qwen-Image, Qwen-Image-Edit). The README lists "Video Model support" without confirming a Wan model is available. A May 2026 paper applies SVDQuant+GPTQ (W4A4) to Wan2.2-I2V-A14B, but it is academic work and not a Nunchaku release — [nunchaku GitHub](https://github.com/nunchaku-ai/nunchaku); [arXiv 2605.27003](https://arxiv.org/html/2605.27003)
- TurboDiffusion uses W8A8 quantization. RTX 5090 and 4090 cards must use the `-quant` checkpoints with `--quant_linear` (above 40 GB, use the non-quantized version) — [TurboDiffusion GitHub](https://github.com/thu-ml/TurboDiffusion)

### Inferences
- On a 16 GB card running LTX-2.5, NVFP4 saves VRAM and time. If a test clip shows smearing, the first thing to try is an FP8 or INT8 ("mixed") variant of the same model before reaching for other optimizations.
- The INT8 H3 text encoder (v19.14) is a free win for both time and RAM. Check that the local install is on v19.14 or later.

### Gaps
- I found no controlled quality measurement (VBench, LPIPS) comparing NVFP4, FP8 and BF16 for LTX-2.5 or H3.
- I could not confirm whether an NVFP4 checkpoint of MiniMax H3 exists other than FastH3 Omni.
- No GGUF Q4-Q8 benchmark for LTX-2.5 or H3 turned up.

## Step distillation and accelerator LoRAs: lightx2v, CausVid, Self-Forcing, rCM, DMD2, LTX distilled, TurboDiffusion, newer 2026 methods

### Takeaway
Step reduction gives the largest gain by far (claimed 5-24x). The H3 and LTX ecosystems in WanGP already ship their own distilled accelerators (HyperFlow Flash in 4/6/8 steps, DMAD, PDD, LTX Distilled 1.1). The known trade-offs are slowed or reduced motion and a slight loss of detail.

### Cited Findings
- LightX2V: step distillation takes 40-50 steps down to 4 with CFG disabled, for about 20-24x (project claim) — [LightX2V docs](https://lightx2v-en.readthedocs.io/en/latest/method_tutorials/step_distill.html)
- Known lightx2v weak spot on Wan2.2 I2V: the stock LoRAs "tend to turn scenes into slow motion", and community "Slow-Mo fix" LoRAs exist. Pusa notes that a higher alpha gives less motion, recommending 1.5 for high-noise and 1.4 for low-noise — [HF rzgar Slow-Mo Fix](https://huggingface.co/rzgar/Wan2.2_I2V_LightX2V_Slow-Mo_Fix); [Pusa Wan2.2](https://huggingface.co/RaphaelLiu/Pusa-Wan2.2-V1)
- TurboDiffusion (Tsinghua/Shengshu/Berkeley, arXiv Dec 2025) combines rCM (step distillation), SLA (sparse-linear attention on top of SageAttention) and W8A8. Measured end-to-end on one RTX 5090, excluding text encoding and VAE: Wan2.1-T2V-14B-720P goes from 4767 s to 24 s, Wan2.2-I2V-A14B-720P from 4549 s to 38 s, and Wan2.1-1.3B-480P from 184 s to 1.9 s. Authors claim "comparable quality" — [TurboDiffusion GitHub](https://github.com/thu-ml/TurboDiffusion); [arXiv 2512.16093](https://arxiv.org/abs/2512.16093v1)
- The TurboDiffusion repo also has a TurboH3-FL2VA-I2VA checkpoint (best at 768p) and a `turbot2va` folder for LTX-2 distillation (separate environment). Broader MiniMax-H3 acceleration is on the roadmap. It recommends torch 2.8.0 ("higher versions may cause OOM") and does not mention Windows. A community ComfyUI node exists (anveshane/Comfyui_turbodiffusion). The H3 licence excludes the US, the EU, the UK and South Korea — [TurboDiffusion GitHub](https://github.com/thu-ml/TurboDiffusion)
- MiniMax H3 accelerators in WanGP:
  - HyperFlow Flash offers 4, 6 or 8 steps. The 6-step default denoises about a third faster than the 8-step PDD (v19.25, 2026-11-08).
  - pDMD image: 2 steps is about 2.5x faster than 8.
  - DMAD accelerators: 4 or 8 steps for FL2VA and Ref2VA, with sound (2026-11-09).
  - Pika H3 runs 6 steps instead of 50 (v18.888, 2026-10-29).
  - New H3 accelerator LoRAs (FL2V v1.3, Ref2V v1.1, 2026-10-27).
  - [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- WanGP: the extra denoising time caused by LoRAs is now down to "around 10%" (v19.25) — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- LTX-2.3 Distilled 1.1 was released by Lightricks and integrated into WanGP v11.34 (2026-04-20), claiming better audio and visuals — [banodoco/Wan2GP fork, notes v11.34](https://github.com/banodoco/Wan2GP)
- LTX-2.3 on an RTX 5090 (Windows 11, torch 2.10+cu130, SageAttention 2.2), NVFP4, 8 steps, CFG 1, 2x spatial upscale: about 54 s with the distilled model vs 57 s with dev plus the distill LoRA. Same speed, so the choice comes down to quality — [r/StableDiffusion snapshot](https://reddit.sentinel-team.org/posts/1rmajss/snapshots/2026-03-08T21%3A07%3A13.941352Z)
- An LTX community guide describes the distilled model or LoRA as "8 steps instead of 20, slight quality trade-off" — [LTX-2 Full vs Distilled](https://crepal.ai/blog/?p=5057)

### Inferences
- For H3 in WanGP, HyperFlow Flash in 6 steps (or DMAD in 4 steps) is the most direct lever: about -33% denoising time compared with 8-step PDD, with no extra install.
- TurboDiffusion is the most aggressive option (around 100x), but only for Wan2.1/2.2 and an experimental H3 checkpoint. Its environment (torch 2.8, Linux-oriented) does not fit WanGP on Windows, and it is not integrated into WanGP.
- I found no 2026 source updating CausVid, Self-Forcing or DMD2 for LTX-2.5 or H3. These methods were mostly applied to Wan2.1 and 2.2.

### Gaps
- I found no quality measurement (VBench) for the H3 accelerators (HyperFlow, DMAD, PDD).
- I found no data on rCM or Self-Forcing applied to LTX-2.5.

## Attention acceleration: SageAttention 2/2++/3 (FP4), SpargeAttn, Radial Attention, STA, FlashAttention 3/4. Support on RTX 50 under Windows

### Takeaway
SageAttention 2.2 works on RTX 50 under Windows through community wheels (woct0rdho, sm_120 included) and gives about 30% faster sampling, the most reliable attention gain. SageAttention 3 (FP4) promises about 5x at the kernel level on an RTX 5090, but its Windows wheels are unofficial and WanGP's notes do not mention it. The sparse methods (Radial, SpargeAttn, STA) give 1.8-3.5x, but they are mostly tied to Wan, Hunyuan or Mochi and are absent from WanGP, except VSA sparse attention for FastH3 Omni.

### Cited Findings
- SageAttention3 (thu-ml, arXiv 2505.11594): 1038 TOPS on an RTX 5090, "5x" faster than FlashAttention. It requires FP4 tensor cores (Blackwell). The paper reports end-to-end speedups on HunyuanVideo on an RTX 5090. The 2.4-3x end-to-end figure comes only from a secondary summary — [arXiv 2505.11594](https://arxiv.org/html/2505.11594v3); [Emergent Mind](https://www.emergentmind.com/topics/sageattention3)
- SageAttention 2.2 on native Windows for Blackwell: "~30% faster diffusion sampling" (ComfyUI discussion #11583) — [ComfyUI discussion #11583](https://github.com/Comfy-Org/ComfyUI/discussions/11583)
- The woct0rdho/SageAttention fork targets sm75/80/86/89/90/120 (RTX 20-50). Install triton-windows first, then the wheel matching your PyTorch version — [woct0rdho release v2.2.0-windows.post3](https://newreleases.io/project/github/woct0rdho/SageAttention/release/v2.2.0-windows.post3)
- Unofficial Windows wheels for "Sage-Attention 2.2 & 3-1.0" built with CUDA 13.2. sm_120 support was not verified — [ussoewwin/Sage-Attention-for-Windows](https://huggingface.co/ussoewwin/Sage-Attention-for-Windows)
- A reported failure: a 2.2.0+cu130torch2.10 wheel crashing at import ("_fused DLL load failed") on an RTX 5090 — [HF discussion](https://huggingface.co/Wildminder/AI-windows-whl/discussions/8)
- The WanGP install guide recommends SageAttention 2.2.0 for RTX 30XX and newer, with SDPA as the fallback (`python wgp.py --attention sdpa`). An older version of the doc said not to install it on RTX 50, which is now outdated. SageAttention 3 does not appear in the 2026 notes — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP); [WanGP TROUBLESHOOTING](https://huggingface.co/spaces/JoranF/Wan2GP/blob/main/docs/TROUBLESHOOTING.md)
- A community installer for WanGP advertises "Python 3.11, PyTorch 2.10 and NVFP4 Support for RTX50" — [shadowburn0/wan2gp](https://github.com/shadowburn0/wan2gp)
- Radial Attention (MIT Han Lab, NeurIPS 2025): up to 1.9x vs dense attention on Wan2.1-14B, HunyuanVideo and Mochi, with quality preserved — [NeurIPS 2025](https://papers.neurips.cc/paper_files/paper/2025/hash/18a367688479c1b08b001584218a4443-Abstract-Conference.html)
- SpargeAttn (training-free): 1.83x end-to-end on Mochi on an L40, and the version built on SageAttention2 is about +30% faster still — [arXiv 2502.18137](https://arxiv.org/html/2502.18137v8)
- Sliding Tile Attention: more than 10x on attention and up to 3.53x end-to-end. The model and GPU behind that figure are not stated in the excerpt — [arXiv 2502.04507](https://www.arxiv.org/pdf/2502.04507)
- WanGP FastH3 Omni uses VSA sparse attention on RTX 30XX and newer (v18.21, 2026-10-21) — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- KJNodes in ComfyUI has an "LTX2 memory efficient sage attention patch" node — [comfyui-wiki KJNodes](https://comfyui-wiki.com/es/custom-nodes/ComfyUI-KJNodes/nodes/ltx2-memory-efficient-sage-attention-patch)
- On an RTX 5070 Ti with LTX-2.3, the first run took about 220 s because of Triton kernel compilation, and later runs were much faster thanks to caching. VRAM held stable at 12.3 GB — [r/StableDiffusion snapshot](https://reddit.sentinel-team.org/posts/1rrepjh/snapshots/2026-03-12T03%3A30%3A27.895773Z)

### Inferences
- First thing to check: is WanGP really running with `--attention sage2` (and not SDPA) on this machine? If not, that is likely 20-30% for free.
- SageAttention 3 on Windows is still experimental (unofficial wheels, crashes reported). Not recommended for a production service without a test.
- Do not judge a configuration on its first run: Triton compilation inflates it (about 220 s on a 5070 Ti).

### Gaps
- I found no source on FlashAttention 3 or 4 on RTX 50 under Windows. FA3 targets Hopper, and FA4 was not found.
- I found no measured gain for SageAttention 2.2 or 3 specifically on LTX-2.5 or H3.

## Caching: TeaCache, MagCache, EasyCache, FasterCache, First Block Cache

### Takeaway
Caching gives about 1.5-2.7x on 30-50-step models (Wan2.1), and MagCache beats TeaCache at equal speed. It becomes almost useless with distilled models at 4-8 steps, which is the user's case: there are too few steps left to skip. WanGP's 2026 notes do not mention it.

### Cited Findings
- MagCache (NeurIPS 2025) on Wan2.1 1.3B: MagCache-fast reaches 2.68x (69.75 s), with better LPIPS, SSIM and PSNR than TeaCache-fast (87.55 s). Calibration takes a single sample, compared with dozens for TeaCache — [MagCache arXiv](https://arxiv.org/html/2506.09045v1); [MagCache page](https://zehong-ma.github.io/MagCache)
- EasyCache (training-free, no offline profiling), on its project page example: PAB 437 s (2.10x), TeaCache 631 s (1.46x), EasyCache 349 s (2.63x) — [EasyCache project page](https://h-embodvis.github.io/EasyCache)
- TeaCache on Wan2.1: community reports of quality trade-offs depending on the threshold, without a benchmark — [r/StableDiffusion thread TeaCache/torch.compile/Sage](https://reddit.birdcat.cafe/r/StableDiffusion/comments/1j1w9s9/teacache_torchcompile_sageattention_and_sdpa_at/mfnemfj/?context=3)
- WanGP's 2026 highlights mention neither TeaCache, MagCache, other caching nor torch.compile. The only cache mentioned is a quantized KV cache for reference-based generation (MOSS Image Edit, Qwen Image 2.1, Wan Animate 2), described as "much faster" without a figure — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- With LTX-2.5 distilled (8+3 steps) or H3 in 4-8 steps, a step cache would skip at most 1-3 steps, with high artifact risk (no direct source; this follows from the cited mechanisms). Not a priority lever for this setup.

### Gaps
- I found no FasterCache or First Block Cache measurement on a distilled model or on LTX/H3.
- I could not confirm whether the full WanGP changelog (not fetched) still includes TeaCache or MagCache for older Wan models.

## torch.compile, TensorRT / TensorRT-RTX, NVIDIA RTX AI optimizations on Windows

### Takeaway
NVIDIA's work on Windows video goes through ComfyUI (native NVFP4/FP8, PyTorch-CUDA optimizations, weight streaming, the RTX Video Super Resolution node), not through TensorRT. For WanGP, the 2026 gains come from its own kernels (WGPKernels, GGUF kernels) and memory profiles.

### Cited Findings
- NVIDIA CES 2026: up to 3x and 60% less VRAM from "PyTorch-CUDA optimizations and native NVFP4/FP8 support in ComfyUI". Weight streaming spills into system RAM when VRAM is full (no figure given). The RTX Video Super Resolution node for ComfyUI upscales to 4K "in seconds", in real time, with sharpening and artifact cleanup, available February 2026 — [NVIDIA blog CES 2026](https://blogs.nvidia.com/?p=88691); [Wccftech](https://wccftech.com/nvidia-rtx-acceleration-comfyui-for-faster-ai-video-gen-fp4-rtx-video-super-res/amp/)
- WanGP v18.21 (2026-10-21):
  - Many models run up to 10% faster with slightly less VRAM.
  - LTX-2.5 VAE encode, decode and upscale measured 4.8-6.8x faster on RTX 20XX.
  - Profile 0 (experimental) gives fast reserved RAM and spare VRAM to the active model.
  - [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- WanGP v18.84 and v18.888 (2026-10-27 to 29):
  - WGPKernels 1.4.3 and GGUF kernels 1.0.29.
  - Quantized KV cache extended to memory profiles 4 and 5.
  - Memory from idle models is reclaimed for the active model, and cached checkpoint data is freed on Windows.
  - [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- The simplest step is updating WanGP to the latest version (v19.25 or later, 2026-11-08/09), which bundles the kernel and memory gains along with the new H3 accelerators.

### Gaps
- I found no source on TensorRT-RTX for LTX-2.5 or H3, and no torch.compile measurement on Windows for these models.

## Post-processing: video super-resolution and frame interpolation. Is low resolution plus upscaling better than native 1080p?

### Takeaway
WanGP now ships its own VSR models:
- **RelayVSR x2**: the default up to x2, more than twice as fast as x4.
- **FlashVSR+ Turbo**: about 30% faster denoising.
- **SeedVR**.

FlashVSR is the speed choice and SeedVR2 the quality reference for degraded sources. For the native vs upscale question there are no measured comparisons, but LTX itself is built around generating at half resolution and then upscaling 2x in latent space. That supports the "generate smaller, upscale" strategy.

### Cited Findings
- WanGP v19.25 (2026-11-08):
  - RelayVSR for real and generated media. The x2 model is the default for scales up to x2 (it uses "LightX2V's native x2 version"), more than twice as fast as x4 with less memory.
  - FlashVSR+ Turbo denoising is about 30% faster.
  - FlashVSR+ Turbo itself arrived on 2026-10-21 (1x refinement to 4x).
  - SeedVR, Lanczos and RIFE are listed as upscaling and interpolation options. Real-ESRGAN and GIMM are not mentioned.
  - DLSS Frame Generation x2 is Linux only.
  - [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- H3 "Regenerate 2K IC": up to 2560x1440 in 3 extra steps (6+3 with HyperFlow Flash Ref2VA, or 8+3) (2026-11-09). A "Regenerate 2K 2-phase" preset dates from 2026-10-29 — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- SeedVR2 at 1080p (ComfyUI template) ran at about 2.0 fps on a short clip on an RTX 5070 Ti 16 GB, without spilling into shared memory (forum anecdote) — [Selur forum](https://forum.selur.net/thread-4311.html)
- FlashVSR vs SeedVR2 at 4x: about 1.12 fps vs 1.02 fps (Topaz forum user). The FlashVSR paper gives about 17 fps at 768x1408 on an A100 — [Topaz community](https://community.topazlabs.com/t/sls-vs-slm-vs-seedvr2-vs-flashvsr-comparison/98005/1); [Emergent Mind FlashVSR](https://www.emergentmind.com/papers/2510.12747)
- Quality positioning: SeedVR2 is the "quality reference" for damaged or low-resolution sources, while FlashVSR is best on fairly clean sources (vendor blog, not neutral) — [Upsampler blog](https://upsampler.com/blog/seedvr-vs-flashvsr-ai-video-super-resolution-2026)
- LTX-2 runs in two stages: stage 1 at half resolution (8 steps), a 2x LatentUpsampler, then stage 2 at full resolution (3 steps, without CFG, with the distilled LoRA). The 2x upscaler needs dimensions divisible by 32 and the exact ratio. Testers report recovered texture and edges, and better than ESRGAN on edges, but with no measured comparison against native — [Lightricks LTX-2 two-stage, deep dive](https://instagit.com/Lightricks/LTX-2/ltx-2-two-stage-generation-process/); [crepal LTX 2.3 upscaler](https://crepal.ai/blog/aivideo/ltx-2-3-spatial-temporal-upscaler/)
- Frame interpolation:
  - RIFE: about 0.035 s per frame at 1024x1024 on a 2080 Ti, 4-27x faster than SuperSlomo and DAIN.
  - On a 480p clip in ComfyUI: RIFE 9 s, FILM 12 s, GIMM-VFI 25 s or 53 s depending on the variant.
  - GIMM holds up better on fast or complex motion, where RIFE ghosts and smears.
  - [RIFE arXiv](https://arxiv.org/pdf/2011.06294); [AceVFI survey](https://arxiv.org/pdf/2506.01061); [ComfyUI-GIMM-VFI](https://comfy.icu/node/GIMMVFI_interpolate)
- NVIDIA RTX Video Super Resolution (ComfyUI node, 2026): real-time 4K upscaling, the cheapest option but not generative — [NVIDIA blog CES 2026](https://blogs.nvidia.com/?p=88691)

### Inferences
- For 704x1280 → 1080x1920 (a 1.5x factor), RelayVSR x2 in WanGP is the most suitable option: it is the default up to x2 and the fastest. FlashVSR+ Turbo is the next step up in quality, and SeedVR2 is reserved for when the detail matters more than the time.
- Generating natively at 1080p would cost far more attention compute: tokens scale with the pixels, and attention grows roughly with their square, which is general knowledge and not sourced here. "Generate at 704x1280, then VSR" is consistent with how LTX itself is designed.
- At 24 fps (the user's preference), interpolation is only useful for slow motion. RIFE is enough for calm scenes, and GIMM-VFI is for fast motion.

### Gaps
- I found no measured comparison (same seed and compute budget) of native 1080p against 704p plus VSR for LTX-2.5 or H3.
- I found no WanGP timings for RelayVSR or FlashVSR+ on a 16 GB card.

## Power and heat: power limiting and undervolting vs generation speed

### Takeaway
There are almost no measurements on AI video. On an RTX 5090, one diffusion test lost about 12-14% going from 475 W to 400 W (about -16% power). For LLMs the loss is tiny, because they are memory-bound while diffusion is compute-bound. Undervolting (curve) loses less than a simple power limit, on the gaming data.

### Cited Findings
- RTX 5090 diffusion (Reddit, undervolt plus overclock): 475 W → 400 W took the time from 42 s to 48 s (about +14%). The table labels are muddled — [r/StableDiffusion snapshot 2026](https://reddit.sentinel-team.org/posts/1tolp1m/snapshots/2026-05-30T00%3A45%3A07.677242Z)
- RTX 5090 LLM: at 400 W, stock clocks give virtually the same speed as 575 W. Another user reports a single-digit loss at 425 W, with the curve steepening below 400 W — [r/LocalLLaMA snapshots](https://reddit.sentinel-team.org/posts/1w2o860/snapshots/2026-09-04T21%3A20%3A12.3645Z)
- In diffusion the tensor cores are under "extreme load", so the card constantly hits its power limit — [GameGPU](https://en.gamegpu.com/news/zhelezo/ogranichenie-12vhpwr-v-600-vt-meshaet-geforce-rtx-5090-raskryt-potentsial-dlss-5)
- RTX 4090 (QuasarZone via TechPowerUp, gaming): at most -8% performance for -110 W, with a power limit tested down to 60% (270 W). Manual undervolting was "by far the more effective", at -5.3% on average — [EVGA forum / QuasarZone](https://forums.evga.com/NVIDIA-GeForce-RTX-4090-power-limiting-and-undervolting-test-shows-only-8-performance-dro-m3588393.aspx); [TechPowerUp](https://www.techpowerup.com/forums/posts/4892815)
- Der8auer: up to -20% power without meaningful loss in games, depending on the title — [CGDirector undervolt guide](https://cgdirector.com/?p=26084)

### Inferences
- On a 5070 Ti (300 W TGP), a power limit of around 80% (about 240 W, via `nvidia-smi -pl 240` as admin, or the MSI Afterburner slider) would likely cost about 5-15% speed in diffusion, extrapolated from the 5090 data and not measured on a 5070 Ti. That is small next to the gains from the levers above (fewer steps, Sage, VSR x2). An Afterburner curve undervolt (cap around 0.9-0.95 V) usually costs less than a pure power limit.
- The techniques that shorten the run (fewer steps, smaller resolution plus VSR) also shorten the time spent under sustained load. That matters given the hard resets, which could equally come from the PSU, transient spikes or the 12V-2x6 connector (no source specific to this case).

### Gaps
- I found no it/s or seconds-per-clip measurement at different power limits on an RTX 5070 Ti, or for LTX, Wan or H3.
- I found no data on transient spikes of the 5070 Ti under AI load.

## What is already in WanGP vs only in ComfyUI or other repos

### Takeaway
WanGP (v19.25, Nov 2026) covers most practical levers natively:
- NVFP4, INT8, FP8, GGUF and Nunchaku checkpoints
- SageAttention 2.2
- H3 and LTX distilled accelerators
- VSA for FastH3
- RelayVSR, FlashVSR+, SeedVR and RIFE

What stays outside WanGP:
- **ComfyUI only:** SageAttention3 (unofficial), MagCache/TeaCache/EasyCache as nodes, the RTX Video Super Resolution node and GIMM-VFI
- **Separate repo:** TurboDiffusion
- **Research code:** Radial Attention, SpargeAttn and STA

### Cited Findings
- In WanGP (README, 2026-10/11): int8, fp8, gguf, NVFP4 and Nunchaku checkpoints; SageAttention 2.2.0 (RTX 30+); VSA sparse attention (FastH3 Omni); H3 accelerators (HyperFlow Flash, DMAD, PDD, pDMD, Pika H3 in 6 steps); RelayVSR, FlashVSR+ Turbo, SeedVR, Lanczos and RIFE; memory profiles 0-5 — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- Not mentioned in WanGP's 2026 highlights: SageAttention 3, TeaCache, MagCache, torch.compile, Real-ESRGAN, GIMM-VFI, TurboDiffusion — [Wan2GP README](https://github.com/deepbeepmeep/Wan2GP)
- ComfyUI: native NVFP4/NVFP8, weight streaming and the RTX VSR node (NVIDIA) — [NVIDIA blog](https://blogs.nvidia.com/?p=88691). Also the LTX2 Sage attention patch node in KJNodes — [comfyui-wiki](https://comfyui-wiki.com/es/custom-nodes/ComfyUI-KJNodes/nodes/ltx2-memory-efficient-sage-attention-patch), the GIMM-VFI node — [comfy.icu](https://comfy.icu/node/GIMMVFI_interpolate), and a community TurboDiffusion node — [TurboDiffusion GitHub](https://github.com/thu-ml/TurboDiffusion)
- Separate repos: TurboDiffusion (thu-ml), Radial Attention (mit-han-lab/radial-attention), SpargeAttn (thu-ml), MagCache (Zehong-Ma/MagCache), EasyCache (H-EmbodVis/EasyCache) — [TurboDiffusion](https://github.com/thu-ml/TurboDiffusion); [Radial NeurIPS](https://papers.neurips.cc/paper_files/paper/2025/hash/18a367688479c1b08b001584218a4443-Abstract-Conference.html); [MagCache](https://zehong-ma.github.io/MagCache); [EasyCache](https://h-embodvis.github.io/EasyCache)

### Inferences
- Likely order of priority for this setup, with each step tested on a single clip to respect the small budget:
  1. Update WanGP to v19.25 or later.
  2. Check that SageAttention 2.2 is active.
  3. For H3, use HyperFlow Flash in 6 steps or DMAD in 4.
  4. Use RelayVSR x2 for the 1.5x upscale.
  5. Set a power limit of about 80% or an undervolt.
  6. Only if smearing appears, switch from NVFP4 to an FP8/INT8 "mixed" checkpoint.

  Caching and TurboDiffusion are not worth it here.

### Gaps
- I did not read WanGP's full changelog (only the README highlights), so some integrations may be missing from this list.
- I found no measured per-component timing breakdown (text encoder, denoising, VAE, VSR) for the user's 7-15 min clip. That breakdown would show where to cut first.

# Specialising open-weight video models with LoRAs, fine-tunes and multi-model pipelines (state as of 2026-11-10)

Scope: MiniMax H3 and LTX-2.5, with Wan 2.2 for reference, run locally through WanGP on an RTX 5070 Ti 16 GB. Quality is the only goal.

Source note: the WanGP docs were read from the user's local clone at `C:\Users\leobi_pntic6c\WanGP`, commit `ad9e417` (2026-11-06, "added viggle remake, relayvsr"). Their changelog stops at v18.19 (18 Oct 2026). They are cited with their GitHub URLs (deepbeepmeep/Wan2GP); the local copy may be a few days behind or ahead of GitHub. Many sources on H3 and LTX-2.5 are dated after June 2026, so web results were trusted over prior knowledge. Vendor and model-card claims are marked as self-reported.

## 1. What LoRAs and fine-tunes exist for MiniMax H3 and LTX-2.5, which subject each targets, and is there evidence they improve on the base?

### Takeaway
H3 now has a real ecosystem.
- **Full fine-tunes:** Singularity V2 (realism, faces in medium and long shots, skin, fast motion), already packaged in WanGP as a Ref2VA model.
- **Official or partner adapters:** Pika H3 Flex (6-step adapters), the Viggle Remake Swap/Edit LoRAs and P-H3-Image.
- **Many community style LoRAs:** "Cinematic", "CinemaGrade", "Dark Cinematic", and fal's Realism People LoRA (skin, faces, film lighting).

LTX-2.5's official adapters are mostly IC-LoRAs (in-context LoRAs that take a reference video) for post-processing and VFX: Refine-Details/detailer, Restore, Decompression, Clean-Plate, Day-To-Night, Layout-To-Render, Ingredients, Alpha-Gen and HDR. They are not "subject" LoRAs.

All evidence that these beat the base model is self-reported: model cards, same-seed comparisons by the authors, or vendor Elo results. No independent controlled comparison was found.

### Cited Findings

**MiniMax H3: full fine-tunes**
- **Singularity (WarmBloodAban)** is a fine-tuned fusion of MiniMax-H3's `ref`, `fl` and `b25-49` checkpoints, followed by high-step fine-tuning and pruning. It supports T2V, I2V, R2V and V2V. — [HF card](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
  - The card shows about 1,104,243 downloads last month and 979 likes. — [HF card](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
  - Claimed improvements: less skin shine and glossy texture; "Distant Face Restoration" against distortion and blur in medium and long shots; HDR-based fine-tuning against motion blur in fast action. V2 adds broader action coverage, stronger prompt adherence, an audio-reference fix and better style rendering. — [HF card](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
  - Prompting advice: name the style explicitly ("photorealistic", "cinematic CG") and keep prompts under about 5,000 characters. For 4-step inference the card recommends the `minimax_h3_ref2v_turbo_4step_v0.1` LoRA. The card gives no recommended steps or CFG and has no limitations section. — [HF card](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
  - V2 claims better results in photorealistic, East Asian realism, 3D CG and cinematic CG styles. — [ComfyUI wiki, 2026-10-22](https://comfyui-wiki.com/en/news/2026-10-22-h3-singularity-v2); [Civitai](https://civitai.com/models/2917208/minimax-h3singularity)
  - The V2 INT8 checkpoint was released on 2026-10-21. — [ComfyUI wiki](https://comfyui-wiki.com/en/news/2026-10-22-h3-singularity-v2); [AIFilmHQ](https://aifilmhq.com/entry/minimax-h3-singularity-v2-community-fine-tune-fixes-plastic-skin-and-slow-motion/)
  - **Evidence:** "no head-to-head comparison against base H3 with measured results". Every improvement comes from the card or one YouTube tutorial (Veteran AI, combined with the SelfLift node and a YOLOv8 face pass). No regressions or user benchmarks are cited. — [AIFilmHQ](https://aifilmhq.com/entry/minimax-h3-singularity-v2-community-fine-tune-fixes-plastic-skin-and-slow-motion/)
  - A derivative merge, "Singularity-V2-x-10Eros-Max", combines it with a turbo model for 8-step realism (third-party claim). — [Civitai](https://civitai.com/models/3019421/singularity-v2-x-10eros-max)
- **Singularity V2 in WanGP:** WanGP ships it as two built-in models.
  - `minimax_h3_singularity_v2` (33B, architecture `minimax_h3_ref2va`) and `minimax_h3_singularity_v2_pruned` (20B, architecture `minimax_h3_ref2va_pruned`). Both download INT8 ConvRot weights from `DeepBeepMeep/MiniMax-H3`. — [WanGP defaults/minimax_h3_singularity_v2_pruned.json](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)
  - WanGP's LoRA guide states that Singularity V2 supports the H3 LoRA conversion packaging for both full and pruned INT8 checkpoints. — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md)

**MiniMax H3: partner adapters**
- **Pika H3 Flex** (released 2026-10-29) is two LoRA adapters on top of MiniMax H3, not a new base model.
  - FL2VA covers T2V and first/last frame; Ref2VA covers multimodal references.
  - It runs in 6 steps, distilled from 50. Native output is 480p and 768p, 5–15 s at 24 fps, with 32 kHz stereo audio.
  - 1080p, 2K and 4K are hosted-only on Pika's API.
  - Quality claims are vendor-reported: a DesignArena T2V Elo of 1293 for Flex against 1277 for base H3. No independent side-by-side tests were found. — [WaveSpeed explainer](https://wavespeed.ai/blog/minimax-h3/pika-h3-flex-explained/)
  - Another summary says Pika claims #1 among open-source T2V models and first in its own human study for anatomy and artistic style. It also says the "H3-Regenerate-2K" stage is not open-sourced, so local runs produce 768p. — [search summary of aiwiki / Chinese press](https://aiwiki.ai/wiki/pika_h3_flex); [Sina](https://t.cj.sina.com.cn/articles/view/2118746300/7e4980bc02001rcf4)
  - No Pika H3 Flex definition exists in the local WanGP `defaults/` folder (grep found none as of commit ad9e417). — [WanGP defaults](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)
- **Viggle Remake Swap / Edit** are H3-derived LoRAs. WanGP loads them as `viggle_remake_swap_bf16.safetensors` and `viggle_remake_edit_bf16.safetensors` on the pruned 20B base.
  - Swap recasts people; Edit changes objects, setting, weather or light from a painted frame while keeping people, motion and soundtrack. — [WanGP MODELS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/MODELS.md); [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
  - "A remake works best on videos with cuts and faces large in the picture. Small faces, many fast cuts ... come out weaker." — [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
- **P-H3-Image** (`p-h3-image_lora_bf16`) turns H3 into an 8-step image generator and editor. WanGP describes it as "strongest at photorealism, film and editorial looks", best at 8 MP, and notes that "hands and dense text can break". — [WanGP defaults/minimax_h3_image.json](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)

**MiniMax H3: quality-oriented acceleration variants in WanGP**
- **Ref2VA PTD RefAsymOPD 8-step** (33B and pruned 20B) "targets sharper details, more believable backgrounds and greater realism than plain PTD at the same step count". WanGP's own description adds that "standard H3 at 40 steps remains the quality reference". — [WanGP defaults/minimax_h3_ref2va_ptd_refasymopd.json](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)
- **PDD 8-step variants** (the user's current `minimax_h3_ref2va_pruned_pdd`) embed `minimax_h3_ref2va_pdd_8step_lora_bf16`. "When using PDD you are stuck to 8 steps and to the Euler Scheduler." — [WanGP CHANGELOG v12.645](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **TaoMate accelerator profiles:** a new 3-step FL2VA-only profile dated 15 October 2026. — [WanGP CHANGELOG v18.19](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **Earlier H3 accelerator LoRAs** (Lightx2v, larryvrh): "default is 0.5 as 1.0 seems too strong". — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)

**MiniMax H3: community subject and style LoRAs**
- **fal/MiniMax-H3-Realism-People-LoRA**
  - Rank 32, 1,500 steps, trained at the high-resolution bucket on 176 hand-curated live-action people clips retimed to 24 fps with structured captions.
  - The card says "training resolution mattered more than rank or step count".
  - Intended effect: skin texture, coherent faces and expressions, film-style lighting, subtle handheld motion.
  - One file covers T2V, I2V and R2V; trigger word `r34l1sm`; strength 1.0, or 0.6–0.8 for a lighter effect.
  - About 115,686 downloads last month and 551 likes.
  - Evidence: 19 same-prompt, same-seed on/off pairs, which the author says were not cherry-picked. No independent evaluation. The card does not say whether it was trained on the full or the pruned checkpoint.
  - — [HF card](https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA)
- **Civitai "Minimax H3 Cinematic Version (Official Release)"** claims lighting, skin texture and depth-of-field refinements against plastic skin and over-sharpening. Strength 0.7 for standard shots, about 0.5 for high motion. — [Civitai 2937734](https://civitai.com/models/2937734/minimax-h3-cinematic-version-official-release)
- **"Minimax H3 Cinematic V2"** (formerly "Authentic cinematic texture", trigger "DY"): strength 0.85, also claims limb and motion stability. — [Civitai 2890588](https://civitai.com/models/2890588/minimax-h3-cinematic-v2)
- **"CinemaGrade"** is a style-only LoRA, labelled experimental. — [Civitai 2927223](https://civitai.com/models/2927223/cinemagrade-minimax-h3-style-lora)
- **Other H3 LoRAs found:** "Dark Cinematic Video" [Civitai 2771200](https://civitai.com/models/2771200?modelVersionId=3363310), "Third_person_view" [Civitai 2945172](https://civitai.com/models/2945172/minimax-h3thirdpersonview), "Void-Style Transformation" [Civitai 2950284](https://civitai.com/models/2950284/void-style-transformation-minimax-h3).
- **Caution:** the search tool noted that the Civitai page metadata and version labels were inconsistent, so check each page before use. Civitai download counts and ratings were not retrieved. — [Civitai 2890588](https://civitai.com/models/2890588/minimax-h3-cinematic-v2)

**MiniMax H3: built-in refiners and finishing stages in WanGP**
- **H3 Face Refiner:** "detect, identity-track, and refine up to five faces with H3 Ref2VA without changing the video resolution". It runs as post-processing (Advanced Mode / Post Processing) or later from the gallery. — [WanGP CHANGELOG v12.643](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3 Two-Phase generation:** phase 1 renders at half width and height, the latent is upscaled, then phase 2 does a fixed 3-step refinement at full resolution with the LightX2V Turbo LoRA. "Two Phases with Tiling" lowers peak VRAM but "may introduce visible seams". — [WanGP CHANGELOG v12.643](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3 VAE Upsampler x2** (v17.17) and **H3 LightVAE**, a 12-layer decoder: "Decoded detail can differ from the full VAE". — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3 Audio Refinement Extra Phase:** 6 extra audio-only steps. It is unavailable on fixed 8-step PDD variants. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)

**LTX-2.5: official adapters**
- **IC-LoRAs on Hugging Face:** Layout-To-Render, Refine-Details, Ingredients, Clean-Plate, Restore, Decompression, Day-To-Night, Alpha-Gen. — [Layout-To-Render](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render), [Refine-Details](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Refine-Details), [Ingredients](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients), [Clean-Plate](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate), [Restore](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Restore), [Decompression](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Decompression), [Day-To-Night](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night), [Alpha-Gen](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen)
- **Refine-Details IC-LoRA** rebuilds fine detail (texture, edges, grain) without changing framing, exposure or colour.
  - Trained on 1024x576 tiles, so tile even at full HD with overlap of at least 0.5. Settings: strength 1.0, 8 distilled Euler steps, guidance 1. Prompts should describe rendering, not subjects.
  - Upscaling path: refine to 4K, then upscale; native 8K in one pass "invents detail".
  - Limitations: foliage in wind can over-sharpen; shallow depth-of-field areas gain little; it slightly desaturates archive footage (run Restore first); it removes grain it cannot rebuild on pristine footage.
  - Optional face or product reference image. 20,247 downloads last month.
  - — [HF card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Refine-Details)
- **The LTX-2 repo also lists:**
  - a Detailing IC-LoRA (`ltx-2.5-22b-ic-lora-pixel-spatial-upscaler-x2-1.0`) used by the DFR pipeline's refinement stage;
  - a Distilled LoRA (`ltx-2.5-22b-distilled-lora-450`) required when the full model runs in stage 1;
  - HDR and Dub-It IC-LoRAs.
  - It states that "a LoRA only works with the model it was trained on". — [Lightricks/LTX-2 GitHub](https://github.com/Lightricks/LTX-2)
- **In WanGP:**
  - LTX-2.5 finetunes include MSR (LiconStudio Multiple Subject Reference), Layout to Render, Alpha Gen, and LTX 2.5 unblur/uncompress LoRAs in Media Flow. — [WanGP CHANGELOG v13.10 and v17.10](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - The "LTX 2.5 Detail Refiner x2" upsampler is described as "high-quality upsampling with tiling ... don't expect it to win any speed races". — [WanGP CHANGELOG v17.17](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - Earlier LTX-2 quality presets: VBVR (complex prompt understanding, motion, temporal consistency), OmniNFT (audio/video sync), Id LoRA (voice cloning, Dev only), and "HQ (res2s)" sampler mode. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - IC-LoRAs by Oumoumad Mohamed power the Refocus, Ungrade, Uncompress and Outpaint processes. — [WanGP CHANGELOG v11.35](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)

### Inferences
- For the user's "faces" case, the most direct quality upgrades that keep the Ref2VA workflow are:
  - swapping `minimax_h3_ref2va_pruned_pdd` for `minimax_h3_singularity_v2_pruned`, which keeps the same architecture and the same face-from-photo Ref2VA inputs, but runs at full steps;
  - adding fal's Realism People LoRA (R2V-compatible);
  - running the H3 Face Refiner as post-processing.

  None of these has independent proof. Each needs a same-seed A/B on the user's own test photos.
- PDD and other 8-step distillations trade quality for speed: WanGP itself says 40-step standard H3 is the quality reference. With time not a constraint, the quality-first default is probably non-distilled Ref2VA (or Singularity V2) at full steps, keeping PDD and RefAsymOPD for drafts.
- LTX-2.5's official adapter set is about finishing and VFX (detail, restore, relight, HDR, layout), not subject-specific realism. It therefore fits better as a post stage than as a "landscape specialist" generator.

### Gaps
- Civitai download counts and ratings for the H3 LoRAs were not retrieved. Civitai pages were only seen through search snippets.
- No independent blind comparison (base H3 vs Singularity V2 vs Realism LoRA vs Pika Flex) was found.
- It is unknown whether fal's Realism LoRA was trained on the full or pruned checkpoint, and whether it stacks well with the PDD or RefAsymOPD distillation LoRAs, or with Singularity V2.
- No community LTX-2.5 subject LoRAs (realism, skin, landscape) were found. Only official IC-LoRAs and LTX-2.3 community LoRAs surfaced.
- No H3 LoRA dedicated to landscapes, nature or drone shots was found.

## 2. Do camera-control LoRAs (dolly, orbit, drone) exist for H3 and LTX, and do they improve landscape shots?

### Takeaway
- **LTX-2.3 and LTX-2 19B:** official camera LoRAs exist for dolly in, out, left and right, jib up and down, and static. Community ones add pan, tilt, zoom and dolly-forward.
- **LTX-2.5:** no LoRA explicitly named for camera control was found. Its camera tool is Layout-to-Render, which follows a 3D viewport playblast.
- **H3:** no camera LoRA was found. Camera paths can be imposed through ControlNet-Union (depth or edges from a control video).
- **Drone and orbit:** no dedicated LoRA exists; they are handled by prompting.
- **Evidence for landscapes:** none. No source measures landscape quality gains from camera LoRAs. They control motion, not image quality.

### Cited Findings
- **LTX-2.3 official set:** seven camera-movement LoRAs (dolly in, dolly out, dolly left, dolly right, jib up, jib down, static), per LTX's VFX page as summarised by the search tool. — [ltx.io VFX](https://ltx.io/model/capabilities/vfx)
- **LTX-2 19B equivalents** exist on Hugging Face. — [Dolly-In](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-In/blob/main/README.md), [Dolly-Right](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Dolly-Right), [Static](https://huggingface.co/Lightricks/LTX-2-19b-LoRA-Camera-Control-Static/blob/main/README.md)
- **Community LTX-2.3 camera LoRAs:** a pan, tilt and zoom set — [elismasilva/LTX-2.3-LoRa-Camera-Controls](https://huggingface.co/elismasilva/LTX-2.3-LoRa-Camera-Controls); a dolly-forward LoRA — [mattbasedow/dollyforward-ltx23](https://huggingface.co/mattbasedow/dollyforward-ltx23)
- **LTX 2.3 IC-LoRA camera-motion transfer** copies the motion of a source clip; ComfyUI workflows exist. — [RunComfy workflow](https://www.runcomfy.com/ja/comfyui-workflows/ltx-2-3-ic-lora-camera-control-in-comfyui-camera-motion-transfer)
  - WanGP lists "Transfer Camera Movement" among IC-LoRA uses. — [WanGP CHANGELOG v11.26](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **No dedicated drone or orbit LoRA was found.** Example orbit and drone shots rely on prompt text such as "Aerial drone shot slowly flying over a coastal city at sunset". — [Melies camera guide](https://melies.co/ai-camera-movements-guide)
- **LTX-2.5 Layout-To-Render IC-LoRA** keeps the camera path and object placement from a 3D layout video (viewport animation or playblast), with an appearance reference image setting the look. — [HF card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render); [WanGP CHANGELOG v17.10](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **WanGP camera-path models** (Wan 2.1 family, v18.00): "Fun Control-Camera 1.3B" and "Uni3C 14B" take a start image and fly the camera along a chosen preset or custom path. Uni3C uses the start image's estimated geometry. — [WanGP MODELS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/MODELS.md); [CHANGELOG v18.00](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3 ControlNet-Union 2.0** (FL2VA 33B and pruned 20B) follows pose, depth, edges, shapes or grey levels of a control video. — [WanGP defaults/minimax_h3_control_pruned.json](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)
- **LTX-2.3 LoRAs on LTX-2.5:**
  - WanGP says LTX 2.5 "finds LoRAs in the shared `loras/ltx2` folder and restores the compatible LTX 2.3 LoRA workflows, including pose/depth/canny control, inpainting, outpainting, Ingredients ...". — [WanGP CHANGELOG v12.53](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - Lightricks states "a LoRA only works with the model it was trained on". — [Lightricks/LTX-2](https://github.com/Lightricks/LTX-2)
  - Earlier, WanGP itself noted that "LTX2.0 Loras work badly with LTX2-3". — [WanGP CHANGELOG v11.33](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - These sources conflict, and nobody states whether the 2.3 camera LoRAs behave on 2.5.

### Inferences
- For big landscapes and drone moves, the deterministic options are:
  - LTX-2.5 Layout-to-Render, if the user can produce a rough 3D or playblast camera path;
  - Uni3C or Fun Control-Camera (Wan 2.1, lower base quality, smaller models) to produce a motion pass, then reuse it as a depth or edge control for H3 ControlNet-Union or an LTX IC-LoRA.

  Camera LoRAs fix the trajectory, not the image detail. Landscape detail would come from a refiner stage instead (LTX-2.5 Refine-Details, H3 two-phase latent upscale).
- LTX-2.3 camera LoRAs on LTX-2.5 are a compatibility gamble. Test before relying on them.

### Gaps
- No H3 camera-motion LoRA was found on HF or Civitai.
- No measured comparison of landscape shots with and without camera LoRAs was found.
- Whether the "seven LTX-2.3 camera LoRAs" are 2.3-native or the 19B LTX-2 set relabelled could not be verified, because the ltx.io page was seen only through a search summary.

## 3. Can you train your own LoRA for H3 or LTX-2.5 locally on 16 GB, and how much does it help?

### Takeaway
- **H3:** training on 12–16 GB is possible, but slow and fragile.
  - Musubi-tuner has experimental H3 support (T2VA, FL2VA, Ref2VA, pruned INT8 base) that needs block swap and quantisation.
  - A documented ai-toolkit run on a 12 GB RTX 4070 took 6–7 h for 1,000 steps on 31 images at 512 px.
  - The first attempt did nothing visible; a face-focused second attempt gave "a passing grade" likeness.
- **LTX-2.x:** the official trainer targets 80 GB, with a low-VRAM path for 32 GB cards. The official trainer needs Triton (Linux-only); 16 GB training of LTX-2 or 2.3 is reported only anecdotally, through community trainers.

No source shows a self-trained LoRA beating H3 Ref2VA's photo-based likeness.

### Cited Findings
- **Musubi-tuner (kohya-ss) H3 support:**
  - LoRA training for T2VA, FL2VA, Ref2VA, plus an experimental one-frame (image) mode.
  - Pruned BF16 and pruned ConvRot INT8 transformers are drop-in. "FP8 files and NVFP4 transformers are rejected."
  - Sizes: about 21 GB for INT8 pruned, about 34 GB for INT8 full; text encoder about 15 GB in NVFP4+AWQ.
  - Advice: "on 24 GB and below combine a quantized transformer, a generous `--blocks_to_swap` [up to 48/50], and `--text_encoder_blocks_to_swap 50`".
  - No minimum VRAM is stated. — [musubi-tuner docs/minimax_h3.md](https://github.com/kohya-ss/musubi-tuner/blob/main/docs/minimax_h3.md)
- **Musubi-tuner H3 recipe constraints:**
  - Plain flow-matching training is unsupported: video "washes out and loses prompt adherence" and image training "breaks structurally within about 50 steps". A training adapter, guidance loss or teacher matching is required.
  - Example settings: rank 16, LR 1e-4, 16 epochs; subject-reference teacher example LR 3e-4, 500 steps.
  - Frames follow 17n+5 (124 frames in the example); batch size 1.
  - Audio is trained when clips contain audio. A video-only LoRA can leave audio "unconstrained".
  - Keep intermediate checkpoints, because the best ones sit "at or just after the plateau".
  - — [musubi-tuner docs/minimax_h3.md](https://github.com/kohya-ss/musubi-tuner/blob/main/docs/minimax_h3.md)
- **Cross-tool compatibility:** musubi PR #1112 loads Diffusers-format H3 LoRAs written by ai-toolkit and diffusion-pipe. — [PR #1112](https://github.com/kohya-ss/musubi-tuner/pull/1112)
- **ai-toolkit H3 character LoRA guide (2026-08-07):**
  - Base: FL2VA pruned INT8 ConvRot with an NVFP4 text encoder, `low_vram: true`, rank 16, adamw8bit, LR 1e-4, 1,000 steps.
  - Dataset: 31–32 still images at 512x512.
  - Resources: about 11.7 GB dedicated VRAM, 10–15 GB shared memory and 32–37 GB system RAM; about 6–7 h on an RTX 4070 12 GB.
  - First LoRA (mixed dataset): "almost no difference" from no LoRA. Second (31 face close-ups): "improved quite a bit", "may not be perfectly identical", "definitely a passing grade".
  - No Ref2VA comparison. — [note.com, かみもと](https://note.com/sepiablue/n/nf0763f854580?hl=en)
- **Conflicting source:** one blog claims H3 cannot be fine-tuned with LoRA. It contradicts the trainer docs and should be disregarded. — [wan27.org](https://wan27.org/blog/minimax-h3-lora)
- **WanGP and custom-pruned H3 LoRAs:** a LoRA trained on a custom pruned H3 checkpoint "must identify its source conditioning table"; WanGP refuses ambiguous mappings. "Conversion preserves adapter rank and strength ... generation quality still depends on the LoRA and target fine-tune." — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md)
- **WanGP cast cards:** the Showrunner can attach a per-person trained LoRA and trigger word to a cast card. "A LoRA only works with the family of models it was trained on", so shots on other models are made without it. — [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
- **Official LTX trainer** (`ltx-trainer`): LoRA, full fine-tune and IC-LoRA. — [Lightricks/LTX-2](https://github.com/Lightricks/LTX-2)
  - 80 GB recommended; a low-VRAM path (INT8, 8-bit optimiser, reduced rank) reaches 32 GB cards such as the RTX 5090; it requires Triton (Linux-only), per the search summary of the official docs. — [LTX trainer docs](https://docs.ltx.video/open-source-model/ltx-trainer/ltx-training); [LTX hardware blog](https://ltx.io/blog/hardware-for-ai-video-models)
- **16 GB claims for LTX-2.x are community-only:**
  - A third-party trainer doc offers "Aggressive VRAM Optimization (8-16GB GPUs)" for LTX-2 19B and LTX-2.3 22B. — [FusionCow ltx_2.md](https://huggingface.co/datasets/FusionCow/asd/blob/main/docs/ltx_2.md)
  - VRAM tips for 12–16 GB cards. — [ltxworkflow community](https://ltxworkflow.com/resources/community/vram-optimization-tips-12gb-16gb-gpus)
  - ai-toolkit guides suggest 512–768 px to start and note that image-only datasets can train identity or style. — [RunComfy ai-toolkit LTX-2 guide](https://www.runcomfy.com/trainer/ai-toolkit/ltx-2-lora-training)
- **What matters in training data:** fal's realism LoRA author reports that "training resolution mattered more than rank or step count" (176 curated clips). — [fal HF card](https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA)

### Inferences
- On 16 GB VRAM plus the user's system RAM, H3 LoRA training looks feasible through musubi-tuner or ai-toolkit with INT8 pruned weights and heavy block swap. Expect many hours per run, several failed runs, and low resolution (512 px).
- The "persistent prompt artefact" risk (washing out) is documented, so the recipe matters more than the tool.
- For faces, Ref2VA from one photo already gives likeness. A per-person LoRA mainly pays off for a recurring character over many videos, not for one-off customers. That fits poorly with an automated per-order service, where each customer would need hours of training.
- A style or "look" LoRA (e.g. the user's own cinematic grade) is the more plausible self-training target, but fal's 176-clip curated dataset shows that a good one needs real curation effort.
- Training LTX-2.5 LoRAs locally on 16 GB under Windows is the least supported path (official trainer needs Triton and recommends 32 GB or more).

### Gaps
- No report of an H3 Ref2VA-mode LoRA trained on 16 GB was found, and no measured likeness comparison against Ref2VA alone.
- No LTX-2.5-specific (as opposed to 2.3) consumer-GPU training report was found.
- diffusion-pipe's H3 support was seen only through a secondary listing ([lorapilot](https://lorapilot.com/lora-training/)); its config was not verified.

## 4. What do the multi-expert and multi-stage designs built into these models teach about a "specialist per task" design?

### Takeaway
Every current model already splits the work by noise level or by resolution stage, rather than by subject:
- **Wan 2.2:** a high-noise expert sets layout and motion; a low-noise expert does detail and texture.
- **LTX-2.x:** stage 1 composes at low resolution; stage 2 refines and upsamples with a distilled LoRA, plus optional detailer and IC-LoRA passes.
- **H3:** optional two-phase latent upscale with a turbo LoRA, a face refiner, and a hosted-only "Regenerate-2K" stage.

So in practice, specialisation means one strong base for composition and identity, followed by specialised refine passes. It does not mean a different generator per subject.

### Cited Findings
- **Wan 2.2 MoE:**
  - The high-noise expert handles early denoising: composition and motion planning. The low-noise expert refines details and textures. — [Vast.ai explainer](https://vast.ai/article/wan-2-2-explained-new-approach-ai-video-generation); [MindStudio](https://www.mindstudio.ai/blog/what-is-wan-2-2-video-open-source)
  - Switch point: one source says about 875/1000 of the schedule; the Wan 2.2 paper uses an SNR-based threshold. This was not reconciled. — [search summary of Vast.ai / RunPod](https://www.runpod.io/blog/wan-2-2-releases-with-a-plethora-of-new-features)
  - LoRAs can be applied separately per expert (`high_noise_loras` / `low_noise_loras`). Motion LoRAs lean on the high-noise stage; style and character LoRAs lean on the low-noise stage. Training only high-noise "tends to under-train detail". — [Atlas Cloud](https://www.atlascloud.ai/pt/models/atlascloud/wan-2.2/image-to-video-lora); [RunComfy Wan 2.2 training guide](https://www.runcomfy.com/trainer/ai-toolkit/wan-2-2-i2v-14b-lora-training)
- **Phase-wise LoRA multipliers in WanGP:** WanGP exposes this as `;`-separated multipliers per phase (e.g. `0;1` = Low Noise only).
  - The same syntax applies to LTX-2's two passes ("1;0.5" = strength 1 in pass 1, 0.5 in pass 2) and to guidance phases on single-model architectures. — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md); [CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - Finetune JSON `URLs2` "can be used with other models than Wan 2.2 to combine different model weights during the same video generation", i.e. a two-expert hybrid of different checkpoints. — [WanGP FINETUNES.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/FINETUNES.md)
- **LTX-2.5 official pipelines:**
  - Two-stage text/image-to-video: guided stage 1 plus 2x spatial upsampling and refinement; the distilled LoRA is required when the full model runs in stage 1.
  - DistilledPipeline: 8 steps in stage 1, 4 in stage 2.
  - DFR pipeline: a separate Detailing IC-LoRA refinement stage.
  - — [Lightricks/LTX-2](https://github.com/Lightricks/LTX-2)
- **LTX two-pass practice in WanGP:**
  - WanGP found ComfyUI's LTX-2 Dev mixes the distilled LoRA in both phases. That "reduces the color saturation specific to Dev" and led to "Dev-Distilled" profiles. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - "Two Phases with Tiling" for LTX: phase 1 lays out the whole scene; phase 2 refines overlapping tiles, so LTX "will see in the worst case 2K tiles". — [WanGP CHANGELOG v17.10](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - IC-LoRAs in WanGP now follow ComfyUI's single full-res pass, because "all the Ic Loras around expect" it. Injecting the control video in phase 2 "will increase output quality with 2 phases but will require more VRAM". — [WanGP CHANGELOG v11.26 and v11.35](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3:**
  - Two-phase latent upscaling (half resolution, then a fixed 3-step full-resolution refine with the LightX2V Turbo LoRA) and the H3 Face Refiner (re-renders up to 5 tracked faces with Ref2VA). — [WanGP CHANGELOG v12.643](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - The H3-Regenerate-2K stage is reportedly not open-sourced (Pika Flex summary). — [aiwiki](https://aiwiki.ai/wiki/pika_h3_flex)
- **Choosing between H3 variants:** WanGP's guidance is "For straightforward text, start/end or injected-frame direction, start with FL2VA; choose Ref2VA when reusing reference content is central." Its changelog adds that "you will get better results with Fl2VA for Start,End,Injected Frames and Text2Video". — [WanGP MODELS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/MODELS.md); [CHANGELOG v13.141](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **Post-model finishing:** DLSS 5 Neural Rendering in WanGP claims to "improve fine features such as skin, hair, fabric, and foliage", with "results ... content-dependent". The Chain of Zoom upsampler is "quite good with hair and skin" but "may reinvent existing details". — [WanGP CHANGELOG v12.72 and v12.22](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)

### Inferences
- A sound per-scene design within the H3 family:
  - **People / face from photo:** Ref2VA (or Singularity V2 Ref2VA) at full steps, then the H3 Face Refiner.
  - **Landscapes / text-only / start-image shots with no person reference:** FL2VA (WanGP explicitly says FL2VA beats Ref2VA for T2V and start/end frames), optionally with the two-phase latent upscale.
  - **Any shot:** an optional LTX-2.5 Refine-Details or DLSS 5 pass.

  This gives "specialists per scene type" while staying on one base family (same prompt format, same VAE look, same LoRA folder), which limits style drift.
- Per-phase LoRA multipliers allow a "detail/realism" LoRA only in late steps and a "motion/camera" LoRA only in early steps, the same logic as the Wan 2.2 experts.

### Gaps
- No published ablation was found comparing "one base + refiner" against "different base per subject" on quality.
- H3's internal Regenerate/refiner architecture is not documented in the open sources found.

## 5. What are the practical risks of switching base models per job?

### Takeaway
Switching base models per shot creates visible "model fingerprint" drift in colour, motion and texture. It also brings different prompt formats, LoRA incompatibility across families (and even across LTX 2.0, 2.3 and 2.5), and big disk and RAM costs. Production advice converges on locking one model per project, using reference images, and unifying in post (upscale, then grade, then grain). The strongest sources here are vendor or marketing content; no studio case study was found.

### Cited Findings
- **Model fingerprint and drift:**
  - "Every model has a distinct visual fingerprint, and mixing models across shots creates inconsistency that is expensive to fix in post." Model choice is a drift vector separate from prompt wording. — [invideo FAQ, single-model lock rule](https://invideo.io/faq/what-is-the-single-model-lock-rule-in-ai-filmmaking-and/); [invideo FAQ, style drift](https://invideo.io/faq/why-does-ai-video-style-drift-happen-between-scenes-and/) (vendor content)
  - Suggested post order: "upscale first, grade second, texture third, review fourth". Grain "unifies clips generated at different times, or by different models". — [invideo post-production pipeline](https://invideo.io/blog/ai-video-post-production-pipeline/) (vendor content)
  - Every model grades differently, and colour mismatch is a main tell. — [HackerNoon](https://hackernoon.com/how-to-color-match-ai-video-clips-when-every-model-grades-differently)
- **LoRA portability:**
  - "A LoRA only works with the model it was trained on." — [Lightricks/LTX-2](https://github.com/Lightricks/LTX-2)
  - WanGP briefly split LTX 2.0 and 2.3 LoRA folders because "LTX2.0 Loras work badly with LTX2-3", then reverted the split as unpopular. — [WanGP CHANGELOG v11.33–11.34](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - WanGP Showrunner: a cast LoRA is used only on shots made with its model family; "the other shots are made without it". — [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
- **Different prompt conventions per model:**
  - Singularity: explicit style keywords, under about 5,000 characters. — [Singularity HF card](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity)
  - LTX Id LoRA: `[VISUAL]`, `[SPEECH]`, `[SOUND]` tags. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - Refine-Details: generic rendering-only prompts. — [HF card](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Refine-Details)
  - LoRA trigger words, e.g. `r34l1sm`. — [fal card](https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA)
  - WanGP finetune JSONs can carry `prompt_infos` and per-model prompt-enhancer instructions (`video_prompt_enhancer_instructions`) to manage this. — [WanGP FINETUNES.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/FINETUNES.md)
- **Disk and RAM:**
  - H3 transformer: about 21 GB INT8 pruned, about 34 GB INT8 full. — [musubi-tuner H3 doc](https://github.com/kohya-ss/musubi-tuner/blob/main/docs/minimax_h3.md)
  - Pika Flex base components: about 210 GB. — [WaveSpeed](https://wavespeed.ai/blog/minimax-h3/pika-h3-flex-explained/)
  - WanGP warns that some PCs with less than 64 GB RAM ran out of memory when pinning LoRAs, and added an auto-recovery mode. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
  - Model reloads happen when switching models or configs ("Changing any config dropdown reloads the current model"). — [WanGP FINETUNES.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/FINETUNES.md)
- **Shared components reduce switching cost within the H3 family:** WanGP's module and URL-reuse system lets finetunes share base weights (e.g. `"URLs": "t2v_2_2"`), and H3 Veda variants use "the same settings and LoRAs". — [WanGP FINETUNES.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/FINETUNES.md); [CHANGELOG v18.00](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **WanGP's own multi-model director (Showrunner):**
  - It uses per-category "templates" (saved model + settings) and falls back to another category's template "when a template cannot do what a shot needs". Example: when the speech template cannot keep cast faces, the cast is shot with the Video Generator with Ref. (H3 Ref2VA).
  - It holds identity with reference pictures per cast member and "Places" images per location, "which words in a prompt cannot do". — [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
  - Viggle Remake: a source above 30 fps or with variable frame rate "is converted to the model's 24 frames per second, which drops frames and can show on fast pans". — [WanGP SHOWRUNNER.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SHOWRUNNER.md)
- **Academic lead (not read beyond the abstract):** a multistage pipeline for character-stable AI video stories. — [arXiv 2512.16954](https://www.arxiv.org/pdf/2512.16954)

### Inferences
- For Cosmos, each order is a single video (not a multi-shot film), so cross-shot drift matters less than for a film. The main switching costs are disk (H3 33B, H3 20B, Singularity and LTX-2.5 can easily exceed 150 GB in total), model reload time, and maintaining one prompt rewriter per model.
- Staying inside the H3 family (Ref2VA for people, FL2VA for scenes, Singularity as an A/B candidate) and using LTX-2.5 only as a finishing or refining stage limits these risks.
- Any per-scene router should use a fixed benchmark set and same-seed A/B before switching, since every claimed gain found so far is self-reported.

### Gaps
- No real studio or automated-pipeline case study (non-vendor) on per-shot model switching was found.
- No measurement of WanGP model-switch reload time on 16 GB VRAM and the user's RAM was found.

## 6. How does WanGP load LoRAs and finetune definitions per job, so a scheduler can pick model + LoRA per scene automatically?

### Takeaway
Everything is per-job JSON:
- **Settings files:** a settings or queue file passed to `wgp.py --process` carries `model_type`, `activated_loras` (file names, URLs or cached entries, resolved under the model family's LoRA folder) and `loras_multipliers`, with phase syntax.
- **Finetune JSONs** in `finetunes/` define new selectable "models" whose `loras`/`loras_multipliers` are always applied, plus their own URLs, VAE and prompt-enhancer instructions.
- **Lset files** bundle LoRA URLs, multipliers and prompt.

A scheduler can therefore choose model + LoRAs per scene simply by writing a different settings JSON, as the user's Planificateur already does with `model_type`.

### Cited Findings
- **Settings keys:** `activated_loras` is a list of strings ("LoRA file names, URLs, or cached local entries. WanGP resolves them under the model's LoRA directory"). `loras_multipliers` is a string, space or newline separated, with phase multipliers using `;` (e.g. `0;1`). — [WanGP SETTINGS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/SETTINGS.md)
- **Headless processing:** `python wgp.py --process my_settings.json` (settings file, created via "Export Settings") or a queue `.zip`; `--dry-run` validates without generating; `--output-dir` overrides the output directory. — [WanGP CLI.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CLI.md)
- **API discovery:** the WanGP API can list locally available `.safetensors` LoRAs per model family, "suitable for `activated_loras`". — [WanGP API.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/API.md)
- **LoRA folders:**
  - Folders are per family (`loras/ltx2/`, `loras/minimax_h3/` locally, etc.); `--lora-config lora_paths.json` maps families to other drives.
  - WanGP records LoRA download URLs in generated videos and a URL cache file, so missing LoRAs download automatically. — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md)
  - The local install currently holds `loras/minimax_h3/` (Ref2VA PDD 8-step, P-H3-Image, Viggle Remake Swap), `loras/ltx2/` (LTX-2.3 IC-LoRA union control) and `loras/qwen/` (Lightning 4-step). These were observed on disk at `C:\Users\leobi_pntic6c\WanGP\loras`, so there is no URL.
- **Finetune JSONs:**
  - Files in `finetunes/` define a finetune; the file name is its id.
  - A `model` subtree holds `name`, `architecture` (any file name in `defaults/`), `URLs`/`URLs2`, `VAE_URLs`, `text_encoder_URLs`, `loras` + `loras_multipliers` ("applied before any LoRA selected by the user"), `prompt_infos`, `video_prompt_enhancer_instructions`, `resolutions`, and selectable `configs`.
  - A file in `finetunes/` with the same name as a default overrides it property by property.
  - "WanGP finetune system can be also used to tweak default models: for instance you can plug on top of an existing model some loras that will be always applied transparently."
  - Properties such as `URLs` and `loras` can reference another model id to reuse its weights. — [WanGP FINETUNES.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/FINETUNES.md)
  - Built-in H3 variants are themselves such definitions. Example: `minimax_h3_ref2va_pruned_pdd` sets `"loras": "minimax_h3_ref2va_pdd"` (reusing the PDD LoRA list) and fixes 8 steps and the Euler solver. — [WanGP defaults](https://github.com/deepbeepmeep/Wan2GP/tree/main/defaults)
- **Lset files** contain LoRA URLs, default multipliers and the prompt; they are saved from the UI. "Accelerator profiles" replace accelerator LoRAs while keeping user LoRAs; the `|` character separates accelerator multipliers. — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md)
- **System LoRAs:** WanGP auto-adds hidden LoRAs needed by a feature (distilled, Id, outpaint, union control); their multipliers can be overridden by selecting them in Activated LoRAs. — [WanGP CHANGELOG](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/CHANGELOG.md)
- **H3 LoRA conversion:** WanGP auto-maps H3 LoRAs between full and pruned checkpoints using conversion maps. Unknown or ambiguous mappings are reported, not guessed. LoRAs that do not touch the affected conditioning projections need no conversion. — [WanGP LORAS.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/LORAS.md)
- **Deepy templates:** WanGP's Deepy can also override LoRAs, steps, resolution and seed per request on top of a template. — [WanGP DEEPY.md](https://github.com/deepbeepmeep/Wan2GP/blob/main/docs/DEEPY.md)

### Inferences
- The scheduler only needs a scene-to-preset map. Each preset is a settings JSON (`model_type` + `activated_loras` + `loras_multipliers` + steps + prompt template). Alternatively, frozen combinations can be wrapped as finetune JSONs in `finetunes/`, e.g. "ref2va_realism" = Singularity V2 pruned + Realism LoRA at 0.7, with its own `prompt_infos`, so that the job file only names the model id.
- Validate each new combination with `--dry-run`, then with one real render per the user's minimal testing budget.

### Gaps
- Whether `activated_loras` URLs are auto-downloaded in pure `--process` headless mode (rather than only from the UI) was not explicitly confirmed. The docs say missing LoRAs from URLs in settings or Lset files are downloaded "the first time you try to generate".
- Stacking behaviour (quality impact) of a style LoRA on top of the embedded PDD or RefAsymOPD distillation LoRAs is undocumented.

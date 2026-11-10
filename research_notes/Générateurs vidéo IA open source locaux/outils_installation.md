# Outils d'installation et d'inférence pour la génération vidéo locale (open-weight), comparés à WanGP — état au 10 novembre 2026

Contexte : un seul PC Windows 11, RTX 5070 Ti 16 Go (Blackwell sm_120), WanGP piloté sans interface (`wgp.py --process`) par un planificateur maison. Statistiques GitHub relevées le 2026-11-10 via l'API GitHub (`gh api repos/...`) sauf mention contraire.

## 1. Quelles sont les options principales ? (URL, activité, modèles, Windows, RTX 50, gestion VRAM, mode headless, licence)

### Takeaway
En novembre 2026, deux outils restent pertinents pour un serveur de jobs Windows 16 Go : WanGP (application tout-en-un, la plus axée petite VRAM, avec une vraie API Python depuis mars 2026) et ComfyUI (146 k étoiles, prise en charge native dès le jour 0 des nouveaux modèles, API HTTP et websocket standard). Les autres outils sont soit des surcouches (SwarmUI sur ComfyUI, Pinokio et Stability Matrix comme lanceurs), soit des moteurs orientés Linux ou serveur (LightX2V, FastVideo, xDiT, DiffSynth, diffusers) qui n'offrent pas d'installation Windows clé en main.

### Cited Findings

**Tableau d'activité GitHub (relevé le 2026-11-10)**

| Projet | URL | Étoiles | Dernier push | Licence (SPDX GitHub) |
|---|---|---|---|---|
| WanGP (ex-Wan2GP, le dépôt redirige) | https://github.com/deepbeepmeep/WanGP | 11 559 | 2026-11-09 | « WanGP Community License 2.0 » (NOASSERTION) |
| ComfyUI | https://github.com/Comfy-Org/ComfyUI | 146 084 | 2026-11-10 | GPL-3.0 |
| ComfyUI-Manager | https://github.com/Comfy-Org/ComfyUI-Manager | 16 787 | 2026-11-08 | GPL-3.0 |
| ComfyUI-WanVideoWrapper (Kijai) | https://github.com/kijai/ComfyUI-WanVideoWrapper | 6 813 | **2026-05-24** | Apache-2.0 |
| ComfyUI-LTXVideo (Lightricks) | https://github.com/Lightricks/ComfyUI-LTXVideo | 4 259 | 2026-10-20 | « Other » (licence propre) |
| ComfyUI-GGUF (city96) | https://github.com/city96/ComfyUI-GGUF | 4 238 | 2026-01-12 | Apache-2.0 |
| SwarmUI | https://github.com/mcmonkeyprojects/SwarmUI | 4 764 | 2026-11-08 | MIT |
| DiffSynth-Studio | https://github.com/modelscope/DiffSynth-Studio | 13 353 | 2026-11-10 | Apache-2.0 |
| diffusers | https://github.com/huggingface/diffusers | 34 894 | 2026-11-10 | Apache-2.0 |
| LightX2V | https://github.com/ModelTC/LightX2V | 2 999 | 2026-11-10 | Apache-2.0 |
| FastVideo | https://github.com/hao-ai-lab/FastVideo | 4 802 | 2026-11-10 | Apache-2.0 |
| xDiT | https://github.com/xdit-project/xDiT | 2 751 | 2026-11-10 | Apache-2.0 |
| SD.Next | https://github.com/vladmandic/sdnext | 7 374 | 2026-11-10 | Apache-2.0 |
| Pinokio | https://github.com/pinokiocomputer/pinokio | 8 385 | 2026-11-05 | MIT |
| Stability Matrix | https://github.com/LykosAI/StabilityMatrix | 9 008 | 2026-10-21 | AGPL-3.0 |
| Wan2.1 (officiel) | https://github.com/Wan-Video/Wan2.1 | 17 413 | 2026-03-05 | Apache-2.0 |
| Wan2.2 (officiel) | https://github.com/Wan-Video/Wan2.2 | 18 505 | 2026-09-21 | Apache-2.0 |
| LTX-2 (officiel) | https://github.com/Lightricks/LTX-2 | 10 174 | 2026-11-05 | Apache-2.0 |
| LTX-Video (officiel) | https://github.com/Lightricks/LTX-Video | 11 353 | 2026-11-02 | Apache-2.0 |
| HunyuanVideo-1.5 | https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5 | 4 597 | 2026-04-10 | NOASSERTION |
| FramePack | https://github.com/lllyasviel/FramePack | 17 351 | 2025-10-16 (inactif) | Apache-2.0 |

Source pour tout le tableau : API GitHub (`gh api repos/<owner>/<repo>`), consultée le 2026-11-10, par exemple [WanGP](https://github.com/deepbeepmeep/WanGP), [ComfyUI](https://github.com/Comfy-Org/ComfyUI).

Dernières versions publiées (API GitHub, releases) : ComfyUI v0.44.0 (2026-11-04), v0.43.0 (2026-10-27) ; SwarmUI 0.9.8-Beta (2026-02-06) ; LightX2V 0.6.1 (2026-11-09) ; FastVideo v0.2.0 (2026-06-04) ; diffusers v0.42.1 (2026-10-27) — [ComfyUI releases](https://github.com/Comfy-Org/ComfyUI/releases), [LightX2V releases](https://github.com/ModelTC/LightX2V/releases).

**WanGP (deepbeepmeep)**
- Dernière version : v19.25 « Bonus Track », 9 novembre 2026. Rythme très soutenu : v19.02 (30 oct.), v19.14 (4 nov.), v19.25 (8 et 9 nov.) — [README WanGP](https://github.com/deepbeepmeep/WanGP)
- Modèles vidéo : Wan 2.1/2.2 et dérivés, MiniMax H3, LTX-2/2.3/2.5, Hunyuan Video 1/1.5, LongCat, Kandinsky, LTXV, MagiHuman, ainsi que des modèles de « monde » (Hy-Nomas 8B, EVOKE Turbo 14B) — [README WanGP](https://github.com/deepbeepmeep/WanGP)
- Installation conseillée pour RTX 20xx à 50xx : Python 3.11.14, torch 2.10.0, CUDA 13.0 (cu130). Les RTX 50xx doivent utiliser PyTorch 2.10 et Triton 3.6 pour les noyaux INT8 et NV FP4 optimisés. L'image Docker est restée en CUDA 12.4.1 / PyTorch 2.6 et ne cite que les RTX 40xx et plus anciennes — [README WanGP](https://github.com/deepbeepmeep/WanGP), [docs/INSTALLATION.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md)
- Gestion VRAM : profils mmgp (dont le profil 0 expérimental « More Speed with Less RAM »), récupération de la mémoire des modèles inactifs, quantifications int8/fp8/gguf/NV FP4/Nunchaku ; certains modèles tournent avec « as little as 4 GB of VRAM » — [README WanGP](https://github.com/deepbeepmeep/WanGP)
- Fonctionnement sans interface : mode batch en ligne de commande, `python wgp.py --process my_queue.zip`, « WanGP API », interface MCP — [README WanGP](https://github.com/deepbeepmeep/WanGP)
- API Python en mémoire (`shared/api.py`, annoncée le 2026-03-10) : `init()` renvoie une `WanGPSession` qui garde le dernier modèle chargé d'une requête à l'autre ; `submit_task(settings)` accepte les réglages exportés depuis l'interface ; événements de progression, d'aperçu et de console ; `job.result()` renvoie `success`, `generated_files` et `errors` — [docs/API.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/API.md)
- Installation Windows : WanGP Manager (application Windows expérimentale `WanGPManager.exe`, ajoutée en v19.02), scripts install/run/update/manage `.bat`, Pinokio, conda manuel — [README WanGP](https://github.com/deepbeepmeep/WanGP)

**ComfyUI (+ Manager, wrappers, GGUF)**
- Le build portable officiel pour Nvidia embarque CUDA 13.0 et Python 3.13 ; le build CUDA 12.6 / Python 3.12 est réservé aux cartes série 10 et plus anciennes — [docs.comfy.org (portable Windows, ES)](https://docs.comfy.org/es/installation/comfyui_portable_windows.md) (source secondaire via la recherche, non lue en entier)
- Kijai, auteur de ComfyUI-WanVideoWrapper, contribue désormais directement au cœur de ComfyUI. Les notes de version récentes contiennent ses PR « Support MiniMax-H3 latent upscaler model », « Support MiniMax Sol-H3-VAE » et « Support context windows for MiniMax-H3 ». Le dernier commit du wrapper date du 2026-05-24 et le dépôt compte 1 288 issues ouvertes — [ComfyUI latest release](https://github.com/Comfy-Org/ComfyUI/releases/latest), API GitHub [WanVideoWrapper](https://github.com/kijai/ComfyUI-WanVideoWrapper)
- Nouvelle gestion mémoire « Dynamic VRAM » et comfy-aimdo (`aimdo.dll` sous Windows) ; PR ouverte « wxa8: Support adaptive quantization under VRAM pressure » (2026-11-09) — [ComfyUI #17634](https://github.com/Comfy-Org/ComfyUI/pull/17634)
- Un fil Reddit rapporte que la nouvelle gestion mémoire de ComfyUI peut charger des modèles plus gros que la VRAM en s'appuyant sur la RAM système ; sur une 5060 Ti 16 Go, des utilisateurs font tourner LTX 2.3 et Wan 2.2 ; il faut au moins 32 Go de RAM pour éviter les plantages en FP8 — [résumé de recherche Reddit (miroir reddit.sentinel-team.org)](https://reddit.sentinel-team.org/posts/1s3d3b9/snapshots/2026-03-28T05%3A33%3A01.316841Z) (anecdotique)

**SwarmUI**
- Interface web modulaire (C#/.NET) qui installe et pilote ComfyUI en arrière-plan (onglet « Comfy Workflow ») ; gère les modèles vidéo MiniMax H3, Wan et LTX-2 ; installation Windows via `install-windows.bat` ; .NET 8 et .NET 10 nécessaires ; licence MIT ; version 0.9.8 Beta, statut « Almost-Release » — [README SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI)
- Le README ne détaille pas l'API HTTP ou websocket ; il renvoie au dossier /docs — [README SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI)

**LightX2V (ModelTC)**
- Modèles : Wan2.1/2.2 (T2V, I2V, VACE, S2V, Animate), LTX-2/2.3/2.5, MiniMax-H3, HunyuanVideo-1.5, LingBot-Video, InfiniteTalk, Self-Forcing, ainsi que des modèles d'image (Qwen-Image 2.1, FLUX.2, Z-Image) — [README LightX2V](https://github.com/ModelTC/LightX2V)
- Offload disque/CPU/GPU au niveau du modèle et des blocs ; quantifications W8A8 (INT8/FP8) et W4A4 (NVFP4, Wan2.2 NVFP4 pour Blackwell) ; modèles et LoRA distillés en 4 étapes (Wan2.2-I2V-A14B 720p, HunyuanVideo-1.5, MiniMax-H3 Turbo 4/8 étapes) — [README LightX2V](https://github.com/ModelTC/LightX2V)
- Serveur HTTP recommandé (« using LightX2V through its service API », port 8000, requêtes asynchrones) ; intégration ComfyUI ; guide Windows et `requirements_win.txt`, mais pas de paquet Windows en un clic — [README LightX2V](https://github.com/ModelTC/LightX2V)
- Les noyaux LightX2V sont aussi intégrés à la pile RTX 50 du lanceur Pinokio de WanGP — [pinokio.co](https://pinokio.co/posts/01kzh8a652cnf8ey59ej8dq352) (source secondaire)

**FastVideo (hao-ai-lab)**
- Modèles phares : famille FastH3 (dérivée de MiniMax-H3 ; FastH3 Trim annoncé à partir de 8 Go, le 2026-10-06), FastWan, Kandinsky 6 (2026-10-06), FastH3 Omni (2026-10-21) ; Video Sparse Attention ; API Python `VideoGenerator.from_pretrained` ; pas de mode serveur générique (Dreamverse est une application séparée) — [README FastVideo](https://github.com/hao-ai-lab/FastVideo)
- Le README annonce « Support Linux, Windows, MacOS », mais la liste matérielle générale cite H100, A100 et 4090. Les RTX 5090 et RTX PRO 6000 n'apparaissent que pour FastH3 — [README FastVideo](https://github.com/hao-ai-lab/FastVideo)

**DiffSynth-Studio (ModelScope)**
- Modèles vidéo : MiniMax-H3, LingBot-Video, LTX-2, Wan (2.2, Wan-Animate-2) ; ordonnancement des paramètres entre disque, RAM et VRAM ; quantifications NF4/INT8 et EntroPack ; projet très orienté entraînement (LoRA, FP8, offload CPU). Le README ne mentionne pas Windows — [README DiffSynth-Studio](https://github.com/modelscope/DiffSynth-Studio)

**SD.Next**
- Interface web pour images et vidéos (texte vers vidéo, image vers vidéo) sur Nvidia, AMD, Intel, Apple et CPU ; Apache-2.0 — [README SD.Next](https://github.com/vladmandic/sdnext)

**Lanceurs (Pinokio, Stability Matrix)**
- Lanceur Pinokio de WanGP reconstruit (daté du 8/8/2026 par une source) avec des piles par GPU : pour les RTX 50, PyTorch 2.10/CUDA 13, SageAttention, FlashAttention, SpargeAttention, noyaux LightX2V, Nunchaku, GGUF CUDA. Un pilote R580 ou plus récent est requis. Une source signale un bug possible : la condition « RTX 50 Linux » serait trop large — [pinokio.co post](https://pinokio.co/posts/01kzh8a652cnf8ey59ej8dq352) (source communautaire, non vérifiée)
- Stability Matrix est sous AGPL-3.0, Pinokio sous MIT — API GitHub ([StabilityMatrix](https://github.com/LykosAI/StabilityMatrix), [Pinokio](https://github.com/pinokiocomputer/pinokio))

### Inferences
- Le seul nouveau venu de 2026 qui pèse est le modèle MiniMax-H3, pas un nouvel outil. Il est pris en charge par WanGP, ComfyUI natif, LightX2V, FastVideo, DiffSynth et SwarmUI. Côté outils, les nouveautés 2026 sont l'API Python de WanGP, WanGP Manager et la Dynamic VRAM / comfy-aimdo de ComfyUI.
- ComfyUI-WanVideoWrapper n'est plus actualisé depuis mai 2026 et son auteur travaille désormais sur le cœur de ComfyUI. Pour une nouvelle installation ComfyUI, il vaut mieux viser les nœuds natifs que le wrapper.
- LightX2V est l'alternative la plus intéressante comme moteur pur avec serveur HTTP (Apache-2.0), mais l'installation Windows se fait à la main et n'a pas été éprouvée sur une 5070 Ti dans les sources trouvées.
- SwarmUI, Pinokio et Stability Matrix ajoutent une couche de plus (et .NET pour SwarmUI). Ils apportent peu à un serveur de jobs sans interface.

### Gaps
- Stars au fil du temps (croissance 2026) non relevées, seulement l'instantané du 2026-11-10.
- Prise en charge vidéo exacte de SD.Next (quels modèles Wan/LTX/H3) et de Stability Matrix non vérifiée.
- Le README de xDiT n'a pas été lu. xDiT vise surtout le parallélisme multi-GPU, donc il compte peu pour un seul GPU.
- L'API REST/websocket de SwarmUI n'a pas été lue (le README ne la décrit pas).

## 2. API de ComfyUI ou mode CLI/process de WanGP pour un serveur de jobs automatisé ? Stabilité sous Windows ?

### Takeaway
ComfyUI expose une API HTTP complète (`POST /prompt`, `/queue`, `/history`, `/interrupt`, `/free`, websocket `/ws`), mais sans authentification et avec un format de graphe à maintenir. WanGP offre maintenant mieux que `--process` : une API Python en mémoire qui garde le modèle chargé et renvoie des événements structurés. Côté stabilité, ComfyUI a en novembre 2026 plusieurs bugs ouverts de plantage silencieux et de fuite mémoire liés à sa nouvelle gestion mémoire, dont un sur une RTX 5060 Ti 16 Go sous Windows.

### Cited Findings
- Routes du serveur ComfyUI : `POST /prompt` (mise en file ; renvoie `prompt_id` et `number`, ou `error` et `node_errors`), `GET /queue`, `POST /queue` (vider), `POST /interrupt`, `POST /free` (décharger les modèles), `GET /history/{prompt_id}`, `POST /upload/image`, `GET /view`, `GET /system_stats`, plus le websocket `/ws` (messages `status`, `execution_start`, `executing`, `progress`, `executed`, `execution_cached`). La page ne décrit aucune authentification — [docs.comfy.org server routes](https://docs.comfy.org/development/comfyui-server/comms_routes)
- WanGP : `wgp.py --process my_queue.zip` traite une file sauvegardée sans interface — [README WanGP](https://github.com/deepbeepmeep/WanGP)
- WanGP API : « keep the last loaded model alive across requests, receive structured progress updates » ; `submit_task`, `submit_manifest`, `list_model_defs`, `list_model_metadata(include_availability=True)`, post-traitements (upscale, remux audio). Toute intégration doit indiquer qu'elle utilise WanGP, dans son interface et sa documentation — [docs/API.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/API.md)
- Bug ComfyUI ouvert le 2026-11-08 : « Silent crash / Application Error in aimdo.dll during video generation on RTX 50-series ». Configuration : RTX 5060 Ti 16 Go, Comfy Portable v0.44.x, MiniMax. Le processus meurt sur une violation d'accès 0xc0000005 sans exception Python — [ComfyUI #17606](https://github.com/Comfy-Org/ComfyUI/issues/17606)
- Autres bugs ComfyUI ouverts début novembre 2026 : plantage CUDA « on second prompt execution with Dynamic VRAM enabled » ([#17609](https://github.com/Comfy-Org/ComfyUI/issues/17609)) ; « Unload leaks int8_convrot weights — VRAM/RAM never released, next job OOMs » sur ROCm ([#17597](https://github.com/Comfy-Org/ComfyUI/issues/17597)) ; « Execution cache silently replays stale outputs when a reference image file changes » ([#17552](https://github.com/Comfy-Org/ComfyUI/issues/17552)) ; plantage de chargement vidéo AIMDO mmap ([#17626](https://github.com/Comfy-Org/ComfyUI/issues/17626))
- ComfyUI retravaille son API de nœuds personnalisés : PR « V4 custom node API (comfy_api.v4) » ouverte le 2026-11-10 — [ComfyUI #17647](https://github.com/Comfy-Org/ComfyUI/pull/17647)

### Inferences
- Pour un planificateur qui interroge le site toutes les 20 s, l'API Python de WanGP (processus persistant, modèle gardé en mémoire, résultats structurés) est probablement une meilleure piste qu'un lancement de `--process` à chaque job, et moins coûteuse qu'une migration vers ComfyUI.
- Avec ComfyUI, il faudrait gérer en plus : le graphe JSON au format API (à figer par version), le suivi par websocket ou l'interrogation de `/history`, la redémarrage du processus après un plantage natif (`aimdo.dll`) et le piège du cache qui rejoue d'anciens résultats si une image de référence change sous le même nom (#17552). Il faut donc un nom de fichier unique par job.
- Les bugs #17606 et #17609 touchent exactement le cas visé (RTX 50 16 Go, vidéo, plusieurs prompts à la suite). C'est un argument contre un passage à ComfyUI pour la production à court terme.

### Gaps
- Aucune comparaison chiffrée de fiabilité (taux d'échec, fuites sur plusieurs centaines de jobs) entre WanGP et ComfyUI n'a été trouvée.
- Les issues WanGP liées au mode headless et à la stabilité Windows n'ont pas été dépouillées en détail.

## 3. Quel outil reçoit les nouveaux modèles en premier (jour 0), et lequel est le plus optimisé pour 16 Go ?

### Takeaway
ComfyUI est l'outil qui reçoit le plus systématiquement les nouveaux modèles le jour même (nœuds natifs maintenus avec les éditeurs, comme pour LTX-2 et MiniMax-H3). WanGP suit en quelques jours, avec un rythme de versions quasi quotidien. Pour les cartes de 16 Go et moins, WanGP reste la référence citée par la communauté, mais aucun banc d'essai direct WanGP contre ComfyUI sur 16 Go n'a été trouvé.

### Cited Findings
- LTX-2 « natively supported in ComfyUI on Day 0 » (janvier 2026) — [WaveSpeed blog](https://wavespeed.ai/blog/posts/blog-ltx-2-comfyui-quickstart) (source tierce)
- Plusieurs sites tiers rapportent que ComfyUI a pris en charge nativement MiniMax H3 le jour de la publication des poids (août 2026) — [kompozy.io](https://kompozy.io/news/comfyui-minimax-h3-day-0-support) (source tierce, non officielle)
- Prise en charge jour 0 de Wan2.2 dans ComfyUI (2025) — [blog.comfy.org](https://blog.comfy.org/p/wan22-day-0-support-in-comfyui)
- LightX2V revendique un « Day-0 Qwen-Image-2.1 support » (2026-09-20) — [README LightX2V](https://github.com/ModelTC/LightX2V)
- Chronologie 2026 de WanGP (d'après des miroirs du changelog) : LTX-2 2.3 en v10.981 (7 mars), API WanGP en v11.13 (30 mars), « The VRAM Digger » en v12.3 (1er juillet), puis v19.x fin octobre et novembre — [miroir du changelog via recherche](https://github.com/banodoco/Wan2GP), [README WanGP](https://github.com/deepbeepmeep/WanGP)
- Un guide japonais présente WanGP comme une application Gradio autonome utilisable dès 6 Go, et ComfyUI comme l'option plus libre pour 8 Go et plus. Des utilisateurs de Reddit jugent « Wan2GP is better suited » pour les petites cartes (« works even with 8 GB ») — [aipicks.jp](https://aipicks.jp/mag/comfyui-guide-2026), [miroir Reddit](https://reddit.sentinel-team.org/posts/1r13uvo/snapshots/2026-02-11T02%3A40%3A58.810348Z)
- Un fil « wangp vs comfyui on 5060ti which one is faster? » est resté sans réponse — résumé de recherche (miroirs Reddit 2026), pas de source fiable

### Inferences
- Pour une activité dont les presets sont figés, le jour 0 compte peu. Quelques jours de retard de WanGP ne posent pas problème.
- Sur 16 Go, l'avantage de WanGP (mmgp, profils, NV FP4 pour Blackwell, noyaux intégrés) est documenté par le projet et par des témoignages, mais il n'est pas mesuré de façon indépendante.

### Gaps
- Aucun banc d'essai indépendant WanGP, ComfyUI et LightX2V sur RTX 5070 Ti ou 5060 Ti 16 Go n'a été trouvé.
- Pas de confirmation officielle de blog.comfy.org pour le jour 0 de MiniMax-H3 (sources tierces seulement).

## 4. Points douloureux sous Windows (Triton-windows, SageAttention, flash-attn, Smart App Control) et réponse de chaque projet

### Takeaway
Triton-windows est passé sous l'organisation officielle triton-lang (février 2026) et s'installe par pip. Blackwell exige Triton ≥ 3.3, PyTorch ≥ 2.7 et CUDA ≥ 12.8. WanGP intègre désormais un helper CUDA précompilé pour Triton 3.7, qui ne demande ni Visual Studio ni exclusion antivirus, ainsi que ses propres roues de noyaux par génération de GPU. ComfyUI a des issues ouvertes en 2026 sur le blocage de DLL Python par Smart App Control et Windows Application Control.

### Cited Findings
- Dépôt woct0rdho/triton-windows archivé le 18 février 2026 ; développement déplacé vers https://github.com/triton-lang/triton-windows ; installation `pip install -U "triton-windows<3.7"` ; correspondances PyTorch 2.7 → Triton 3.3, 2.8 → 3.4, 2.9 → 3.5, 2.10 → 3.6. Les roues embarquent CUDA 12.8 (Triton 3.3 à 3.6). Blackwell sm_120 est pris en charge à partir de Triton 3.3, PyTorch 2.7 et CUDA 12.8. Le README ne parle pas de Smart App Control ; pour « DLL load failed while importing libtriton », il pointe vers des vcredist obsolètes — [triton-windows (archive)](https://github.com/woct0rdho/triton-windows)
- WanGP : helper CUDA précompilé pour Triton 3.7.0.post26 et 3.7.1.post27, activé automatiquement sous Windows 64 bits avec Python 3.11 ; « No separate helper installation, Visual Studio or antivirus exclusion is needed ». Passer à Triton 3.7 est conseillé quand un antivirus bloque le helper CUDA généré par Triton — [docs/INSTALLATION.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md)
- WanGP : SageAttention 2.2.0 pour RTX 30xx et plus récentes, Blackwell compris ; les scripts d'installation Windows et Linux incluent les WGPKernels pour RTX 20xx à 50xx ; Comfy Kitchen (noyaux CUDA précompilés, pilote R580+) installé via `requirements.txt` ; conseil RTX 50xx : `python wgp.py --attention sage2 --profile 4 --fp16` — [docs/INSTALLATION.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md), [docs/TROUBLESHOOTING.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/TROUBLESHOOTING.md)
- WanGP partage maintenant Comfy Kitchen avec l'écosystème ComfyUI pour l'INT8 — [docs/INSTALLATION.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md)
- Fork Windows de SageAttention maintenu (woct0rdho/SageAttention, dernier push 2026-10-09) ; le dépôt amont thu-ml/SageAttention n'a pas été poussé depuis le 2026-01-17 — API GitHub ([woct0rdho/SageAttention](https://github.com/woct0rdho/SageAttention), [thu-ml/SageAttention](https://github.com/thu-ml/SageAttention))
- Issues ComfyUI : « Windows 11 26H2 Smart App Control blocks ComfyUI Python runtime DLLs » (2026-10-09, [#16911](https://github.com/Comfy-Org/ComfyUI/issues/16911)) ; « WinError 4551 - Windows Application Control blocks PyTorch DLLs (c10_cuda.dll, shm.dll) » (2026-07-28, [#15117](https://github.com/Comfy-Org/ComfyUI/issues/15117)) ; « comfy-aimdo failed to load: [WinError 4551] » (2026-03-21, [#13088](https://github.com/Comfy-Org/ComfyUI/issues/13088))
- Aucune issue « Smart App Control » n'a été trouvée sur le dépôt WanGP (recherche `gh search issues` du 2026-11-10) — [WanGP issues](https://github.com/deepbeepmeep/WanGP/issues)
- flash-attn sous Windows : WanGP indique seulement « Linux: Usually works with `pip install flash-attn` » ; la compilation sous Windows reste un problème connu — [docs/TROUBLESHOOTING.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/TROUBLESHOOTING.md)
- ComfyUI portable embarque Python 3.13 et cu130, alors que WanGP recommande Python 3.11 et cu130. Les roues tierces (Sage, Triton) doivent donc correspondre à des versions de Python différentes selon l'outil — [docs.comfy.org portable (ES)](https://docs.comfy.org/es/installation/comfyui_portable_windows.md), [docs/INSTALLATION.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md)
- Un dépôt communautaire (ComfyUI-Win-Blackwell) prétend que PyTorch stable ne prend pas en charge sm_120 début 2026 et recommande les nightlies cu130. Cela contredit le README de triton-windows et l'installation stable torch 2.10/cu130 de WanGP. Ce dépôt signale aussi que PyTorch est rétrogradé en silence quand on installe d'autres paquets — [ComfyUI-Win-Blackwell](https://github.com/hiroki-abe-58/ComfyUI-Win-Blackwell), contredit par [triton-windows](https://github.com/woct0rdho/triton-windows) et [WanGP INSTALLATION](https://github.com/deepbeepmeep/WanGP/blob/main/docs/INSTALLATION.md)

### Inferences
- WanGP est le projet qui absorbe le plus les difficultés de Windows : roues précompilées, helper Triton sans exclusion antivirus et scripts « Upgrade ». ComfyUI délègue davantage aux nœuds personnalisés et aux guides communautaires pour Sage et Triton.
- Smart App Control est un risque pour tout outil Python sous Windows 11, mais les sources trouvées ne le documentent que côté ComfyUI.

### Gaps
- Le contenu et la résolution des issues #16911 et #15117 n'ont pas été lus.
- Pas de source sur le comportement de Smart App Control avec WanGP Manager (exécutable non signé ?).

## 5. Licences (contexte : service payant automatisé)

### Takeaway
WanGP est sous une licence propriétaire-communautaire (« WanGP Community License 2.0 ») qui autorise la vente des sorties (avec mention de WanGP) mais interdit sans licence commerciale écrite toute exposition payante du logiciel à des tiers (API, SaaS, hébergé, « monetized backend component »). Toutes les alternatives sérieuses sont sous licences open source standard : ComfyUI GPL-3.0, diffusers, LightX2V, FastVideo, DiffSynth, xDiT et SD.Next Apache-2.0, SwarmUI et Pinokio MIT, Stability Matrix AGPL-3.0. Les poids des modèles gardent leurs propres licences.

### Cited Findings
- Résumé (non contraignant) de la licence WanGP : « You may use WanGP to create outputs and you may sell or license those outputs. You are only asked to credit WanGP when you directly sell or license an output created with WanGP. You may not sell WanGP itself, white-label it, embed it in a paid product, or offer paid API / SaaS / hosted / OEM access to it without a separate written reseller or commercial license. » — [LICENSE.txt WanGP](https://github.com/deepbeepmeep/WanGP/blob/main/LICENSE.txt)
- Le §1.9 définit la « Restricted Commercialization », qui couvre notamment : (b) proposer le logiciel via un service « paid, metered, ... subscription, hosted, managed, API, SaaS... » ; (d) « enabling third parties to invoke, access, automate, or consume the Software through Headless Usage, an API ... in exchange for consideration ». En sont exclus explicitement : (i) l'usage interne, (ii) « using the Software to create Outputs for yourself or for clients » et (iv) les ventes directes de sorties — [LICENSE.txt WanGP](https://github.com/deepbeepmeep/WanGP/blob/main/LICENSE.txt)
- Le §5.2(g) exige une licence commerciale pour « exposing the Software to customers or end users as a paid feature, add-on, or monetized backend component ». Le §7.2 vise aussi l'exposition à des tiers via « Headless Usage in exchange for consideration ». Le §3.3 précise qu'aucune licence n'est requise du seul fait d'être une entreprise rentable, « so long as the Software is not sold, monetized, or made available to third parties » — [LICENSE.txt WanGP](https://github.com/deepbeepmeep/WanGP/blob/main/LICENSE.txt)
- Le §10.2 prévoit que si des sorties ou le logiciel sont exposés à des tiers via headless, une API ou un hébergement, l'exploitant doit communiquer les restrictions d'usage et dissuader les usages interdits. Contact pour une licence commerciale : deepbeepmeep@yahoo.com ou le Discord — [LICENSE.txt WanGP](https://github.com/deepbeepmeep/WanGP/blob/main/LICENSE.txt)
- Historique du fichier LICENSE.txt : commits du 2025-08-07, du 2026-03-10 (« official WanGP API announcement ») et du 2026-04-05 — API GitHub [commits LICENSE.txt](https://github.com/deepbeepmeep/WanGP/commits/main/LICENSE.txt)
- WanGP API : « use of the WanGP API is subject to the WanGP Terms and Conditions. Any product that integrates WanGP should clearly disclose that it uses WanGP in both its user interface and its documentation » — [docs/API.md](https://github.com/deepbeepmeep/WanGP/blob/main/docs/API.md)
- Licences des alternatives (SPDX GitHub) : ComfyUI GPL-3.0, ComfyUI-Manager GPL-3.0, WanVideoWrapper Apache-2.0, ComfyUI-GGUF Apache-2.0, ComfyUI-LTXVideo « Other » (licence propre Lightricks), SwarmUI MIT, DiffSynth-Studio Apache-2.0, diffusers Apache-2.0, LightX2V Apache-2.0, FastVideo Apache-2.0, xDiT Apache-2.0, SD.Next Apache-2.0, Pinokio MIT, Stability Matrix AGPL-3.0, Wan2.1/Wan2.2/LTX-2 (code officiel) Apache-2.0 — API GitHub (voir le tableau de la section 1), [ComfyUI-LTXVideo LICENSE](https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/LICENSE)
- Le README de SwarmUI rappelle que certains projets intégrés ou connectés sont sous GPL, AGPL ou d'autres licences, et que les modèles ont leurs propres conditions — [README SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI)

### Inferences
- Le cas Cosmos est un site où des clients paient (abonnement en tokens ou achat unique) et déclenchent automatiquement une génération via WanGP en headless. Il paraît correspondre aux §1.9(b)/(d), §5.2(g) et §7.2 (« monetized backend component », exposition en headless contre rémunération), plutôt qu'à l'exception « create Outputs for clients ». L'exception (ii) ou la vente directe de sorties (§6) pourraient être plaidées, mais le texte vise explicitement le cas d'un backend payant. C'est une lecture du texte, pas un avis juridique ; une demande de licence commerciale à deepbeepmeep ou une confirmation écrite lèverait l'ambiguïté.
- La GPL-3.0 de ComfyUI n'impose rien pour un usage serveur interne : le logiciel n'est pas distribué et la GPL-3 n'est pas l'AGPL. Les licences Apache-2.0 et MIT (diffusers, LightX2V, FastVideo, SwarmUI) sont encore plus permissives. Il faut tout de même vérifier séparément les licences des poids (Wan Apache-2.0 ; licence LTX-2, MiniMax-H3 et HunyuanVideo propres) et des nœuds personnalisés comme ComfyUI-LTXVideo.

### Gaps
- Le texte complet de la licence ComfyUI-LTXVideo et celui des poids MiniMax-H3 et LTX-2 n'ont pas été lus.
- Le prix et les conditions d'une licence commerciale WanGP ne sont pas publics : aucune information trouvée.

# Auto-hébergement GPU de modèles ouverts comme alternative à fal pour Cosmos

Toutes les pages ont été consultées le 2026-11-04, sauf date contraire indiquée. Aucun test n'a été lancé, aucun compte créé, rien de facturé. Chaque élément porte un statut : **FAIT VÉRIFIÉ** (lu sur une source primaire ou le classement lui-même), **DÉDUCTION** (calcul ou raisonnement à partir de faits), **NON VÉRIFIÉ** (source secondaire, chiffre de vendeur ou hypothèse). Les pages ont été lues par extraction automatique : un chiffre décisif reste à relire à la main avant toute décision.

## Quels modèles ouverts sont les plus proches de chaque usage de Cosmos, et quelle est leur qualité face à Kling 4.0 et Nano Banana 2.1 ?

### Takeaway
Les meilleurs modèles à poids ouverts sont presque tous inutilisables par Cosmos pour une raison de licence (voir question suivante). Parmi ceux qui restent, l'écart est net : FLUX 3 Image Klein est assez proche de Nano Banana 2.1, mais en vidéo Wan 2.2 et LTX sont loin derrière Kling. Aucun classement indépendant ne mesure le remplacement de personne.

### Cited Findings

**Image avec références** — classement AA-Image-Editing v2.1, FLUX.2 [dev] fixé à 1000, page sans date de mise à jour, sorties listées jusqu'à octobre 2026.

| Modèle | Elo édition | Elo texte-image | Ouvert ? | Utilisable par Cosmos ? |
|---|---|---|---|---|
| Nano Banana 2.1 (actuel) | 1151 | 1176 | Non | Référence, via fal |
| Fibo 2.0 | 1088 | 1040 | Oui | Non, CC BY-NC |
| Qwen-Image-2.1 | 1081 | 1043 | Oui | Non, recherche seulement |
| FLUX 3 Image Klein | 1072 | 1043 | Oui | Oui sous 5 M$ de CA |
| HunyuanImage 3.0 Instruct | 1064 | n.c. | Oui | Non, UE exclue |
| Qwen Image Edit Plus 2511 | 993 | n.c. | Oui | Probablement, Apache 2.0 |
| FLUX.2 [klein] 4B | 941 | n.c. | Oui | Probablement, Apache 2.0 |

- FAIT VÉRIFIÉ : scores d'édition des modèles ouverts — [AA open weights](https://artificialanalysis.ai/image/leaderboard/editing/open-weights).
- FAIT VÉRIFIÉ : Nano Banana 2.1 rang 4-7, Elo 1151, 33,6 $ pour 1 000 images ; Fibo 2.0 rang 19-26 — [AA édition](https://artificialanalysis.ai/image/leaderboard/editing).
- FAIT VÉRIFIÉ : en texte-image, Nano Banana 2.1 est 4e à 1176 ; le meilleur ouvert est 21e à 1043 — [AA texte-image](https://artificialanalysis.ai/image/leaderboard/text-to-image).
- FAIT VÉRIFIÉ : FLUX 3 Image Klein accepte jusqu'à 10 images de référence, sorti le 15 octobre 2026 — [BFL](https://bfl.ai/blog/flux-3-image-klein).
- FAIT VÉRIFIÉ : Qwen-Image-2.1 accepte aussi jusqu'à 10 références — [Hugging Face](https://huggingface.co/Qwen/Qwen-Image-2.1).

**Vidéo 720p**

| Modèle | Arena image-vidéo (21/09/2026) | AA texte-vidéo (Kling 3.0 Pro = 1000) | Ouvert ? |
|---|---|---|---|
| MiniMax H3 (768p) | 1495, 1er | 1160, 3e | Oui, UE exclue |
| Wan 3.0 | 1480 | 1172, 1er | Non |
| Wan 2.7 | 1428 | 1035 | Non |
| Kling 3.0 Pro | 1354 | 1000 | Non |
| HunyuanVideo 1.5 | 1198 | Hors top 30 | Oui, UE exclue |
| Wan 2.2 A14B | 1170 | Hors top 30 | Oui, Apache 2.0 |
| LTX-2 19B | 1159 | n.c. | Oui, communautaire |
| LTX-2.5 Fast / Pro | n.c. | 944 / 940 | Oui, communautaire |

- FAIT VÉRIFIÉ : colonne Arena, 48 modèles, 2 081 953 votes, Kling 4.0 absent — [Arena](https://arena.ai/leaderboard/video/image-to-video).
- FAIT VÉRIFIÉ : colonne AA, Kling 4.0 absent des 30 premiers — [AA texte-vidéo](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- FAIT VÉRIFIÉ : seule mesure indépendante trouvée pour Kling 4.0 : Design Arena, 7e, Elo 1288, 618 victoires pour 420 défaites, devant H3 (1276) et derrière Wan 3.0 (1321). Mise à jour du 4 novembre 2026. Les scores LTX y sont masqués et Wan 2.2 n'est pas dans les 15 lignes visibles — [Design Arena](https://www.designarena.ai/leaderboard/video).
- FAIT VÉRIFIÉ : les poids Wan s'arrêtent à 2.2 selon Arena (Wan 2.5 à 3.0 marqués fermés) — [Arena](https://arena.ai/leaderboard/video/image-to-video). NON VÉRIFIÉ : un guide tiers confirme l'absence de poids officiels pour Wan 2.7, et limite les clips Wan 2.2 à environ 5 s, à enchaîner au-delà — [LocalAIMaster](https://localaimaster.com/blog/wan-video-generation-guide).
- Attention : des pages de référencement annoncent Wan 2.7 ou 3.0 en Apache 2.0, ce que contredisent ces classements — [Pinggy](https://pinggy.io/blog/best_video_generation_ai_models/).

**Remplacement de personne en gardant le mouvement**
- FAIT VÉRIFIÉ : Wan2.2-Animate-14B a un mode remplacement officiel (`--replace_flag`, relighting LoRA), préparation incluse — [GitHub Wan2.2](https://github.com/Wan-Video/Wan2.2).
- FAIT VÉRIFIÉ : SCAIL-2 (zai-org, 9 juin 2026, base Wan 2.1) a un mode remplacement avec masque et un LoRA de relighting. Sa résolution monte à 704p, pas 720p. Le multi-référence n'est « pas optimisé » — [GitHub SCAIL-2](https://github.com/zai-org/SCAIL-2).
- NON VÉRIFIÉ : les auteurs de SCAIL-2 disent battre Wan-Animate et MoCha, et citent des artefacts sombres autour de la personne chez Wan-Animate. C'est leur propre article — [arXiv](https://arxiv.org/html/2606.10804v1).
- NON VÉRIFIÉ : retours communautaires : MoCha préserve moins l'identité mais gère très bien la lumière ; Wan Animate garde mieux le décor que SCAIL — [notes Wan Animate](https://wanx-troopers.github.io/wan-animates.html).
- FAIT VÉRIFIÉ : le banc AA d'édition vidéo mesure l'édition par instruction, pas le remplacement. Hyperflow H3 et MiniMax H3 y sont les seuls à lien Hugging Face, et Kling 4.0 en est absent — [AA édition vidéo](https://artificialanalysis.ai/video/leaderboard/video-editing). Hyperflow n'est qu'un LoRA à poser sur H3, sous la même licence — [Hugging Face](https://huggingface.co/videorebirth/hyperflow).

**Préparation**
- FAIT VÉRIFIÉ : Cosmos utilise `fal-ai/sam-3/video-rle` et `fal-ai/depth-anything-video` en `VDA-Large` dans `presets/arrivee-star/preset.json`, et `scripts/preset-prepare.mjs` indique que cette préparation est « faite une seule fois » par preset, pour ≈ 0,48 $.

### Inferences
- DÉDUCTION : si ces Elo suivent la formule standard, Nano Banana 2.1 serait préféré à Klein dans environ 61 % des duels en édition (écart 79) et 68 % en texte-image (écart 133) ; à Qwen Edit 2511 dans 71 % ; à FLUX.2 klein 4B dans 77 %.
- DÉDUCTION : Kling 3.0 Pro serait préféré à Wan 2.2 dans environ 74 % des duels (écart 184 sur Arena) et à LTX-2.5 Fast dans 58 % (écart 56 sur AA). Kling 4.0, plus récent et à égalité avec H3 chez Design Arena, creuse probablement cet écart, mais aucune mesure directe ne le prouve.
- DÉDUCTION : les échelles Arena, AA et Design Arena ne se comparent pas entre elles.

### Gaps
- Aucun classement indépendant de Kling 4.0 Video Edit, ni du remplacement de personne en général. Seul un test à l'aveugle sur les presets de Cosmos trancherait, et il est payant : il n'a pas été lancé.
- SteadyDancer : aucune comparaison trouvée. MoCha : licence non vérifiée.

## Licences : usage commercial autorisé pour Cosmos ?

### Takeaway
Quatre des meilleurs modèles ouverts sont exclus pour Cosmos, sur la base de textes lus pour H3 et Qwen : H3 interdit même ses sorties dans l'UE, Hunyuan exclut l'UE, Qwen-Image-2.1 et Fibo 2.0 sont non commerciaux. Restent Wan 2.2 et Wan Animate (Apache 2.0), SCAIL-2 (Apache 2.0), LTX-2.5 (gratuit sous 10 M$), FLUX 3 Klein (gratuit sous 5 M$), Qwen Edit 2511 et FLUX.2 klein 4B (Apache 2.0).

### Cited Findings

| Modèle | Licence | Effet pour Cosmos | Statut |
|---|---|---|---|
| MiniMax H3, Hyperflow | Community, UE, R.-U., Corée, États-Unis exclus, sorties comprises (V.4) ; autorisation au-delà de 20 M$ | **Interdit** | FAIT VÉRIFIÉ — [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE) |
| HunyuanVideo 1.5 | Tencent Community, UE, R.-U., Corée exclus | **Interdit** | NON VÉRIFIÉ pour la vidéo — [comparatif](https://www.creativeainews.com/articles/best-open-source-ai-video-models-2026/) |
| HunyuanImage 3.0 | Même clause de territoire | **Interdit** | FAIT VÉRIFIÉ, base de licences — [ScanCode](https://scancode-licensedb.aboutcode.org/tencent-hunyuan-image-3.0-cla.html) |
| Qwen-Image-2.1 | Research : « for research or evaluation purposes only », droit chinois | **Interdit** sans licence payante | FAIT VÉRIFIÉ — [LICENSE](https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE) |
| Fibo 2.0 | CC BY-NC 4.0, accord commercial séparé | **Interdit** sans accord | NON VÉRIFIÉ, fiche miroir — [Comfy-Org](https://huggingface.co/Comfy-Org/Fibo-2.0) |
| FLUX 3 Klein | Kommunity : gratuit sous 5 M$ de CA annuel | Autorisé | FAIT VÉRIFIÉ pour le seuil, texte complet non lu — [BFL](https://bfl.ai/blog/flux-3-image-klein) |
| FLUX.2 klein 4B / 9B | 4B Apache 2.0 ; 9B non commercial | 4B autorisé | NON VÉRIFIÉ, miroir — [HF](https://huggingface.co/bi1o/FLUX.2-klein-4B) |
| Qwen-Image-Edit-2511 | Apache 2.0 | Autorisé | NON VÉRIFIÉ, extrait de la fiche officielle — [HF](https://huggingface.co/Qwen/Qwen-Image-Edit-2511) |
| Wan 2.2, Animate-14B | Apache 2.0, aucun droit revendiqué sur les sorties | Autorisé | FAIT VÉRIFIÉ — [GitHub](https://github.com/Wan-Video/Wan2.2) |
| SCAIL-2 | Apache 2.0 | Autorisé | FAIT VÉRIFIÉ — [GitHub](https://github.com/zai-org/SCAIL-2) |
| LTX-2.5 | Community : gratuit sous 10 M$ de CA | Autorisé, avec conditions | FAIT VÉRIFIÉ — [LICENSE](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x) |
| SAM 3 | SAM License : mondiale, gratuite, usages militaires et armes exclus | Autorisé (« commercial » non écrit tel quel) | FAIT VÉRIFIÉ — [LICENSE](https://github.com/facebookresearch/sam3/blob/main/LICENSE) ; lecture commerciale — [Roboflow](https://roboflow.com/model-licenses/segment-anything-3) |
| Video Depth Anything | Small Apache 2.0 ; Base et Large CC-BY-NC-4.0 | **Small seulement** en auto-hébergement | FAIT VÉRIFIÉ — [GitHub](https://github.com/DepthAnything/Video-Depth-Anything) |

- FAIT VÉRIFIÉ : LTX-2.5 autorise le service hébergé pour des tiers, à condition de reporter ses restrictions dans les CGU (§ 3.1). Il interdit l'usurpation « deepfakes » sans consentement (annexe A), impose marquage et mention de contenu IA, et demande des efforts raisonnables pour utiliser la dernière version (§ 6) — [LICENSE](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x).
- FAIT VÉRIFIÉ : H3 interdit aussi l'usurpation sans consentement (annexe A, point 13) — [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE). Runpod le rappelle lui-même et renvoie la conformité au client — [Runpod](https://www.runpod.io/blog/minimax-h3-the-open-weight-omni-modal-video-model-and-what-it-takes-to-run-it).

### Inferences
- DÉDUCTION : les clauses sur l'usurpation visent l'absence de consentement. La case à cocher sur les droits et l'accord des personnes filmées prévue pour les presets va dans le bon sens, mais c'est à valider juridiquement.
- DÉDUCTION : le classement réel des modèles utilisables par Cosmos s'arrête donc à Klein en image, et à LTX-2.5 puis Wan 2.2 en vidéo. Ce sont eux qui doivent servir au comparatif, pas H3.
- DÉDUCTION : le modèle `minimax/h3-max/recast` testé par Cosmos passe par l'API fal. H3 Max est marqué fermé par AA, donc la licence des poids ne le régit pas directement ; les conditions de l'API restent à lire.

### Gaps
- **Contradiction à lever, indépendamment de cette étude** : `preset.json` utilise `VDA-Large`, sous CC-BY-NC-4.0 en amont, alors que [fal](https://fal.ai/models/fal-ai/depth-anything-video) affiche « Commercial use » sans nommer de licence. Je ne sais pas si fal détient un accord commercial pour ce modèle.
- Texte complet de la FLUX Kommunity License non lu. Licence de HiDream-O1-Image non trouvée. Ce résumé n'est pas un avis juridique.

## Coût par génération : GPU, temps de rendu, tarifs, démarrages à froid, stockage, bande passante, échecs

### Takeaway
En calcul seul, l'auto-hébergement coûte environ 0,20 à 0,24 $ pour 10 s de vidéo avec un rendu accéléré en 4 étapes, contre 1,57 $ chez Kling. Mais ce chiffre dépend d'une hypothèse de temps de rendu fragile : avec un rendu complet sur H100, il grimpe à environ 2,20 $, soit plus cher que Kling.

### Cited Findings

**Tarifs GPU officiels (par GPU)**

| Hébergeur | GPU | VRAM | Tarif | Source |
|---|---|---|---|---|
| Runpod Serverless | RTX 4090 | 24 Go | 1,34 $/h (0,000372 $/s) | [Runpod, 28/10/2026](https://www.runpod.io/pricing) |
| Runpod Serverless | RTX 5090 | 32 Go | 1,79 $/h (0,000497 $/s) | idem |
| Runpod Serverless | L40S | 48 Go | 1,75 $/h (0,000486 $/s) | idem |
| Runpod Serverless | H100 | 80 Go | 5,39 $/h (0,001497 $/s) | idem |
| Runpod Pod Secure / Community | RTX 4090 | 24 Go | 0,89 $/h / 0,34 $/h | idem |
| Beam Serverless | RTX 4090 | 24 Go | 0,000192 $/s + CPU/RAM | [Beam](https://www.beam.cloud/pricing) |
| Modal | L40S | 48 Go | 0,000542 $/s + CPU/RAM | [Modal](https://modal.com/pricing) |
| Modal | H100 | 80 Go | 0,001097 $/s + CPU/RAM | idem |
| Cerebrium | L40s | 48 Go | 0,000542 $/s + CPU/RAM | [Cerebrium](https://www.cerebrium.ai/pricing) |
| Replicate | L40S | 48 Go | 0,000975 $/s | [Replicate](https://replicate.com/pricing) |
| Replicate | H100 | 80 Go | 0,001525 $/s | idem |
| Lambda | A6000 / A10 | 48 / 24 Go | 1,09 $/h / 1,29 $/h à la demande | [Lambda](https://lambda.ai/pricing) |

- Les $/s Runpod sont calculés depuis la page en $/h. La page ne distingue pas les workers flex et active.
- NON VÉRIFIÉ : Baseten, H100 à 0,10833 $/min et L4 à 0,01414 $/min. [Sa page](https://www.baseten.co/pricing/) n'a pas pu être lue, ces tarifs viennent d'un extrait de recherche — [morphllm](https://www.morphllm.com/baseten-pricing).
- NON VÉRIFIÉ : Vast.ai, RTX 4090 à environ 0,50 $/h en médiane à la demande le 20 octobre 2026, 0,37 $/h en interruptible. La page officielle ne montre que des prix en direct non lisibles — [comparatif](https://llmconfigurator.com/zh/blog/runpod-vs-vast-ai-for-llms) ; [Vast](https://vast.ai/pricing).

**Facturation**
- FAIT VÉRIFIÉ : Runpod facture du démarrage du worker à son arrêt, cold start et attente compris, à la seconde supérieure. Un worker à zéro n'est pas facturé. Attente par défaut : 5 s. Volume réseau : 0,07 $/Go/mois sous 1 To — [Runpod](https://docs.runpod.io/serverless/pricing).
- FAIT VÉRIFIÉ : Beam ne facture pas le démarrage à froid — [Beam](https://www.beam.cloud/pricing).
- FAIT VÉRIFIÉ : Replicate facture le temps de mise en route et d'attente des modèles privés — [Replicate](https://replicate.com/pricing).
- FAIT VÉRIFIÉ : Modal, volumes à 0,09 $/Gio/mois avec 1 Tio gratuit, sortie à 0,04 $/Gio avec 1 Tio/mois inclus, 30 $/mois de crédits sur le plan Starter — [Modal](https://modal.com/pricing).
- La page Runpod n'indique aucun tarif de bande passante : à confirmer.

**Temps de rendu (aucun banc indépendant contrôlé trouvé)**
- NON VÉRIFIÉ : Wan 2.2 14B, 720p, 81 images, 30 étapes, FP8 sur RTX 4090 : 4 min 20 s, pic de VRAM à 24 Go « pratiquement sans marge », chiffre repris de LocalAIMaster sans méthode — [Smeltcore](https://smeltcore.com/recipes/wan-2-2-t2v-a14b-on-rtx-4090-720p-text-to-video-in-comfyui-with-fp8-scaled-weights/).
- NON VÉRIFIÉ, vendeur : Wan 14B, 5 s en 720p sur H100 : 10 à 12 min, étapes non indiquées, poids d'environ 69 Go — [Spheron](https://www.spheron.network/blog/deploy-wan-2-1-ai-video-generation-gpu-setup/).
- NON VÉRIFIÉ : 720p, 81 images, 4 étapes sur RTX 5070 Ti : environ 312 s — [port Tenstorrent](https://huggingface.co/sunandbean/wan2.2-i2v-a14b-p100a).
- FAIT VÉRIFIÉ, chiffre d'éditeur : le modèle Wan 5B fait 5 s en 720p en moins de 9 min sur un GPU grand public — [GitHub](https://github.com/Wan-Video/Wan2.2).
- NON VÉRIFIÉ : VACE 14B, environ 40 min en 720p sur 4090, sans date — [base communautaire](https://nathanshipley.github.io/banodoco-kb/kb/wan/index.html). Elle ne donne pas de temps pour Wan Animate.
- NON VÉRIFIÉ : LTX-2.5, 4 s en 720p en environ 25 s et 8 s en environ 3 min sur RTX 5090 (guide NVIDIA) ; 5 s en 2 min 30 sur RTX 3090 (communauté). L'article reconnaît qu'aucun banc indépendant n'existe — [RunAIHome](https://runaihome.com/blog/ltx-2-5-local-ai-video-hardware-guide-2026/). Les 6,8 s annoncés pour 10 s sont une démo sur deux GB200 — [VentureBeat](https://venturebeat.com/ai/ltx-2-5-can-generate-a-10-second-ai-video-from-an-image-in-just-6-8-seconds-on-nvidia-superchips-and-its-open-weights/).
- FAIT VÉRIFIÉ, chiffres d'éditeur : FLUX 3 Klein distillé INT8 : environ 4 s sur RTX 5090 et moins de 9 s sur RTX 4070 pour 1 Mpx ; édition par API en 7,18 s ; poids de 5,6 à 11,2 Go — [BFL](https://bfl.ai/blog/flux-3-image-klein).
- FAIT VÉRIFIÉ, chiffres d'éditeur : SAM 3 en 30 ms pour une image sur H200 — [arXiv](https://arxiv.org/html/2511.16719v1). Video Depth Anything en FP16 sur A100 : Small 7,5 ms et 6,8 Go, Large 14 ms et 23,6 Go — [GitHub](https://github.com/DepthAnything/Video-Depth-Anything).

**Démarrages à froid (anecdotique)**
- NON VÉRIFIÉ : ComfyUI sur Modal : 30 à 90 s à froid, attente d'allocation GPU de 0 à 6 min — [comfymodi](https://github.com/adbrasi/comfymodi).
- NON VÉRIFIÉ : ComfyUI sur volume réseau Runpod : 50 à 120 s, 10 à 40 s selon un autre commentaire — [forum](https://answeroverflow.com/m/1285299193258315848).

**Prix de référence hébergés**
- FAIT VÉRIFIÉ : Cosmos : image 0,04 $, vidéo 720p 0,157 $/s, remplacement 0,188 $/s (`src/config/product.ts`).
- FAIT VÉRIFIÉ : fal, Wan 2.2 A14B en 720p : 0,08 $/s comptée à 16 images par seconde — [fal](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video).
- FAIT VÉRIFIÉ : fal, Wan 2.2 Animate Replace en 720p : 0,08 $/s, images ÷ 16 — [fal](https://fal.ai/models/fal-ai/wan/v2.2-14b/animate/replace). Donc 10 s à 24 ips = 240 ÷ 16 × 0,08 = 1,20 $.
- FAIT VÉRIFIÉ : BFL, Klein à 0,009 $ l'image 1K — [BFL](https://bfl.ai/blog/flux-3-image-klein).
- FAIT VÉRIFIÉ : fal, SAM 3 vidéo à 0,005 $ pour 16 images — [fal](https://fal.ai/models/fal-ai/sam-3/video-rle) ; profondeur à 0,04 $/s — [fal](https://fal.ai/models/fal-ai/depth-anything-video).

### Inferences

**Formule :** coût par résultat utilisable = (rendu + part de démarrages à froid × durée à froid) × tarif ÷ (1 − taux d'échec).

**Hypothèses, toutes de ma part et non mesurées :**
- Vidéo de 10 s : Wan 2.2 en deux segments de 81 images, donc enchaînés avec un risque de raccord.
- Rendu central : 480 s sur RTX 4090 (4 étapes, 4 min par segment). Bas : 240 s. Haut : 1 320 s sur H100 (2 × 11 min).
- À froid : 90 s en vidéo, 30 s en image.
- Part à froid : 100 %, 50 %, 10 % en vidéo ; 50 %, 20 %, 3 % en image (volumes faible, moyen, élevé).
- Échecs techniques facturés : 10 % en vidéo (24 Go sans marge), 5 % en image.
- Image Klein : 6 s de rendu avec références.

**Vidéo Wan 2.2, 10 s, RTX 4090 Runpod**
- Faible : (480 + 90) × 0,000372 ÷ 0,9 = **0,236 $**
- Moyen : (480 + 45) × 0,000372 ÷ 0,9 = **0,217 $**
- Élevé : (480 + 9) × 0,000372 ÷ 0,9 = **0,202 $**
- Rendu bas, volume moyen : (240 + 45) × 0,000372 ÷ 0,9 = 0,118 $
- 15 min de rendu, volume moyen : (900 + 45) × 0,000372 ÷ 0,9 = 0,391 $
- Rendu haut sur H100, volume élevé : (1 320 + 9) × 0,001497 ÷ 0,9 = **2,21 $**, au-dessus de Kling (1,57 $) et de Wan chez fal (0,80 $).

**Le même rendu de 480 s selon l'hébergeur** (vitesse supposée égale entre 4090 et L40S ; Modal et Cerebrium avec 4 cœurs physiques et 32 Gio) :

| Hébergeur | $/s | Coût |
|---|---|---|
| Beam 4090 | 0,000192 + CPU/RAM | 0,092 $ + CPU/RAM |
| Runpod 4090 | 0,000372 | 0,179 $ |
| Runpod L40S | 0,000486 | 0,233 $ |
| Modal ou Cerebrium L40S | ≈ 0,000665 | 0,319 $ |
| Modal L40S région UE (× 1,15) | ≈ 0,000765 | 0,367 $ |
| Replicate L40S | 0,000975 | 0,468 $ |

**Image Klein, RTX 4090 Runpod**
- Faible : (6 + 15) × 0,000372 ÷ 0,95 = **0,0082 $**
- Moyen : (6 + 6) × 0,000372 ÷ 0,95 = **0,0047 $**
- Élevé : (6 + 0,9) × 0,000372 ÷ 0,95 = **0,0027 $**
- L'API Klein coûte 0,009 $ : l'écart n'existe vraiment qu'à fort volume.

**Autres usages**
- Remplacement de 10 s : pas de mesure. Hypothèse de 10 à 40 min sur 4090 (40 min étant la valeur VACE), centrale à 20 min : (1 200 + 90) × 0,000372 ÷ 0,9 = **0,53 $**, entre 0,28 et 1,03 $. À comparer à 1,20 $ pour Wan Animate chez fal et 1,88 $ pour Kling Edit.
- Préparation de 10 s : fal = 15 × 0,005 + 10 × 0,04 = 0,475 $. Auto-hébergée, environ 120 s sur 4090 (hypothèse) = 0,045 $, soit 0,43 $ d'écart par préparation.

**Frais annexes**
- Stockage : environ 150 Go × 0,07 $ = 10,50 $/mois (hypothèse de trois modèles).
- Bande passante : 5 000 vidéos × 20 Mo (hypothèse) = 100 Go, dans le Tio inclus chez Modal. Négligeable.

### Gaps
- Aucun temps indépendant, reproductible et daté pour Wan Animate ou SCAIL-2 en 720p, ni pour 10 s de Wan 2.2. La qualité à 4 étapes par rapport à 30-50 étapes n'est pas chiffrée. **C'est la plus grande incertitude du calcul** : seul un essai payant la lèverait.
- Le chiffre de 17,4 min sur H100 apparu dans une recherche n'a pas été retrouvé dans une page lue : écarté.

## Seuil de rentabilité face à fal dans les trois scénarios, temps humain compris

### Takeaway
À 50 $/h, l'auto-hébergement perd largement au volume faible, ne gagne au volume moyen que face aux modèles fermés et moyennant une baisse de qualité, et ne gagne franchement qu'au volume élevé. Face aux mêmes modèles ouverts hébergés chez fal, le seuil se situe vers 850 à 1 400 vidéos par mois.

### Cited Findings
- FAIT VÉRIFIÉ : `src/config/product.ts` fixe la durée du remplacement à 10 s, et 605 tokens pour une vidéo de 10 s, avec une marge « d'environ 60 % au moins ».
- Tarifs et prix de référence : voir la question précédente.

### Inferences

**Hypothèses humaines, toutes de ma part :** 50 $/h. Mise en place : 60 h (image Docker, worker, webhooks, intégration à `src/lib/presets/provider.ts`, retests des presets), amorties sur 12 mois, soit 5 h/mois. Récurrent : 3 h/mois en faible, 5 h en moyen, 12 h en élevé (incidents, mises à jour, capacité). Hypothèses : 10 s par vidéo, génération 720p à 1,57 $, aucune remise de volume.

| Par mois | Faible (200 img, 50 vid) | Moyen (2 000 img, 500 vid) | Élevé (20 000 img, 5 000 vid) |
|---|---|---|---|
| **A. fal, modèles actuels** | 86,50 $ | 865 $ | 8 650 $ |
| A bis. avec remplacement à 1,88 $ | 102 $ | 1 020 $ | 10 200 $ |
| **B. Modèles ouverts hébergés** (Klein 0,009 $, Wan fal 0,80 $) | 41,80 $ | 418 $ | 4 180 $ |
| C. Auto-hébergé, calcul images | 1,64 $ | 9,40 $ | 54 $ |
| C. Auto-hébergé, calcul vidéos | 11,80 $ | 108,50 $ | 1 010 $ |
| C. Stockage | 10,50 $ | 10,50 $ | 10,50 $ |
| C. Temps humain | 400 $ (8 h) | 500 $ (10 h) | 850 $ (17 h) |
| **C. Total auto-hébergé** | **423,94 $** | **628,40 $** | **1 924,50 $** |
| C face à A | −337 $ | +237 $ | +6 726 $ |
| C face à B | −382 $ | −210 $ | +2 256 $ |
| GPU-heures par mois | ≈ 9 | ≈ 80 | ≈ 717 |

**Seuil en vidéos par mois, avec 4 images par vidéo comme dans les scénarios**

Par vidéo et ses 4 images : auto-hébergé 0,236 $ ; A 1,73 $, soit 1,494 $ d'écart ; B 0,836 $, soit 0,60 $ d'écart. Frais fixes = 10 h × taux + 10,50 $.

| Taux horaire | Frais fixes | Seuil face à A (qualité dégradée) | Seuil face à B (qualité égale) |
|---|---|---|---|
| 25 $/h | 260,50 $ | 175 | 435 |
| 50 $/h | 510,50 $ | 342 | 851 |
| 100 $/h | 1 010,50 $ | 677 | 1 685 |
| 50 $/h, régime élevé (17 h) | 860,50 $ | 568 | 1 381 |

- Si le rendu moyen passe à 15 min (0,391 $), le seuil face à B monte à environ 1 200 vidéos/mois : (0,836 − 0,391 − 0,019 = 0,426 $ d'écart).
- Si le rendu de qualité exige le H100 (2,21 $), **il n'y a aucun seuil** : on perd sur chaque vidéo.

**Coût de la qualité.** Revenu par vidéo estimé à environ 3,93 $ (1,573 ÷ 0,4). Marge actuelle : 2,36 $ par vidéo. Marge auto-hébergée : environ 3,71 $. La baisse de ventes tolérable avant de perdre de l'argent par rapport à aujourd'hui, en passant de Kling à un modèle ouvert :
- Faible : (118 + 410,50) ÷ 184,70 = 2,86 : **impossible**.
- Moyen : (1 180 + 510,50) ÷ 1 856,50 = 0,91 : **8,9 %**.
- Élevé : (11 800 + 860,50) ÷ 18 640 = 0,68 : **32 %**.

Avec environ 74 % de duels perdus face à Kling 3.0 Pro sur Arena, une baisse de 9 % n'a rien d'improbable sur un produit promis « parfait du premier coup ». Ce lien entre préférence et ventes reste une supposition : aucune donnée ne le chiffre.

**Autres seuils**
- Images seules, face à l'API Klein : 0,0063 $ d'écart à fort volume. Avec 300 $ de frais fixes, seuil vers **48 000 images/mois**.
- Remplacement : écart de 1,35 $ face à Kling Edit, 0,67 $ face à Wan Animate chez fal. À 510,50 $ de frais fixes, seuils de 378 et 762 remplacements/mois. Valeurs très incertaines, faute de mesure.
- Préparation : frais fixes hypothétiques de 185 $/mois (20 h de mise en place amorties, 2 h/mois, 20 Go). 185 ÷ 0,43 = **430 préparations/mois**. Comme Cosmos prépare une fois par preset, ce seuil n'a aucun sens aujourd'hui : dix presets par mois ne coûtent que 4,75 $.
- Pod fixe contre serverless : 0,89 ÷ 1,34 = rentable au-dessus de 66 % d'utilisation réelle sur RTX 4090. Un pod Secure Cloud coûte 650 $/mois (730 h), et le pic impose plusieurs machines. Serverless reste préférable, même au volume élevé (≈ 1 GPU en moyenne).
- Lambda, sans mise à zéro : A6000 à 796 $/mois, A10 à 942 $/mois par GPU. Absurde aux volumes faible et moyen.

### Gaps
- Le temps humain est une estimation : aucun retour de production chiffré trouvé. Il suppose un seul modèle par usage ; chaque modèle en plus l'alourdit.
- Remises de volume de fal et prix futurs non connus.
- L'effet réel d'un changement de modèle sur les ventes n'est pas mesurable sans test.

## Compatibilité avec un business semi-passif

### Takeaway
Le serverless démarre et s'éteint seul et s'intègre bien, mais il **ne supprime pas toute intervention manuelle récurrente** : il en ajoute plusieurs par rapport à fal, dont un piège à faible volume où l'endpoint se coupe seul. La location de machines (Vast, Lambda) n'est pas compatible. Tout hébergement local est exclu, le PC redémarrant sous charge.

### Cited Findings

**Ce qui est automatique**
- FAIT VÉRIFIÉ : Runpod : mise à zéro sans requête, FlashBoot activé par défaut dans la console, mise à l'échelle selon l'attente (4 s par défaut) — [Runpod](https://docs.runpod.io/serverless/endpoints/endpoint-configurations).
- FAIT VÉRIFIÉ : webhooks à la fin des jobs, 2 nouvelles tentatives à 10 s d'intervalle, résultats conservés 30 min — [Runpod](https://docs.runpod.io/serverless/endpoints/send-requests). Nouvelles tentatives automatiques en cas d'échec sur les endpoints en file — [Runpod](https://docs.runpod.io/serverless/endpoints/overview).
- FAIT VÉRIFIÉ : Cosmos a déjà une interface de fournisseur (`submit`, `status`, `result`, `cancel`, `run`) dans `src/lib/presets/provider.ts`, avec webhook.

**Ce qui reste manuel ou risqué**
- FAIT VÉRIFIÉ : sans requête pendant 3 jours, max workers passe à 2, puis à 0 après 7 jours. Il faut le remonter dans la console. Même réduction si des workers plantent à répétition — [Runpod](https://docs.runpod.io/serverless/troubleshooting).
- FAIT VÉRIFIÉ : workers bloqués (« throttled ») quand les hôtes n'ont plus de GPU libre ; le remède proposé est d'ajouter d'autres types de GPU — [Runpod](https://docs.runpod.io/serverless/troubleshooting).
- FAIT VÉRIFIÉ : réglages par défaut à modifier : délai d'exécution de 10 min en console (5 min en API), max workers à 3 — [Runpod](https://docs.runpod.io/serverless/endpoints/endpoint-configurations). Plafond de dépense par défaut de 80 $/h, relevable par le support — [Runpod](https://docs.runpod.io/serverless/pricing).
- NON VÉRIFIÉ : limite de 5 workers par compte, selon un extrait de la [page d'erreurs](https://docs.runpod.io/docs/errors). La page de dépannage lue ne la mentionne pas.
- NON VÉRIFIÉ, tracker tiers : 44 incidents en 90 jours et 98,74 % de disponibilité sur 45 services. Incident API serverless de 21 min le 21 octobre 2026, de 45 min le 14 mars 2026 — [Pingoru](https://pingoru.io/providers/runpod). Ce chiffre mêle tous les services, et je n'ai pas trouvé de SLA.
- FAIT VÉRIFIÉ : Modal, plan Starter : 10 GPU simultanés ; rollbacks et budgets réservés au plan Team à 250 $/mois — [Modal](https://modal.com/pricing).
- FAIT VÉRIFIÉ : Beam : Keep Warm en option, arrêt après chaque requête par défaut — [Beam](https://www.beam.cloud/pricing).
- NON VÉRIFIÉ : Vast se loue par instance, à la demande, interruptible ou réservée — [Vast](https://vast.ai/pricing) ; son offre serverless n'a pas été évaluée. FAIT VÉRIFIÉ : aucune offre serverless sur la page tarifaire de [Lambda](https://lambda.ai/pricing), seulement des instances à la demande et des clusters sur engagement.
- FAIT VÉRIFIÉ : la licence LTX demande des efforts raisonnables pour rester sur la dernière version — [LICENSE](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x).

| Tâche | fal | Serverless auto-hébergé |
|---|---|---|
| Démarrage et montée en charge | Aucune | Automatique, mais plafonds à régler |
| Endpoint inactif | Aucune | Coupure à 3-7 jours : tâche planifiée à prévoir |
| Plantages à répétition | Aucune | Endpoint réduit : réparation et console |
| Mise à jour d'un modèle | Changer l'identifiant | Image Docker, poids, pilotes, tests de VRAM |
| Pénurie de GPU | Gérée par fal | À surveiller, plusieurs types de GPU à valider |
| Choix et test d'un modèle sur les presets | Manuel | Manuel |
| Supervision des échecs | Statut de l'API | Temps de rendu, mémoire, échecs, à construire |

### Inferences
- DÉDUCTION : une tâche planifiée Vercel envoyant un job léger tous les 2 jours évite la coupure d'inactivité. Elle coûte quelques centimes, mais c'est encore une pièce à maintenir, et elle garde des poids sur les GPU sans usage réel.
- DÉDUCTION : le pire défaut est le cas « workers défaillants » : une image cassée après une mise à jour peut couper le service jusqu'à une action manuelle. Cela contredit directement l'objectif « rien de manuel récurrent », et les remboursements automatiques de Cosmos limitent le dégât sans l'éviter.
- DÉDUCTION : ajouter des types de GPU contre la pénurie change les temps de rendu, et parfois la VRAM. Il faut donc valider chaque type, ce qui ajoute des tests. Restreindre à l'UE réduit encore le pool : deux objectifs en conflit.
- DÉDUCTION : Runpod et Beam sont les plus adaptés en prix ; Modal est le plus propre côté UE mais plus cher. Vast et Lambda sont écartés en production pour un service semi-passif.

### Gaps
- Aucune donnée publique sur la disponibilité des GPU aux heures de pointe par région.
- Aucun retour de production fiable : la recherche n'a rien donné de solide sur Reddit, et les pages trouvées viennent des hébergeurs ou de projets isolés. r/StableDiffusion n'a pas pu être exploité.

## Confidentialité : un GPU loué apporte-t-il un gain réel en RGPD ?

### Takeaway
Le gain est modéré, et il n'est pas automatique. Il réduit le nombre d'intervenants et donne la main sur la conservation, mais les hébergeurs cités sont américains et restent des sous-traitants à encadrer. Les hôtes communautaires ne sont pas acceptables pour des photos de personnes réelles.

### Cited Findings
- FAIT VÉRIFIÉ : une photo n'est pas systématiquement une donnée sensible : elle n'est biométrique que traitée par un moyen technique spécifique permettant d'identifier une personne — [considérant 51](https://gdpr-info.eu/recitals/no-51/).
- FAIT VÉRIFIÉ : fal est basée aux États-Unis, traite sur des serveurs aux États-Unis et ailleurs, et a un DPA. Sa politique du 22 juillet 2026 ne nomme ni Kling ni Google parmi les destinataires — [fal](https://fal.ai/legal/privacy-policy).
- FAIT VÉRIFIÉ (mémoire du projet, docs fal lues le 2026-11-04) : par défaut, fichiers gardés sans limite et lisibles publiquement, historique de 90 jours ; des en-têtes par requête permettent de l'éviter.
- FAIT VÉRIFIÉ : Runpod : DPA à signer via trust.runpod.io, clauses types, 15 sous-traitants, serveurs « dans le monde entier » ; choisir une région n'engage qu'à des efforts raisonnables — [DPA](https://www.runpod.io/legal/data-processing-agreement).
- FAIT VÉRIFIÉ : Runpod se dit « fully compliant » au RGPD pour les régions européennes, interdit aux hôtes d'inspecter les données, et décrit Secure Cloud en centres T3/T4. La page ne dit pas sur quel niveau tourne le serverless — [Runpod](https://docs.runpod.io/references/security-and-compliance).
- NON VÉRIFIÉ : régions européennes EU-RO-1, EU-NL-1, EU-SE-1 — [getdeploying](https://getdeploying.com/runpod) ; [Runpod, avril 2025](https://www.runpod.io/blog/runpod-global-networking-expansion). La disponibilité serverless et les certifications par site ne sont pas confirmées.
- FAIT VÉRIFIÉ : Modal : DPA avec clauses types, en vigueur depuis le 31 octobre 2025 — [DPA](https://modal.com/legal/dpa). Région `eu` à × 1,15, `eu-west` à × 1,75 — [régions](https://modal.com/docs/guide/region-selection).
- FAIT VÉRIFIÉ : même en région UE, chez Modal restent aux États-Unis les journaux, les charges de plus de 2 Mio, **toutes les charges asynchrones**, les images, volumes et secrets. Modal recommande de passer des références vers son propre stockage — [Modal](https://modal.com/docs/guide/data-residency).
- FAIT VÉRIFIÉ : Cerebrium liste le RGPD et ISO 27001, sans préciser la répartition par plan — [Cerebrium](https://www.cerebrium.ai/pricing). Régions Royaume-Uni et Stockholm, pas de réplication automatique — [Cerebrium](https://cerebrium.ai/docs/deployments/multi-region-deployment).
- FAIT VÉRIFIÉ : Vast : SOC 2 Type 2 ; Secure Cloud avec centres audités et DPA. Les « Verified Hosts », isolés par Docker seulement, sont présentés comme une « option économique pour charges non réglementées ». Le RGPD n'y est pas mentionné, ni ce que l'hôte peut voir — [Vast](https://vast.ai/compliance).
- NON VÉRIFIÉ, comparateurs tiers : hébergeurs européens : OVHcloud H100 PCIe à environ 2,80 €/h, sans exposition au CLOUD Act mais SecNumCloud non applicable aux GPU en juillet 2026 — [Spheron](https://www.spheron.network/blog/ovhcloud-gpu-pricing-2026-h100-cost-and-sovereign-ai/). Scaleway L4 à environ 0,88 $/h — [computeprices](https://computeprices.com/compare/ovhcloud-vs-scaleway).

### Inferences
- DÉDUCTION : le gain réel existe sur deux points : moins de destinataires si le modèle ne passe plus par un agrégateur puis un éditeur, et maîtrise de l'effacement. Mais ce dernier est déjà largement atteignable chez fal avec les en-têtes.
- DÉDUCTION : pas de gain sur le fond : l'hébergeur reste un sous-traitant (DPA, registre, information des personnes), le transfert reste à encadrer chez une société américaine même si le GPU est en UE, et Cosmos devient seul responsable de la configuration et de la sécurité. Un bug de journalisation devient son problème.
- DÉDUCTION : le remplacement de personne ne vise pas à identifier quelqu'un, ce qui plaide pour des données personnelles ordinaires et non biométriques. À faire confirmer par un juriste, surtout si un embedding de visage est extrait ou conservé.
- DÉDUCTION : un hôte communautaire a la main sur la machine physique ; une isolation Docker ne protège pas des données d'un exploitant de machine. **Vast communautaire et Runpod Community Cloud sont à exclure pour ces photos.** Seuls les niveaux Secure Cloud, avec DPA signé et région imposée, sont défendables. Cela annule l'avantage de prix des hôtes communautaires : le comparatif doit retenir 0,89 $/h et non 0,34 $/h.
- DÉDUCTION : le vrai saut de confidentialité viendrait d'un hébergeur de droit européen (OVHcloud, Scaleway), mais je n'ai pas trouvé d'offre serverless GPU vérifiée : un GPU permanent coûterait environ 640 $/mois (L4), hors de proportion aux volumes faible et moyen.

### Gaps
- DPA de Beam, Lambda, Cerebrium et Baseten non lus.
- Le trajet exact des données fal vers Kling et Google n'est pas documenté dans la politique lue ; le DPA fal n'a pas été lu.
- La qualification juridique n'a pas été validée par un juriste. La recherche sur le chapitre V et le cadre transatlantique n'a pas donné de source exploitable.

## Conclusion : envisageable ou non, pour quels modèles, et à partir de quel volume ?

### Takeaway
**Non pour l'instant.** L'auto-hébergement n'est défendable ni au volume faible ni au volume moyen. Il ne devient envisageable qu'au-delà d'environ 1 500 vidéos par mois, et seulement si les modèles ouverts ont d'abord prouvé leur qualité en mode hébergé sur les presets de Cosmos. La préparation (SAM 3, Depth Anything) n'a aucune raison d'être auto-hébergée aujourd'hui.

### Cited Findings
- Kling 4.0 et Nano Banana 2.1 sont fermés (repère de la demande). Le classement des modèles ouverts vient d'[AA](https://artificialanalysis.ai/image/leaderboard/editing/open-weights) et d'[Arena](https://arena.ai/leaderboard/video/image-to-video).
- Le seul candidat de tête en vidéo, H3, est juridiquement exclu dans l'UE, y compris pour ses sorties — [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE).
- fal héberge déjà Wan 2.2 à 0,08 $/s — [fal](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video) — et BFL propose Klein à 0,009 $ — [BFL](https://bfl.ai/blog/flux-3-image-klein).

### Inferences

| Usage | Verdict | Condition ou seuil (DÉDUCTION) |
|---|---|---|
| Kling 4.0, Nano Banana 2.1 | Impossible | Modèles fermés |
| Préparation SAM 3 + profondeur | **Non** | Une fois par preset, ≈ 0,48 $. Seuil vers 430 préparations/mois, et seulement avec VDA Small (Large est NC) |
| Image, FLUX 3 Klein | **Non** | L'API à 0,009 $ suffit. Seuil vers 48 000 images/mois |
| Vidéo, Wan 2.2 ou LTX-2.5 | **Pas avant environ 1 400 vidéos/mois** | Face aux mêmes modèles hébergés, à condition que le rendu reste sous 15 min sur GPU 24-48 Go |
| Remplacement, Wan Animate ou SCAIL-2 | **Pas maintenant** | Qualité non mesurée de façon indépendante. Seuil de calcul vers 760/mois, très incertain |

**Par scénario, à 50 $/h**
- **Faible (200 images, 50 vidéos) : non.** 424 $ contre 86,50 $. Même sans compter le temps humain, on n'économise qu'environ 63 $/mois pour une panne possible par inactivité.
- **Moyen (2 000 images, 500 vidéos) : non.** 628 $ contre 865 $ chez fal, soit 237 $ gagnés au prix d'une qualité inférieure, avec seulement 8,9 % de baisse de ventes tolérée. Les mêmes modèles hébergés coûtent 418 $ sans aucune maintenance.
- **Élevé (20 000 images, 5 000 vidéos) : envisageable sous conditions.** 1 925 $ contre 8 650 $ (fal actuel) et 4 180 $ (ouverts hébergés). Gain de 2 256 $/mois à qualité égale.

**Ordre recommandé, du moins risqué au plus risqué**
1. Rester sur fal avec les modèles actuels.
2. Si le prix devient un problème, tester d'abord les modèles ouverts **hébergés** chez fal sur une offre d'entrée de gamme : cela donne environ la moitié de l'économie (4 180 $ contre 8 650 $ au volume élevé), sans maintenance. Cet essai est payant et demande un feu vert.
3. Revoir l'auto-hébergement seulement si les trois conditions sont réunies : au moins 1 500 vidéos/mois sur modèles ouverts (facture ouverte d'environ 1 250 $/mois ou plus), test à l'aveugle réussi selon les critères de publication de Cosmos, et temps de rendu mesuré conforme aux hypothèses.
4. Dans ce cas : Runpod ou Modal en Secure Cloud ou région UE, DPA signé, jamais d'hôte communautaire.

**Ce qui ferait changer cette conclusion**
- Un modèle ouvert à licence compatible UE qui égale Kling 4.0 dans un classement indépendant.
- Une levée de la clause territoriale de H3, ou un accord avec MiniMax.
- Un temps de rendu mesuré très inférieur (LTX-2.5 sur GPU 48 Go), ce qui ferait baisser les seuils d'environ un tiers.
- Une obligation de localisation UE stricte, à laquelle fal ne répondrait pas.

### Gaps
- Tous les seuils reposent sur des temps de rendu non mesurés et des heures humaines estimées. Ils donnent un ordre de grandeur, pas une valeur exacte.
- La qualité sur les presets réels de Cosmos reste inconnue sans essai payant, qui n'a pas été lancé conformément aux contraintes.

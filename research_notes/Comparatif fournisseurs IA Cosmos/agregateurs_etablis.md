# Agrégateurs établis comme alternatives à fal.ai pour Cosmos : Replicate, Runware, WaveSpeedAI, Together AI (au 2026-11-04)

Conventions. Toutes les pages ont été consultées le 2026-11-04, sauf mention contraire. Aucune génération, aucun appel facturé, aucun compte créé.
- **FAIT VÉRIFIÉ** : lu sur une page officielle du fournisseur, ou dans un document réglementaire. Les prix de Replicate ont été lus dans le JSON de tarification intégré au HTML public de chaque page de modèle, donc sans résumé intermédiaire. Les autres pages ont été lues via un outil de résumé automatique, avec un risque résiduel d'erreur de lecture.
- **DÉDUCTION** : calcul ou raisonnement de ma part à partir de faits cités.
- **NON VÉRIFIÉ** : source secondaire, source biaisée ou témoignage, non recoupé.
- Les chiffres fal viennent du code de Cosmos (`src/config/product.ts`, `presets/arrivee-star/preset.json`), sauf quand une page fal est citée.

Limite de la recherche : le budget de recherche web de la session s'est épuisé en cours de travail (200 requêtes, partagées entre agents). La lecture directe de pages a continué, mais les retours de développeurs (Reddit, Hacker News, GitHub) et le financement de Together n'ont pas pu être cherchés davantage. Une nouvelle recherche serait possible sur demande de l'utilisateur.

## 1. Disponibilité : chaque modèle exact est-il proposé, sous quel identifiant, avec tous les paramètres de Cosmos, et par un accès officiel ?

### Takeaway
Aucun des quatre ne couvre les neuf modèles à spécification identique. WaveSpeed en couvre le plus (tout sauf Recast), mais perd des paramètres clés. Replicate et Runware couvrent les modèles de production (Nano Banana 2.1, Kling 4.0, Kling O3, Seedance 2.5), mais ni Recast, ni PixVerse Swap. Together ne sert ni Kling ni Nano Banana 2.1. Les `elements` Kling, utilisés par tous les prompts de Cosmos, n'existent en l'état que chez Runware, et leur combinaison avec une vidéo source n'y est pas confirmée.

### Cited Findings

**Identifiants** (« non trouvé » ne veut pas dire absent : le modèle n'a pas été trouvé sur les pages consultées)

| Modèle Cosmos (identifiant fal) | Replicate | Runware | WaveSpeed | Together |
|---|---|---|---|---|
| Nano Banana 2.1 et édition (`fal-ai/nano-banana-2.1`, `/edit`) | `google/nano-banana-2.1`, modèle unique avec `image_input` ; marqué officiel | `google:nano-banana@2.1` | `google/nano-banana-2.1/text-to-image`, `/edit` | Non trouvé. Seuls `google/flash-image-3.1` (Nano Banana 2) et `google/flash-image-2.5` |
| Kling 4.0 texte-vidéo (`kling/v4/text-to-video`) | `kwaivgi/kling-v4.0` ; officiel | `klingai:kling-video@4.0` | `kwaivgi/kling-v4.0/text-to-video` | Kling absent |
| Kling 4.0 référence-vidéo (`kling/v4/reference-to-video`) | Même modèle, `reference_images` | Même modèle, `inputs.referenceImages` ou `inputs.elements` | `kwaivgi/kling-v4.0/reference-to-video` | Kling absent |
| Kling 4.0 edit (`kling/v4/video-to-video/edit`) | Même modèle, `base_video` | Même modèle, `inputs.video` | `kwaivgi/kling-v4.0/video-edit` | Kling absent |
| Kling O3 standard edit (`fal-ai/kling-video/o3/standard/video-to-video/edit`) | `kwaivgi/kling-v3-omni-video`, `mode: standard`, `video_reference_type: base` ; officiel | `klingai:kling-video@o3-standard`, `inputs.video` | `kwaivgi/kling-video-o3-std/video-edit` | Kling absent |
| MiniMax H3 Max Recast (`minimax/h3-max/recast`) | Non trouvé (`minimax/h3`, `h3-highspeed`, `h3-lite` seulement) | `minimax:h3@max` existe, Recast non documenté | Non trouvé | Non trouvé (`MiniMaxAI/MiniMax-H3` seulement) |
| PixVerse Swap (`fal-ai/pixverse/swap`) | Non trouvé | Non trouvé (`pixverse:modify@0` est un autre produit) | `pixverse/swap` | Non trouvé (v5, v5.6, v6) |
| Seedance 2.5 référence-vidéo (`bytedance/seedance-2.5/reference-to-video`) | `bytedance/seedance-2.5`, `reference_videos` ; officiel | `bytedance:seedance@2.5` | `bytedance/seedance-2.5/reference-to-video` | `ByteDance/Seedance-2.5` listé, entrée vidéo non confirmée |
| SAM 3 vidéo (`fal-ai/sam-3/video-rle`) | `8digit/gener8-sam3`, communautaire (extrait de recherche, NON VÉRIFIÉ) | Non trouvé (`meta-sam-3d-objects` est un modèle 3D) | `wavespeed-ai/sam3-video` | Non trouvé |
| Depth Anything Video (`fal-ai/depth-anything-video`, VDA-Large) | `lucataco/depth-anything-video`, `chenxwh/depth-any-video`, communautaires (extrait de recherche, NON VÉRIFIÉ) | Non trouvé (`controlnet-preprocess-depth` seulement) | `wavespeed-ai/depth-anything/video`, `wavespeed-ai/depth-anything-v3/video` | Non trouvé |

Sources : [Replicate kwaivgi](https://replicate.com/kwaivgi), [Replicate minimax](https://replicate.com/minimax), [Replicate pixverse](https://replicate.com/pixverse), [Replicate nano-banana-2.1](https://replicate.com/google/nano-banana-2.1), [Replicate seedance-2.5](https://replicate.com/bytedance/seedance-2.5), [Runware Models](https://runware.ai/docs/models), [Runware Kling 4.0](https://runware.ai/docs/models/klingai-video-4-0), [Runware O3 standard](https://runware.ai/docs/models/klingai-video-3-0-omni-standard), [Runware H3 Max](https://runware.ai/docs/models/minimax-h3-max), [Runware PixVerse Modify](https://runware.ai/docs/models/pixverse-modify), [WaveSpeed Kling 4.0](https://wavespeed.ai/blog/ai-news/kling-4-0-is-coming-what-we-know-and-how-to-prepare-on-wavespeedai/), [WaveSpeed O3](https://wavespeed.ai/collections/kling-o3), [WaveSpeed MiniMax H3](https://wavespeed.ai/minimax-h3-api), [WaveSpeed Swap](https://wavespeed.ai/models/pixverse/swap), [WaveSpeed SAM3](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-sam3-video-on-wavespeedai/), [WaveSpeed Depth](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-depth-anything-video-on-wavespeedai/), [Together modèles serverless](https://docs.together.ai/docs/serverless/models). Toute la table est FAIT VÉRIFIÉ, sauf les deux cases marquées.

**Paramètres utilisés par Cosmos** (toutes les lignes FAIT VÉRIFIÉ)

| Paramètre | Replicate | Runware | WaveSpeed |
|---|---|---|---|
| `elements` sur Kling 4.0 (photo de face + références ; Cosmos écrit `@Element1`) | Absent du schéma. `reference_images` jusqu'à 10 ([page](https://replicate.com/kwaivgi/kling-v4.0)) | Oui, jusqu'à 7 : `frontalImage` + 1 à 3 `images`. Combinaison avec `inputs.video` non décrite ([guide](https://runware.ai/docs/models/klingai-video-4-0/guides/elements)) | Absent : « Elements » réservés à Kling 3.0 et O3 selon l'article ; `images` jusqu'à 10 ([article](https://wavespeed.ai/blog/ai-news/kling-4-0-is-coming-what-we-know-and-how-to-prepare-on-wavespeedai/), [edit](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit)) |
| `elements` sur O3 edit | Absent : 4 `reference_images` au plus avec vidéo ([page](https://replicate.com/kwaivgi/kling-v3-omni-video)) | Explicitement exclu avec `inputs.video` ; `referenceImages` à la place ([page](https://runware.ai/docs/models/klingai-video-3-0-omni-standard)) | Non mentionné : `images` jusqu'à 4 ([page](https://wavespeed.ai/models/kwaivgi/kling-video-o3-std/video-edit)) |
| Durées 5/10/15/20 s | Oui, 3 à 30 s ; ignorée avec `base_video` (la sortie garde la longueur de l'entrée) | Oui, 3 à 30 s, défaut 10 | Oui, 3 à 30 s, défaut 5 |
| Formats 9:16, 16:9, 1:1 | Oui, aussi 21:9 | Oui, via `width`/`height` | Oui, aussi 21:9 |
| 720p | Oui, **défaut 1080p** : à forcer | Oui, **défaut 1080p** : à forcer | Oui, défaut 720p |
| Son | Kling 4.0 : aucun paramètre audio au schéma. O3 : `keep_original_sound` | O3 : `keepOriginalSound`. Kling 4.0 : audio via le prompt ou les voix d'éléments ([guide edit](https://runware.ai/docs/models/klingai-video-4-0/guides/editing-video)) | `keep_original_sound`, activé par défaut sur edit |
| Vidéo source O3 | 3 à 10 s, 720 à 2160 px, 200 Mo | Durée et dimensions suivent l'entrée, 3 à 15 s | Facturation bornée à 3-10 s, conçu pour 3-10 s ; renvoie à Kling 4.0 au-delà |
| Seedance `reference_videos`, `generate_audio: false`, 9:16, 720p | Oui ; le mode édition impose `duration: -1` et `aspect_ratio: adaptive` | Oui (`inputs.video` ou `referenceVideos`, `settings.audio`) | Oui ([doc](https://wavespeed.ai/docs/docs-api/bytedance/bytedance-seedance-2.5-reference-to-video)) |
| PixVerse `keyframe_id` (choix de la bonne personne dans la foule), `mode: person` | Modèle non trouvé | Modèle non trouvé | `mode` oui, **`keyframe_id` absent** ([page](https://wavespeed.ai/models/pixverse/swap)) |
| SAM 3 `box_prompts`, `point_prompts`, `object_id` | Non vérifié | Modèle non trouvé | **Absents** : `video`, `prompt` texte, `apply_mask` seulement ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-sam3-video-on-wavespeedai/)) |
| Depth `VDA-Large`, `colormap: turbo`, 720p | Non vérifié | Modèle non trouvé | Depth Anything Video : `video` seul, niveaux de gris ; V3 Video : palette turbo disponible, mais autre modèle ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-depth-anything-video-on-wavespeedai/), [V3](https://wavespeed.ai/models/wavespeed-ai/depth-anything-v3/video)) |

**Caractère officiel**
- FAIT VÉRIFIÉ : les cinq pages Replicate lues (`nano-banana-2.1`, `kling-v4.0`, `kling-v3-omni-video`, `seedance-2.5`, `h3`) portent `is_official: true` dans leurs données de page.
- FAIT VÉRIFIÉ : WaveSpeed sépare `minimax/h3` (« officiel ») et `wavespeed-ai/minimax-h3` (poids ouverts, hébergement WaveSpeed). Les espaces de noms `wavespeed-ai/*` ne sont donc pas des accès éditeur ([WaveSpeed MiniMax H3](https://wavespeed.ai/minimax-h3-api)). La page SAM3 ne cite ni Meta ni un dépôt d'origine ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-sam3-video-on-wavespeedai/)).
- FAIT VÉRIFIÉ : les conditions de Runware distinguent des modèles « Partner », avec droit d'usage commercial, et des modèles ouverts ou communautaires ([conditions](https://runware.ai/terms)).
- NON VÉRIFIÉ : aucune source lue ne prouve un contrat direct avec Kuaishou, ByteDance ou MiniMax, chez aucun des trois. Aucun signe d'intermédiaire douteux non plus sur Kling 4.0 ou Seedance 2.5 : mêmes noms, mêmes règles de facturation, prix cohérents avec les tarifs éditeur quand ils sont connus.

### Inferences
- DÉDUCTION : passer à Replicate ou WaveSpeed revient à remplacer `@Element1` par des images de référence. C'est le même modèle, mais une autre entrée, et donc pas une « spécification identique » tant qu'un test à l'aveugle n'a pas comparé les résultats. Un tel test est payant et demande un feu vert explicite.
- DÉDUCTION : sur WaveSpeed, l'absence de `keyframe_id` et de cadres SAM 3 touche précisément les deux risques notés dans le preset : « mauvaise personne choisie dans la foule » et ciblage de la star par six cadres.
- DÉDUCTION : Recast et PixVerse Swap imposent de garder fal pour ces deux variantes, ou WaveSpeed pour Swap, quel que soit le choix sur Kling.

### Gaps
- Runware : un élément passe-t-il avec `inputs.video` sur Kling 4.0 ? Le guide ne le dit pas, et le budget d'éléments vidéo partagé suggère seulement que c'est possible. Un petit essai ou une question au support trancherait.
- Recast n'a pas été trouvé ailleurs, mais les index de catalogue ne sont pas exhaustifs. Une URL directe `replicate.com/minimax/h3-max` renvoie 404.
- Le schéma complet de `8digit/gener8-sam3` et des modèles Depth communautaires de Replicate n'a pas été lu.

## 2. Prix officiel daté et coût par génération à spécification identique

### Takeaway
Sur Kling 4.0, le gros de la dépense de Cosmos, **personne ne bat fal en prix durable** : 0,157 $/s et 1,88 $ pour 10 s d'édition partout. Le seul gain clair sur les flux de production est l'image : 0,0336 $ chez Replicate contre 0,04 $ estimés chez fal, soit 16 % si l'estimation est juste. Sur Seedance 2.5 avec vidéo de référence, WaveSpeed est 21 % moins cher que fal, Runware peut-être 47 % moins cher, et Replicate 74 % plus cher. Sur PixVerse Swap, fal est trois fois moins cher que WaveSpeed. La promotion de 20 % de WaveSpeed sur Kling 4.0 est temporaire et sans date de fin.

### Cited Findings

**Tableau ligne par ligne, prix durable hors promotion, en dollars.** Colonnes séparées pour la promotion. Tous les calculs sont des DÉDUCTIONS à partir des tarifs cités en dessous.

| Ligne (spécification Cosmos) | fal (code Cosmos) | Replicate | Runware | WaveSpeed durable | WaveSpeed promo (à exclure) | Together |
|---|---|---|---|---|---|---|
| Image 1K, sans entrée | 0,04 (estimation, non affichée par fal) | **0,0336** | ≈ 0,034 (mesuré, au token) | 0,04 | 0,036 | Modèle non trouvé |
| Édition 1K, 1 image | 0,04 (estimation) | **0,0336** | ≈ 0,034 | 0,042 | ≈ 0,038 | Modèle non trouvé |
| Édition 1K, 3 images (étape keyframe du preset) | 0,04 (estimation) | **0,0336** | ≈ 0,035 (non chiffré exactement) | 0,046 | ≈ 0,041 | Modèle non trouvé |
| Kling 4.0 texte ou référence images, 720p, 5 s | 0,785 | 0,785 | 0,785 | 0,785 | 0,628 | Absent |
| Idem, 10 s | 1,57 | 1,57 | 1,57 | 1,57 | 1,256 | Absent |
| Idem, 15 s | 2,355 | 2,355 | 2,355 | 2,355 | 1,884 | Absent |
| Idem, 20 s | 3,14 | 3,14 | 3,14 | 3,14 | 2,512 | Absent |
| Kling 4.0 edit, 720p, 10 s entrée + 10 s sortie | 1,88 | 1,88 | 1,88 | 1,88 | 1,504 | Absent |
| Kling 4.0 edit, 720p, 5 s + 5 s | 0,94 | 0,94 | 0,94 | 0,94 | 0,752 | Absent |
| Kling O3 standard edit, 5 s | 0,63 (page) ; 0,70 (API de prix) | 0,84 | 0,63 | 0,63 | Pas de promo O3 vue | Absent |
| Kling O3 standard edit, 10 s | 1,26 (page) ; 1,40 (API de prix) | 1,68 | 1,26 | 1,26 | Pas de promo O3 vue | Absent |
| MiniMax H3 Max Recast, 768p, 10 s | 3,00 | Non trouvé | Non trouvé | Non trouvé | - | Non trouvé |
| PixVerse Swap, 720p, 5 s | **0,20** | Non trouvé | Non trouvé | 0,62 | - | Non trouvé |
| PixVerse Swap, 720p, 10 s | **0,40** | Non trouvé | Non trouvé | 1,22 | - | Non trouvé |
| Seedance 2.5 réf. vidéo, 720p 9:16, 5 s + 5 s | 2,77 | 4,84 | 1,48 si sortie seule ; 2,95 si entrée + sortie (règle non écrite) | **2,20** | ≈ 1,98 | Non vérifié |
| Seedance 2.5 réf. vidéo, 720p 9:16, 10 s + 10 s | 5,55 | 9,68 | 2,95 ou 5,90 | **4,40** | ≈ 3,96 | Non vérifié |
| SAM 3 vidéo, 10 s (une seule fois par preset) | ≈ 0,075 (0,005 $ par 16 images, 24 i/s) | Non vérifié | Non trouvé | 0,10, sans cadres ni points | - | Non trouvé |
| Depth Anything Video, 10 s (une seule fois par preset) | ≈ 0,40 (0,04 $/s) | Non vérifié | Non trouvé | 0,05, autre sortie (gris) ou autre modèle (V3) | - | Non trouvé |

**Tarifs sources**
- FAIT VÉRIFIÉ, Replicate : Nano Banana 2.1 à 0,0336 $ (1K), 0,0504 $ (2K), 0,1134 $ (4K) par image de sortie, sans frais d'entrée listés ([page](https://replicate.com/google/nano-banana-2.1)). C'est le prix Google rapporté par la presse, 0,0336 $ en 1K (NON VÉRIFIÉ sur la page tarifs de Google, [Decrypt](https://decrypt.co/380257/google-launches-nano-banana-2-1)).
- FAIT VÉRIFIÉ, Replicate : Kling 4.0 à 0,157 $/s en 720p sans vidéo ; avec vidéo 0,094 $/s, « Billed seconds: 2x output if input is shorter than output, otherwise input + output » ([page](https://replicate.com/kwaivgi/kling-v4.0)).
- FAIT VÉRIFIÉ, Replicate : `kling-v3-omni-video` standard à 0,168 $/s sans audio, 0,224 $/s avec audio. Aucun palier distinct pour la vidéo en entrée ([page](https://replicate.com/kwaivgi/kling-v3-omni-video)).
- FAIT VÉRIFIÉ, Replicate : Seedance 2.5, palier `non_video_in` 720p à 0,2312 $/s de sortie, palier `video_in` 720p à **0,9676 $/s de sortie** ; 480p à 0,1028 $ et 0,4304 $ ([page](https://replicate.com/bytedance/seedance-2.5)).
- FAIT VÉRIFIÉ, Runware : Kling 4.0 à 0,157 $/s en 720p sans vidéo, 0,188 $/s avec vidéo, « à la seconde de sortie » ([tarifs](https://runware.ai/pricing), [modèle](https://runware.ai/docs/models/klingai-video-4-0), [page Kling 4](https://runware.ai/kling-4)).
- FAIT VÉRIFIÉ, Runware : Nano Banana 2.1 au token, 1,50 $/M en entrée et 30 $/M en sortie image, avec des exemples mesurés de 0,0341 à 0,0346 $ en 1K. Les prix unitaires ne sont pas fixes ([page](https://runware.ai/docs/models/google-nano-banana-2-1)).
- FAIT VÉRIFIÉ, Runware : O3 standard à 0,084 $/s sans entrée, 0,126 $/s avec vidéo sans audio ([page](https://runware.ai/docs/models/klingai-video-3-0-omni-standard)).
- FAIT VÉRIFIÉ, Runware : Seedance 2.5 720p à 0,23 $/s, 0,295 $/s avec vidéo ; la page ne dit pas si l'entrée compte ([page](https://runware.ai/docs/models/bytedance-seedance-2-5)). Un exemple officiel référence-vidéo de 8 s en 720p coûte 1,859 $, soit 0,232 $/s, mais la durée d'entrée n'est pas indiquée ([exemples](https://runware.ai/docs/models/bytedance-seedance-2-5/examples)).
- FAIT VÉRIFIÉ, Runware : H3 Max à 0,08 $/s en 768p, mais sans Recast documenté ([page](https://runware.ai/docs/models/minimax-h3-max)). PixVerse Modify à 0,06 $/s en 720p, autre produit ([page](https://runware.ai/docs/models/pixverse-modify)).
- FAIT VÉRIFIÉ, WaveSpeed : Kling 4.0 à 0,157 $/s ; `video-edit` à 0,094 $ par seconde comptée, « requested duration + the longer of the requested and source durations », avec exemple 5 s + 5 s à 0,94 $ ([edit](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit), [article](https://wavespeed.ai/blog/ai-news/kling-4-0-is-coming-what-we-know-and-how-to-prepare-on-wavespeedai/)).
- FAIT VÉRIFIÉ, WaveSpeed : O3 standard edit à 0,126 $/s, 10 s = 1,26 $ ([page](https://wavespeed.ai/models/kwaivgi/kling-video-o3-std/video-edit)).
- FAIT VÉRIFIÉ, WaveSpeed : Nano Banana 2.1 à 0,04 $ en 1K ; `edit` + 0,002 $ par image de référence ([texte](https://wavespeed.ai/models/google/nano-banana-2.1/text-to-image), [edit](https://wavespeed.ai/models/google/nano-banana-2.1/edit)).
- FAIT VÉRIFIÉ, WaveSpeed : Seedance 2.5, 0,36 $/s sans vidéo, 0,22 $/s avec vidéo, appliqué à entrée + sortie, 5 s + 5 s = 2,20 $ ([doc](https://wavespeed.ai/docs/docs-api/bytedance/bytedance-seedance-2.5-reference-to-video)).
- FAIT VÉRIFIÉ, WaveSpeed : Swap à 0,12 $/s en 720p + 0,02 $ de sélection de masque par tâche ([page](https://wavespeed.ai/models/pixverse/swap)). SAM3 à 0,01 $/s, minimum 3 s ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-sam3-video-on-wavespeedai/)). Depth Anything Video à 0,005 $/s, minimum 3 s ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-depth-anything-video-on-wavespeedai/)).
- FAIT VÉRIFIÉ, Together : `ByteDance/Seedance-2.5` à 0,115 $ « par vidéo » sans durée ni résolution, Nano Banana 2 à 0,05 $ ([tarifs](https://www.together.ai/pricing), [modèles](https://docs.together.ai/docs/serverless/models)).
- FAIT VÉRIFIÉ, fal : Kling 4.0 edit à 0,094 $/s, entrée + sortie, minimum 2 fois la sortie ([page](https://fal.ai/models/kling/v4/video-to-video/edit)). Seedance 2.5 : 0,0214 $ par 1 000 tokens, tokens = h × l × (entrée + sortie) × 24 / 1024, × 0,6 avec vidéo ; 10 s + 8 s = 4,99 $ ([page](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video)).
- NON VÉRIFIÉ : tarifs BytePlus de Seedance 2.5 à 10,70 $/M tokens sans vidéo et 6,40 $/M avec vidéo, source CometAPI, article du 3 août 2026, mis à jour le 3 septembre ([CometAPI](https://www.cometapi.com/seedance-2-5-api-pricing/)).

### Inferences
- DÉDUCTION : la règle de comptage de Kling 4.0 edit est mathématiquement la même chez fal, Replicate et WaveSpeed : sortie + max(entrée, sortie). Pour Cosmos, où l'entrée égale la sortie, cela fait 2 × 0,094 = 0,188 $/s, soit exactement le tarif de Runware.
- DÉDUCTION : Kling 4.0 a un prix plancher visiblement commun à tout le marché, ce qui suggère un tarif éditeur répercuté à l'identique. Il n'y a rien à gagner à migrer pour ce modèle, hors promotion.
- DÉDUCTION : à 720p, 21 600 tokens/s × 10,70 $/M = 0,2311 $/s, le prix exact de Replicate et Runware sans vidéo. Le tarif CometAPI est donc crédible, et le tarif fal à 21,4 $/M est le double. fal n'est pas le moins cher sur Seedance 2.5.
- DÉDUCTION, faible : 0,9676 $ = 7 × (21 600 × 6,40 $/M). Replicate semble facturer un pire cas fixe au lieu de compter l'entrée (par exemple 30 s d'entrée pour 5 s de sortie = 35/5 = 7). Non confirmé par la page.
- DÉDUCTION : sur Replicate, l'édition O3 tombe dans le palier 0,168 $/s, puisque `generate_audio` est incompatible avec une vidéo de référence ; soit 33 % au-dessus du prix affiché par fal.
- DÉDUCTION : le gain image reste modeste : 0,0064 $ par image, et seulement si fal facture bien 0,04 $, ce qu'une facture peut seule confirmer.

### Gaps
- Prix réel de Nano Banana 2.1 chez fal : le code l'estime ; la page essayée (`fal.ai/models/fal-ai/nano-banana-2.1`) renvoie 404. La première facture fal le dira.
- Règle exacte de Runware pour Seedance avec vidéo : `includeCost` sur une tâche donnerait le chiffre, mais c'est un appel payant, donc non fait.
- Unité réelle du prix Together sur Seedance 2.5 : 0,115 $ « par vidéo » ressemble à un tarif par seconde en basse résolution, sans preuve.
- La promotion Seedance à 10 % de WaveSpeed s'applique-t-elle au tarif avec vidéo ? Vue seulement sur le prix de base de l'index ([modèles](https://wavespeed.ai/models)).

## 3. Frais : dépôt, crédits, expiration, remises, échecs facturés, promotions, écart entre affiché et facturé

### Takeaway
Runware a les conditions les plus simples : pas de dépense minimale, solde sans expiration, échecs non facturés, coût réel renvoyé par requête. Replicate fait expirer le crédit au bout d'un an. WaveSpeed a le plus de signaux d'alerte : promotions sans date, prix documentés « peut-être obsolètes », et plaintes de facturation. Aucun des trois ne dit clairement si un refus de modération est facturé, ce qui compte pour Cosmos, qui rembourse ses tokens en cas d'échec.

### Cited Findings

| Point | Replicate | Runware | WaveSpeed | Together |
|---|---|---|---|---|
| Dépôt minimum | Pas de minimum indiqué ; auto-recharge : seuil 5 $, solde 15 $ minimum ([crédit](https://replicate.com/docs/topics/billing/prepaid-credit)) | « no subscription and no minimum spend » ([tarifs](https://runware.ai/docs/models-api/pricing)) | Varie selon le moyen de paiement, sans chiffre ([tarification](https://wavespeed.ai/docs/how-pricing-works)) | Non trouvé |
| Expiration | **1 an** après l'achat, non remboursable ([crédit](https://replicate.com/docs/topics/billing/prepaid-credit)) | « it never expires » ([tarifs](https://runware.ai/docs/models-api/pricing)) | N'expire pas, non remboursable ([tarification](https://wavespeed.ai/docs/how-pricing-works)) | Non trouvé |
| Crédit offert | Non trouvé | 2 $ avec adresse professionnelle ([tarifs](https://runware.ai/pricing)) | 1 $ pour comptes éligibles, pas tous les modèles ([tarifs](https://wavespeed.ai/pricing)) | Non trouvé |
| Abonnement | Aucun : usage seul | Aucun | Usage ; les conditions mentionnent des abonnements renouvelés automatiquement ([conditions](https://wavespeed.ai/static/terms)) | Non trouvé |
| Remises volume | Sur demande, sans montant ([tarifs](https://replicate.com/pricing)) | Sur demande, rien d'automatique ([tarifs](https://runware.ai/docs/models-api/pricing)) | Sur demande ([tarifs](https://wavespeed.ai/pricing)) | Non trouvé |
| Échec | « une exécution échouée n'est pas facturée » pour tous les modèles ; un modèle officiel **annulé** peut être facturé ([facturation](https://replicate.com/docs/topics/billing)) | « Failed generations are not charged », limites de débit non facturées ([tarifs](https://runware.ai/docs/models-api/pricing), [page](https://runware.ai/pricing)) | Remboursement automatique des échecs et timeouts système ; un échec de livraison de webhook ne rembourse pas ([remboursement](https://wavespeed.ai/docs/refund-policy), [webhooks](https://wavespeed.ai/docs/how-to-use-webhooks)) | Non trouvé |
| Refus de modération | Non trouvé | Non précisé | Code 1200, facturation non précisée ([erreurs](https://wavespeed.ai/docs/error-codes)) | Non trouvé |
| Coût réel | Non vérifié | `includeCost` renvoie le montant débité ([tarifs](https://runware.ai/docs/models-api/pricing)) | Coût final sur la prédiction ; API `/api/v3/model/price` pour estimer à l'avance ([tarification](https://wavespeed.ai/docs/how-pricing-works)) | Champ `cost` dans la réponse ([doc](https://docs.together.ai/docs/videos-overview)) |

**Promotions à exclure du prix durable** (FAIT VÉRIFIÉ)
- WaveSpeed : Kling 4.0 à -20 %, aucune date de fin indiquée ([API Kling 4](https://wavespeed.ai/kling-4-api), [edit](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit)).
- WaveSpeed : Nano Banana 2.1 à -10 % ([page](https://wavespeed.ai/models/google/nano-banana-2.1/text-to-image)), Seedance 2.5 à -10 % ([modèles](https://wavespeed.ai/models)), certains `wavespeed-ai/minimax-h3` à -50 % ([page](https://wavespeed.ai/minimax-h3-api)).
- Replicate : « Minimax H3 Lite and Highspeed are 50% until end of year », sans rapport avec Recast ([tarifs](https://replicate.com/pricing)).
- Runware : affiche ses promotions avec prix barré, aucune vue sur les modèles de Cosmos ([tarifs](https://runware.ai/pricing)).

**Écart entre prix affiché et prix facturé**
- FAIT VÉRIFIÉ, WaveSpeed : l'aperçu du bouton Run n'est pas un devis (« the server calculates the charge again when you submit ») ([tarification](https://wavespeed.ai/docs/how-pricing-works)), et les pages disent que leurs prix peuvent être obsolètes ([edit](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit)). Les libellés « par run » prêtent à confusion : Swap affiche « 0,12 $ par run » à côté d'un tarif par seconde ([page](https://wavespeed.ai/models/pixverse/swap)), et Depth « 0,005 $ per run » ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-depth-anything-video-on-wavespeedai/)).
- FAIT VÉRIFIÉ, WaveSpeed : une soumission sans identifiant de tâche retourné peut quand même avoir créé une tâche facturée. Vérifier l'historique avant de relancer ([erreurs](https://wavespeed.ai/docs/errors-retries-timeouts)).
- FAIT VÉRIFIÉ, Runware : certains exemples texte-vidéo ne collent pas exactement au tarif × durée, et la page n'explique pas pourquoi ([page](https://runware.ai/docs/models/bytedance-seedance-2-5)).
- FAIT VÉRIFIÉ, Replicate : Replicate peut facturer par anticipation quand l'usage franchit certains seuils pour la première fois, à titre antifraude ([facturation](https://replicate.com/docs/topics/billing)).
- NON VÉRIFIÉ, WaveSpeed : Trustpilot, 2,3/5 sur 6 avis, tous à 1 étoile ; recharge auto réglée à 15 $ débitée deux fois 55 $ (13 avril 2026) ; moitié de 20 générations échouées ou au mauvais format (23 avril 2026) ; e-mails sans réponse ([Trustpilot](https://uk.trustpilot.com/review/wavespeed.ai)). Échantillon très petit.

### Inferences
- DÉDUCTION : pour Cosmos, un crédit Replicate qui expire impose de ne pas surdoser une recharge si le fournisseur sert seulement de secours.
- DÉDUCTION : `includeCost` de Runware colle bien à l'objectif « tout automatisé » : marge contrôlable par génération sans attendre de facture.

### Gaps
- La facturation d'un refus de modération n'est écrite clairement chez aucun. Seul un essai ou une question au support le dirait.
- Le montant minimal de recharge WaveSpeed n'est pas publié.

## 4. Rapidité d'accès aux nouveaux modèles

### Takeaway
Replicate et Runware suivent de très près : Nano Banana 2.1 le jour même, Seedance 2.5 dès le 7 août, Kling 4.0 entre 23 et 26 octobre. fal a été donné au 23 octobre sur Kling 4.0, par une seule source secondaire. Sur ce critère, aucun écart décisif n'apparaît en faveur de fal ou contre lui.

### Cited Findings

| Modèle | Sortie officielle | fal | Replicate | Runware | WaveSpeed |
|---|---|---|---|---|---|
| Nano Banana 2.1 | 6 oct. 2026 (NON VÉRIFIÉ sur Google, presse et extraits : [Decrypt](https://decrypt.co/380257/google-launches-nano-banana-2-1)) | Non trouvé | 6 oct. 2026 16:28 UTC, FAIT VÉRIFIÉ ([page](https://replicate.com/google/nano-banana-2.1)) | 6 oct. 2026, date de la fiche, FAIT VÉRIFIÉ ([page](https://runware.ai/docs/models/google-nano-banana-2-1)) | Non trouvé |
| Kling 4.0 | Accès anticipé Flash le 28 sept. ; lancement le 15 oct. ; API les 21-22 oct. (NON VÉRIFIÉ, sources secondaires qui divergent : [ToolNavs](https://toolnavs.com/de/article/2830-kling-40-api-opens-to-all-customers-as-fal-and-third-party-platforms-move-in), [Creaa](https://creaa.ai/blog/kling-4)) | 23 oct. 2026 (NON VÉRIFIÉ, [ToolNavs](https://toolnavs.com/de/article/2830-kling-40-api-opens-to-all-customers-as-fal-and-third-party-platforms-move-in)) | Page : « créé il y a 1 semaine, 4 jours », soit ≈ 24 oct. ; horodatage le plus ancien lu : 26 oct. 19:20 UTC. FAIT VÉRIFIÉ, avec cet écart ([page](https://replicate.com/kwaivgi/kling-v4.0)) | 23 oct. 2026, date de la fiche, FAIT VÉRIFIÉ ([page](https://runware.ai/docs/models/klingai-video-4-0)) | « Octobre 2026 », article mis à jour le 22 oct. ; source du fournisseur, contradictions internes, NON VÉRIFIÉ ([article](https://wavespeed.ai/blog/ai-news/kling-4-0-release-date/)) |
| Seedance 2.5 | Annonce le 23 juin ; lancement le 31 juil. ; API Volcano Engine rapportée le 10 août (NON VÉRIFIÉ : [BBT News](https://www.bbtnews.com.cn/2026/0810/601734.shtml), [Digital Applied](https://www.digitalapplied.com/blog/seedance-2-5-bytedance-ai-video-model-2026)) | Non trouvé | 7 août 2026, FAIT VÉRIFIÉ ([page](https://replicate.com/bytedance/seedance-2.5)) | 7 août 2026, date de la fiche, FAIT VÉRIFIÉ ([page](https://runware.ai/docs/models/bytedance-seedance-2-5)) | Non trouvé |

- FAIT VÉRIFIÉ : à la date du jour, Together ne sert ni Kling ni Nano Banana 2.1, 29 jours après la sortie de ce dernier ([modèles](https://docs.together.ai/docs/serverless/models)).

### Inferences
- DÉDUCTION : les dates de fiches Runware peuvent être des dates d'édition de la documentation plutôt que de mise en service. Elles coïncident toutefois avec Replicate sur deux modèles.
- DÉDUCTION : pour un modèle majeur, Replicate et Runware ne font pas perdre plus de quelques jours par rapport à fal.

### Gaps
- Dates exactes de fal pour Nano Banana 2.1 et Seedance 2.5, et de WaveSpeed pour les trois modèles : non trouvées. La recherche web était épuisée à ce stade.

## 5. Latence et limites documentées, concurrence, file d'attente, SLA

### Takeaway
Aucun des trois ne publie de SLA en libre-service ni de latence garantie sur ces modèles. Replicate donne les limites les plus claires pour un petit compte. Runware n'a pas de limite stricte, mais recommande 2 à 4 requêtes simultanées. WaveSpeed bride un compte neuf à 5 requêtes par minute et 2 tâches jusqu'à la première recharge. Une seule mesure indépendante, rapportée de seconde main, suggère que WaveSpeed est plus lent que fal sur plusieurs modèles.

### Cited Findings
- FAIT VÉRIFIÉ, Replicate : 600 créations de prédictions par minute, 3 000 pour les autres points d'accès ; sans moyen de paiement 1 requête/s et 6 par minute ; limites plus strictes si le solde baisse ([limites](https://replicate.com/docs/topics/predictions/rate-limits)). SLA : non trouvé.
- FAIT VÉRIFIÉ, Runware : pas de limite stricte de concurrence, 2 à 4 requêtes simultanées recommandées, pas de niveaux, aucun SLA publié (négocié). En surcharge, `serviceOverloaded` avec `retryAfter`, avant entrée en file ; au-delà de 120 s, une requête synchrone passe en « processing » ([limites](https://runware.ai/docs/models-api/rate-limits)). Des limites de fournisseurs tiers peuvent remonter en 429 ou 503 (même source).
- FAIT VÉRIFIÉ, WaveSpeed : Bronze 5 prédictions/min et 2 tâches ; Silver 500/min et 300 tâches, après toute recharge réussie de moins de 1 000 $ ; Gold 3 000/3 000 ; Ultra 5 000/10 000 ([docs](https://wavespeed.ai/docs/)). SLA personnalisés en offre Enterprise seulement ([à propos](https://wavespeed.ai/about)).
- FAIT VÉRIFIÉ, estimations de pages, sans garantie : WaveSpeed O3 edit ≈ 512 s ([page](https://wavespeed.ai/models/kwaivgi/kling-video-o3-std/video-edit)), SAM3 ≈ 61 s ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-sam3-video-on-wavespeedai/)), Depth ≈ 102 s ([page](https://wavespeed.ai/blog/posts/introducing-wavespeed-ai-depth-anything-video-on-wavespeedai/)) ; Runware H3 Max ≈ 23 à 25 s ([page](https://runware.ai/docs/models/minimax-h3-max)). Aucun chiffre de latence trouvé pour Kling 4.0, chez aucun.
- FAIT VÉRIFIÉ, incidents, autodéclarés : WaveSpeed : API à 100 % / 99,978 % / 99,981 % selon la période, panne de 2 min le 20 août et de 14 min le 9 sept. 2026 ([statut](https://status.wavespeed.ai)), alors que l'accueil annonce 99,99 % ([accueil](https://wavespeed.ai/)). Runware, août à nov. 2026 : API 100 %, Modèles 99,93 % ([statut](https://status.runware.ai)). Replicate, désormais sur la page de statut Cloudflare : aucun jour d'incident sur 30 jours, 5 sur 90 jours, sans détail ([statut](https://www.cloudflarestatus.com/services?search=replicate&)).
- NON VÉRIFIÉ, medianes Artificial Analysis du 21 oct. 2026 rapportées par un site tiers : FLUX.1 schnell 11,0 s chez WaveSpeed, 3,2 s chez fal, 2,2 s chez Replicate ; MiniMax H3 123,9 s chez WaveSpeed, 12,5 s chez fal ; Vidu Q3 Pro, WaveSpeed le plus rapide des trois à 105,7 s ([GenGrades](https://gengrades.com/wavespeed-ai)). La page d'origine n'a pas pu être lue.

### Inferences
- DÉDUCTION : le volume actuel de Cosmos reste loin de toutes ces limites, sauf le niveau Bronze de WaveSpeed et, potentiellement, les 2 à 4 requêtes conseillées de Runware en cas de pic.
- DÉDUCTION : la vitesse de la vidéo dépend surtout du modèle amont pour Kling et Seedance, car l'agrégateur relaie. Sans mesure publique sur Kling 4.0, la latence ne peut pas départager.

### Gaps
- Aucune mesure indépendante de latence Kling 4.0 par fournisseur : la page Artificial Analysis testée renvoie 404.
- Pas d'historique détaillé des incidents Replicate.

## 6. Automatisation : webhooks, SDK JavaScript, stockage, Vercel, migration

### Takeaway
WaveSpeed est le plus proche de fal en forme de requête, Replicate le plus éprouvé, Runware le plus différent en API. Trois écarts structurants existent par rapport à Cosmos : aucun ne renvoie un webhook pendant une longue durée comme le code le suppose de fal (1 h), Replicate supprime les sorties après 1 h, et Runware ne signe pas ses webhooks. La migration est faisable, mais demande une relance automatique et une réécriture des prompts.

### Cited Findings

| Point | Replicate | Runware | WaveSpeed | Together |
|---|---|---|---|---|
| Webhook | `webhook` + `webhook_events_filter` dans le corps ([doc](https://replicate.com/docs/topics/webhooks/setup-webhook)) | `webhookURL` ([doc](https://runware.ai/docs/platform/webhooks)) | `standard_webhook` en paramètre d'URL ([doc](https://wavespeed.ai/docs/how-to-use-webhooks)) | Non mentionné : suivi par interrogation ([doc](https://docs.together.ai/docs/videos-overview)) |
| Signature | HMAC-SHA256 (`webhook-id`, `webhook-timestamp`, `webhook-signature`) ([doc](https://replicate.com/docs/topics/webhooks/verify-webhook)) | **Aucune signature décrite** : paramètres d'URL seulement ([doc](https://runware.ai/docs/platform/webhooks)) | HMAC-SHA256, même schéma, tolérance 5 min, rotation 24 h ([doc](https://wavespeed.ai/docs/verify-webhooks)) | - |
| Reprises | Webhook final seul ; dernière tentative ≈ **1 min** après la fin ; 2xx attendu ([doc](https://replicate.com/docs/topics/webhooks/receive-webhook)) | 250 ms à 8 s avec gigue, sans durée totale publiée ; 2xx en moins de 5 s conseillé ([doc](https://runware.ai/docs/platform/webhooks)) | Jusqu'à **3 reprises**, réponse en moins de 10 s, puis plus rien ([doc](https://wavespeed.ai/docs/how-to-use-webhooks)) | - |
| SDK JS | `replicate-javascript` ([doc](https://replicate.com/docs/topics/webhooks/setup-webhook)) | `@runware/sdk`, REST ou WebSocket, Node 18+, Vercel Edge cité ([doc](https://runware.ai/docs/tools/typescript)) | `wavespeed` sur npm, `upload`, interrogation ; serverless non précisé ([doc](https://wavespeed.ai/docs/javascript-sdk)) | Client `together` ([doc](https://docs.together.ai/docs/videos-overview)) |
| Vie des sorties | **1 h** via API ([doc](https://replicate.com/docs/topics/predictions/output-files)) | **7 jours** sans ZDR ; 60 s par défaut avec ZDR, réglable ([doc](https://runware.ai/docs/models-api/zero-data-retention)) | « generally expire within 7 days » ([doc](https://wavespeed.ai/docs/data-retention-policy)) | Expirent, durée non donnée ([doc](https://docs.together.ai/docs/videos-overview)) |
| Dépôt d'entrées | URL, fichier local jusqu'à 100 Mo, data URI ([doc](https://replicate.com/docs/topics/predictions/input-files)) | `mediaStorage` : URL, data URI, base64 ; suppression définitive possible, durée non donnée ([doc](https://runware.ai/docs/models-api/media-storage)) | `wavespeed.upload`, durée non donnée ([doc](https://wavespeed.ai/docs/javascript-sdk)) | Non trouvé |
| Syntaxe de prompt | `@video_1`, `<<<image_1>>>` selon modèle ([Kling 4](https://replicate.com/kwaivgi/kling-v4.0), [O3](https://replicate.com/kwaivgi/kling-v3-omni-video)) | `<<<video_1>>>`, `<<<image_1>>>`, `<<<element_1>>>`, prompt commençant par « Edit <<<video_1>>> » ([guide](https://runware.ai/docs/models/klingai-video-4-0/guides/editing-video)) | `@Video1`, `@Image1`, comme fal ([edit](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit)) | - |

**Côté Cosmos** (FAIT VÉRIFIÉ, code lu)
- `src/app/api/webhooks/fal/route.ts` vérifie une signature Ed25519, valide un `request_id` UUID, relit le résultat avec la clé, et répond 500 pour faire renvoyer le webhook. `src/config/product.ts` indique des renvois fal pendant 1 h au maximum.
- La même route passe directement `result.url` à l'e-mail de résultat (ligne 46).
- `src/lib/presets/provider.ts` a déjà une interface `MediaProvider` : « une entrée de plus dans PROVIDERS et "provider" dans le preset ». `src/lib/fal.ts` (flux `/creer` et chat) n'a pas cette abstraction.

### Inferences
- DÉDUCTION : l'e-mail avec l'URL brute ne marche pas chez Replicate : le lien mourrait après 1 h. Il faudrait copier la vidéo dans le stockage de Cosmos à la réception. Chez Runware et WaveSpeed, 7 jours coïncident avec `retentionDays: 7`, mais la formule de WaveSpeed (« generally ») n'est pas une garantie.
- DÉDUCTION : les reprises courtes (1 min chez Replicate, 3 essais chez WaveSpeed) rendent obligatoire une tâche planifiée de rattrapage par interrogation, pour rester sans intervention manuelle. Cosmos n'a ce filet que partiellement sur les presets.
- DÉDUCTION : l'absence de signature chez Runware est gérable, car Cosmos met déjà un jeton chiffré dans l'URL et relit le résultat avec sa clé. Cela retire toutefois une vérification.
- DÉDUCTION, difficulté de migration, de la plus faible à la plus forte : WaveSpeed (URL de modèle + paramètre de webhook + mêmes jetons `@Video1`), Replicate (corps différent, prompts à ajuster, copie obligatoire), Runware (`taskType`, `inputs`, `<<<...>>>`, mais `elements` proches). Toutes demandent de relancer la grille de test des presets, payante.
- DÉDUCTION : les trois sont compatibles avec Vercel via REST et webhook, puisque rien n'exige de connexion longue, à condition de ne pas utiliser le mode synchrone ni le WebSocket de Runware dans une fonction serverless.

### Gaps
- Durée de vie des fichiers déposés chez Runware et WaveSpeed.
- Replicate : le nombre exact de reprises n'est pas publié.

## 7. Conditions : usage commercial, entraînement, conservation et visibilité, DPA, localisation

### Takeaway
Runware est le mieux placé pour une activité française traitant des photos de visages : société britannique, hébergement en partie dans l'UE, RGPD mentionné, engagement écrit de non-entraînement. Replicate a la meilleure conservation par défaut (suppression à 1 h), meilleure que le défaut de fal noté dans les mémoires du projet, mais ses textes ne mentionnent ni RGPD ni DPA. WaveSpeed est le plus faible : Singapour et Hong Kong, responsabilité plafonnée à 100 $, aucun RGPD ni DPA mentionné.

### Cited Findings

| Point | Replicate | Runware | WaveSpeed |
|---|---|---|---|
| Entité, droit | Replicate, LLC, San Francisco ; droit californien ; conditions du 1er avril 2026 ([conditions](https://replicate.com/terms)) | Runware Ltd, Harrow, Royaume-Uni ; droit anglais, arbitrage à Londres ; conditions du 29 sept. 2026 ([conditions](https://runware.ai/terms)) | WaveSpeedAI PTE. LTD. (Singapour) et WaveSpeedAI LIMITED (Hong Kong) ; arbitrage SIAC ; conditions du 1er nov. 2026 ([conditions](https://wavespeed.ai/static/terms)) |
| Usage commercial | Oui, sous réserve des conditions tierces des modèles ([conditions](https://replicate.com/terms)) | Oui ; droit d'usage commercial pour les modèles « Partner » ([conditions](https://runware.ai/terms)) | Le client possède ses sorties ; pas de droit commercial explicite ; aucune garantie sur les droits ([conditions](https://wavespeed.ai/static/terms)) |
| Entraînement | Licence limitée aux modèles affinés par le client (« Customer Derivative Models »), données agrégées et anonymisées réutilisables ([conditions](https://replicate.com/terms)) | « Runware never uses data sent through the API to train or improve models » ([ZDR](https://runware.ai/docs/models-api/zero-data-retention)) | Pas de clause explicite ; art. 11.5 : analyse possible, données agrégées réutilisables ([conditions](https://wavespeed.ai/static/terms)) |
| Conservation | Entrées, sorties et journaux API supprimés après **1 h** par défaut ([doc](https://replicate.com/docs/topics/predictions/data-retention)) | URL de sortie 7 jours par défaut, entrées non précisées ; ZDR réservé à l'entreprise, sur demande ([ZDR](https://runware.ai/docs/models-api/zero-data-retention)) | Médias : 7 jours environ ; entrées non précisées ; métadonnées « as needed » ([doc](https://wavespeed.ai/docs/data-retention-policy)) |
| ZDR et modèles Cosmos | Non applicable | ZDR couvre Google, BFL, HeyGen, Ideogram, Lightricks, Topaz, xAI, **pas Kuaishou, ByteDance ni MiniMax** ([ZDR](https://runware.ai/docs/models-api/zero-data-retention)) | Non trouvé |
| Visibilité des fichiers | Non précisé ; URL sur `replicate.delivery` ([doc](https://replicate.com/docs/topics/predictions/output-files)) | Non précisé pour `mediaURL` ([doc](https://runware.ai/docs/models-api/media-storage)) | Non précisé ([doc](https://wavespeed.ai/docs/data-retention-policy)) |
| DPA, RGPD | Aucun des deux textes n'en parle ; se dit « processor » ou « service provider » ([confidentialité](https://replicate.com/privacy)) | RGPD et RGPD britannique cités ; pied de page « GDPR Compliant » ; DPA non mentionné ([confidentialité](https://runware.ai/privacy)) | Aucun RGPD ni DPA mentionné ([confidentialité](https://wavespeed.ai/static/privacy), [conditions](https://wavespeed.ai/static/terms)) |
| Localisation | Non traitée dans le texte ([confidentialité](https://replicate.com/privacy)) | Services hébergés aux États-Unis, en Allemagne et en Roumanie ; « Data residency EU & US » ([conditions](https://runware.ai/terms), [confidentialité](https://runware.ai/privacy)) | Non traitée ([confidentialité](https://wavespeed.ai/static/privacy)) |
| Plafond de responsabilité | Non relevé | Sommes payées sur 6 mois par un client entreprise ([conditions](https://runware.ai/terms)) | **100 $**, modifications de prix à tout moment ([conditions](https://wavespeed.ai/static/terms)) |
| Identité de tiers | Non relevé | Usage de l'identité d'une personne réelle sans consentement interdit ; le client intégrateur doit faire ses propres contrôles d'âge et de contenu ([conditions](https://runware.ai/terms)) | Deepfakes non consentis interdits ; blocage et suspension possibles ([conditions](https://wavespeed.ai/static/terms)) |

Tout le tableau est FAIT VÉRIFIÉ, lu via résumé automatique ; ce n'est pas un avis juridique.

- NON VÉRIFIÉ, mémoire du projet : les docs fal lues le 2026-11-04 indiquent des fichiers générés conservés sans limite et publics par défaut, un historique de 90 jours, et des en-têtes pour l'éviter.

### Inferences
- DÉDUCTION : chez tout agrégateur, les photos de clients passent probablement chez l'éditeur du modèle (Kuaishou, ByteDance). Aucune politique lue ne le détaille ; c'est à traiter comme un sous-traitant ultérieur, quel que soit l'intermédiaire.
- DÉDUCTION : le cœur de Cosmos, « un proche filmé en star à partir de ses photos », tombe sous les clauses d'identité et de consentement de Runware et WaveSpeed. Il faut que le formulaire recueille le consentement. Le blocage de compte, évoqué par les conditions de WaveSpeed et par un avis Trustpilot de déc. 2025, est un risque d'exploitation.
- DÉDUCTION : le RGPD pèse contre WaveSpeed et, dans une moindre mesure, contre Replicate, faute de texte. Un DPA formel reste à demander partout.

### Gaps
- Existence d'un DPA signable chez chacun : non trouvée sur les pages lues. Replicate pourrait relever de celui de Cloudflare, sans confirmation.
- Le plafond de responsabilité et la clause d'identité de Replicate n'ont pas été extraits.
- Conditions de Together non lues, vu son verdict.

## 8. Stabilité : financement, propriété, clients, support, incidents

### Takeaway
Replicate est le plus sûr en propriété, adossé à Cloudflare, société cotée. Runware a un financement sérieux et récent. WaveSpeed a la structure la plus légère et la plus opaque, avec des témoignages négatifs peu nombreux mais cohérents.

### Cited Findings
- FAIT VÉRIFIÉ, Replicate : « On December 1, 2025, the Company acquired all of the outstanding shares of Replicate […] for a total purchase cash consideration of $57.4 million », goodwill de 46,6 M$, formulaire 10-Q de Cloudflare ([SEC](https://www.sec.gov/Archives/edgar/data/0001477333/000147733326000038/cloud-20260331.htm)). Une source wiki évoque environ 350 M$ sans source ; à écarter ([agentwiki](https://agentwiki.org/replicate)).
- FAIT VÉRIFIÉ : la page de statut de Replicate redirige vers celle de Cloudflare ([statut](https://www.cloudflarestatus.com/services?search=replicate&)), alors que les conditions et la confidentialité restent au nom de Replicate, LLC, sans mention de Cloudflare ([conditions](https://replicate.com/terms), [confidentialité](https://replicate.com/privacy)).
- NON VÉRIFIÉ : Replicate doit rester une marque distincte, API maintenues, catalogue intégré à Workers AI, annonce de nov. 2025 relayée par la presse ([ChannelDive](https://www.channeldive.com/news/cloudflare-fortifies-ai-arsenal-replicate-acquisition/805839/), [Techzine](https://www.techzine.eu/news/infrastructure/136427/cloudflare-brings-50000-llms-within-reach-with-replicate-deal)). Le communiqué d'origine renvoie 403.
- NON VÉRIFIÉ, recoupé par plusieurs médias : Runware, série A de 50 M$ en déc. 2025, menée par Dawn Capital, avec Speedinvest, Comcast Ventures, Insight Partners et a16z Speedrun ; 66 M$ au total selon CB Insights ([SiliconANGLE](https://siliconangle.com/2025/12/11/ai-inference-startup-runware-raises-50m-make-ai-run-faster/), [Cooley](https://www.cooley.com/news/coverage/2025/2025-12-12-dawn-capital-leads-runwares-$50-million-series-a), [CB Insights](https://www.cbinsights.com/company/runware/financials)).
- NON VÉRIFIÉ, Runware : communauté de développeurs jugée petite, pas de fils Reddit notables, documentation « en rattrapage », selon un agrégateur d'avis ; sans preuve solide ([rfp.wiki](https://www.rfp.wiki/vendors/replicate/fal), [Tools for Humans](https://www.toolsforhumans.ai/ai-tools/runware)).
- FAIT VÉRIFIÉ, WaveSpeed : siège à Singapour, 3 Phillip Street, PDG Zeyi Cheng, création en 2025, aucun investisseur nommé ; logos « Trusted by innovators » (Freepik, Novita AI, Stripe, MiniMax, Draw Things et d'autres), sans nature de la relation ([à propos](https://wavespeed.ai/about)).
- NON VÉRIFIÉ, WaveSpeed : tour d'amorçage « de plusieurs millions » en avril 2025, sans montant ni investisseurs ([MarTech Series](https://martechseries.com/?p=376687)) ; Preqin le place à Hangzhou, contrairement au reste ([Preqin](https://www.preqin.com/data/profile/asset/wavespeedai/736996)) ; 1 à 50 employés selon les annuaires ([StartupHub](https://www.startuphub.ai/startups/wavespeedai)).
- NON VÉRIFIÉ, WaveSpeed : support décrit comme absent par plusieurs avis, 21 oct. et 23 avril 2026, et l'entreprise ne répond pas aux avis ([Trustpilot](https://uk.trustpilot.com/review/wavespeed.ai)). Les comparatifs publiés par WaveSpeed contre fal et Replicate sont biaisés ; je ne m'en sers pas comme preuve ([exemple](https://wavespeed.ai/blog/posts/replicate-review-2026)).
- FAIT VÉRIFIÉ, Together : ne sert pas les modèles Kling ; son financement n'a pas été recherché, faute de budget ([modèles](https://docs.together.ai/docs/serverless/models)).

### Inferences
- DÉDUCTION : le risque Replicate n'est pas la faillite, mais une évolution de prix ou de marque liée à l'intégration à Cloudflare. Aucun changement de prix post-acquisition n'a été trouvé.
- DÉDUCTION : pour un business semi-passif sans support humain en continu, un fournisseur au support défaillant coûte plus cher qu'un écart de quelques pour cent.

### Gaps
- Aucun fil Reddit, Hacker News ou GitHub exploitable n'a été trouvé sur Replicate-Kling, Runware ou WaveSpeed. Les deux recherches lancées n'ont rien donné de direct, et la suivante a été bloquée par le budget.
- Délais réels de réponse du support : non mesurés. Clients nommés de Runware et Replicate : non recherchés.

## 9. Verdict par acteur

### Takeaway
**Aucun ne bat fal à spécification identique sur la ligne qui compte, Kling 4.0, et aucun ne justifie une migration.** Garder fal comme fournisseur principal. Qualifier Runware comme second fournisseur pour Kling 4.0, garder Replicate en secours, écarter WaveSpeed et Together.

### Cited Findings
Les faits sont cités aux sections 1 à 8. Récapitulatif :

| Acteur | Verdict | Justification courte |
|---|---|---|
| **Runware** | **À retenir, comme second fournisseur à qualifier, sans migration** | Seul à proposer `elements` sur Kling 4.0, mêmes prix que fal, O3 à 0,126 $, Seedance peut-être nettement moins cher, solde sans expiration, `includeCost`, RGPD mentionné et hébergement en partie dans l'UE, série A récente. Contre : webhooks non signés, pas de Recast, Swap, SAM 3 ni Depth, 2 à 4 requêtes simultanées conseillées. |
| **Replicate** | **En réserve, secours de premier rang** | Propriété la plus solide (Cloudflare), modèles marqués officiels, conservation d'1 h, webhooks signés, prix fixes, Nano Banana 2.1 à 0,0336 $. Contre : pas d'`elements`, O3 33 % plus cher, Seedance avec vidéo 74 % plus cher, pas de Recast ni Swap, sorties à copier sous 1 h, crédit valable 1 an, aucun texte RGPD. |
| **WaveSpeedAI** | **À écarter pour l'instant** | Catalogue le plus large et Seedance 21 % moins cher, mais pas de `elements`, de `keyframe_id` ni de cadres SAM 3 ; Swap 3 fois plus cher ; responsabilité limitée à 100 $, entités Singapour et Hong Kong, aucun RGPD ni DPA ; avis défavorables et mesures de latence secondaires défavorables. Sa promotion de 20 % sur Kling 4.0 est temporaire et sans date. À réexaminer si un DPA est obtenu et si la remise devient durable. |
| **Together AI** | **À écarter** | Ni Kling, ni Nano Banana 2.1, ni Recast, ni Swap, ni SAM 3, ni Depth ; pas de webhook documenté. |

### Inferences
- DÉDUCTION : l'unique gain immédiat à examiner est Nano Banana 2.1 chez Replicate, 16 % sous l'estimation fal. Il reste trop faible pour justifier un second circuit tant que la facture fal n'a pas confirmé le prix réel.
- DÉDUCTION : si Seedance 2.5 revient dans les plans de production, le trio de prix mérite une nouvelle comparaison : Runware avec `includeCost`, WaveSpeed et fal, car l'écart peut dépasser 40 %.
- DÉDUCTION : ordre des prochains pas, sans dépense : lire la première facture fal pour Nano Banana 2.1 ; demander à Runware si `elements` passe avec `inputs.video`, si l'entrée Seedance est facturée, et un DPA. Toute génération de test reste soumise à un feu vert explicite, run par run.

### Gaps
- La qualité réelle d'un même modèle à travers ces fournisseurs n'a pas été mesurée : aucun test payant n'a été fait, et aucune comparaison indépendante n'a été trouvée.
- Le prix de fal et la disponibilité de ces modèles peuvent évoluer vite : ces notes valent au 2026-11-04.

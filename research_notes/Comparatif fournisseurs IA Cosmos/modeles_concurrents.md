# Modèles concurrents achetés à la source : existe-t-il mieux ou moins cher que Nano Banana 2.1 et Kling 4.0 pour Cosmos ? (état au 2026-11-04)

Conventions. **Toutes les pages citées ont été consultées le 2026-11-04**, sauf date contraire indiquée. FAIT VÉRIFIÉ = lu sur une page officielle de l'éditeur ou sur le classement lui-même. DÉDUCTION = calcul ou raisonnement de ma part. NON VÉRIFIÉ = source tierce, ou point que la page officielle ne confirme pas. Les pages ont été lues par un extracteur automatique : les chiffres décisifs sont à relire à l'œil avant tout engagement. **Aucun modèle différent n'est une « spécification identique » : toute équivalence de qualité reste à prouver par un test, et aucun test payant n'a été lancé.**

Références Cosmos utilisées pour les écarts (tarifs issus du code, voie fal, voir `src/config/product.ts`) : image 1K ≈ 0,04 $ ; vidéo 720p 0,157 $/s ; remplacement de personne 0,188 $/s produite, soit 1,88 $ sur 10 s. Coûts Kling 4.0 de référence : 0,785 $ (5 s), 1,57 $ (10 s), 2,355 $ (15 s), 3,14 $ (20 s).

## Pour chaque acteur : modèle adapté, prix officiel, coût comparable, remplacement de personne, photos réelles

### Takeaway
Deux offres coûtent nettement moins que Kling 4.0 en vidéo et sont bien classées : **MiniMax H3 768p (0,08 $/s, -49 %)** et **Wan 3.0 (0,10 $/s, -36 %)**. En remplacement de personne, seuls **Wan 2.2 Animate Mix** (outil dédié, 1,80 $ sur 10 s depuis Singapour, 0,90 $ depuis Pékin) et **H3 avec vidéo de référence** (1,60 $, mais la scène est régénérée) sont des pistes crédibles. En image, aucun modèle n'est à la fois moins cher et aussi bien classé que Nano Banana 2.1.

### Cited Findings

#### Usage 1 : image 1K

Base de comparaison. FAIT VÉRIFIÉ : Nano Banana 2.1 coûte chez Google 0,0336 $ l'image 1K en sortie, plus 1,50 $ par million de jetons d'entrée, et 0,0168 $ en lot — [Google AI Studio, tarifs](https://aistudio.google.com/docs/pricing). FAIT VÉRIFIÉ : Runway le revend 4 crédits, soit 0,04 $ — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing).

| Modèle | Prix pour une image 1K | Écart / 0,0336 $ | Elo Artificial Analysis (rang) | Score Arena (rang) | Statut du prix | Source du prix |
|---|---|---|---|---|---|---|
| GPT Image 2.5 Sunburst, qualité max | 0,2107 $ | +527 % | 1223 (1) | 1427 (1, qualité non précisée) | FAIT VÉRIFIÉ sur AA ; OpenAI ne publie que des jetons | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text), [OpenAI](https://developers.openai.com/api/docs/pricing) |
| GPT Image 2, élevée | 0,211 $ | +528 % | 1189 (3-4) | n/d | FAIT VÉRIFIÉ | [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation) |
| GPT Image 2, moyenne | 0,053 $ | +58 % | n/d | 1381 (3) | FAIT VÉRIFIÉ | [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation) |
| GPT Image 2, basse | 0,006 $ | -82 % | n/d | n/d | FAIT VÉRIFIÉ, qualité non classée | [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation) |
| GPT Image 1 Mini, moyenne | 0,011 $ | -67 % | n/d | n/d | FAIT VÉRIFIÉ, qualité non classée | [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation) |
| **Nano Banana 2.1 (référence)** | **0,0336 $** | - | **1176 (3-6)** | **1325 (5, préliminaire)** | FAIT VÉRIFIÉ | [Google](https://aistudio.google.com/docs/pricing) |
| Grok Imagine Image 2.0 | 0,04 $ chez xAI ; 60 $/1000 sur AA | +19 % | 1168 (4-6) | 1317 (6) | FAIT VÉRIFIÉ chez xAI, contredit par AA | [xAI](https://docs.x.ai/docs/models) |
| MAI-Image-2.6 | 0,0389 $ | +16 % | 1167 (4-6) | 1329 (4) | NON VÉRIFIÉ à la source, prix AA | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) |
| MAI-Image-2.6-Flash | 0,0195 $ | -42 % | 1120 (8-14) | n/d | NON VÉRIFIÉ à la source, prix AA | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) |
| Muse Image | 0,01 $ | -70 % | 1127 (8-12) | 1269 (9) | FAIT VÉRIFIÉ en revente Runway et sur AA, jamais lu à la source | [Runway](https://docs.dev.runwayml.com/guides/pricing), [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) |
| FLUX 3 Image | 0,048 $ | +43 % | 1119 (8-15) | absent | FAIT VÉRIFIÉ sur AA ; tableau BFL illisible | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text), [BFL](https://bfl.ai/pricing) |
| FLUX 3 Image Klein (poids ouverts) | 0,009 $ | -73 % | 1043 (20-26) | absent | FAIT VÉRIFIÉ sur AA | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) |
| Seedream 5.0 Pro | 0,05 $ (Runway) ; 90 $/1000 sur AA | +49 % ou plus | 1101 (14-17) | 1250 (14) | Les deux prix se contredisent | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Qwen-Image-3.0 | 0,03 $ | -11 % | 1072 (18-19) | n/d | NON VÉRIFIÉ à la source, prix AA | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) |
| Recraft V4.1 Utility | 0,035 $ | +4 % | 1026 (24-39) | n/d | FAIT VÉRIFIÉ | [Recraft](https://www.recraft.ai/docs/api-reference/pricing) |
| Recraft V4.1 Flash | 0,007 $ | -79 % | 949 (68-72) | n/d | FAIT VÉRIFIÉ | [Recraft](https://www.recraft.ai/docs/api-reference/pricing) |
| Ideogram 4.5, haute | 0,10 $ | +198 % | 1016 (27-45) | n/d | NON VÉRIFIÉ à la source, page Ideogram non chargée | [AA](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text), [Ideogram](http://ideogram.ai/pricing/?pricing_tab=api) |
| Luma Uni-1.1 (2048 px) | 0,0404 $ ; 0,0434 $ avec 1 référence ; 0,0644 $ avec 8 | +20 % | Uni-1 : 993 (45-60) | n/d | FAIT VÉRIFIÉ ; Elo mesuré sur Uni-1, pas 1.1 | [Luma](https://lumalabs.ai/api/pricing) |
| Wan 2.7 Image | 0,03 $ (Singapour) | -11 % | 987 (48-63) | n/d | FAIT VÉRIFIÉ | [Alibaba](https://www.alibabacloud.com/help/en/model-studio/model-pricing) |

- FAIT VÉRIFIÉ : les variantes GPT Image 2.5 Flare et Sunburst ont le même tarif, 30 $ par million de jetons image en sortie, 8 $ en entrée image, 5 $ en entrée texte — [OpenAI, tarifs](https://developers.openai.com/api/docs/pricing). OpenAI renvoie à un calculateur et au champ `usage` pour le coût par image — [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation).
- FAIT VÉRIFIÉ : Runway facture GPT Image 2.5 en 1K carré (1920x1920 selon sa table) 2 crédits en qualité basse, 3 en moyenne, 11 en haute, 19 en très haute et 42 en max, plus 1 crédit par image de référence — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing).
- FAIT VÉRIFIÉ : `gpt-image-2` traite toujours les images d'entrée en haute fidélité, ce qui alourdit le coût des références — [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation).
- FAIT VÉRIFIÉ : `gpt-image-1` a été arrêté le 2026-10-23 — [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation). `gemini-2.5-flash-image` sera arrêté le 2027-03-15 — [Google, tarifs](https://aistudio.google.com/docs/pricing).

#### Usage 2 : vidéo 720p (prompt ou images)

Toutes les lignes sont des coûts calculés (DÉDUCTION) à partir du prix unitaire, dont le statut figure en colonne. L'audio est inclus sauf mention contraire.

| Modèle | $/s en 720p | 5 s | 10 s | 15 s | 20 s | Écart / 0,157 $ | Statut du prix | Source |
|---|---|---|---|---|---|---|---|---|
| **Kling 4.0, prix catalogue (référence)** | **0,157** | 0,785 | 1,57 | 2,355 | 3,14 | - | Catalogue confirmé chez Runway (15,7 crédits/s) | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Kling 4.0 via Runway, promo jusqu'au 2026-11-30 | 0,1256 | 0,63 | 1,26 | 1,88 | 2,51 | -20 % | FAIT VÉRIFIÉ, promo datée | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| **MiniMax H3, 768p** | **0,08** | 0,40 | 0,80 | 1,20 | 15 s max ; 2 clips = 1,60 | **-49 %** | FAIT VÉRIFIÉ | [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo), [limites](https://platform.minimax.io/docs/guides/video-generation) |
| MiniMax H3-Highspeed, 768p | 0,06 | 0,30 | 0,60 | 0,90 | 2 clips = 1,20 | -62 % | FAIT VÉRIFIÉ, variante non classée | [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo) |
| MiniMax H3-Lite, 768p | 0,04 | 0,20 | 0,40 | 0,60 | 2 clips = 0,80 | -75 % | FAIT VÉRIFIÉ, variante non classée | [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo) |
| **Wan 3.0, Singapour** | **0,10** | 0,50 | 1,00 | 1,50 | 2,00 | **-36 %** | FAIT VÉRIFIÉ, statut promo ambigu (voir ci-dessous) | [Alibaba](https://www.alibabacloud.com/help/en/model-studio/model-pricing) |
| Wan 3.0, Japon/Allemagne/États-Unis/Hong Kong/Pékin | 0,0825 | 0,41 | 0,83 | 1,24 | 1,65 | -47 % | FAIT VÉRIFIÉ, « -30 % durée limitée » | [Alibaba](https://www.alibabacloud.com/help/en/model-studio/model-pricing) |
| Wan 3.0 Prime, Singapour | 0,14 | 0,70 | 1,40 | 2,10 | 2,80 | -11 % | FAIT VÉRIFIÉ | [Alibaba](https://www.alibabacloud.com/help/en/model-studio/model-pricing) |
| Gemini Omni Flash 1.1 | 0,1014 | 0,51 | 1,01 | par extension | par extension | -35 % | FAIT VÉRIFIÉ ; sortie 3-10 s, extension non chiffrée | [Google](https://aistudio.google.com/docs/pricing), [limites](https://aistudio.google.com/docs/omni) |
| Veo 3.1 Lite | 0,05 | 0,25 | durée max non lue | - | - | -68 % | NON VÉRIFIÉ, lecture tierce du 2026-09-11 | [benchlm](https://benchlm.ai/md/media-pricing/veo.md) |
| Veo 3.1 Fast | 0,10 sans audio ; 0,15 avec | 0,50 | durée max non lue | - | - | -36 % | Revente Runway FAIT VÉRIFIÉ | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Veo 3.1 | 0,20 sans audio ; 0,40 avec | 2,00 avec audio | durée max non lue | - | - | +155 % | Revente Runway FAIT VÉRIFIÉ | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Runway Gen-4.5 | 0,12 | 0,60 | 1,20 | durée max non lue | - | -24 % | FAIT VÉRIFIÉ | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Runway Gen-4 Turbo | 0,05 | 0,25 | 0,50 | durée max non lue | - | -68 % | FAIT VÉRIFIÉ | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Luma Ray3.2 | 0,06 à 0,09 | 0,30 | 0,90 | non listé | non listé | -43 % à 10 s | FAIT VÉRIFIÉ | [Luma](https://lumalabs.ai/api/pricing) |
| FLUX 3 Video | 0,15 | 0,75 | 1,50 | 2,25 | 3,00 | -4 % | NON VÉRIFIÉ, lecture tierce, table BFL illisible | [layer3labs, 2026-10-16](https://www.layer3labs.io/guides/flux-3-video-pricing) |
| FLUX 3 Max | 0,0725 selon AA | 0,36 | 0,73 | 1,09 | 1,45 | -54 % | NON VÉRIFIÉ, absent de la page BFL lue | [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video) |
| Grok Imagine Video 1.5 | 0,08 (xAI) ; 0,16 (Runway) ; 0,25 (AA) | 0,40 à 1,25 | 0,80 à 2,50 | - | - | -49 % à +59 % | Sources en conflit | [xAI](https://docs.x.ai/developers/models/grok-imagine-video-1.5), [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Seedance 2.5 (via Runway) | 0,30 | 1,50 | 3,00 | 4,50 | 6,00 | +91 % | FAIT VÉRIFIÉ en revente ; minimum 80 crédits | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| Seedance 2.0 Mini (via Runway) | 0,15 | 0,75 | 1,50 | 2,25 | 3,00 | -4 % | FAIT VÉRIFIÉ en revente | [Runway](https://docs.dev.runwayml.com/guides/pricing) |
| HappyHorse 1.0 (via Runway) | 0,15 | 0,75 | 1,50 | 2,25 | 15 s max | -4 % | FAIT VÉRIFIÉ en revente | [Runway](https://docs.dev.runwayml.com/guides/pricing), [limites](https://www.alibabacloud.com/help/en/model-studio/video-generation) |
| LTX-2.5 Fast | 0,09 | 0,45 | 0,90 | 1,35 | 1,80 | -43 % | NON VÉRIFIÉ, guides tiers | [layer3labs](https://www.layer3labs.io/guides/ltx-2-5-pricing), [aireiter](https://aireiter.com/blog/ltx-2-5-api-pricing-guide) |
| Pika 2.5 | 0,04 | 0,20 | 0,40 | 0,60 | 0,80 | -75 % | NON VÉRIFIÉ, guide tiers | [apiframe](https://apiframe.ai/guides/pika-labs-api-guide) |
| HeyGen Video 1 | 0,04 selon AA | 0,20 | 0,40 | 0,60 | 0,80 | -75 % | NON VÉRIFIÉ à la source | [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video) |

- CONFLIT sur Wan 3.0 : la page tarifaire présente 0,10 $ comme un prix à « -30 %, durée limitée » — [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Le blog d'Alibaba du 2026-08-27 présente 0,10 $ comme le prix « avant remise promotionnelle » — [Alibaba, blog](https://www.alibabacloud.com/blog/603505). Runway revend aussi à 10 crédits/s sans mention de remise — [Runway](https://docs.dev.runwayml.com/guides/pricing). Si 0,10 $ est bien un prix remisé, le catalogue serait voisin de 0,143 $/s, soit seulement -9 % face à Kling (DÉDUCTION).
- FAIT VÉRIFIÉ : Wan 3.0 accepte 2 à 30 s en 480p, 720p et 1080p à 30 i/s, avec texte, première et dernière images, références image, vidéo et audio — [Alibaba, génération vidéo](https://www.alibabacloud.com/help/en/model-studio/video-generation). Audio activé par défaut, désactivable — [Alibaba, guide Wan 3.0](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide).
- FAIT VÉRIFIÉ : H3 produit du 768p ou du 2K, de 4 à 15 s en secondes entières, avec jusqu'à 9 images, 3 vidéos de référence (15 s au total) et 12 fichiers — [MiniMax, génération vidéo](https://platform.minimax.io/docs/guides/video-generation). Les 5 premières images sont gratuites, puis 0,04 $ l'image — [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo).
- FAIT VÉRIFIÉ : Omni Flash coûte 17,50 $ par million de jetons vidéo à 5 792 jetons par seconde en 720p, environ 0,10 $/s — [Google, tarifs](https://aistudio.google.com/docs/pricing).
- CONFLIT : H3 Max est à 0,08 $/s en 768p chez MiniMax et 8 crédits/s chez Runway, mais à 9,60 $/min (0,16 $/s) sur AA — [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo), [AA](https://artificialanalysis.ai/video/leaderboard/text-to-video).
- Une autre grille d'Alibaba affiche Singapour en yuans (0,74942 pour le 720p) — NON VÉRIFIÉ, extrait de recherche sur [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing).

#### Usage 3 : remplacement d'une personne sur 10 s

Référence : Kling 4.0 facture 9,4 crédits par seconde de sortie plus 9,4 par seconde de la durée la plus longue entre entrée et sortie, soit 18,8 crédits/s et 1,88 $ sur 10 s au catalogue, 1,504 $ en promo jusqu'au 2026-11-30 (FAIT VÉRIFIÉ sur la revente) — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing).

| Offre | Principe | Calcul 10 s | Coût | Écart / 1,88 $ | Mouvement et caméra conservés ? | Personne réelle en photo ? |
|---|---|---|---|---|---|---|
| **Wan 2.2 Animate Mix, standard, Singapour** | Outil dédié au remplacement | 10 × 0,18 $, sortie seule | **1,80 $** | -4 % | Oui, annoncé : actions, expressions, décor et lumière | Pas de règle écrite ; `check_image` actif par défaut |
| Wan 2.2 Animate Mix, pro, Singapour | Idem, meilleure qualité annoncée | 10 × 0,26 $ | 2,60 $ | +38 % | Idem | Idem |
| Wan 2.2 Animate Mix, standard, Pékin | Idem, région Chine | 10 × 0,09 $ | **0,90 $** | -52 % | Idem | Idem |
| Wan 2.2 Animate Mix, pro, Pékin | Idem, région Chine | 10 × 0,13 $ | 1,30 $ | -31 % | Idem | Idem |
| Wan 3.0, édition (Singapour) | Modèle généraliste, `reference_video` | 20 × 0,10 $, entrée + sortie | 2,00 $ | +6 % | Partiel : « ce qui n'est pas demandé reste inchangé » ; pas d'engagement sur la caméra | Aucune règle écrite |
| Wan 3.0, édition (autres régions) | Idem | 20 × 0,0825 $ | 1,65 $ | -12 % | Idem | Idem |
| Wan 2.7 VideoEdit, Singapour | Édition par instructions, 2-10 s | 20 × 0,10 $ | 2,00 $ | +6 % | Non documenté pour une personne | Non documenté |
| **MiniMax H3, 768p, référence** | Vidéo pilote + portrait, **la scène est régénérée** | 10 × 0,08 $ + 10 × 0,08 $ | **1,60 $** | -15 % | Mouvement, caméra et jeu transférables selon un tiers ; décor non garanti | Pas de règle officielle lue |
| MiniMax H3-Lite, 768p, référence | Idem, variante légère | 10 × 0,04 $ + 10 × 0,04 $ | 0,80 $ | -57 % | Idem, qualité non classée | Idem |
| Runway Aleph 2.0 | Édition dans le contexte | 10 × 0,28 $ | 2,80 $ | +49 % | Échange évoqué par des tiers seulement, pas de mesure | Modération, seuil personnalités publiques |
| Runway Act-Two | Capture de performance sur un personnage | 10 × 0,05 $ | 0,50 $ | -73 % | Jeu transféré ; décor et caméra de la source non confirmés | Modération, seuil personnalités publiques |
| Luma Ray3.2 V2V, 720p | Édition guidée par pose, profondeur, visage | Prix fixe 10 s | 2,16 $ | +15 % | `adhere` préserve mouvement et composition ; pas de remplacement documenté | Faux positifs annoncés sur les références de personnes réelles |
| FLUX Video Edit [fast] | Édition texte, sans image | 10 × 0,03 $ | 0,30 $ | -84 % | Oui pour le reste du plan | **Impossible d'imposer un visage** : image en entrée non prise en charge |
| Omni Flash, édition (Runway) | Édition de vidéo importée | 110 crédits + 1 par référence | 1,11 $ | -41 % | Non documenté | **Personnes reconnaissables non prises en charge ; indisponible en EEE, Suisse, Royaume-Uni** |
| Seedance 2.5, référence (Runway) | Référence vidéo | 10 × 0,30 $ + 10 × 0,15 $ | 4,50 $ | +139 % | Non documenté | Visages réels refusés selon un tiers |
| Pikaswaps | Échange d'éléments | 0,03 $ la requête | 0,03 $ | -98 % | Non classé | Non documenté, existence même contestée |

Sources du tableau :
- FAIT VÉRIFIÉ : Animate Mix remplace le personnage principal en gardant actions, expressions, décor, lumière et tonalité, avec une vidéo de 2 à 30 s et 200 Mo maximum, une image de 5 Mo maximum — [Alibaba, API Animate Mix](https://www.alibabacloud.com/help/en/model-studio/wan-animate-mix-api). Sortie en 720p à **15 ou 25 i/s** — [Alibaba, génération vidéo](https://www.alibabacloud.com/help/en/model-studio/video-generation). Tarifs : sortie facturée seule, 0,18/0,26 $/s à Singapour et 0,09/0,13 $/s à Pékin — [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing).
- FAIT VÉRIFIÉ : le guide Wan 3.0 décrit « Modify elements » : remplacer apparence, vêtements, âge d'un personnage, et un exemple de référence multimodale remplace un homme d'une image dans le rôle féminin d'une vidéo. Il fixe aussi 5 clips de référence, 15 s au total, 100 Mo par fichier, et `duration: -1` pour reprendre format et durée de la source — [Alibaba, guide Wan 3.0](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide). Facturation entrée + sortie — [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Le blog officiel ne mentionne ni remplacement de personnage ni transfert de mouvement — [Alibaba, blog](https://www.alibabacloud.com/blog/603505).
- FAIT VÉRIFIÉ : Wan 2.7 VideoEdit couvre 2 à 10 s — [Alibaba, génération vidéo](https://www.alibabacloud.com/help/en/model-studio/video-generation).
- FAIT VÉRIFIÉ : l'exemple officiel H3 fait suivre à un personnage le mouvement de la vidéo 1, les références couvrant personnage, mouvement, caméra, style, voix et rythme — [MiniMax, génération vidéo](https://platform.minimax.io/docs/guides/video-generation). La vidéo d'entrée est facturée au même tarif que la sortie — [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo).
- NON VÉRIFIÉ, revendeur : transfert de mouvement, de caméra et de jeu sur un portrait, résultats dégradés si cadrage ou morphologie diffèrent, audio de la référence repris — [Runware, guide H3](https://runware.ai/docs/models/minimax-h3/guides/motion-camera-performance.md).
- FAIT VÉRIFIÉ : Aleph 2.0 coûte 28 crédits/s, minimum 56 crédits ; Act-Two 5 crédits/s — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing). Runway décrit Aleph 2 comme un modèle d'édition en contexte et Act-Two comme de la capture de mouvement, sans parler de remplacement — [Runway, modèles](https://docs.dev.runwayml.com/guides/models).
- NON VÉRIFIÉ : blogs sur l'échange de personnes par Aleph 2, sans mesure, et un essai chien vers tigre raté — [atlabs](https://www.atlabs.ai/blog/runway-aleph-review), [Filmora](https://filmora.wondershare.com/video-editor-review/aleph-2-0-review.html). Act-Two de 3 à 30 s avec `publicFigureThreshold` — [CometAPI](https://www.cometapi.com/tr/models/runway/runwayml-character-performance/).
- FAIT VÉRIFIÉ : Ray3.2 limite la source à 18 s et 200 Mo, offre 9 préréglages de force, 64 images guides et `controls.face`, sans fonction de remplacement décrite — [Luma, édition](https://docs.agents.lumalabs.ai/guides/videos/editing). Tarif V2V — [Luma, tarifs](https://lumalabs.ai/api/pricing). NON VÉRIFIÉ : un essai `flex_2` a changé la personne deux fois sur trois — [Atlas Cloud](https://www.atlascloud.ai/blog/tips/luma-modify-video).
- FAIT VÉRIFIÉ : FLUX Video Edit [fast] refuse image en entrée, références de mouvement et masques, limite la source à 15 s et 50 Mo et réduit au-delà de 720p — [BFL, Video Edit](https://docs.bfl.ai/flux_tools/flux_video_edit). Prix de 0,03 $/s sur OpenRouter présenté « sans marge » — [OpenRouter](https://openrouter.ai/black-forest-labs/flux-video-edit), NON VÉRIFIÉ chez BFL.
- FAIT VÉRIFIÉ : « l'import et l'édition d'images contenant certaines personnes reconnaissables ne sont pas pris en charge », et l'édition de vidéos importées n'est pas disponible en EEE, Suisse et Royaume-Uni, source limitée à 10 s — [Google, Omni](https://aistudio.google.com/docs/omni).
- NON VÉRIFIÉ : visages réels rejetés par Seedance 2.5 — [EmpirioLabs](https://empiriolabs.ai/models/seedance-2-5). Tarif BytePlus en jetons, sans prix fixe par vidéo — [CometAPI, 2026-08-03](https://www.cometapi.com/seedance-2-5-api-pricing/), [Atlas Cloud](https://www.atlascloud.ai/blog/guides/seedance-2-5-api-atlas-cloud-pricing-availability-quickstart).
- CONFLIT sur Pikaswaps : 0,03 $ la requête selon un extrait de la page Pika — [Pika, tarifs](https://mcp.pika.art/pricing) ; retiré de l'application en septembre 2026 selon un concurrent — [Atlas Cloud](https://www.atlascloud.ai/blog/tips/pikaswaps).

#### Produits arrêtés ou en voie d'arrêt
- **Sora.** FAIT VÉRIFIÉ : la grille OpenAI ne contient aucun tarif Sora — [OpenAI, tarifs](https://developers.openai.com/api/docs/pricing). NON VÉRIFIÉ à la source mais convergent : Videos API et modèles Sora 2 retirés le 2026-09-24, annonce du 2026-03-24, aucun successeur, application fermée le 2026-04-26 — [Pillitteri](https://pasqualepillitteri.it/en/news/18764/openai-sora2-api-dismessa-en), [Invideo](https://invideo.io/blog/sora-ai-video-generator/). Zilliz présente une chronologie différente — [Zilliz](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline).
- **Veo 3.1 Preview.** FAIT VÉRIFIÉ : arrêté sur l'API Gemini le 2026-10-22, remplacement recommandé Omni Flash, Veo 3.1 GA disponible uniquement via Gemini Enterprise Agent Platform — [Google, vidéo](https://aistudio.google.com/docs/video). Aucune trace de Veo 4 dans mes lectures.
- **GPT Image 1** arrêté le 2026-10-23 ; **Gemini 2.5 Flash Image** arrêt le 2027-03-15 (voir usage 1).
- **MiniMax** : les forfaits vidéo ne couvrent pas H3 et la musique ne prend plus de nouveaux clients depuis le 2026-08-20 — [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo).

### Inferences
- DÉDUCTION : H3 et Wan 3.0 sont les deux seuls écarts de prix supérieurs à 30 % à s'appuyer à la fois sur un prix officiel et sur un bon classement.
- DÉDUCTION : H3 768p n'est pas du 720p : légèrement plus de pixels pour moins cher, mais limite de 15 s, donc 20 s impose un raccord entre deux clips.
- DÉDUCTION : pour le remplacement, l'économie réelle est faible hors région Chine : Animate Mix -4 %, Wan 3.0 +6 %. Le gain ne devient net qu'avec H3 ou Pékin, chacun avec une réserve lourde.
- DÉDUCTION : Animate Mix date de la génération Wan 2.2. Sa cadence de 15 ou 25 i/s peut rester sous celle de Wan 3.0 (30 i/s), et le mode standard est présenté comme adapté aux aperçus. Le mode pro, à 2,60 $, est peut-être le seul comparable, et il coûte alors plus cher que Kling.
- DÉDUCTION : H3 régénère un plan au lieu de modifier la source. L'exigence Cosmos « conserver mouvement et caméra » n'est donc pas garantie, et le décor peut changer.
- DÉDUCTION : Muse Image à 0,01 $ est la seule baisse forte en image avec un classement proche. L'écart de 49 points d'Elo correspond à environ 57 % de préférence pour Nano Banana 2.1 en duel à l'aveugle.
- DÉDUCTION : acheter Nano Banana 2.1 directement chez Google (0,0336 $) rapporte déjà 16 % face à 0,04 $, et 58 % en lot si le délai est acceptable, sans changer de modèle.
- DÉDUCTION : le tarif Kling du code Cosmos (0,157 et 0,188 $/s) correspond au catalogue affiché chez Runway, ce qui corrobore ces deux prix sans vérifier la facturation réelle chez fal.

### Gaps
- Coût réel de GPT Image 2.5 en qualité basse ou moyenne en 1024x1024 : OpenAI ne donne que des jetons et le calculateur n'est pas lisible ici. Le prix Runway (3 crédits en moyenne pour 1920x1920) laisse penser qu'il peut approcher ou passer sous Nano Banana 2.1, mais la qualité à ce niveau n'est pas classée sur AA.
- Prix officiels BFL : les tableaux de la page sont vides à l'extraction, y compris FLUX 3 Video, FLUX 3 Max et Video Edit.
- Prix officiel Veo 3.1 sur Gemini Enterprise Agent Platform : page tronquée, seuls Runway et des tiers ont été lus. Durées maximales de Veo, Gen-4.5 et Gen-4 Turbo non confirmées sur page officielle.
- Tarif hors promotion de Wan 3.0 et date de fin de la remise.
- Paramètres officiels d'Act-Two et d'Aleph 2 : la référence API de Runway est illisible à l'extraction. Je n'ai pas pu confirmer si Act-Two conserve décor et caméra de la vidéo source.
- Règles officielles sur les photos de personnes réelles chez OpenAI, MiniMax, Alibaba et xAI : les pages lues n'en parlent pas.
- HeyGen Video 1, P-Video-2-Pro, Agnes-Video-2.5, MAI-Image et Muse Image : ni éditeur, ni API, ni conditions lus à la source. **Le budget de recherche web de la session a été épuisé (limite atteinte) avant de pouvoir les vérifier ; un message de suivi permet de reprendre.**

## Frais réels : crédits, minimums, abonnements, échecs et refus facturés

### Takeaway
Aucun des retenus n'impose d'abonnement ; les échecs ne sont pas facturés chez Alibaba et remboursés chez Luma. Le point noir est Runway : un refus de modération en entrée n'est pas remboursé, donc un selfie refusé coûte des crédits.

### Cited Findings
- **Runway.** FAIT VÉRIFIÉ : 0,01 $ le crédit, taxes possibles en plus — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing). FAIT VÉRIFIÉ : crédits non remboursés pour `SAFETY.INPUT.*`, à ne pas relancer ; le remboursement des autres échecs n'est que suggéré — [Runway, échecs](https://docs.dev.runwayml.com/errors/task-failures/). Minimum d'achat non indiqué sur les pages lues.
- **Alibaba.** FAIT VÉRIFIÉ : appels échoués non facturés et n'entamant pas le quota gratuit ; Animate Mix facture la sortie des tâches réussies uniquement — [Alibaba, API Animate Mix](https://www.alibabacloud.com/help/en/model-studio/wan-animate-mix-api), [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing). FAIT VÉRIFIÉ : quota gratuit de 30 s pour `wan3.0-video` à Singapour, valable 90 jours — [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing). Le refus de modération d'Animate Mix (`DataInspectionFailed`) n'est pas qualifié explicitement ; non précisé si c'est un « échec » non facturé.
- **MiniMax.** FAIT VÉRIFIÉ : pay-as-you-go pour H3, forfaits de 1 000 à 6 000 $/mois réservés aux modèles Hailuo, points non reportés, régénération facturée à part et matériaux d'entrée refacturés — [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo). Minimum de recharge et politique d'échec non indiqués. NON VÉRIFIÉ : facturation au succès seulement, selon un revendeur — [BudgetPixel](https://budgetpixel.com/models/minimax-h3).
- **Luma.** FAIT VÉRIFIÉ : formule Build sans abonnement ni minimum, sans SLA de latence ; Scale sur devis, minimum 4 ou 8 unités selon la section de la même page — [Luma, tarifs](https://lumalabs.ai/api/pricing). FAIT VÉRIFIÉ : erreurs synchrones jamais facturées, `content_moderated`, `generation_failed` et `output_not_found` remboursés, `budget_exhausted` parfois facturé partiellement — [Luma, FAQ](https://docs.agents.lumalabs.ai/guides/faq).
- **OpenAI.** FAIT VÉRIFIÉ : le texte et les images d'entrée s'ajoutent à la sortie ; le cache ne vaut que via l'API Responses — [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation). Facturation d'un `moderation_blocked` non indiquée.
- **Google.** FAIT VÉRIFIÉ : le tarif Nano Banana 2.1 comprend une part d'entrée, en plus du prix de sortie — [Google, tarifs](https://aistudio.google.com/docs/pricing). Facturation des refus non trouvée.
- **BFL.** FAIT VÉRIFIÉ : 1 crédit = 0,01 $, sans abonnement ni siège, coût renvoyé à la soumission — [BFL, tarifs API](https://docs.bfl.ai/quick_start/pricing), [BFL, licences](https://bfl.ai/pricing). Inputs vidéo trop longs refusés sans frais pour Video Upscale.
- **Seedance via Runway.** FAIT VÉRIFIÉ : minimums par génération de 80 crédits (2.5), 56 (2.0), 44 (Fast), 28 (Mini) — [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing).
- **Recraft.** FAIT VÉRIFIÉ : unités sans expiration mais non remboursables — [Recraft](https://www.recraft.ai/docs/api-reference/pricing). **Ideogram** : frais non remboursables, préavis de 14 jours sur les changements de prix — [Ideogram](http://ideogram.ai/pricing/?pricing_tab=api).
- **Topaz.** FAIT VÉRIFIÉ : 50 $ par mois minimum pour 500 crédits — [Topaz, API](https://www.topazlabs.com/api).

### Inferences
- DÉDUCTION : les remises temporaires faussent la comparaison : Kling via Runway jusqu'au 2026-11-30, Wan 3.0 sans date de fin publiée. Un calcul de marge Cosmos doit se faire sur les prix catalogue.
- DÉDUCTION : le coût par commande réussie dépend du taux de refus sur de vrais selfies, inconnu tant qu'aucun test n'a eu lieu. Ce taux peut annuler l'écart de prix, surtout chez Runway où le refus d'entrée est perdu.
- DÉDUCTION : l'abonnement Topaz et les forfaits MiniMax ne conviennent pas à un service semi-passif à faible volume, sans être nécessaires pour H3.

### Gaps
- Minimums de recharge chez Runway, Alibaba, MiniMax et BFL non affichés dans les pages lues.
- Traitement exact des refus de modération chez MiniMax, Google, OpenAI et xAI.

## Qualité comparée : classements indépendants et place face à Kling 4.0 et Nano Banana 2.1

### Takeaway
**Kling 4.0 n'apparaît dans aucun classement consulté**, ni sur Artificial Analysis ni sur Arena : la comparaison directe est impossible aujourd'hui. Nano Banana 2.1 se classe juste derrière GPT Image, à un sixième de leur prix max. Les classements disent quels clips plaisent à l'aveugle, pas qui remplace le mieux une personne.

### Cited Findings

Vidéo, Elo Artificial Analysis et scores Arena :

| Modèle | AA texte-vidéo | AA image-vidéo | Arena texte-vidéo (2026-09-21) | Arena image-vidéo (2026-09-21) | Arena édition vidéo (2026-08-26) |
|---|---|---|---|---|---|
| Wan 3.0 | 1 (1172) | 6-10 (1112) | 6 (1476) | 3 (1480) | 1 (1414 ±26) |
| MiniMax H3 768p | 3 (1160) | 3-7 (1130) | 8 (1460) | 1 (1495) | 3 (1392 ±19) |
| FLUX 3 Max | 4 (1156) | 11-12 (1068) | n/d | n/d | n/d |
| Seedance 2.5 | 5 (1155) | 1 (1159) | 7 (1474) | 4 (1477) | 2 (1410 ±26) |
| HeyGen Video 1 | 6 (1153) | 4-8 (1123) | n/d | n/d | n/d |
| FLUX 3 | 8 (1139) | 11-12 (1070) | 3 (1493, préliminaire) | 9 (1449) | n/d |
| Seedance 2.0 | 9 (1136) | 2-5 (1135) | 5 (1479) | 5 (1475) | 5 (1365 ±14) |
| Gemini Omni Flash 1.1 | 10 (1129) | 13-15 (1043) | 1 (1516) | 2 (1488) | 4 (1367 ±15, version antérieure) |
| Grok Imagine Video 1.5 | 13 (1058) | 13-15 (1049) | 4 (1492, préliminaire) | 8 (1456) | n/d |
| HappyHorse 1.1 / 1.0 | 14 (1050) / 17 (1033) | 13-16 (1038) / 15-16 (1022) | 1.0 : 10 (1427) | 1.0 : 10 (1442) | 1.0 : 6 (1307) |
| **Kling 3.0 Omni / Pro** | 18 (1022) / 19 (1000) | 17-19 (1002 / 1000) | hors top 20 | Pro : 19 (1354) | O3 Pro : 8 (1255) |
| **Kling 4.0** | **absent** | **absent** | **absent** | **absent** | **absent** |
| Veo 3.1 / Fast / Lite | 22 (961) / 23 (957) / 24 (951) | 20-21 (955) / 22-24 (936) / 22-25 (929) | 12 (1364) / 14 (1362) | 13 (1398) / 15 (1385) | n/d |
| LTX-2.5 Fast / Pro | 25 (944) / 26 (940) | 24-27 (913) / 25-27 (910) | n/d | n/d | n/d |
| Runway Gen-4 Aleph | n/d | n/d | n/d | n/d | 10 (1182 ±9) |
| Gen-4.5, Ray3.2, Pika | absents | absents | hors top 20 | hors top 20 | absents |

- FAIT VÉRIFIÉ : les colonnes ci-dessus viennent de [AA texte-vidéo](https://artificialanalysis.ai/video/leaderboard/text-to-video), [AA image-vidéo](https://artificialanalysis.ai/video/leaderboard/image-to-video), [Arena texte-vidéo](https://arena.ai/leaderboard/video/text-to-video), [Arena image-vidéo](https://arena.ai/leaderboard/video/image-to-video) et [Arena édition vidéo](https://arena.ai/leaderboard/video/video-edit). lmarena.ai redirige désormais vers arena.ai.
- FAIT VÉRIFIÉ : image, AA : GPT Image 2.5 Sunburst 1223 (210,7 $/1000), GPT Image 2 haute 1189 (211 $), Nano Banana 2.1 1176 (33,6 $) — [AA image](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text). Arena au 2026-10-26 : Sunburst 1427, Flare 1401, GPT Image 2 moyenne 1381, MAI-Image-2.6 1329, Nano Banana 2.1 1325 (préliminaire) — [Arena image](https://arena.ai/leaderboard/text-to-image).
- FAIT VÉRIFIÉ : le board Arena d'édition vidéo porte sur 27 930 votes et 10 modèles, Wan 3.0 (463 votes) et Seedance 2.5 (429) étant peu échantillonnés — [Arena édition vidéo](https://arena.ai/leaderboard/video/video-edit).
- NON VÉRIFIÉ : un agrégateur affirme que l'absence de Kling 4.0 du board image-vidéo avec audio d'AA durait depuis huit jours autour du 2026-10-22, et que le classement repose sur des votes à l'aveugle qui mesurent une préférence — [OrcaRouter](https://www.orcarouter.ai/blog/kling-4-0-vs-minimax-h3-max). Source peu fiable, mais l'absence est confirmée par mes lectures directes.
- NON VÉRIFIÉ : essais Kling 4.0 contre Seedance 2.5 publiés par un vendeur de Seedance, sans conclusion sur la cohérence des personnages — [DomoAI](https://www.domoai.app/zh-Hant/blog/kling-4-0-vs-seedance-2-5). Je n'ai trouvé aucun test indépendant de Kling 4.0, ni fil Reddit ou Hacker News exploitable.

### Inferences
- DÉDUCTION : les deux classements divergent : Omni Flash 1.1 est 1er sur Arena et 10e sur AA en texte-vidéo. Un seul classement ne suffit jamais à décider.
- DÉDUCTION : H3 et Wan 3.0 sont dans le haut des deux classements en texte et en image-vidéo. Ils dominent nettement Kling 3.0, mais cela ne prouve rien sur Kling 4.0.
- DÉDUCTION : Nano Banana 2.1 est sur la frontière prix-qualité : les modèles mieux classés sur AA coûtent six fois plus en qualité max, et les modèles moins chers sont classés plus bas d'au moins 49 points.
- DÉDUCTION : le board d'édition mesure une édition générale. Il ne classe ni Animate Mix ni Aleph 2.0 ni Kling 4.0, et il ne mesure pas la fidélité à un visage imposé. Seul un test Cosmos, avec la vidéo de référence et de vraies photos, peut trancher.

### Gaps
- Aucun classement d'identité ou de remplacement de personne trouvé.
- Classements AA pour l'édition d'images avec références non consultés : le classement image lu porte sur le texte seul, alors que Cosmos utilise aussi des références.
- Dates des pages AA non affichées par l'extraction.

## Automatisation : API, webhooks, limites, SDK, compatibilité Vercel sans intervention

### Takeaway
Tous les candidats ont une API asynchrone utilisable sans intervention, mais les retenus se pilotent surtout par interrogation répétée plutôt que par webhook. Il faut donc un cron Vercel et une copie immédiate des vidéos, car les liens expirent en 1 à 24 heures.

### Cited Findings
- **Alibaba.** FAIT VÉRIFIÉ : appel asynchrone via `X-DashScope-Async: enable`, puis lecture de `/api/v1/tasks/{task_id}` ; lien vidéo valable 24 h ; webhook non mentionné ; limites renvoyées à une autre page — [Alibaba, guide Wan 3.0](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide). FAIT VÉRIFIÉ : task_id valable 24 h, interrogation conseillée toutes les 15 s environ, liens publics sans caractères non ASCII, clés et points d'accès propres à chaque région — [Alibaba, API Animate Mix](https://www.alibabacloud.com/help/en/model-studio/wan-animate-mix-api).
- **MiniMax.** FAIT VÉRIFIÉ : le guide vidéo décrit un flux par interrogation ; webhook, rétention et limites non mentionnés ; 64 Mo par requête, URL conseillées pour les gros fichiers — [MiniMax, génération vidéo](https://platform.minimax.io/docs/guides/video-generation). FAIT VÉRIFIÉ : les forfaits Hailuo indiquent 20 à 50 requêtes par minute, sans chiffre pour H3 en pay-as-you-go — [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo).
- **Runway.** FAIT VÉRIFIÉ : SDK officiels Node (`@runwayml/sdk`) et Python (`runwayml`) — [Runway, usage de l'API](https://docs.dev.runwayml.com/guides/using-the-api/). Webhooks et paliers non lus.
- **Luma.** FAIT VÉRIFIÉ : l'ancienne API documente `callback_url` avec 3 relances, pour Ray 2 — [Luma, génération vidéo](https://docs.lumalabs.ai/docs/video-generation). La nouvelle FAQ décrit l'interrogation répétée et des liens valables 1 h renouvelés à chaque lecture — [Luma, FAQ](https://docs.agents.lumalabs.ai/guides/faq).
- **BFL.** FAIT VÉRIFIÉ : interrogation de `polling_url`, liens signés d'environ 1 h — [BFL, Video Edit](https://docs.bfl.ai/flux_tools/flux_video_edit). FAIT VÉRIFIÉ pour OpenRouter : `callback_url` proposé via sa propre API — [OpenRouter](https://openrouter.ai/black-forest-labs/flux-video-edit).
- **Google.** FAIT VÉRIFIÉ : Omni Flash passe par l'API Interactions et l'API Files pour l'import — [Google, vidéo](https://aistudio.google.com/docs/video), [Google, Omni](https://aistudio.google.com/docs/omni).
- **xAI.** FAIT VÉRIFIÉ : 10 requêtes par seconde pour Grok Imagine Video 1.5 — [xAI](https://docs.x.ai/developers/models/grok-imagine-video-1.5). **Ideogram** : 10 requêtes simultanées par défaut — [Ideogram](http://ideogram.ai/pricing/?pricing_tab=api).

### Inferences
- DÉDUCTION : un service sur Vercel peut piloter ces API sans intervention : soumission, cron d'interrogation, copie du résultat dans le stockage Cosmos. Cosmos reçoit aujourd'hui des webhooks via son fournisseur actuel ; passer à l'interrogation répétée chez Alibaba ou MiniMax demande un travail d'intégration, à estimer.
- DÉDUCTION : Alibaba impose des liens publics pour les photos et vidéos d'entrée, ce qui demande des URL signées courtes côté Cosmos, avec attention particulière pour des selfies de clients.

### Gaps
- Webhooks et limites par palier non confirmés chez Runway, MiniMax et Alibaba. La page de paliers de Runway renvoie une erreur 404.
- Disponibilité et incidents réels de ces API : aucune donnée indépendante lue.

## Conditions : usage commercial, entraînement, conservation, filtres sur les visages

### Takeaway
Les conditions départagent fortement. OpenAI, Google payant et Alibaba disent ne pas entraîner sur les données ; **Runway se réserve explicitement ce droit**, BFL aussi avec un retrait sur demande, et Luma ne garantit l'absence d'entraînement qu'en formule Scale. **Les conditions de MiniMax n'ont pas pu être lues**, ce qui bloque toute décision sur des photos de clients.

### Cited Findings
- **Alibaba.** FAIT VÉRIFIÉ : « will never use your data for model training », mise à jour 2026-10-11 ; pas de durée de conservation, renvoi à d'autres accords — [Alibaba, confidentialité](https://www.alibabacloud.com/help/en/model-studio/privacy-notice). FAIT VÉRIFIÉ : entrée et sortie modérées, refus `IPInfringementSuspect` ou `DataInspectionFailed` — [Alibaba, API Animate Mix](https://www.alibabacloud.com/help/en/model-studio/wan-animate-mix-api). Déploiements listés : Singapour, Pékin, ainsi que Global Allemagne, Japon, États-Unis, Hong Kong selon le modèle — [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing).
- **Runway.** FAIT VÉRIFIÉ : conditions du 2026-10-23 : « Inputs and Outputs may be used by the Company to train and improve its AI models », aucune option de retrait ni exception API sur cette page ; pas de restriction à l'usage commercial des sorties ; photo d'une autre personne interdite sans permission ; droit à l'image protégé — [Runway, conditions](https://runway.com/terms-of-use).
- **BFL.** FAIT VÉRIFIÉ : conditions générales du 2026-08-01 : entraînement sur les entrées et sorties, retrait possible par e-mail, non rétroactif ; consentement obligatoire de la personne réelle ; ces conditions renvoient à des conditions développeur distinctes, non lues — [BFL, conditions](https://bfl.ai/legal/terms-of-service).
- **Luma.** FAIT VÉRIFIÉ : garantie de non-entraînement citée pour la formule Scale — [Luma, tarifs](https://lumalabs.ai/api/pricing). Modération prudente, faux positifs sur références de personnes réelles, deepfakes interdits, droits renvoyés aux conditions — [Luma, FAQ](https://docs.agents.lumalabs.ai/guides/faq).
- **OpenAI.** FAIT VÉRIFIÉ : pas d'entraînement par défaut, journaux d'abus jusqu'à 30 jours, zéro rétention compatible pour les modèles GPT Image récents sur approbation — [OpenAI, données](https://developers.openai.com/api/docs/guides/your-data). Paramètre `moderation` `auto` ou `low` — [OpenAI, guide image](https://developers.openai.com/api/docs/guides/image-generation).
- **Google.** FAIT VÉRIFIÉ : niveau payant non utilisé pour améliorer les produits, niveau gratuit oui — [Google, tarifs](https://aistudio.google.com/docs/pricing). Mineurs interdits à l'import en EEE, Suisse et Royaume-Uni pour Omni — [Google, Omni](https://aistudio.google.com/docs/omni).
- **MiniMax.** Page des conditions vide à l'extraction — [MiniMax, conditions](https://platform.minimax.io/protocol/terms-of-service). NON VÉRIFIÉ : aucune restriction lue sur les visages réels chez les revendeurs, dont les exemples sont ambigus — [Runware](https://runware.ai/docs/models/minimax-h3/guides/motion-camera-performance.md).
- **Seedance.** NON VÉRIFIÉ : visages réels refusés en référence chez un tiers, alors que le produit grand public en accepterait — [EmpirioLabs](https://empiriolabs.ai/models/seedance-2-5), [useapi](https://useapi.net/blog/260807).
- **Omni Flash.** NON VÉRIFIÉ : représentation de personnes réelles écartée au lancement, vérification par avatar enregistré — [Digital Applied, 2026-05-19](https://www.digitalapplied.com/blog/gemini-omni-multimodal-video-creation-guide).

### Inferences
- DÉDUCTION : Runway ne convient pas aux photos de clients tant que ses conditions API n'excluent pas clairement l'entraînement, même pour sa promotion Kling.
- DÉDUCTION : Alibaba (Singapour ou Pékin) et MiniMax impliquent un transfert de photos de visages hors UE, avec des sous-traitants à déclarer. Pékin aggrave nettement le risque, et un compte international peut ne pas y donner accès. À soumettre à un avis juridique avant usage ; ce n'est pas un avis juridique.
- DÉDUCTION : l'absence de règle écrite chez Alibaba ou MiniMax n'est pas une autorisation : `check_image` et la modération peuvent refuser de vrais selfies. Seul un test avec des photos dont Cosmos a le consentement peut le mesurer.

### Gaps
- Conditions API de MiniMax, durée de conservation chez Alibaba, MiniMax et Runway, conditions développeur de BFL.
- Politique d'entraînement de xAI, HeyGen et Muse Image non lue.

## Conclusion par acteur : à retenir, en réserve, à écarter

### Takeaway
**À retenir pour un test : MiniMax H3 et Wan 3.0 en vidéo, Wan 2.2 Animate Mix et H3 en remplacement. Nano Banana 2.1 reste le meilleur choix en image.** Aucune de ces options n'est prouvée équivalente à Kling 4.0, et chacune impliquerait un essai payant soumis à ton accord explicite.

### Cited Findings
Le tableau reprend les faits sourcés dans les sections précédentes ; la décision est une DÉDUCTION.

| Acteur | Verdict | Justification courte |
|---|---|---|
| **MiniMax (H3)** | **À retenir (usage 2, test usage 3)** | 0,08 $/s, haut des deux classements. Réserves : conditions illisibles, 15 s max, scène régénérée. |
| **Alibaba (Wan 3.0, Animate Mix)** | **À retenir (usages 2 et 3)** | Wan 3.0 à 0,10 $/s, 1er sur AA et sur Arena édition. Animate Mix dédié au remplacement. Pas d'entraînement annoncé. Réserves : promo ambiguë, 15/25 i/s, données hors UE. |
| Google (Veo 3.1) | À écarter | Préversions fermées sur l'API Gemini le 2026-10-22, classé 22-24 sur AA. |
| Google (Omni Flash 1.1) | En réserve, usage 2 sans personne réelle | 0,10 $/s, 1er sur Arena, mais personnes reconnaissables non prises en charge et édition fermée en UE. |
| OpenAI (GPT Image) | En réserve, image | 1er en qualité, mais 0,21 $ en haute qualité. Basse et moyenne à mesurer. |
| OpenAI (Sora) | À écarter | Retiré des tarifs ; arrêt de l'API le 2026-09-24 selon des tiers. |
| Runway (Gen-4.5, Aleph 2, Act-Two) | À écarter en modèles | Non classés ou plus chers (Aleph 2,80 $). Act-Two à 0,50 $ : conservation du décor non démontrée. Droit d'entraînement. |
| Runway (revente Kling) | En réserve, à vérifier | -20 % jusqu'au 2026-11-30 seulement, droit d'entraînement à éclaircir. |
| Luma (Ray3.2, Uni-1.1) | À écarter | Absent des classements, V2V à 2,16 $, faux positifs sur personnes réelles, non-entraînement réservé à Scale. |
| BFL (FLUX 3, Video Edit) | En réserve, usage 2 si FLUX 3 Max se confirme | Image plus chère et moins bien classée que Nano Banana 2.1. Video Edit à 0,03 $/s ne peut pas imposer un visage. Prix officiels illisibles. |
| xAI (Grok Imagine) | En réserve | Image à parité sans gain ; prix vidéo contradictoires de 0,08 à 0,25 $/s. |
| ByteDance (Seedance 2.5) | À écarter | Très bien classé, mais deux fois le prix de Kling, tarif en jetons, visages réels refusés selon un tiers. |
| Alibaba (HappyHorse) | À écarter | Prix voisin de Kling, moins bien classé que Wan 3.0. |
| Lightricks (LTX-2.5) | À écarter | Classé 25-26 sur AA, prix tiers seulement, retake non confirmé sur 2.5. |
| Pika | À écarter | Absent des classements, existence de Pikaswaps contestée. |
| Ideogram | À écarter | 0,10 $ en haute qualité, classement moyen. |
| Recraft | À écarter | Flash classé 68-72, Utility au prix de Nano Banana 2.1 pour un Elo inférieur de 150 points. |
| Topaz | À écarter | Amélioration d'image et de vidéo, pas un générateur ; 50 $/mois minimum. |
| Microsoft (MAI-Image), Muse Image, HeyGen Video 1 | En réserve, à vérifier à la source | Prix et classements attractifs sur AA, mais rien de lu chez l'éditeur. |

Sources principales : [MiniMax, tarifs](https://platform.minimax.io/docs/guides/pricing-paygo), [Alibaba, tarifs](https://www.alibabacloud.com/help/en/model-studio/model-pricing), [Runway, tarifs](https://docs.dev.runwayml.com/guides/pricing), [AA texte-vidéo](https://artificialanalysis.ai/video/leaderboard/text-to-video), [AA image](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text), [Arena édition vidéo](https://arena.ai/leaderboard/video/video-edit), [Google, vidéo](https://aistudio.google.com/docs/video), [Google, Omni](https://aistudio.google.com/docs/omni), [Runway, conditions](https://runway.com/terms-of-use).

### Inferences
- DÉDUCTION : ordre de test proposé si tu donnes ton accord, une seule personne et un essai à la fois, arrêt au premier bon résultat, sur 10 s : (1) Wan 2.2 Animate Mix standard, 1,80 $ ; (2) MiniMax H3 768p avec référence, 1,60 $ ; (3) Wan 3.0 édition, 2,00 $. Total maximal 5,40 $, hors quota gratuit, à comparer au rendu Kling 4.0 déjà connu. Ce plan n'a pas été exécuté.
- DÉDUCTION : avant tout test, lire les conditions MiniMax et trancher le transfert hors UE des photos, car un excellent rendu n'aurait aucune valeur si ces points bloquent.
- DÉDUCTION : le gain possible le plus net porte sur la vidéo à partir d'un prompt ou d'images (environ -36 à -49 %). Sur le remplacement de personne, il est incertain (de -4 % à -15 % hors Pékin) et le risque de qualité est plus élevé, donc Kling 4.0 reste la référence tant qu'un test ne prouve pas le contraire.
- DÉDUCTION : en image, rien ne justifie de quitter Nano Banana 2.1 ; la seule économie sûre est l'achat direct chez Google.

### Gaps
- Équivalence de qualité non prouvée pour tous les modèles, en particulier face à Kling 4.0, absent des classements.
- Taux de refus sur de vrais selfies et fidélité du visage : aucune donnée, test nécessaire.
- Points restés ouverts faute de budget de recherche : éditeurs et conditions de HeyGen Video 1, Muse Image et MAI-Image ; conditions API de MiniMax.

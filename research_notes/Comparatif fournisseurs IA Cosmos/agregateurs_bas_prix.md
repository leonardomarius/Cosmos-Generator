# Agrégateurs à bas prix et de seconde ligne : alternatives à fal.ai pour Cosmos (au 2026-11-04)

Lecture de ces notes : toutes les pages ont été lues le 2026-11-04, sauf date indiquée. Aucun appel d'API, aucun compte, aucune génération. Pages lues via un outil qui résume : recontrôler tout chiffre avant décision.

- **FAIT VÉRIFIÉ** : ce que dit la page citée à la date indiquée. Pour un fournisseur, cela prouve qu'il l'affirme, pas que c'est vrai. Pour un avis client, cela prouve que l'avis existe, pas son contenu.
- **DÉDUCTION** : mon calcul ou mon raisonnement à partir de faits cités.
- **NON VÉRIFIÉ** : source secondaire, intéressée, contradictoire ou introuvable.

Spécification de comparaison : 720p (768p pour Recast), 9:16, 10 s produites, source de 10 s quand le modèle prend une vidéo. Repères fal lus dans `presets/arrivee-star/preset.json` et `src/config/product.ts`, recoupés avec les pages fal quand elles étaient lisibles.

## Chaque modèle exact est-il proposé, à quel prix, avec les paramètres de Cosmos ?

### Takeaway
Aucun acteur ne couvre le catalogue moins cher que fal sur tous les modèles. Sur Kling 4.0, l'écart réel va de +6 % à -30 %, et les baisses de -20 % et -30 % sont affichées comme des remises. PixVerse Swap reste moins cher chez fal, et Recast n'est trouvé que chez fal et EachLabs, au même prix. La seule économie forte concerne Seedance 2.5, parce que fal facture le double du tarif BytePlus rapporté.

### Cited Findings

**Coût par génération (DÉDUCTION : calcul à partir des tarifs cités en dessous)**

| Modèle, spécification | fal (repère) | Kie.ai | Segmind | EachLabs | Atlas Cloud | WaveSpeed | AI/ML API | Higgsfield |
|---|---|---|---|---|---|---|---|---|
| Nano Banana 2.1 édition, 1K | ≈ 0,04 $ (estimation Cosmos) | 0,02 $ (-50 %) | non trouvé | tokens Google, ≈ 0,034 $ + entrée | non trouvé | non trouvé | tokens Google | non trouvé |
| Kling 4.0 texte, 10 s | 1,57 $ | 1,43 $ (-9 %), via le modèle référence | 1,66 $ (+6 %) | 1,57 $ (0 %) | 1,10 $ (-30 %), résolution non précisée | 1,26 $ (-20 %), remise | 1,57 $ (0 %) | dès 1,10 $ (-30 %), remise |
| Kling 4.0 référence, images ou éléments, 10 s | 1,57 $ | 1,43 $ (-9 %) | 1,66 $ (+6 %) | 1,57 $ (0 %) | non trouvé | 1,26 $ (-20 %), remise | 1,57 $ (0 %) | non trouvé |
| Kling 4.0 édition, 10 s + source 10 s | 1,88 $ | pas d'endpoint ; référence + vidéo 1,70 $ (-10 %) | 1,99 $ (+6 %), `elements` non listé | 1,88 $ (0 %) | non trouvé | 1,50 $ (-20 %), remise, `elements` non listé | 1,88 $ (0 %) | annoncé, prix non trouvé |
| Kling O3 standard édition, 10 s | 1,26 $ (page) ou 1,40 $ (API de prix) | non confirmé | 3,15 $ (+125 à +150 %) | 1,26 $ (0 à -10 %) | non lu | 1,26 $ (0 à -10 %), `elements` non listé | non trouvé | non trouvé |
| MiniMax H3 Max Recast, 768p, 10 s | 3,00 $ | non trouvé | non trouvé | 3,00 $ (0 %) | non trouvé | non trouvé | non trouvé | non trouvé |
| PixVerse Swap, 720p, 10 s | 0,40 $ | non trouvé | non trouvé | 0,60 $ (+50 %) | pas d'endpoint selon son blog | 1,22 $ (+205 %) | non trouvé | non trouvé |
| Seedance 2.5 référence, 10 s + source 10 s | 5,55 $ | 3,80 $ (-31 %) | 2,86 $ (-48 %) | 3,18 $ (-43 %) | 1,34 à 2,68 $ (-52 à -76 %), non confirmé | non trouvé | 2,77 $ (-50 %), formule supposée | dès 0,144 $/s, non comparable |

**Autres durées, à source égale (DÉDUCTION)**

| Durée produite | fal Kling édition | fal Seedance référence | Segmind Seedance référence | fal Swap |
|---|---|---|---|---|
| 5 s | 0,94 $ | 2,77 $ | 1,43 $ | 0,20 $ |
| 10 s | 1,88 $ | 5,55 $ | 2,86 $ | 0,40 $ |
| 15 s | 2,82 $ | 8,32 $ | 4,29 $ | 0,40 $ |
| 20 s | 3,76 $ | 11,09 $ | 5,72 $ | 0,40 $ |

**Repères fal et tarifs officiels**
- FAIT VÉRIFIÉ : Kling 4.0 édition, 0,094 $/s en 720p, facturé entrée + sortie, minimum 2 fois la sortie — [fal](https://fal.ai/models/kling/v4/video-to-video/edit).
- FAIT VÉRIFIÉ : Seedance 2.5 référence, 0,0214 $ les 1 000 tokens, formule hauteur x largeur x (entrée + sortie) x 24 / 1024, puis x 0,6 avec vidéo — [fal](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video).
- FAIT VÉRIFIÉ : Recast, 0,30 $/s en 768p, sur la durée de sortie, étiquette « Commercial use » — [fal](https://fal.ai/models/minimax/h3-max/recast).
- FAIT VÉRIFIÉ : Swap 720p, 0,20 $ les 5 s, le double au-delà de 5 s. La page ne donne pas de durée maximale — [fal](https://fal.ai/models/fal-ai/pixverse/swap).
- FAIT VÉRIFIÉ : Nano Banana 2.1 chez Google, 0,0336 $ en 1K, 0,0504 $ en 2K, 0,113 $ en 4K ; en batch 0,0168 $, 0,0252 $, 0,0567 $. Pas d'usage des données pour améliorer les produits en offre payante — [Google](https://aistudio.google.com/docs/pricing).
- NON VÉRIFIÉ : BytePlus facturerait Seedance 2.5 à 10,70 $ par million de tokens sans vidéo et 6,40 $ avec vidéo, source secondaire — [ToolColumn et CometAPI via recherche](https://www.cometapi.com/seedance-2-5-api-pricing/). La page BytePlus lue ne montre pas ce tarif — [BytePlus](https://docs.byteplus.com/en/docs/ModelArk/1544106). AI/ML API affiche le même 6,40 $ — [AI/ML API](https://aimlapi.com/ai-ml-api-pricing).
- NON VÉRIFIÉ : le tarif Kling officiel serait 0,157 $/s en 720p et 0,235 $/s en 1080p, selon des tiers — [ToolColumn](https://www.toolcolumn.com/learn/kling-4-vs-seedance-2-5). La page officielle n'a pas livré de prix — [Kling](https://kling.ai/dev/pricing).

**Kie.ai**
- FAIT VÉRIFIÉ : Kling 4.0, 28,5 crédits/s sans vidéo (0,1425 $) et 17 crédits/s avec vidéo (0,085 $) en 720p, entrée facturée aussi. Jusqu'à 7 éléments, 5 vidéos de 2 à 30 s, **10 Mo maximum par fichier vidéo**, 3 à 30 s, 16:9, 9:16, 1:1, audio natif — [Kie Kling 4.0](https://kie.ai/kling-4-0).
- FAIT VÉRIFIÉ : le catalogue ne montre ni édition Kling 4.0, ni Kling O3, ni H3, ni Recast, ni PixVerse Swap — [Kie market](https://kie.ai/market). La page de prix affiche « kling 3.0 omni » dès 14 crédits/s — [Kie pricing](https://kie.ai/pricing). Sa page produit à l'URL essayée répond 404.
- FAIT VÉRIFIÉ : Seedance 2.5 en 720p, 38 crédits/s avec vidéo (0,19 $), 63 sans vidéo (0,315 $), entrée + sortie facturées, 9:16 et `generate_audio` disponibles, « prix en bêta » — [Kie Seedance](https://kie.ai/seedance-2-5).
- FAIT VÉRIFIÉ : Nano Banana 2.1, 0,02 $ en 1K, 0,03 $ en 2K, 0,045 $ en 4K, édition au même prix, jusqu'à 10 images — [Kie Nano Banana](https://kie.ai/nano-banana-2-1).

**Novita**
- FAIT VÉRIFIÉ : la page de prix ne liste aucun des modèles demandés, seulement langage, embeddings et recherche — [Novita pricing](https://novita.ai/pricing). Le catalogue visible n'affiche aucune vidéo — [Novita models](https://novita.ai/models).
- FAIT VÉRIFIÉ : ses publications récentes s'arrêtent à Kling 3.0 Standard, Pro et 4K — [blog Novita](https://blogs.novita.ai/kling-v3-0-4k-api-novita-ai/).

**Segmind**
- FAIT VÉRIFIÉ : Kling 4.0 référence, 0,1661 $/s en 720p sans vidéo, 0,2656 $/s avec vidéo — [Segmind](https://www.segmind.com/models/kling-4-reference-to-video/pricing). Édition 0,1989 $/s, plus 0,0995 $ par seconde de source au-delà de la sortie — [Segmind](https://www.segmind.com/models/kling-4-video-edit/pricing).
- FAIT VÉRIFIÉ : son propre test mesure 0,2984 $/s sur une référence avec vidéo, soit +12,4 % sur le prix affiché, et précise que l'audio ne peut pas être coupé — [blog Segmind, 2026-11-01](https://blog.segmind.com/kling-4-0-api-on-segmind-text-image-reference-and-edit-with-real-costs/).
- FAIT VÉRIFIÉ : l'édition accepte `reference_images`, `duration` et `aspect_ratio` (adaptive, 21:9, 16:9, 9:16, 1:1). La page ne liste ni `elements` ni conservation du son — [Segmind](https://www.segmind.com/models/kling-4-video-edit).
- FAIT VÉRIFIÉ : Seedance 2.5 en 720p, 0,1429 $/s avec référence, facturé sortie + max(référence, 2/3 de la sortie), audio sans surcoût, échecs non facturés — [Segmind](https://www.segmind.com/models/seedance-2.5/pricing).
- FAIT VÉRIFIÉ : Kling O3 standard édition 0,315 $/s — [Segmind](https://www.segmind.com/models/kling-o3-video2video-edit/pricing).

**EachLabs**
- FAIT VÉRIFIÉ : Kling 4.0 texte 0,157 $/s, 3 à 30 s, 21:9, 16:9, 9:16, 1:1 — [EachLabs](https://www.eachlabs.ai/kling/kling-v4/kling-video-4-0-text-to-video/llms.txt). Édition 0,188 $ par seconde de sortie et 0,094 $ par seconde d'entrée additionnelle, jusqu'à 7 éléments, conservation du son non documentée — [EachLabs](https://www.eachlabs.ai/kling/kling-v4/kling-video-4-0-video-edit/llms.txt).
- FAIT VÉRIFIÉ : Kling O3 standard édition 0,126 $/s, `elements`, `keep_audio`, entrée de 3 à 10 s, environ 500 s de traitement estimé — [EachLabs](https://www.eachlabs.ai/kling/kling-o3/kling-o3-standard-video-to-video-edit/llms.txt).
- FAIT VÉRIFIÉ : Seedance 2.5 référence, 0,159 $/s de sortie + 0,159 $/s de vidéo de référence en 720p. **La documentation indique « Real human faces are not accepted » pour `image_urls`** — [EachLabs](https://www.eachlabs.ai/bytedance/seedance-2-5/bytedance-seedance-2-5-reference-to-video/llms.txt).
- FAIT VÉRIFIÉ : Nano Banana 2.1 édition au tarif en tokens de Google, 1,50 $ en entrée et 30 $ en sortie image, images de 7 Mo maximum — [EachLabs](https://www.eachlabs.ai/google/nano-banana-2/nano-banana-2-1-edit/llms.txt).
- FAIT VÉRIFIÉ : Recast 0,30 $/s en 768p — [EachLabs](https://www.eachlabs.ai/fal/minimax-h3-max/minimax-h3-max-recast/llms.txt). Swap 0,06 $/s en 720p, `keyframe_id` présent, réglage du son non listé — [EachLabs](https://www.eachlabs.ai/pixverse/pixverse-features/pixverse-swap/llms.txt).

**Atlas Cloud**
- FAIT VÉRIFIÉ : Seedance 2.5 référence, 0,134 $ par seconde générée, résolution par défaut 720p, facturation des secondes de référence non précisée — [Atlas](https://www.atlascloud.ai/models/bytedance/seedance-2.5/reference-to-video). Le catalogue présente ce prix comme -20 % sur 0,167 $ — [Atlas models](https://www.atlascloud.ai/models).
- FAIT VÉRIFIÉ : Kling 4.0 texte 0,11 $/s, sans détail par résolution — [Atlas](https://www.atlascloud.ai/models/kwaivgi/kling-v4.0/text-to-video). Le 2026-10-27, son propre article écrivait encore que le tarif Kling 4.0 restait « à vérifier » — [Atlas](https://www.atlascloud.ai/blog/tips/kling-4.0-video-cost-calculator).
- NON VÉRIFIÉ : pas d'endpoint Swap, selon son blog résumé en recherche — [Atlas](https://www.atlascloud.ai/it/blog/guides/pixverse-face-swap).

**WaveSpeed (découvert pendant la recherche)**
- FAIT VÉRIFIÉ : Kling 4.0 de 0,1256 $ (texte, image, référence) à 0,1504 $ (édition), -20 % sans date de fin affichée — [WaveSpeed](https://wavespeed.ai/collections/kling-4).
- FAIT VÉRIFIÉ : édition à 0,094 $ par seconde facturée, `keep_original_sound`, 10 images de référence, 16:9, 9:16, 1:1, 21:9, `elements` non listé — [WaveSpeed](https://wavespeed.ai/models/kwaivgi/kling-v4.0/video-edit).
- FAIT VÉRIFIÉ : O3 standard édition 0,126 $/s, facturation bornée de 3 à 10 s, 4 images de référence, `elements` non listé — [WaveSpeed](https://wavespeed.ai/models/kwaivgi/kling-video-o3-std/video-edit).
- FAIT VÉRIFIÉ : Swap 0,12 $/s en 720p + 0,02 $ de masque par tâche, 30 s et 50 Mo maximum — [WaveSpeed](https://wavespeed.ai/models/pixverse/swap).

**Les autres**
- FAIT VÉRIFIÉ : AI/ML API affiche Kling 4.0 texte et référence à 0,157 $/s, édition à 0,188 $/s, Seedance 2.5 à 6,4 $ par million de tokens — [AI/ML API](https://aimlapi.com/ai-ml-api-pricing). L'édition accepte `elements`, sources de 3 à 30 s, 300 Mo — [AI/ML API](https://aimlapi.com/models/klingai-video-v4-video-to-video-edit).
- FAIT VÉRIFIÉ : Higgsfield annonce Kling 4.0 dès 0,110 $/s (liste 0,157 $, -30 %), Seedance 2.5 dès 0,144 $/s (liste 0,206 $, -30 %) et « 100 % de cashback », sans conditions visibles — [Higgsfield](https://open.higgsfield.ai/).
- FAIT VÉRIFIÉ : PiAPI affiche Kling 4 à « 0,10 à 0,25 $/s », sans détail de l'édition — [PiAPI](https://piapi.ai/kling-api).
- FAIT VÉRIFIÉ : OpenRouter sert Nano Banana 2.1 par Google AI Studio au prix du fournisseur (1,50 $ et 30 $ par million), pas en routage UE — [OpenRouter](https://openrouter.ai/google/gemini-nano-banana-2.1). Frais de 5,5 % sur l'achat de crédits, 8 % en Business — [OpenRouter pricing](https://openrouter.ai/pricing).
- FAIT VÉRIFIÉ : Freepik redirige ses docs vers Magnific, l'API se paie en crédits, le coût par modèle est sur une autre page — [Magnific](https://docs.magnific.com/pricing). Cette page répond 403 — [Magnific crédits](https://www.magnific.com/ai/docs/ai-image-generator-credits).
- FAIT VÉRIFIÉ : ModelsLab cite Kling et Seedance sans prix et ne mentionne pas Nano Banana — [ModelsLab](https://modelslab.com/pricing).
- FAIT VÉRIFIÉ : UnificAlly affichait, le 2026-11-04, Kling 4.0 à 0,126 $/s et 0,151 $/s avec source en 720p — [UnificAlly](https://unifically.com/blogs/kling-4.0). Muapi affiche les mêmes prix que fal — [Muapi](https://muapi.ai/zh/comparison/kling-4.0-reference-to-video).

### Inferences
- DÉDUCTION : pour Kling 4.0 édition, le meilleur prix sérieux est -20 % (WaveSpeed, UnificAlly), mais sans `elements` affiché chez WaveSpeed. Or le preset Cosmos appelle `@Element1`. La spécification n'est donc pas identique.
- DÉDUCTION : le cas Seedance se règle peut-être sans agrégateur. Si le tarif de 6,40 $ est confirmé, BytePlus en direct coûterait 2,77 $, soit le prix d'AI/ML API et moins que Segmind.
- DÉDUCTION : Nano Banana 2.1 via OpenRouter coûte 0,0354 $ en sortie (5,5 % compris), plus les tokens d'entrée. Avec trois images d'entrée, le gain sur le repère de 0,04 $ se situe entre 0 et 10 %.
- DÉDUCTION : aucun fournisseur n'atteint le prix de fal sur Swap, car fal facture un forfait doublé au-delà de 5 s, alors que les autres facturent à la seconde.

### Gaps
- NON VÉRIFIÉ : le prix réel de Nano Banana 2.1 chez fal. Les deux URL essayées répondent 404, le repère de 0,04 $ reste l'estimation du code.
- NON VÉRIFIÉ : la divergence fal sur O3, 0,126 $ sur la page et 0,14 $ sur l'API de prix, relevée dans le preset.
- Non trouvé : Nano Banana 2.1 chez Segmind (page 404), Recast ailleurs que chez fal et EachLabs, Swap ailleurs que chez fal, EachLabs et WaveSpeed.
- NON VÉRIFIÉ : facturation de l'entrée sur Kling 4.0 référence chez EachLabs. La page indique 0,094 $ par seconde de sortie, ce qui donnerait -50 % si l'entrée n'est pas comptée.

## Comment un acteur peut-il vendre moins cher que le créateur du modèle ?

### Takeaway
Trois situations différentes se mélangent. Certains ne sont pas moins chers que le créateur, c'est fal qui est au-dessus (Seedance). Certains affichent des remises déclarées (Kling -20 ou -30 %). Un seul cas reste inexpliqué par les tarifs publics : Kie.ai sur Nano Banana 2.1 en 4K. Aucune preuve de fraude ou de substitution n'a été trouvée, seulement des allégations et l'absence de partenariat déclaré.

### Cited Findings

**Preuves**
- FAIT VÉRIFIÉ : PiAPI documente un routage par comptes Kling. L'utilisateur doit « acheter, opérer, gérer son propre pool de comptes », et PiAPI y route les tâches — [GitHub PiAPI](https://github.com/PiAPI-1/KlingAPI).
- FAIT VÉRIFIÉ : cette formule à 10 $ par siège et par mois « ne transforme pas un abonnement grand public en clé d'API officielle », et PiAPI propose aussi un accès mutualisé à l'usage — [PiAPI, 2026-09-07](https://piapi.ai/blogs/kling-subscription-api).
- FAIT VÉRIFIÉ : Kie.ai se dit à « 40 % sous le prix officiel en 1K et 2K, 60 % en 4K » et ne revendique aucun partenariat avec Google — [Kie Nano Banana](https://kie.ai/nano-banana-2-1). Même absence de revendication sur Kling — [Kie Kling](https://kie.ai/kling-4-0).
- FAIT VÉRIFIÉ : Kie.ai présente son instabilité comme « un compromis assumé », se dit « petite équipe de startup », et ne dit rien de sa source amont — [docs Kie](https://docs.kie.ai/).
- FAIT VÉRIFIÉ : WaveSpeed et Higgsfield affichent eux-mêmes -20 % et -30 % sur un prix de liste de 0,157 $ — [WaveSpeed](https://wavespeed.ai/collections/kling-4) ; [Higgsfield](https://open.higgsfield.ai/).
- FAIT VÉRIFIÉ : EachLabs range Recast sous le chemin `/fal/` tout en nommant Minimax comme fournisseur — [EachLabs](https://www.eachlabs.ai/fal/minimax-h3-max/minimax-h3-max-recast/llms.txt).
- FAIT VÉRIFIÉ : Apiframe se dit « Official BytePlus partner », affirmation non recoupée — [Apiframe, 2026-08-20](https://apiframe.ai/models/seedance-2.5/pricing).

**Allégations à ne pas traiter comme des preuves**
- NON VÉRIFIÉ : deux avis accusent Kie.ai d'une qualité dégradée (2026-07-15) et de références d'images ignorées (2026-05-15). Kie répond ne pas modifier volontairement les résultats — [Trustpilot Kie](https://ca.trustpilot.com/review/kie.ai).
- NON VÉRIFIÉ : un avis accuse Atlas Cloud de router WAN 3.0 vers un modèle plus faible (2026-10-01) — [Trustpilot Atlas](https://www.trustpilot.com/review/atlascloud.ai).
- NON VÉRIFIÉ : Atlas se dit revendeur autorisé de Seedance 2.5 aux États-Unis, sur une bannière lue en hindi dans un résultat de recherche et absente de la page anglaise lue — [Atlas](https://www.atlascloud.ai/hi/blog/tips/kling-4.0-video-cost-calculator).
- NON VÉRIFIÉ : calendrier de l'API Kling 4.0 officielle. « Coming Soon » au 19 octobre — [Wireflow](https://www.wireflow.ai/blog/kling-4-0-pricing) ; lancement le 22 octobre avec Higgsfield et Magnific dans la première vague, fal le 23 — [ToolNavs, 2026-10-24](https://toolnavs.com/article/2830-kling-4-0-api-kai-fang-gei-suo-you-ke-hu-fal-yu-di-san-fang-ping-tai-tong-ri-gen) ; encore « Preview » au 23 octobre — [AIReiter, intéressé](https://aireiter.com/blog/kling-4-api-availability). Le fichier public de Kling ne cite pas la version 4.0 — [Kling llms.txt](https://kling.ai/llms.txt).

### Inferences
- DÉDUCTION : Kie à 0,045 $ en 4K est sous le tarif batch public de Google (0,0567 $), soit au moins 0,0117 $ de moins par image. Une simple revente au tarif public ne l'explique pas. Remise de volume, subvention, autre source ou image non équivalente restent possibles, aucune n'est prouvée. Cosmos utilise le 1K, où Kie reste 19 % au-dessus du batch.
- DÉDUCTION : les prix Kie valent exactement 0,6 et 0,4 fois la liste de Google, ce qui ressemble à une décote commerciale fixe plutôt qu'à un coût réel.
- DÉDUCTION : Segmind applique une marge fixe. 0,1661 / 0,157 et 0,1989 / 0,188 donnent 1,058 ; 11,263 / 10,70 et 6,737 / 6,40 donnent 1,053. C'est le profil d'un relais transparent, qui appuie aussi les tarifs de 0,157 $ et 6,40 $ comme prix amont.
- DÉDUCTION : sur Seedance 2.5, fal est à 21,40 $ par million contre 10,70 $ rapportés chez BytePlus. Le prix bas de Segmind, AI/ML API ou EachLabs n'est donc pas sous le créateur, c'est fal qui est au double. Kie (0,19 $/s) est même au-dessus de 0,138 $/s, tarif BytePlus rapporté.
- DÉDUCTION : le chemin `/fal/` et l'égalité parfaite des prix suggèrent qu'EachLabs revend fal au moins sur certains modèles. C'est un soupçon, pas une preuve. Si c'est le cas, passer par EachLabs ajoute un intermédiaire sans réduire l'exposition.
- DÉDUCTION : de l'extérieur, on ne peut pas distinguer une remise partenaire, une revente de seconde main et des comptes mutualisés. L'absence de partenariat déclaré doit donc compter comme un risque, pas comme une preuve.

### Gaps
- Aucune source trouvée établissant que Kie.ai, Atlas Cloud, WaveSpeed ou UnificAlly utilisent des comptes grand public mutualisés. Aucune confirmation non plus de partenariat officiel avec Kuaishou, ByteDance ou Google.
- Aucune analyse indépendante comparant les pixels ou le modèle réellement servi. Sans générations payantes, c'est invérifiable ici.

## Prix promotionnels, crédits, dépôts, écart affiché et facturé, échecs facturés

### Takeaway
Les baisses les plus fortes sur Kling sont des remises sans date de fin (WaveSpeed, Higgsfield) ou des prix déclarés en bêta (Kie). L'écart entre prix affiché et facturé est documenté chez Segmind. Plusieurs fournisseurs ne remboursent pas, et la promesse de ne pas facturer les échecs est contredite par des avis, sans preuve décisive.

### Cited Findings
- FAIT VÉRIFIÉ : Kie, 1 crédit = 0,005 $, crédits sans expiration, +10 % de bonus sur une recharge de 1 250 $, échecs annoncés non facturés — [Kie pricing](https://kie.ai/pricing). Les nouveaux comptes reçoivent 80 crédits — [Kie blog](https://kie.ai/blog/seedance-2-5-pricing).
- FAIT VÉRIFIÉ : remboursement chez Kie possible « si besoin », sur demande par e-mail, sans critères ni délai — [Kie remboursement](https://kie.ai/refund-policy).
- NON VÉRIFIÉ : dépôt minimum de 5 $ chez Kie, repris par des revues, absent des pages officielles lues — [AI Insights News, 2026-07-21](https://aiinsightsnews.net/kie-ai-review/).
- FAIT VÉRIFIÉ : Segmind, paiement à l'usage dès 10 $, remises de volume sur devis, expiration non précisée — [Segmind pricing](https://www.segmind.com/pricing). Remboursement seulement comme recours de garantie — [Segmind conditions](https://www.segmind.com/terms).
- FAIT VÉRIFIÉ : sur 9 clips, Segmind mesure 5 factures exactes, 3 à +0,2-0,4 %, une à +12,4 %, échecs à 0 $, champ `cost` dans la réponse — [blog Segmind](https://blog.segmind.com/kling-4-0-api-on-segmind-text-image-reference-and-edit-with-real-costs/).
- FAIT VÉRIFIÉ : EachLabs, pas de minimum, solde prépayé non remboursable sauf exceptions, crédits promotionnels jamais remboursés — [EachLabs pricing](https://www.eachlabs.ai/pricing) ; [EachLabs conditions](https://www.eachlabs.ai/terms-of-service).
- FAIT VÉRIFIÉ : AI/ML API « n'offre aucun remboursement » — [AI/ML API conditions](https://aimlapi.com/terms-and-conditions).
- FAIT VÉRIFIÉ : PiAPI répète « nous ne remboursons pas » et indique sur une FAQ que les crédits expirent 180 jours après l'achat — [PiAPI llms-full](https://app.piapi.ai/llms-full.txt).
- FAIT VÉRIFIÉ : WaveSpeed prévient que les prix documentés peuvent être périmés et que la charge finale prévaut — [WaveSpeed](https://wavespeed.ai/models/pixverse/swap).
- FAIT VÉRIFIÉ : Higgsfield, remboursement sous 7 jours et sans crédit utilisé, frais possibles jusqu'à 6 % — [Higgsfield conditions](https://higgsfield.ai/terms).
- FAIT VÉRIFIÉ : UnificAlly présente une remise de lancement de 10 % de Kuaishou jusqu'au 2026-10-29 — [UnificAlly](https://unifically.com/blogs/kling-4.0). Une recherche montre encore l'ancien prix de 0,1134 $/s sur d'autres de ses pages.
- NON VÉRIFIÉ : échecs facturés malgré la promesse. Kie : environ 1 tâche sur 5 bloquée à 99 % et crédits consommés (2026-10-02), 500 pendant 8 h après 500 $ de recharge (2026-05-10) — [Trustpilot Kie](https://ca.trustpilot.com/review/kie.ai). WaveSpeed : « it says it will not charge, but it does » (2026-04-22) — [Trustpilot WaveSpeed](https://www.trustpilot.com/review/wavespeed.ai).

### Inferences
- DÉDUCTION : pour un modèle économique sans intervention, un prix en remise sans date de fin ne peut pas servir de base de marge. Il faut budgéter au prix de liste, soit 1,88 $ chez WaveSpeed pour l'édition, le même que fal.
- DÉDUCTION : le bonus de 10 % de Kie suppose de bloquer 1 250 $ chez un acteur sans DPA ni remboursement encadré. Ce gain n'est pas prudent à ce stade.

### Gaps
- NON VÉRIFIÉ : durée des remises Atlas (-20 %), WaveSpeed (-20 %) et Higgsfield (-30 % et cashback). Aucune date de fin trouvée.
- NON VÉRIFIÉ : facturation des échecs chez EachLabs. Seules les soumissions refusées par le plafond sont annoncées non facturées.

## Latence, limites, taux d'échec, webhooks, SDK, Vercel et fonctionnement automatique

### Takeaway
Aucun taux d'échec indépendant n'a été trouvé. EachLabs est le mieux documenté pour un fonctionnement automatique (webhook signé, pas de limite par seconde). Kie a un callback mais renvoie ses erreurs en HTTP 200 et fait l'objet de plaintes sur des tâches bloquées, un risque direct pour un service sans intervention.

### Cited Findings
- FAIT VÉRIFIÉ : Kie, 20 nouvelles requêtes par 10 s, 100+ tâches simultanées, HTTP 429 sans file d'attente, callback ou interrogation par `taskId`, pas de SDK mentionné — [docs Kie](https://docs.kie.ai/).
- FAIT VÉRIFIÉ : chez Kie, « un 200 OK signifie seulement que la tâche a été créée », et les erreurs de `/api/v1/*` arrivent en HTTP 200 avec un code dans le corps. Support par Discord et Telegram, horaires UTC 21:00 à 17:00 — [docs Kie](https://docs.kie.ai/).
- FAIT VÉRIFIÉ : latence Kling 4.0 chez Segmind, de 119 à 622 s sur 9 clips (test du vendeur). La v2 ne valide pas la requête à la soumission, l'erreur n'apparaît qu'à l'interrogation. Le slug unifié `kling-4` répondait 404 le 31 octobre — [blog Segmind](https://blog.segmind.com/kling-4-0-api-on-segmind-text-image-reference-and-edit-with-real-costs/).
- FAIT VÉRIFIÉ : Segmind, 60 requêtes par minute en paiement à l'usage, 120 en Pro, 500 en Business — [Segmind pricing](https://www.segmind.com/pricing).
- FAIT VÉRIFIÉ : EachLabs, webhook signé HMAC-SHA256, 3 tentatives à environ 10 s d'écart, pas de limite par seconde, plafond de concurrence sous 10 $ de solde, 429 non facturé, exemples Python et JavaScript — [docs EachLabs](https://docs.eachlabs.ai/llms.txt).
- FAIT VÉRIFIÉ : Seedance chez EachLabs accepte `webhook_url` — [EachLabs](https://www.eachlabs.ai/bytedance/seedance-2-5/bytedance-seedance-2-5-reference-to-video/llms.txt).
- FAIT VÉRIFIÉ : le SLA d'Atlas ne vise que les instances et GPU, sous forme d'objectif, et ne mentionne pas les modèles tiers — [SLA Atlas](https://www.atlascloud.ai/service-level-agreement).
- FAIT VÉRIFIÉ : Higgsfield fournit l'accès développeur « tel quel », sans garantie de disponibilité — [Higgsfield conditions](https://higgsfield.ai/terms). AI/ML API exclut toute garantie de stabilité ou de disponibilité — [AI/ML API conditions](https://aimlapi.com/terms-and-conditions).
- NON VÉRIFIÉ : 4 appels Nano Banana Pro sur 5 auraient échoué chez Kie selon un testeur anonyme, sans facturation, alors que le moniteur de Kie affichait mieux. Pas de protocole publié — [AI Insights News](https://aiinsightsnews.net/kie-ai-review/).

### Inferences
- DÉDUCTION : avec 2 à 10 minutes de génération, toute intégration Vercel doit passer par un webhook et non attendre dans une fonction. Une REST asynchrone suffit, aucun SDK n'est nécessaire.
- DÉDUCTION : Cosmos devrait, chez Kie, ajouter une lecture du corps de réponse et un minuteur contre les tâches bloquées, puisque des avis décrivent des tâches qui restent en cours sans échouer.
- DÉDUCTION : changer de fournisseur coûterait aussi du travail sur les schémas d'entrée, car `elements`, `keep_audio` et la facturation de l'entrée varient d'un acteur à l'autre.

### Gaps
- Aucun taux d'échec indépendant, aucune mesure comparable de latence, aucune page d'état historique consultée pour ces acteurs.
- Non trouvé : webhooks chez Segmind (la page de logs lue répond 404), Atlas Cloud et WaveSpeed.

## Conditions et confidentialité : société, usage commercial, entraînement, conservation, DPA, RGPD, photos de personnes réelles

### Takeaway
Seul EachLabs publie un DPA intégré avec clauses contractuelles types, et il exclut les fournisseurs de modèles de son périmètre. OpenRouter propose un DPA en Business, Atlas Cloud sur demande en offre Enterprise. Kie.ai n'a pas de DPA visible et sa politique ne parle que d'e-mails. Higgsfield entraîne ses modèles sur les entrées hors contrat Enterprise, ce qui l'élimine pour des photos de clients.

### Cited Findings

**Kie.ai**
- FAIT VÉRIFIÉ : NEXUSAI SERVICES LLC, 118 Krameria St, Denver, droit du Colorado. Suspension possible « à tout moment, sans préavis ». Licence sur les contenus pour « exploiter et améliorer nos services ». Ni DPA, ni RGPD, ni usage commercial des sorties, ni entraînement, ni personnes réelles — [conditions Kie](https://kie.ai/terms-of-service).
- FAIT VÉRIFIÉ : sa politique dit ne collecter que l'adresse e-mail, ne parle ni des fichiers ni des photos, mentionne les droits RGPD, pas de DPA — [confidentialité Kie](https://kie.ai/privacy-policy).
- FAIT VÉRIFIÉ : fichiers générés conservés 14 jours, journaux 2 mois, conservation des fichiers envoyés non précisée — [docs Kie](https://docs.kie.ai/).

**Novita**
- NON VÉRIFIÉ : droit du Delaware, pas de conservation par défaut, pas d'entraînement par défaut, société de contrôle non divulguée, selon un concurrent vérifiant au 2026-09-02 — [Standard Compute](https://standardcompute.com/providers/novita).
- FAIT VÉRIFIÉ : la page affiche un badge « SOC 2 », le texte juridique n'a pas pu être lu — [Novita](https://novita.ai/legal/terms-of-service) ; [Trust Center](https://trust.novita.ai).
- Attention : la politique de NOVITA OY à Helsinki trouvée en recherche concerne [novita.com](https://novita.com/en/pages/privacy-policy), sans lien établi avec Novita AI. Ne pas s'en servir.

**Segmind**
- FAIT VÉRIFIÉ : Segmind Inc., contrat limité aux « fins commerciales internes du client », revente et substitut interdits (§2.1.1, §2.3), pas de DPA client, suspension immédiate possible — [conditions Segmind](https://www.segmind.com/terms).
- FAIT VÉRIFIÉ : adresse à Wilmington (Delaware), droits RGPD énumérés, et la mention « we do not process sensitive personal information ». Rien sur les fichiers, l'entraînement ou les fournisseurs de modèles — [confidentialité Segmind](https://www.segmind.com/privacy).
- NON VÉRIFIÉ : entrées non conservées, sorties gardées 7 jours, lu en extrait de recherche seulement — [docs Segmind](https://docs.segmind.com/api-reference/logging).

**EachLabs**
- FAIT VÉRIFIÉ : Eachlabs Inc., Dover (Delaware), droit du Delaware, usage professionnel. Engagement de ne pas entraîner sur les contenus et de ne pas l'autoriser à un fournisseur. Médias synthétiques d'une personne réelle sans consentement requis interdits, le client assume les consentements — [conditions EachLabs](https://www.eachlabs.ai/terms-of-service).
- FAIT VÉRIFIÉ : DPA intégré, EachLabs sous-traitant, clauses contractuelles types modules 2 ou 3, droit irlandais. Les fournisseurs de modèles sont des « endpoints dirigés par le client, pas des sous-traitants », sans garantie sur leurs pratiques. Données biométriques d'identification interdites sauf bon de commande, le client seul responsable de la base légale pour les visages. Charges d'exécution conservées à vie sauf réglage de durée, AWS us-east-1 — [DPA EachLabs](https://www.eachlabs.ai/dpa).

**Atlas Cloud**
- FAIT VÉRIFIÉ : ATLAS CLOUD AI INC., 1540 Broadway, New York, hébergement aux États-Unis, suppression de compte possible sans avertissement — [conditions Atlas](https://www.atlascloud.ai/privacy).
- FAIT VÉRIFIÉ : conservation jusqu'à 7 jours en standard, zéro conservation en addendum Enterprise, pas d'entraînement sur ses services, mais les fournisseurs tiers gardent leurs propres pratiques — [Atlas conservation](https://www.atlascloud.ai/data-retention).
- FAIT VÉRIFIÉ : la politique d'usage ne dit rien de précis sur les visages, l'échange de visage ou le consentement, et fait porter au client la responsabilité des contenus de ses utilisateurs — [Atlas usage](https://www.atlascloud.ai/acceptable-use).
- NON VÉRIFIÉ : DPA, liste de sous-traitants et matrice par fournisseur disponibles sur demande pour les clients Enterprise — [Atlas suppression](https://www.atlascloud.ai/data-deletion-policy). Résumé de recherche mentionnant aussi « Atlas Cloud AI LLC » et le respect du RGPD, non confirmé par la page lue, qui ne cite pas le RGPD.
- NON VÉRIFIÉ : SOC 2 et HIPAA annoncés, alors que le même site invite à confirmer DPA et SLA et admet que sa politique publique ne détaille pas la conservation des requêtes ni l'entraînement — [Ask Atlas](https://ask.atlascloud.ai/is-atlas-cloud-safe).

**Higgsfield**
- FAIT VÉRIFIÉ : Higgsfield Inc., 535 Mission St, San Francisco. §4.4 : entrées, sorties et contenus peuvent servir à entraîner ses modèles. La suppression stoppe seulement l'usage futur (§16.5). Exclusion réservée aux accords Enterprise. Consentements exigés pour les visages, modèles biométriques interdits (§4.2, §5.3). Pas de DPA dans ce texte — [conditions Higgsfield](https://higgsfield.ai/terms).
- FAIT VÉRIFIÉ : son résumé officiel confirme « nous utilisons le contenu pour améliorer nos modèles », en vigueur le 2026-08-27 — [Higgsfield](https://higgsfield.ai/es/blog/terms-of-use-privacy-policy-update).

**AI/ML API**
- FAIT VÉRIFIÉ : conditions fournies par Boiler Labs FZ-LLC, pied de page AIMLAPI OÜ, droit estonien. Résiliation immédiate sans préavis, ni DPA ni RGPD dans ce texte — [conditions AI/ML API](https://aimlapi.com/terms-and-conditions).
- FAIT VÉRIFIÉ : politique émise par Boiler Labs FZ-LLC à Ras Al Khaimah (Émirats). Rien sur les prompts, les fichiers, l'entraînement ou les transferts — [confidentialité AI/ML API](https://aimlapi.com/privacy-policy).

**OpenRouter**
- FAIT VÉRIFIÉ : pas de stockage des prompts et réponses par défaut, sauf option, contenu signalé CSAM ou endpoints de rétention de sécurité. Réglage ZDR-only disponible — [OpenRouter données](https://openrouter.ai/docs/guides/privacy/data-collection).
- FAIT VÉRIFIÉ : pas d'entraînement, ZDR sur toutes les offres, DPA en Business « via les conditions, copie signée sur demande » — [OpenRouter pricing](https://openrouter.ai/pricing).

**Autres**
- FAIT VÉRIFIÉ : UnificAlly est UALLY CO LLC à Tbilissi (Géorgie), ne se dit pas canal officiel — [UnificAlly](https://unifically.com/blogs/kling-4.0).
- FAIT VÉRIFIÉ : PiAPI autorise l'usage commercial des vidéos Kling selon sa FAQ — [PiAPI](https://piapi.ai/kling-api). Entité légale non trouvée dans la partie lue — [PiAPI llms-full](https://app.piapi.ai/llms-full.txt).

### Inferences
- DÉDUCTION : Kie est éliminé pour des photos de personnes réelles. Sans DPA ni clause sur les fichiers, Cosmos ne peut pas documenter la sous-traitance exigée par l'article 28 du RGPD. Sa politique, qui dit ne collecter que l'e-mail, ne décrit pas le service réel.
- DÉDUCTION : Higgsfield est éliminé hors contrat Enterprise. Une photo de client pourrait servir à l'entraînement, ce que le consentement actuel de Cosmos ne couvre pas à ma lecture (à faire confirmer).
- DÉDUCTION : le DPA d'EachLabs ne couvre pas la chaîne jusqu'au modèle. Il améliore le dossier sans le fermer, Cosmos devrait documenter Kling, ByteDance et Google séparément.
- DÉDUCTION : la clause « fins internes » de Segmind et sa mention sur les données sensibles sont à clarifier par écrit avant d'envoyer des photos de clients dans un service revendu au public.
- Point d'attention valable partout : l'interdiction de visages humains réels sur `image_urls` de Seedance 2.5, écrite chez EachLabs, peut venir du modèle lui-même. Le preset Cosmos envoie précisément des photos dans ce champ. Un avis Kie signale aussi des 422 « Content flagged » sur Seedance (2026-03-31). À vérifier avant tout calcul d'économie.

### Gaps
- NON VÉRIFIÉ : aucune inscription au registre vérifiée (Colorado, Delaware, New York, Estonie). Limite de recherches atteinte, Scamadviser non consulté.
- Textes non lus : conditions de Novita, de WaveSpeed (2 URL en 404), de PiAPI, d'UnificAlly, de ModelsLab et de Magnific.
- Non trouvé : clause Kling ou ByteDance autorisant ou interdisant la revente d'API, et conditions amont sur les visages réels. Le preset Cosmos note déjà ce point comme à confirmer.

## Stabilité : ancienneté, financement, avis, incidents, plaintes

### Takeaway
Les profils sont faibles ou tumultueux, et les échantillons Trustpilot sont petits. Kie (2,1), ModelsLab (2,1) et WaveSpeed (2,3) sont notés bas. Higgsfield a beaucoup d'avis (4,0 sur 5 296) mais une controverse documentée. Aucune fermeture brutale n'a été trouvée.

### Cited Findings

| Acteur | Trustpilot au 2026-11-04 | Plaintes principales (allégations) | Source |
|---|---|---|---|
| Kie.ai | 2,1, 16 avis, 81 % à une étoile | tâches bloquées à 99 %, crédits consommés, 500 après recharge, 422 sur Seedance | [Trustpilot](https://ca.trustpilot.com/review/kie.ai) |
| Novita | 2,5, 9 avis | double facturation, résiliation difficile, support lent | [Trustpilot](https://www.trustpilot.com/review/novita.ai) |
| Segmind | pas de page (404) | non trouvé | [Trustpilot](https://www.trustpilot.com/review/segmind.com) |
| Atlas Cloud | 3,7, 7 avis | qualité, routage allégué vers un modèle plus faible | [Trustpilot](https://www.trustpilot.com/review/atlascloud.ai) |
| EachLabs | 0 avis, profil revendiqué en 2024-09 | aucun | [Trustpilot](https://www.trustpilot.com/review/eachlabs.ai) |
| AI/ML API | 3,4, 23 avis, 44 % à une étoile | prélèvements contestés, refus de remboursement, 524 | [Trustpilot](https://www.trustpilot.com/review/aimlapi.com) |
| ModelsLab | 2,1, 18 avis, 83 % à une étoile | double prélèvement, résiliation impossible, jusqu'en 2026-09 | [Trustpilot](https://www.trustpilot.com/review/modelslab.com) |
| WaveSpeed | 2,3, 6 avis, tous à une étoile | recharge auto de 55 $ à la place de 15 $, échecs facturés | [Trustpilot](https://www.trustpilot.com/review/wavespeed.ai) |
| Higgsfield | 4,0, 5 296 avis, 19 % à une étoile | prélèvements après résiliation, crédits expirés, attentes de plusieurs heures | [Trustpilot](https://www.trustpilot.com/review/higgsfield.ai) |

- FAIT VÉRIFIÉ : Kie répond qu'il ne modifie pas volontairement les résultats et que les crédits des tâches échouées sont rendus automatiquement (2026-07-24) — [Trustpilot Kie](https://ca.trustpilot.com/review/kie.ai).
- NON VÉRIFIÉ : Higgsfield : compte X suspendu vers le 2026-02-09, plaintes sur les abonnements et le programme Earn, cofondateur reconnaissant des faiblesses opérationnelles, résumé de recherche d'articles de presse — [PiunikaWeb](https://piunikaweb.com/2026/02/11/higgsfield-ai-ceo-speaks-up-after-x-account-suspension-negative-pr/) ; [Times of Central Asia](https://timesca.com/kazakh-startup-higgsfield-ai-from-unicorn-to-racism-and-sexism-scandal/) ; [Forbes Australie](https://www.forbes.com.au/?p=177110).
- FAIT VÉRIFIÉ : les conditions de Higgsfield ont été révisées après une polémique en juillet 2026. La licence perpétuelle a été retirée, l'entraînement maintenu, selon MindStudio, acteur du même secteur — [MindStudio, 2026-07-28](https://mindstudio.ai/blog/higgsfield-terms-of-service-backlash).
- NON VÉRIFIÉ : plaintes r/n8n sur les pannes de Kie, relayées par des tiers dont un concurrent — [AIReiter](https://aireiter.com/blog/kie-ai-review-2026) (page 404 à la lecture, vue en extrait) ; [AI Insights News](https://aiinsightsnews.net/kie-ai-review/).

### Inferences
- DÉDUCTION : l'échantillon de Trustpilot est trop faible pour noter un fournisseur API (les clients satisfaits écrivent peu), mais la répétition des tâches bloquées chez Kie sur 12 mois forme un signal cohérent avec sa propre documentation.
- DÉDUCTION : les prélèvements automatiques sont une plainte récurrente. Si un acteur était testé, il faudrait une recharge manuelle unique et faible, sans recharge automatique.

### Gaps
- Limite de recherches atteinte (quota partagé) : Reddit, Hacker News et GitHub Issues n'ont pas été lus directement, le financement et l'ancienneté de Segmind, Atlas, EachLabs, WaveSpeed et Kie n'ont pas été établis. Aucune fermeture brutale trouvée, ce qui ne prouve pas qu'il n'y en ait pas eu.
- Runware, cité dans un avis comme comparaison, n'a pas été évalué : aucune page trouvée sur les modèles de Cosmos avant la limite.

## Verdict par acteur

### Takeaway
Aucun agrégateur à bas prix ne doit remplacer fal pour la vidéo avec photos de personnes réelles à ce stade. OpenRouter reste à retenir pour l'image et la vision, avec un gain faible. Trois acteurs vont en réserve, pour Seedance 2.5 surtout : EachLabs, Segmind et Atlas Cloud. Le premier geste utile est de vérifier le tarif BytePlus direct et le refus éventuel des visages réels sur Seedance 2.5.

### Cited Findings

| Acteur | Verdict | Justification courte |
|---|---|---|
| **OpenRouter** | À retenir, image et vision seulement | Prix fournisseur, ZDR sur toutes les offres, DPA en Business. Pas de routage UE sur ce modèle. |
| **EachLabs** | En réserve, le meilleur dossier | Seul à couvrir tous les modèles exacts et à publier un DPA. Prix égal à fal sauf Seedance. 0 avis, soupçon de revente fal. |
| **Segmind** | En réserve, Seedance 2.5 seulement | Relais transparent et -48 % sur Seedance, plus cher ailleurs. Pas de DPA client, clause « fins internes » à clarifier. |
| **Atlas Cloud** | En réserve, à confirmer | Prix affichés bas, DPA sur demande. Facturation de l'entrée, résolution et prix d'édition non confirmés. |
| **WaveSpeed** | En réserve faible | -20 % sans date de fin, `elements` non listé, 2,3 sur Trustpilot, conditions et entité non lues : critère éliminatoire potentiel. |
| **Kie.ai** | À écarter | Pas de DPA, politique limitée à l'e-mail, plaintes répétées, pas d'édition Kling, -9 % seulement sur Kling. |
| **Novita** | À écarter | Modèles de Cosmos non trouvés au catalogue, entité non établie. |
| **Higgsfield** | À écarter hors Enterprise | Entraînement sur les entrées, API « tel quel », remises non datées, controverses. |
| **AI/ML API** | À écarter | Aucun gain sur Kling, entité double (Émirats et Estonie), aucun remboursement, pas de DPA visible. |
| **PiAPI** | À écarter | Routage par comptes documenté, aucun remboursement, crédits qui expirent, entité non trouvée. |
| **ModelsLab** | À écarter | Pas de prix pour ces modèles, 2,1 sur Trustpilot avec doubles prélèvements. |
| **Freepik / Magnific** | À écarter à ce stade | API au crédit, coût par modèle illisible (403), entité non indiquée. Non évalué sur le fond. |
| **UnificAlly** | À écarter | Société géorgienne, pas de statut officiel, conditions non lues. -20 % ne compense pas ce risque. |
| **Muapi** | À écarter | Mêmes prix que fal, donc aucun gain. |
| **Apiframe, LaoZhang, APIYI, CometAPI, OrcaRouter, EvoLink, EmpirioLabs, Wireflow** | Non évalués | Vus seulement via leurs pages marketing, souvent au-dessus du prix officiel (LaoZhang 0,045 $ par image, EmpirioLabs 0,252 $/s sur O3, Apiframe 0,29 $/s sur Seedance). |

**Économie par rapport à fal pour les acteurs retenus ou en réserve, spécification de comparaison (DÉDUCTION)**

| Modèle | OpenRouter | EachLabs | Segmind | Atlas Cloud | WaveSpeed |
|---|---|---|---|---|---|
| Nano Banana 2.1, 1K | 0 à -10 % selon les images d'entrée | -15 % environ avant tokens d'entrée | non trouvé | non trouvé | non trouvé |
| Kling 4.0 texte | non proposé à ma connaissance, non vérifié | 0 % | +6 % | -30 %, résolution non précisée | -20 %, remise |
| Kling 4.0 référence | idem | 0 % | +6 % | non trouvé | -20 %, remise |
| Kling 4.0 édition | idem | 0 % | +6 % | non trouvé | -20 %, remise, sans `elements` listé |
| Kling O3 standard édition | idem | 0 à -10 % | +125 à +150 % | non lu | 0 à -10 %, sans `elements` listé |
| MiniMax H3 Max Recast | idem | 0 % | non trouvé | non trouvé | non trouvé |
| PixVerse Swap | idem | +50 % | non trouvé | pas d'endpoint (non vérifié) | +205 % |
| Seedance 2.5 référence | idem | -43 % | -48 % | -52 à -76 %, non confirmé | non trouvé |

### Inferences
- DÉDUCTION : sur un run à 10 s, garder fal pour Kling, O3, Recast et Swap et déplacer le seul Seedance 2.5 économiserait 2,37 $ à 2,69 $ par génération Seedance (EachLabs ou Segmind). C'est le seul déplacement au gain net. Il n'a de valeur que si Seedance reste au preset et accepte les visages réels.
- DÉDUCTION : le prix de Kling est sans doute trop proche de la liste pour justifier un changement. Avec le prix de liste, le gain de -20 % disparaît dès la fin de la remise.
- DÉDUCTION : un essai éventuel devrait se limiter à une seule génération, sur le seul acteur retenu, avec une recharge unique et sans photo de client, après accord explicite pour ce run. Aucun test de ce type n'a été fait ici.

### Gaps
- Ces verdicts reposent sur des pages lues le 2026-11-04 et sur aucun test de génération : la qualité réelle, le modèle réellement servi et les taux d'échec restent NON VÉRIFIÉS pour tous.
- Questions à poser par écrit avant toute bascule : à EachLabs (qui sert réellement Kling et Recast, durée de conservation par défaut), à Segmind (DPA, sens de « internal business purposes », usage pour un service public), à Atlas (DPA hors Enterprise, facturation de l'entrée sur Seedance, durée de la remise).

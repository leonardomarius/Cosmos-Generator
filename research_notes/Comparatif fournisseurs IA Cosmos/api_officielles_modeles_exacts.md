# API officielles des créateurs des modèles exacts de Cosmos, comparées à fal.ai

Pages consultées les 2026-11-04 et 2026-11-05. Sauf mention contraire, « consulté le 04/11 » ou « le 05/11 » désigne la date réelle de lecture. Aucune génération, aucun appel facturable, aucun compte, aucun achat.

Étiquettes : **FAIT VÉRIFIÉ** (lu sur une page du créateur), **DÉDUCTION** (calcul ou raisonnement à partir de faits cités), **NON VÉRIFIÉ** (source tierce, résumé d'index de recherche, ou affirmation non recoupée).

Méthode de lecture à connaître : plusieurs sites officiels (Kling, BytePlus, MiniMax) sont des applications JavaScript qui renvoient une page vide aux outils de lecture. Kling a été lu dans sa version Markdown officielle (`https://kling.ai/document-api/<page>.md`, indexée par [son llms.txt](https://kling.ai/document-api/llms.txt)), ce qui est fiable. Ses paquets de crédits, eux, n'ont été lus que dans l'index de recherche.

## Acheter à la source coûte-t-il moins cher que fal, à spécification identique et tous frais inclus ?

### Takeaway
Non dans la plupart des cas utiles à Cosmos. Kling 4.0 coûte le même prix catalogue que fal, et le seul gain (2 à 5 %) impose un prépaiement de 500 à 8 000 $ qui expire en 180 jours. PixVerse Swap est plus cher en direct que sur fal, Recast n'est pas proposé en direct, et Seedance 2.5 coûte deux fois moins cher mais refuse les visages réels téléversés. Seul Google offre une petite économie sans contrainte, de l'ordre d'un demi-centime par image.

### Cited Findings

Coûts par génération, en dollars. Les colonnes « direct » et « fal » viennent des sources citées sous le tableau.

| Génération | Direct, sans engagement | Direct, meilleur palier connu | fal | Écart direct / fal | Statut |
|---|---|---|---|---|---|
| Nano Banana 2.1, image 1K | 0,0336 + invite ≈ 0,034 | Batch 0,0168 (asynchrone, autre usage) | ≈ 0,04 (code, non vérifié) | ≈ -15 % | Direct vérifié, fal non vérifié |
| Nano Banana 2.1, édition 1K, 2 images | ≈ 0,037 | n/a | ≈ 0,04 (code, non vérifié) | ≈ -7 % | Idem |
| Nano Banana 2.1, édition 1K, 4 images | ≈ 0,041 | n/a | ≈ 0,04 (code, non vérifié) | ≈ 0 % | Idem |
| Kling 4.0, 720p, 5 s sans vidéo en entrée | Pas d'accès sans paquet ou solde : 0,769 (paquet 500 $) | 0,746 (paquet 8 000 $) | 0,785 | -2 % à -5 % | Prix vérifié, paquets non vérifiés |
| Kling 4.0, 720p, 10 s | 1,538 | 1,491 | 1,57 | -2 % à -5 % | Idem |
| Kling 4.0, 720p, 15 s | 2,308 | 2,237 | 2,355 | -2 % à -5 % | Idem |
| Kling 4.0, 720p, 20 s | 3,077 | 2,983 | 3,14 | -2 % à -5 % | Idem |
| Kling 4.0, vidéo vers vidéo 10 s (entrée 10 s) | 1,846 | 1,790 | 1,88 | -2 % à -5 % | Idem |
| Kling O3 (3.0 Omni), vidéo vers vidéo 10 s | 1,26 (paquet 700 $) | 1,134 (paquet 5 670 $) | 1,26 (page) ou 1,40 (API de prix) | 0 à -19 % | Prix vérifié, paquets et équivalence non vérifiés |
| Seedance 2.5, 720p, 10 s, référence vidéo 10 s | 2,765 | Paquets de jetons | ≈ 5,55 | ≈ -50 % | Vérifié, mais visages réels refusés |
| Seedance 2.5, 720p, 10 s, images seules | 2,311 | Paquets de jetons | ≈ 4,62 | ≈ -50 % | Idem |
| MiniMax H3 Max Recast, 768p, 10 s | Non proposé | n/a | 3,00 | n/a | Absent de la doc officielle |
| MiniMax H3 Max référence (autre fonction), 768p, 10 s | 2,23 | n/a | n/a | Non comparable | Vérifié |
| PixVerse Swap, 720p, 10 s | 0,542 (122 crédits) | Inconnu | 0,40 | **+36 % en direct** | Vérifié |
| PixVerse Swap, 720p, 5 s | 0,276 (62 crédits) | Inconnu | 0,20 | **+38 % en direct** | Vérifié |
| Gemini 2.5 Flash, vision | 0,30 $/M entrée, 2,50 $/M sortie | Batch 0,15 / 1,25 | Non vérifié | Inconnu | Direct vérifié |

Sources du tableau :
- **FAIT VÉRIFIÉ** Nano Banana 2.1 : 1,50 $/M en entrée, 30 $/M en image de sortie, soit 0,0336 $ en 1K, 0,0504 $ en 2K, 0,113 $ en 4K, Batch 0,0168 $ en 1K — [tarifs Gemini API](https://aistudio.google.com/docs/pricing), consulté le 04/11. Le chiffre de 0,0336 $ inscrit dans le code de Cosmos est donc exact.
- **FAIT VÉRIFIÉ** Vertex applique les mêmes prix en région « Global » et facture **1 120 jetons par image en entrée** — [tarifs Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/pricing), consulté le 05/11. **DÉDUCTION** : chaque image d'entrée coûte 0,00168 $, d'où la disparition de l'écart vers 4 images. Ce nombre de jetons est lu sur la page Vertex, pas sur la page Gemini API.
- **FAIT VÉRIFIÉ** Kling 4.0 : 1,0 unité (0,157 $)/s en 720p sans vidéo en entrée ; 0,6 unité (0,094 $)/s avec vidéo en entrée, sur une durée facturée égale à sortie × 2 si l'entrée est plus courte ou égale, ou à entrée + sortie si elle est plus longue. Pour Kling 3.0 Omni avec vidéo de référence sans audio natif : 0,9 unité (0,126 $)/s sur la seule sortie — [tableau officiel Kling](https://kling.ai/document-api/pricing/base/video.md), consulté le 05/11.
- **FAIT VÉRIFIÉ** fal : 0,157 $/s pour le [texte vers vidéo](https://fal.ai/models/kling/v4/text-to-video/llms.txt) et la [référence vers vidéo](https://fal.ai/models/kling/v4/reference-to-video/llms.txt), 0,094 $/s sur entrée + sortie pour le [vidéo vers vidéo](https://fal.ai/models/kling/v4/video-to-video/edit/llms.txt), consulté le 04/11. **DÉDUCTION** : les tarifs fal de Kling 4.0 sont strictement les prix catalogue de Kling, sans marge visible.
- **NON VÉRIFIÉ** Paquets : 500 $ pour 3 250 unités (0,15386 $/unité, remise 2 %), 2 000 $ pour 13 135 unités, 8 000 $ pour 53 640 unités, 180 jours, sans report, 20 tâches simultanées — [page de prix Kling](https://kling.ai/dev/pricing), lue uniquement via l'index de recherche le 04/11. **DÉDUCTION** : ces paquets correspondent au prix catalogue de 0,157 $ avec 2, 3 et 5 % de remise (510 $ barré ÷ 3 250 = 0,157). Ce sont donc très probablement les paquets « Flagship », mais la page lue ne l'étiquette pas.
- **FAIT VÉRIFIÉ** fal Kling O3 Standard : 0,126 $/s, entrée 3 à 15 s — [page fal](https://fal.ai/models/fal-ai/kling-video/o3/standard/video-to-video/edit/llms.txt), consulté le 04/11. Le preset Cosmos note 0,14 $/s selon l'API de prix fal (`presets/arrivee-star/preset.json`, ligne 142). **DÉDUCTION** : « O3 » désigne Kling 3.0 Omni, car le prix (0,126 $) et la limite d'entrée (3 à 15,5 s dans la [doc Kling 3.0 Omni](https://kling.ai/document-api/api/video/3-0-omni/video-omni.md)) coïncident. fal ne le confirme pas.
- **NON VÉRIFIÉ** Paquets généraux (hors Kling 4.0) : 700 $ pour 5 000 unités à 0,14 $, jusqu'à 7 560 $ pour 60 000 unités à 0,126 $ ; essai à 9,80 $ pour 100 unités (0,098 $/unité), 30 jours, 5 tâches simultanées — [Atlas Cloud, revendeur, 14/07/2026](https://www.atlascloud.ai/blog/tips/kling-ai-api-pricing), recoupé en partie par [Wireflow, revendeur, 19/10/2026](https://www.wireflow.ai/blog/kling-4-0-pricing). Sur ce palier d'essai, O3 10 s coûterait 0,88 $, mais pour 100 unités seulement.
- **FAIT VÉRIFIÉ** Seedance 2.5 (`dreamina-seedance-2-5-260628`) : 10,70 $/M sans vidéo en entrée et 6,40 $/M avec, en 480p et 720p. Jetons = (durée d'entrée + durée de sortie) × largeur × hauteur × images/s ÷ 1024. Aucune mention de promotion — [tarifs BytePlus](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/model-pricing), consulté le 04/11. **DÉDUCTION** : en 720×1280 à 24 images/s, 21 600 jetons/s, soit 432 000 jetons et 2,765 $ pour 10 s + 10 s. La formule reproduit les exemples officiels : 1,156 $ pour 5 s, 1,244 $ et 4,838 $ pour 5 s avec 4 s et 30 s d'entrée.
- **FAIT VÉRIFIÉ** fal Seedance 2.5 : 0,0214 $ les 1 000 jetons, × 0,6 avec vidéo en entrée, même formule — [page fal](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video/llms.txt), consulté le 04/11. **DÉDUCTION** : 21,40 $/M et 12,84 $/M, soit le double exact de BytePlus. Cela donne 5,55 $, chiffre déjà présent dans le README du preset de Cosmos (`presets/arrivee-star/README.md`, ligne 49). L'origine de cet écart n'est pas expliquée par les pages lues.
- **FAIT VÉRIFIÉ** MiniMax-H3-Max en 768P : sortie 0,08 $/s, vidéo en entrée 0,143 $/s, 2 premières images gratuites puis 0,074 $ l'image — [tarifs MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo), consulté le 04/11. **DÉDUCTION** : 0,80 + 1,43 = 2,23 $ pour 10 s avec 10 s d'entrée ; 2,378 $ avec 4 photos.
- **FAIT VÉRIFIÉ** fal Recast : 0,30 $/s en 768p, 0,45 $/s en 1080p, sur la sortie seule, photos incluses — [page fal](https://fal.ai/models/minimax/h3-max/recast/llms.txt), consulté le 04/11.
- **FAIT VÉRIFIÉ** PixVerse Swap : 12 crédits/s en 720p sur la durée source, génération de masque 2 crédits par requête, 225 crédits = 1 $, plans et volumes pouvant modifier le coût réel — [tarifs PixVerse](https://docs.platform.pixverse.ai/pixverse-api-pricing-2394995m0.md), consulté le 04/11. Le taux de 225 est confirmé par [la page PixVerse du 19/10/2026](https://pixverse.ai/en/ai-info-page), qui prévient que les anciennes tables de paquets ne font plus foi. D'anciens résumés citent 200 ou 100 crédits par dollar, non retenus.
- **FAIT VÉRIFIÉ** fal Swap : 0,20 $ par clip de 5 s en 720p, le coût « double » au-delà de 5 s — [page fal](https://fal.ai/models/fal-ai/pixverse/swap/llms.txt), consulté le 04/11.
- **FAIT VÉRIFIÉ** Gemini 2.5 Flash : 0,30 $/M en entrée (texte, image, vidéo), 2,50 $/M en sortie, Batch à moitié prix — [tarifs Gemini API](https://aistudio.google.com/docs/pricing), mêmes montants sur [Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/pricing), consultés les 04 et 05/11.

### Inferences
- **DÉDUCTION** Gain maximal réel sur Kling 4.0 : environ 10 $ sur le paquet de 500 $, 62 $ sur celui de 2 000 $, 421 $ sur celui de 8 000 $. Le paquet de 500 $ représente environ 270 vidéos de 10 s en vidéo vers vidéo, à écouler en 180 jours, soit 1,5 par jour. Une seule perte de solde à expiration efface plusieurs paquets d'économies. Pour un business semi-passif, cet arbitrage est défavorable.
- **DÉDUCTION** Le prix affiché de 0,188 $/s produite pour le vidéo vers vidéo est confirmé en direct : l'entrée est bien facturée, chez Kling comme chez fal.
- **DÉDUCTION** Kling 4.0 reste le produit phare de Cosmos, donc la migration cumulerait prépaiement, réécriture et gain marginal. Elle ne se justifierait qu'à partir d'un volume où 5 % d'économie dépassent le coût de maintenance d'une seconde intégration.
- **DÉDUCTION** Le doublement du prix Seedance sur fal est le seul écart important du comparatif, mais il n'est exploitable que si Cosmos n'a pas besoin de visages réels téléversés (voir la question sur les photos). Pour le preset étudié, ce n'est pas le cas.
- **DÉDUCTION** Sur Google, à 0,006 $ d'économie par image, il faut environ 1 700 images pour gagner 10 $. Le passage direct est le plus simple de tous, mais son intérêt financier reste faible à faible volume.

### Gaps
- Prix réellement facturé par fal pour Nano Banana 2.1 : `fal-ai/nano-banana-2.1` et `/edit` répondent 404 en `llms.txt` (05/11). Le repère de 0,04 $ reste celui du code. Si fal facture autrement, l'écart Google change.
- Consommation réelle de jetons texte et de raisonnement sur Nano Banana 2.1 (7,50 $/M). Quelques centaines de jetons ajouteraient de l'ordre de 0,002 $ par image. Non mesuré, car cela demanderait un appel payant.
- Table des jetons minimaux de Seedance 2.5 avec vidéo en entrée : elle est sur [une page Lark externe](https://bytedance.larkoffice.com/wiki/H0fUwHPxtiHayOk6CVpcZzKqnHJ?table=tblTUnmKaxBSqpU7&view=vewpCgsiHf), non lue.
- Prix du Swap sur fal au-delà de 10 s : la page ne précise pas. Tarif PixVerse après remise de plan : non publié.
- Prix réel de `gemini-3.5-flash-lite`, vers lequel Gemini 2.5 Flash sera redirigé : non relu. Prix de Gemini 2.5 Flash via fal : non vérifié.

## Le modèle exact est-il disponible, avec quels paramètres ?

### Takeaway
Nano Banana 2.1, Gemini 2.5 Flash, Kling 4.0, Kling 3.0 Omni, Seedance 2.5 et PixVerse Swap existent en direct. MiniMax H3 Max Recast n'apparaît pas dans la documentation officielle de MiniMax. Kling 4.0 couvre toutes les spécifications de Cosmos, avec un format d'appel différent de celui de fal.

### Cited Findings
- **FAIT VÉRIFIÉ** Nano Banana 2.1 (`gemini-nano-banana-2.1`) est stable, sorti le 6 octobre 2026, sans date d'arrêt annoncée — [calendrier Google](https://aistudio.google.com/docs/deprecations), [fiche du modèle](https://aistudio.google.com/docs/models/gemini-nano-banana-2.1), consultés le 04/11.
- **FAIT VÉRIFIÉ** Sorties 1K, 2K, 4K (K majuscule obligatoire) ; 14 images de référence dont 4 personnages et 10 objets ; formats dont 1:1, 9:16 et 16:9 ; filigrane SynthID sur toutes les images — [doc images](https://aistudio.google.com/docs/image-generation), [fiche Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/nano-banana-2-1), consultés les 04 et 05/11.
- **FAIT VÉRIFIÉ** Sur Google Cloud, seule la région « global » est listée pour Nano Banana 2.1, sans quota fixe — [fiche Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/nano-banana-2-1), consulté le 04/11.
- **FAIT VÉRIFIÉ** Gemini 2.5 Flash : arrêt au plus tôt le 1er décembre 2026, les requêtes étant alors redirigées vers `gemini-3.5-flash-lite` et facturées à son tarif — [calendrier Google](https://aistudio.google.com/docs/deprecations), [tarifs](https://aistudio.google.com/docs/pricing), consultés le 04/11. Cosmos le référence comme `google/gemini-2.5-flash` (`presets/arrivee-star/preset.json`, ligne 232).
- **FAIT VÉRIFIÉ** Kling 4.0 : points d'accès `/text-to-video/kling-4.0`, `/image-to-video/kling-4.0`, `/omni-video/kling-4.0` ; 720p et 1080p ; durée entière de 3 à 30 s ; formats 21:9, 16:9, 9:16, 1:1, adaptive ; `settings.audio` à `native` ou `original` — [doc Omni](https://kling.ai/document-api/api/video/4-0/video-omni.md), [doc texte](https://kling.ai/document-api/api/video/4-0/text-to-video.md), consultés le 05/11. Les durées 5, 10, 15 et 20 s sont couvertes.
- **FAIT VÉRIFIÉ** Vidéo à éditer via `base_video` (une seule), jusqu'à 5 vidéos de 3 à 30 s au total, 10 images, 15 éléments de référence au total. Les références se font avec un identifiant libre : `"id": "image_1"` puis `@image_1` dans l'invite — [doc Omni](https://kling.ai/document-api/api/video/4-0/video-omni.md), consulté le 05/11. La syntaxe `@Video1` et `@Element1` est propre à fal ; ce n'est pas celle de Kling.
- **FAIT VÉRIFIÉ** Les éléments Kling se créent d'abord par une tâche asynchrone sur `/v1/general/advanced-custom-elements` (une vue de face plus 1 à 3 images), puis sont appelés par `element_id` — [doc éléments](https://kling.ai/document-api/api/video/4-0/elements.md), consulté le 05/11. fal les accepte directement dans la requête.
- **FAIT VÉRIFIÉ** L'audio et le découpage intelligent sont activés par défaut dans l'API — [guide Kling 4.0](https://kling.ai/document-api/api/usage-guide/kling-4-0.md), consulté le 05/11.
- **FAIT VÉRIFIÉ** Kling 3.0 Omni : durée de 3 à 15 s, vidéo d'entrée de 3 à 15,5 s et 200 Mo au plus — [doc](https://kling.ai/document-api/api/video/3-0-omni/video-omni.md), consulté le 05/11.
- **FAIT VÉRIFIÉ** Seedance 2.5 : 480p, 720p, 1080p ; 4 à 30 s ; formats dont 16:9, 1:1, 9:16 ; 30 images, 10 vidéos, 10 audios en référence ; `generate_audio` ; modes `reference`, `edit`, `extend` — [tutoriel BytePlus](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-5), consulté le 04/11.
- **FAIT VÉRIFIÉ** MiniMax-H3-Max : 480P et 768P seulement (pas de 720p), 5 à 15 s, ratios dont 16:9, 1:1, 9:16 ; texte, image, référence ; 9 images et 3 vidéos de 15 s au total. Aucune fonction d'édition ou de remplacement de personne n'est décrite — [référence API](https://platform.minimax.io/docs/api-reference/video-generation-v2-create), [guide](https://platform.minimax.io/docs/guides/video-generation), consultés le 04/11.
- **FAIT VÉRIFIÉ** Recast sur fal : vidéo source de 5 à 30 s avec plans de 15 s au plus, 4 photos, son d'origine conservé, 768p ou 1080p — [page fal](https://fal.ai/models/minimax/h3-max/recast/llms.txt), consulté le 04/11. Le mot « Recast » n'apparaît ni dans le guide ni dans la référence API de MiniMax.
- **FAIT VÉRIFIÉ** PixVerse Swap : 360p, 540p, 720p, pas de 1080p ; vidéo source de 30 s et 100 Mo au plus, côté le plus long de 1920 px ; appel préalable obligatoire à Select Video Mask, puis `keyframe_id`, `mask_id` et `img_id` — [doc Swap](https://docs.platform.pixverse.ai/subject-replacement-swap-43051222e0.md), [doc masque](https://docs.platform.pixverse.ai/select-video-mask-43051221e0.md), consultés les 04 et 05/11.

### Inferences
- **DÉDUCTION** Passer de fal à Kling en direct n'est pas un simple changement d'URL. Il faut réécrire le format `contents`, les références `@id` et ajouter une étape asynchrone de création d'élément avant `/creer`. Il faudra aussi supprimer ces éléments persistants pour respecter la durée de conservation des photos clients.
- **DÉDUCTION** Le masque explicite de PixVerse en direct répond à un risque noté par Cosmos : « mauvaise personne choisie dans la foule » (`presets/arrivee-star/README.md`, ligne 48). Cet avantage est fonctionnel, pas financier. Il reste à automatiser le choix du bon masque.
- **DÉDUCTION** Recast et la référence H3 Max ne sont pas interchangeables : la source est plafonnée à 15 s au lieu de 30 s, et le suivi de chaque personne d'un plan à l'autre n'est pas documenté. Seul un essai pourrait dire si la qualité est comparable, ce qui serait un test payant.

### Gaps
- Recast pourrait exister chez MiniMax sous un autre nom ou via un contrat commercial : aucune trace dans les pages lues, ni dans une recherche restreinte aux domaines de MiniMax.
- Possibilité de désactiver l'audio natif sur Kling 4.0 : le guide le dit activé par défaut, sans option d'arrêt lue.

## Quels sont les frais réels : prépaiement, minimum, expiration, échecs facturés ?

### Takeaway
Google demande 5 $ au départ et facture à l'usage. Kling impose un paquet dédié à Kling 4.0 ou un solde négocié avec le service commercial, non remboursable. Chez Kling, BytePlus et PixVerse, les échecs ne sont en principe pas facturés. Les conditions de MiniMax en paiement à l'usage restent muettes sur ce point.

### Cited Findings
- **FAIT VÉRIFIÉ** Google : facturation par défaut en prépaiement, 5 $ minimum, 5 000 $ maximum, crédits valables 12 mois et en général non remboursables, clé coupée à 0 $ (erreur 402). Le crédit Cloud de 300 $ ne couvre pas la Gemini API. Les erreurs 400 et 500 ne sont pas facturées — [facturation Gemini](https://aistudio.google.com/docs/billing), consulté le 04/11.
- **FAIT VÉRIFIÉ** Kling 4.0 exige l'une de ces deux conditions : un paquet Flagship acheté, ou un solde positif obtenu via une demande commerciale — [guide Kling 4.0](https://kling.ai/document-api/api/usage-guide/kling-4-0.md), consulté le 05/11.
- **FAIT VÉRIFIÉ** Les paquets Kling 4.0 sont étanches : le paquet « v4 » ne sert qu'à Kling 4.0 et 4.0 Flash, les paquets généraux ne les couvrent pas. Les filtres « Flagship (180-Day Package) » et « Flagship (Trial Package) » existent dans [le code public de la page](https://kling.ai/dev/pricing), lu le 04/11. **NON VÉRIFIÉ** : prix ou existence réelle de l'essai Flagship.
- **FAIT VÉRIFIÉ** Kling : les générations échouées ne déduisent aucune unité, le solde non utilisé est perdu à expiration, le nombre de tâches simultanées n'augmente pas en achetant plus de paquets — [configuration de la page de prix](https://kling.ai/dev/pricing), lu le 04/11.
- **FAIT VÉRIFIÉ** Kling : le solde est non retirable et non remboursable ; un paquet activé n'est pas remboursable ; le solde restant est perdu en cas de résiliation — [conditions API payantes, art. 2.5.2, 2.5.6, 2.8](https://kling.ai/document-api/guides/protocols/paid-service.md), en vigueur le 21/04/2026, consulté le 05/11.
- **FAIT VÉRIFIÉ** BytePlus : seule la vidéo réussie est facturée, les échecs de modération ne le sont pas. Avec vidéo en entrée, un minimum de jetons s'applique — [tarifs BytePlus](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/model-pricing), consulté le 04/11. Le tutoriel recommande un solde supérieur à 30 $ ou un paquet — [tutoriel](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-5), consulté le 04/11. Compte en impayé suspendu après 2 heures, selon la page de tarifs.
- **NON VÉRIFIÉ** Paquets Seedance 2.5 : 32 $ pour 5 M de jetons, 64 $ pour 10 M, 640 $ pour 100 M, valables 3 mois, soit 6,40 $/M — résumé d'index de [BytePlus](https://www.byteplus.com/en/product/modelark), consulté le 04/11.
- **FAIT VÉRIFIÉ** MiniMax : H3 n'est disponible qu'en paiement à l'usage, via une recharge du solde. Les forfaits vidéo (1 000 à 6 000 $/mois) ne couvrent pas H3. « Pas de déduction si échec ou blocage de sécurité » n'est écrit que pour ces forfaits — [vue d'ensemble des prix](https://platform.minimax.io/docs/pricing/overview), [grille](https://platform.minimax.io/docs/guides/pricing-paygo), consultés le 04/11.
- **FAIT VÉRIFIÉ** PixVerse : les crédits API sont séparés de l'abonnement web. Le montant renvoyé à la création est indicatif, seul le journal du compte fait foi. Le remboursement d'un échec est automatique mais à vérifier dans le journal — [facturation PixVerse](https://docs.platform.pixverse.ai/billing-and-usage-2394984m0), consulté le 04/11.
- **FAIT VÉRIFIÉ** Ne pas confondre avec l'abonnement Kling grand public (1 $ = 66 crédits, crédits valables 2 ans, échecs non décomptés) : c'est un autre produit — [llms.txt Kling](https://kling.ai/llms.txt), consulté le 04/11.

### Inferences
- **DÉDUCTION** Conversion crédit/dollar à retenir : Kling 4.0, 1 unité = 0,157 $ catalogue ; Kling 3.0 et Omni, 1 unité = 0,14 $ catalogue ; PixVerse, 225 crédits = 1 $. Une même « unité Kling » n'a donc pas la même valeur selon le paquet.
- **DÉDUCTION** Avec plusieurs fournisseurs en direct, Cosmos devrait surveiller autant de soldes prépayés et de dates d'expiration, ce qui va contre l'objectif « rien de manuel récurrent », sauf à ajouter des alertes et une recharge automatique.

### Gaps
- Recharge minimale chez MiniMax et PixVerse : non publiée dans les pages lues. PixVerse renvoie à sa page de facturation, accessible avec un compte.
- Facturation d'une image Google renvoyée en 200 mais bloquée par un filtre : non documentée. Seuls les codes 400 et 500 sont cités.
- Facturation d'un échec en paiement à l'usage chez MiniMax : non écrite.
- Possibilité d'obtenir un solde Kling sans contact commercial, et son montant minimal : non vérifiée.

## Une petite entreprise française peut-elle y accéder sans contrat commercial ?

### Takeaway
Oui pour Google, en quelques minutes et par carte. Kling, MiniMax et PixVerse semblent accessibles en libre-service, mais je n'ai pu le confirmer sans créer de compte. Kling 4.0 reste en déploiement progressif. BytePlus distingue comptes individuels et entreprises.

### Cited Findings
- **FAIT VÉRIFIÉ** Google : activation en liant un compte de facturation et en prépayant 5 $, la plupart des paiements par carte étant immédiats ; EEE, Royaume-Uni et Suisse sont disponibles — [facturation](https://aistudio.google.com/docs/billing), consulté le 04/11. Les services sont réservés à un usage professionnel, aux plus de 18 ans, et les clients servant des utilisateurs de l'EEE doivent utiliser **uniquement les services payants** — [conditions Gemini API](https://aistudio.google.com/docs/terms), en vigueur le 23/03/2026, consulté le 04/11.
- **FAIT VÉRIFIÉ** Paliers Google : palier 1 à 250 $/mois et 10 $ par tranche de 10 minutes ; palier 2 après 100 $ payés et 3 jours (2 000 $/mois, 200 $/10 min) ; palier 3 après 1 000 $ et 30 jours — [limites](https://aistudio.google.com/docs/rate-limits), consulté le 04/11.
- **FAIT VÉRIFIÉ** Kling : compte obligatoire, puis achat sur la page de prix — [guide Kling 4.0](https://kling.ai/document-api/api/usage-guide/kling-4-0.md), [conditions art. 2.1](https://kling.ai/document-api/guides/protocols/paid-service.md), consultés le 05/11. Factures disponibles dans la console, selon [les textes publics de la console](https://kling.ai/dev/pricing), lus le 04/11.
- **NON VÉRIFIÉ** Statut de Kling 4.0, sources divergentes : « Coming Soon » au 19/10 ([Wireflow](https://www.wireflow.ai/blog/kling-4-0-pricing)) ; déploiement commencé le 21/10 avec badge Preview ([AIReiter, 23/10](https://aireiter.com/fr/blog/kling-4-api-availability)) ; lancement du 22/10 ouvert progressivement aux entreprises et développeurs, et fal ouvert à tous ses clients le 23/10 ([ToolNavs, 24/10](https://toolnavs.com/fr/article/2830-lapi-de-kling-40-ouverte-%C3%A0-tous-les-clients-fal-et-les-plateformes-tierces-embo%C3%AE)).
- **FAIT VÉRIFIÉ** Au 05/11, la documentation officielle décrit les points d'accès, les prix et les conditions d'accès de Kling 4.0, sans mention d'aperçu dans [le tableau de prix](https://kling.ai/document-api/pricing/base/video.md). Mais le code de la page contient encore un message « Kling 4.0 API access is not yet available » et un bouton d'accès anticipé, dont l'affichage réel n'a pas pu être contrôlé.
- **FAIT VÉRIFIÉ** BytePlus : limites différentes pour les comptes « Enterprise » et « Individual ». Pas de service aux États-Unis, disponible « dans les marchés pris en charge » — [tutoriel](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-5), [annonce du 06/08/2026](https://www.byteplus.com/en/blog/dreamina-seedance2-5), consultés le 04/11.
- **FAIT VÉRIFIÉ** PixVerse : l'API est réservée aux développeurs ayant les qualifications légales, des justificatifs peuvent être demandés et l'accès refusé ; les entreprises peuvent s'inscrire à leur nom — [conditions plateforme, mises à jour le 04/09/2026](https://pixverse.ai/en/pixverse-platform-terms-of-service), consulté le 04/11.

### Inferences
- **DÉDUCTION** Le plafond du palier 1 de Google (10 $ par 10 minutes) laisse environ 250 images par tranche : largement suffisant au départ, sans démarche manuelle pour monter de palier.
- **DÉDUCTION** Le libre-service de Kling 4.0 n'est pas prouvé. Le statut réel ne se constate qu'avec un compte, ce qui sort du périmètre de cette recherche.

### Gaps
- Paiement par carte chez Kling, MiniMax, BytePlus et PixVerse : non confirmé par une page lue. Le code Kling mentionne un point de paiement en ligne, sans préciser les moyens.
- Vérification d'entreprise chez Kling, MiniMax et BytePlus : non lue. Une source affirmait qu'il fallait une candidature validée chez Kling, mais [la page](https://anycap.ai/page/en-US/news/kling-ai-review-2026) renvoie désormais une erreur 410 ; à ne pas retenir.
- TVA et mentions de facture pour une entreprise française : non traité par les pages lues.

## Limites de débit, webhooks, conservation des résultats et fonctionnement sans intervention

### Takeaway
Kling, MiniMax et PixVerse proposent des rappels (webhooks) compatibles avec l'architecture actuelle de Cosmos, avec des variantes à recoder. Google répond en direct, sans file de type fal pour une génération à la demande, et BytePlus efface les liens après 24 heures. Dans tous les cas, il faut copier le résultat rapidement sur le stockage de Cosmos.

### Cited Findings

| Fournisseur | Tâches simultanées | Rappel | Conservation du résultat |
|---|---|---|---|
| Google | Quotas par projet, visibles dans AI Studio ; pas de valeur publique lue pour Nano Banana 2.1 | Non lu pour la génération directe | Image renvoyée en base64 dans la réponse |
| Kling 4.0 | 20 vidéos par défaut en déduction de solde, erreur 1303 au-delà, pas de limite de requêtes/s | `callback_url`, signature webhook en option | 30 jours |
| BytePlus Seedance 2.5 | Entreprise 10 et 600 req/min, Individuel 3 et 180 req/min | `callback_url` cité, peu détaillé | 24 h, 100 téléchargements |
| MiniMax H3 | 30 en cours et 300 req/min pour H3 ; H3-Max non listé | `callback_url` avec défi à renvoyer sous 3 s | Non indiquée |
| PixVerse | Selon le plan, erreur 500044 | Webhook HMAC-SHA256, 8 reprises jusqu'à 4 h | Non indiquée |

- **FAIT VÉRIFIÉ** Google : [limites](https://aistudio.google.com/docs/rate-limits) et [doc images](https://aistudio.google.com/docs/image-generation), consultés le 04/11.
- **FAIT VÉRIFIÉ** Kling : [règles de simultanéité](https://kling.ai/document-api/api/get-started/concurrency-rules.md), [rappels](https://kling.ai/document-api/api/get-started/callbacks.md), [erreurs](https://kling.ai/document-api/api/get-started/error-codes.md), [doc Omni](https://kling.ai/document-api/api/video/4-0/video-omni.md), consultés le 05/11. Le quota de 20 vient des [textes publics de la console](https://kling.ai/dev/pricing), lus le 04/11. Les tâches échouées occupent un créneau jusqu'à leur fin. Le serveur international est `api-singapore.klingai.com`.
- **FAIT VÉRIFIÉ** BytePlus : [tutoriel](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-2-5), consulté le 04/11.
- **FAIT VÉRIFIÉ** MiniMax : [référence API](https://platform.minimax.io/docs/api-reference/video-generation-v2-create), [limites](https://platform.minimax.io/docs/guides/rate-limits), [guide](https://platform.minimax.io/docs/guides/video-generation), consultés le 04/11. Interrogation conseillée toutes les 10 s, tâches listées sur 7 jours.
- **FAIT VÉRIFIÉ** PixVerse : [webhooks](https://docs.platform.pixverse.ai/webhook-callbacks-2394994m0.md), [simultanéité](https://docs.platform.pixverse.ai/concurrency-rules-2394990m0.md), consultés le 04/11.
- **FAIT VÉRIFIÉ** Stabilité Kling : engagement de disponibilité de 99,90 %, compensation uniquement en crédits (10 % puis 25 % de la redevance mensuelle), en vigueur le 07/10/2026 — [SLA](https://kling.ai/document-api/guides/protocols/service-level-agreement.md), consulté le 05/11. Préavis de 30 jours en cas d'arrêt d'un service — [conditions art. 4.1](https://kling.ai/document-api/guides/protocols/paid-service.md).

### Inferences
- **DÉDUCTION** Le webhook actuel de Cosmos (`src/app/api/webhooks/fal/route.ts`) devrait être doublé par fournisseur : formats de statut, signatures et reprises diffèrent. Le défi de MiniMax sous 3 s est atteignable sur Vercel, sauf démarrage à froid lent.
- **DÉDUCTION** D'après les pages lues, Google répond de façon synchrone pour la génération à la demande : la fonction Vercel doit rester ouverte pendant la génération. Sa durée maximale doit être comparée à la latence réelle, qui n'a pas été mesurée. Le code actuel, lui, s'appuie sur la file et le webhook de fal.
- **DÉDUCTION** Avec 3 tâches simultanées en compte individuel, BytePlus serait un goulot d'étranglement à la moindre affluence, sauf file d'attente côté Cosmos.

### Gaps
- Reprises de rappel chez Kling, Google et MiniMax : non documentées dans les pages lues.
- Durée de vie des liens MiniMax et PixVerse : introuvable.
- Latence réelle et files d'attente : aucune donnée fiable sans essai payant.

## Conditions : usage commercial, entraînement, conservation, photos de personnes réelles, RGPD

### Takeaway
L'obstacle décisif est Seedance sur BytePlus : le téléversement direct de visages réels y est interdit, et la voie autorisée est réservée à des clients invités. Google et Kling API promettent de ne pas entraîner leurs modèles sur les données payantes. La politique générale de PixVerse prévoit un entraînement par défaut sur des données anonymisées et agrégées. Aucune page Kling lue ne mentionne les transferts vers l'EEE ni un DPA.

### Cited Findings

**Google**
- **FAIT VÉRIFIÉ** En payant, invites et réponses ne servent pas à améliorer les produits ; DPA disponible — [conditions Gemini API](https://aistudio.google.com/docs/terms), consulté le 04/11. Conservation de 55 jours pour détecter les abus, avec examen humain possible en cas de signalement — [politiques d'usage](https://aistudio.google.com/docs/usage-policies), consulté le 04/11.
- **FAIT VÉRIFIÉ** La génération de personnes est listée comme prise en charge sur Google Cloud — [fiche](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/nano-banana-2-1). La recherche Google intégrée n'utilise pas d'images réelles de personnes trouvées sur le web. La doc rappelle seulement d'avoir les droits sur les images téléversées — [doc images](https://aistudio.google.com/docs/image-generation), consulté le 05/11.

**Kling (API payante, à ne pas confondre avec le grand public)**
- **FAIT VÉRIFIÉ** Pas d'entraînement ni d'amélioration sur les données ; Kling agit comme sous-traitant ; journaux conservés 30 jours ; usage commercial non restreint, risque d'atteinte aux droits à la charge du client — [conditions API payantes, art. 5.1, 5.5, 6.4](https://kling.ai/document-api/guides/protocols/paid-service.md), consulté le 05/11.
- **FAIT VÉRIFIÉ** Le client doit recueillir le consentement valable des personnes et expliquer dans sa politique de confidentialité l'usage de Kling — [art. 5.2, 8.3](https://kling.ai/document-api/guides/protocols/paid-service.md). Données stockées à Singapour, équipes de modération réparties dans le monde — [politique API, section 4](https://kling.ai/document-api/guides/protocols/privacy-policy.md), consulté le 05/11. Une recherche des termes EEA, European, standard contractual et adequacy n'y donne aucun résultat.
- **FAIT VÉRIFIÉ** Licence accordée « dans le périmètre géographique de l'activité », sans définition dans le texte anglais — [art. 3.3](https://kling.ai/document-api/guides/protocols/paid-service.md). **NON VÉRIFIÉ** : la [version chinoise](https://www.klingai.com/document-api/guides/protocols/paid-service) limiterait cette licence à la Chine continentale, d'après un résumé d'index ; elle concerne vraisemblablement l'entité chinoise.
- **FAIT VÉRIFIÉ** Les conditions grand public sont opposées : pas d'usage commercial sans accord écrit, entraînement possible sur les contenus, automatisation interdite — [conditions utilisateur, art. 3.1, 4.6, 4.7](https://kling.ai/docs/user-policy), consulté le 05/11. **DÉDUCTION** : un abonnement grand public ne peut pas remplacer l'API pour Cosmos.

**BytePlus / Seedance 2.5**
- **FAIT VÉRIFIÉ** Seedance 2.5 et 2.0 « ne prennent pas en charge le téléversement direct » d'images ou vidéos de référence contenant des visages réels. Trois alternatives : personnages numériques préréglés, sorties de confiance du même compte valables 30 jours, actifs de personnes réelles autorisées — [guide des portraits](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedance-portrait-asset-guide), consulté le 05/11 ; [annonce](https://www.byteplus.com/en/blog/dreamina-seedance2-5), consulté le 04/11.
- **FAIT VÉRIFIÉ** La bibliothèque de personnes réelles est réservée aux **utilisateurs invités** et exige les droits de création avancés. La personne filmée passe elle-même une vérification sur une page H5 ouverte via `CreateVisualValidateSession`, avec un jeton valable 30 minutes, une seule autorisation, une comparaison de chaque actif au visage vérifié, et un seul visage par image. L'authentification est gratuite pour une durée limitée — [guide](https://ai.byteplus.com/ark/region:ap-southeast-1/docs/2333589), consulté le 05/11.
- **NON VÉRIFIÉ** Droits de création avancés : niveau d'entrée gratuit à 50 actifs, niveau payant à 1 400 $/mois ou 14 000 $/an — résumé d'index du [guide d'achat](https://docs.byteplus.com/en/docs/ModelArk/seedance-2-0-purchase-guide), dont le corps n'a pas pu être lu.
- **FAIT VÉRIFIÉ** Filigrane visible et Content Credentials C2PA annoncés sur Seedance 2.5 — [annonce](https://www.byteplus.com/en/blog/dreamina-seedance2-5), consulté le 04/11. Un [DPA](https://docs.byteplus.com/en/docs/legal/docs-data-processing-addendum) (mis à jour le 15/05/2026) et des [conditions IA](https://docs.byteplus.com/en/docs/legal/AI-Services-terms) (mises à jour le 28/08/2026) existent, leur corps n'a pas pu être lu.

**MiniMax**
- **FAIT VÉRIFIÉ** Fournisseur : Nanonoble Pte. Ltd., Singapour, conditions en vigueur le 30/03/2026. MiniMax accède aux données du client pour fournir le service, assurer maintenance et assistance, et respecter la loi. Le client garantit le consentement des personnes, sous peine de suspension du compte — [conditions](https://platform.minimax.io/protocol/terms-of-service), consulté le 04/11.

**PixVerse**
- **FAIT VÉRIFIÉ** Exploité par AIVORA PTE. LTD. Entraînement par défaut sur les contenus, de façon agrégée et anonymisée, sauf opposition « lorsque l'option existe ». Transferts possibles vers les États-Unis. Les données faciales extraites des photos sont supprimées après traitement. Aucune mention du RGPD par son nom — [politique de confidentialité, 07/05/2026](https://pixverse.ai/en/privacy-policy), consulté le 05/11. Cette politique est générale : la documentation API y renvoie, sans clause propre à l'API sur l'entraînement dans les pages lues.
- **FAIT VÉRIFIÉ** Les conditions se contredisent en apparence : l'art. 5.3 dit que l'usage commercial des résultats « n'est pas restreint », l'art. 1.4 interdit le profit commercial sans autorisation écrite, y compris la revente d'appels API — [conditions plateforme](https://pixverse.ai/en/pixverse-platform-terms-of-service), consulté le 04/11. **DÉDUCTION** : Cosmos vend des générations à ses clients, ce point serait à clarifier par écrit avec PixVerse avant un usage en direct.

### Inferences
- **DÉDUCTION** Pour Cosmos, qui reçoit des photos de clients, Seedance 2.5 en direct est inutilisable aujourd'hui sans invitation. Même invité, chaque client devrait passer un contrôle H5 avant de générer, ce qui ajoute une étape au parcours et consomme le quota d'actifs. Le prix réduit de moitié n'est donc pas comparable à spécification identique.
- **DÉDUCTION** Le preset Cosmos prévoit Seedance avec une silhouette de profondeur : la vidéo source ne contient plus de visage, mais les photos de la personne, elles, en contiennent. Le blocage s'applique donc quand même aux photos.
- **DÉDUCTION** Kling API et Google sont les plus lisibles sur l'entraînement. Google a un DPA clair, Kling pose un risque de conformité RGPD faute de mention des transferts hors UE. C'est un point à faire valider par un juriste avant toute mise en production.
- **DÉDUCTION** La clause PixVerse sur l'entraînement par défaut est peu compatible avec des photos de clients sans opposition effective. Elle mérite un contrôle, y compris pour le routage via fal, car le partage de données entre fal et PixVerse n'a pas été étudié ici.

### Gaps
- Taux réels de refus liés aux visages, chez chaque fournisseur : aucune donnée fiable sans essai.
- Si `bytedance/seedance-2.5` sur fal accepte des visages réels : [la page fal](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video/llms.txt) n'en dit rien. C'est le test préalable à tout budget Seedance, et il serait payant.
- DPA de Kling, MiniMax et PixVerse : aucun repéré. Absence dans les pages lues, pas preuve d'inexistence.
- Région de traitement réelle : seule Kling (Singapour) donne un lieu de stockage. Nano Banana 2.1 est « global », sans ancrage européen listé pour l'inférence en ligne.

## Rapidité d'accès, stabilité et support

### Takeaway
Google est le seul accès immédiat prouvé. Je n'ai trouvé aucun retour indépendant fiable de développeurs sur le support, les dépôts ou les refus : ce qui remonte vient presque uniquement de revendeurs.

### Cited Findings
- **FAIT VÉRIFIÉ** Le calendrier Google publie des dates d'arrêt et annonce un préavis — [calendrier](https://aistudio.google.com/docs/deprecations), consulté le 04/11. L'exemple de Gemini 2.5 Flash montre qu'une migration forcée peut arriver vite : Cosmos a moins d'un mois.
- **NON VÉRIFIÉ** Selon ToolNavs, tarifs et quotas Kling 4.0 n'étaient pas encore transparents fin octobre, et le coût réel « ne se saura que sur facture » — [article du 24/10](https://toolnavs.com/fr/article/2830-lapi-de-kling-40-ouverte-%C3%A0-tous-les-clients-fal-et-les-plateformes-tierces-embo%C3%AE). Le tableau officiel lu le 05/11 répond désormais à la question du prix.
- **NON VÉRIFIÉ** Comparatifs de fournisseurs Kling : [article dev.to déclaré sponsorisé par APIMart](https://dev.to/lucas_apimart/which-kling-api-provider-should-a-production-application-use-1pe8), écarté comme preuve et non utilisé dans ces notes.

### Inferences
- **DÉDUCTION** fal a ouvert Kling 4.0 à tous ses clients dès le 23/10, quand Kling déployait par phases : pour un petit acteur, fal a offert un accès plus rapide, et au même prix catalogue.

### Gaps
- Qualité du support des cinq fournisseurs : aucune source indépendante exploitable. Un comparatif tiers mentionnait une très mauvaise note Trustpilot de Kling, portant sur le produit grand public, source non recoupée et donc non retenue.
- Incidents et disponibilité mesurée : aucun historique consulté.
- Retours de développeurs sur Reddit, GitHub et Hacker News : les recherches générales effectuées n'ont fait remonter aucun fil exploitable, et ces sites n'ont pas été explorés un par un. Cette absence ne prouve donc rien.
- Le quota de recherches web a été atteint une fois le 04/11, puis rétabli le 05/11 : les recherches sur ce point sont restées peu nombreuses.

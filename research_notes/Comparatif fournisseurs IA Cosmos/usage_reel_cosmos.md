# Usage réel des fournisseurs d'IA par Cosmos Generator (audit du code, 2026-11-04)

Conventions de ces notes :

- Source : uniquement le dépôt et sa configuration locale. Aucun appel à fal, à la base de production ou à Vercel. Aucune génération. Les citations sont au format `fichier:ligne`.
- « Cited Findings » : lu dans le code ou mesuré localement. « Inferences » : mes calculs, formule visible. « Gaps » : non vérifié. Les contradictions sont signalées par **Contradiction** dans la question concernée.
- Hypothèse de change partout : **1 USD = 0,86 EUR**, valeur inscrite dans le code (`scripts/economics.mjs:18`, `src/lib/presets/spec.ts:206`), non comparée à un cours réel.
- Hypothèse de TVA : 20 % (`scripts/economics.mjs:19`). Frais de paiement : 1,8 % + 0,25 € (`scripts/economics.mjs:20`, marqué « tarif standard, à vérifier »).
- `scripts/economics.mjs` a été lu puis exécuté : calcul local, sans réseau ni écriture. Son résultat est repris ici sous le nom « sortie d'economics.mjs ». Mes autres calculs viennent d'un script hors dépôt qui reprend les formules de `product.ts` et `spec.ts` ; il retrouve les chiffres du README du preset.

## Quels modèles et endpoints sont réellement appelés, avec quels paramètres ?

### Takeaway
Quatre services de production passent par cinq endpoints fal (Nano Banana 2.1 et /edit, Kling 4 text-to-video, reference-to-video, video-to-video/edit), tous à une seule sortie et en 720p pour la vidéo. Tout le reste du relevé préliminaire est confirmé mais n'existe que dans le preset en brouillon, non commité, donc absent de `main`.

### Cited Findings

**État de déploiement.** `git ls-files presets src/lib/presets scripts/preset-lab.mjs src/app/api/webhooks/presets` renvoie 0 fichier : tout le système de presets est non suivi par git. Le `vercel.json` de `HEAD` n'a que 2 crons, sans `/api/cron/presets`. La mémoire indique un déploiement Vercel depuis la branche `main` (`project-public-launch-url.md`). `src/lib/fal.ts` et `src/config/product.ts` ne sont pas modifiés par rapport à `HEAD`.

**A. Production active** (`src/lib/fal.ts`, un seul appel par commande, `src/config/product.ts:13-20`) :

| Service (id en base) | Endpoint | Paramètres envoyés | Entrées client | Source |
| --- | --- | --- | --- | --- |
| `image`, sans image | `fal-ai/nano-banana-2.1` | `prompt`, `aspect_ratio`, `resolution: "1K"`, `num_images: 1` | prompt de 1 500 caractères au plus ; 9:16, 16:9 ou 1:1 | `fal.ts:99-104`, `product.ts:63,114,255` |
| `image`, avec images | `fal-ai/nano-banana-2.1/edit` | les mêmes + `image_urls` | 1 à 4 images, réduites à 1 536 px | `fal.ts:102-103`, `product.ts:65,258-259` |
| `prompt` | `kling/v4/text-to-video` | `prompt`, `duration` (5, 10, 15, 20), `aspect_ratio`, `resolution: "720p"` | aucune image acceptée | `fal.ts:106-110`, `product.ts:75,107`, `api/generations/route.ts:58-60` |
| `promptImages` | `kling/v4/reference-to-video` | `prompt` préfixé par `Reference images: @Image1, …`, `image_urls`, `duration`, `aspect_ratio`, `resolution: "720p"` | 1 à 4 images | `fal.ts:111-124`, `product.ts:81` |
| `kling4` (« Vidéo de référence ») | `kling/v4/video-to-video/edit` | prompt fixe, `video_url`, `elements: [{ frontal_image_url, reference_image_urls }]`, `resolution: "720p"` ; aucun paramètre de durée | 1 ou 2 photos réduites à 2 048 px ; si une seule, elle sert aussi de référence | `fal.ts:84-97`, `product.ts:36-43,90`, `UploadForm.tsx:57` |

- Nombre de sorties : une. Le code lit `output.video.url` ou `output.images[0].url` (`fal.ts:170-171`).
- Son : aucun paramètre audio dans les requêtes Kling de production (`fal.ts:84-125`). La mémoire indique que le son est toujours généré (`reference-kling4-limits.md`).
- Vidéo source du service `kling4` : `public/exemple.mp4`, 1080x1920, 24 i/s, **10,04 s**, AAC, 22,8 Mo (mesuré avec `ffmpeg -i`). Envoyée telle quelle (`scripts/prepare-video.mjs:3-4,32`). URL enregistrée dans `src/config/reference-video.json`, fichier suivi par git, hébergée sur le stockage fal.
- Résolution : `VIDEO_RESOLUTION = "720p"` (`product.ts:56`). Le 1080p est écarté dans le code car il « ferait passer les marges sous l'objectif » (`product.ts:53-55`).
- Effet Père Noël (`santa`) : aucune IA par commande, collage ffmpeg sur une vidéo fixe (`src/config/effects.ts:1-4`, `src/app/api/effets/pere-noel/route.ts:39-42`). Confirme `project-santa-effect-template.md`.

**B. Preset en brouillon** (`presets/arrivee-star/preset.json`, `status: "draft"` ligne 4, variante retenue `kling4-raw` ligne 222). `presets/arrivee-star/assets/urls.json` vaut `{}` : fichiers fixes non envoyés, donc `presetReady` renvoie false (`src/lib/presets/jobs.ts:123-128`) et la commande répond 503 (`api/presets/[slug]/route.ts:42-45`).

| Clé | Endpoint | Paramètres | Durée permise (preset) | Tarif inscrit | Lignes |
| --- | --- | --- | --- | --- | --- |
| `kling4` | `kling/v4/video-to-video/edit` | `prompt`, `video_url`, `elements` (photo 1 ; références : photo 2 ou photo 1, plus l'image-clé), `resolution: "720p"` | 3-30 s, côté ≥ 700 px | 0,094 $/s, entrée + sortie | 126-138 |
| `kling_o3` | `fal-ai/kling-video/o3/standard/video-to-video/edit` | mêmes `elements`, `keep_audio: false`, pas de `resolution` | 3-15 s, côté ≥ 720 px | 0,14 $/s, sortie | 139-151 |
| `recast` | `minimax/h3-max/recast` | `prompt`, `video_url`, `reference_image_urls: [photo 1]`, `resolution: "768P"` | 5-30 s | 0,30 $/s, sortie | 152-163 |
| `pixverse_swap` | `fal-ai/pixverse/swap` | `video_url`, `image_url`, `mode: "person"`, `keyframe_id` (image 169), `resolution: "720p"`, `original_sound_switch: false` ; pas de prompt | non renseignée | 0,40 $ par exécution, 0,20 $ jusqu'à 5 s | 164-176 |
| `seedance25` | `bytedance/seedance-2.5/reference-to-video` | `prompt`, `video_urls`, `image_urls` (photos, image-clé), `resolution: "720p"`, `aspect_ratio: "9:16"`, `duration`, `generate_audio: false` | 4-30 s | 0,2773 $/s, entrée + sortie | 177-192 |
| `nano_banana` (image-clé) | `fal-ai/nano-banana-2.1/edit` | `image_urls` (image de 7 s, photo 1, photo 2), `aspect_ratio: "9:16"`, `resolution: "1K"`, `output_format: "jpeg"`, `num_images: 1` | sans objet | 0,04 $ par exécution | 193-206 |

- Vision : endpoint réel `openrouter/router/vision` sur `fal.run`, avec `model: "google/gemini-2.5-flash"`, `temperature: 0`, `max_tokens: 400` (`src/lib/presets/vision.ts:14,44-50`, `preset.json:232`). Trois contrôles : photo, image-clé, vidéo (planche de 10 images, `assemble.ts:89`).
- Son des presets : le son généré est jeté et remplacé par la piste d'origine sans réencodage (`assemble.ts:79,81`).
- Vidéo source des presets : normalisée en 720x1280, 240 images, 10,00 s, sans son (`preset-prepare.mjs:48-56`, durée mesurée sur `assets/source.mp4`).
- 11 variantes (`preset.json:209-221`) : `kling4-raw`, `kling4-depth`, `o3-raw`, `o3-depth`, `recast-raw`, `pixverse-raw`, `seedance-depth`, `kling4-raw-kf`, `kling4-depth-kf`, `o3-raw-kf`, `o3-depth-kf`.

**C. Préparation unique, script local seulement** (`scripts/preset-prepare.mjs`, jamais au moment d'une commande) : `fal-ai/sam-3/video-rle` (seuil 0,5, 6 cadres et 7 points, `preset.json:56-77`) et `fal-ai/depth-anything-video` (`VDA-Large`, `turbo`, `720p`, `preset.json:78-83`), appelés par `fal.subscribe` (`preset-prepare.mjs:188`). Jamais lancés : ni `sam-result.json` ni `depth.mp4` dans `.cache/presets/arrivee-star/`, pas de `composite.mp4` ni `mask.mp4` dans `assets/`.

**D. Lab de comparaison.** `scripts/preset-lab.mjs run` passe par la même machine et peut lancer chacune des 11 variantes, avec `--go` et `--max-usd` obligatoires (`preset-lab.mjs:180-186`) et sans webhook (`preset-lab.mjs:240`). Le vote à l'aveugle (`/lab/vote/[id]`, `/api/lab/votes`) n'appelle aucun modèle. Aucun essai n'a tourné : pas de `depenses.jsonl`, et `benchmark.md:3` dit « aucun essai payant n'a encore été lancé ».

**Vérification du relevé préliminaire :** les 11 identifiants existent dans le dépôt. Corrections :
- `google/gemini-2.5-flash` n'est pas un endpoint mais le paramètre `model` de **`openrouter/router/vision`**, à ajouter au relevé.
- Kling O3, Recast, PixVerse, Seedance : `preset.json` seulement (plus les tests). Aucun n'est en production.
- SAM 3 et Depth Anything : script de préparation seulement, aucun appel par commande.

**Contradiction** : `project-cosmos-business-goal.md` parle de Wan 2.2 Animate, 4,99 € TTC pour 8 s de parkour. Aucune trace de Wan dans `src`, `scripts` ou `package.json` : ce fichier de mémoire est périmé sur le modèle, le prix et le produit.

**Contradiction** : `.env.example:24` dit que la vidéo de référence est « convertie en 16 fps » ; `scripts/prepare-video.mjs:3-4` dit qu'elle part « telle quelle », et la vidéo fait bien 24 i/s.

**Contradiction** : `reference-genjutsu-pipeline-presets.md` donne Kling O3 pour 3-10 s, `preset.json:143` pour 3-15 s. Aucun essai ne tranche.

**Piège de nommage** : l'identifiant `kling4` désigne seulement la vidéo de référence (`product.ts:18-20`), alors que `prompt` et `promptImages` utilisent aussi Kling 4. Le plan affiché « Réalisateur » a pour clé `producteur` (`product.ts:164-165`).

### Inferences
- À comparer en priorité chez d'autres fournisseurs : Kling 4 text-to-video, Kling 4 reference-to-video, Kling 4 edit, Nano Banana 2.1 (et /edit). C'est tout ce qui sert des clients aujourd'hui.
- O3, Recast, PixVerse et Seedance sont des candidats pour un preset non publié, sans aucun résultat de qualité. Aucun chiffre de qualité ne peut en être tiré à ce stade.

### Gaps
- L'état réellement déployé sur Vercel n'est pas vérifié (interdit par le périmètre). Je déduis « production » de `HEAD` sur `main` et de la mémoire.
- Le schéma complet des modèles chez fal (paramètres non utilisés) n'est pas dans le dépôt.

## Quel est le coût fournisseur inscrit dans le code, et quelles valeurs sont des estimations ?

### Takeaway
Aucun coût du code n'est confirmé par une facture : tous viennent de pages de modèles ou d'estimations, et Cosmos n'enregistre aucun coût réel. Le plus fragile est l'image à 0,04 $ (« à confirmer sur la première facture »), le plus lourd est Kling 4 à 0,157 $/s, ou 0,188 $/s effectif en edit.

### Cited Findings

| Service | Valeur dans le code | Formule | Coût | Source |
| --- | --- | --- | --- | --- |
| Image | `usdPerImage: 0.04` | fixe | 0,04 $ | `product.ts:68` |
| Vidéo prompt | `usdPerSecond: 0.157` | 0,157 x durée | 0,785 / 1,57 / 2,355 / 3,14 $ pour 5 / 10 / 15 / 20 s | `product.ts:76,127` |
| Vidéo avec images | `usdPerSecond: 0.157` | idem | idem | `product.ts:82` |
| Vidéo de référence | `usdPerSecond: 0.188` | 0,094 $/s x 2 (entrée + sortie) x 10 s | 1,88 $ | `product.ts:94-95,126` |
| Père Noël | aucun coût IA par commande | sans objet | 0 $ | `effects.ts:18` |

- Règle de prix : `TOKEN_USD = 0.0026`, `PRICE_STEP_TOKENS = 5` (`product.ts:50-51`). `tokensFor` = arrondi supérieur de coût / (0,0026 x 5), multiplié par 5 (`product.ts:133-138`).
- Exception : l'image a `tokens: 25`, « fixé au-dessus de la règle (20 tokens) » (`product.ts:69-70`).
- 1080p, non utilisé : 0,235 $/s, et 0,141 $/s en video-to-video (`product.ts:54`).
- Presets : `modelCostUsd` = `usd x secondes x 2` si `billed: "input+output"`, ou prix fixe par exécution (`spec.ts:181-188`). Coût de commande : modèle + image-clé + `visionCalls x vision_usd` (`spec.ts:192-197`).
- Préparation : `Math.ceil(240 / 16) x 0,005 $` pour SAM 3 et `10 x 0,04 $` pour la profondeur (`preset-prepare.mjs:201-202`).

**Valeurs non confirmées, telles qu'écrites dans le dépôt :**

| Valeur | Statut indiqué | Source |
| --- | --- | --- |
| Nano Banana 2.1 : 0,04 $ | « fal n'affiche pas son prix : 0,0336 $ chez Google en 1K, plus la marge habituelle de fal. À confirmer sur la première facture. » | `product.ts:66-68`, repris `preset.json:196` |
| Kling O3 : 0,14 $/s | API de prix fal ; la page affiche 0,126 $ ; « la première facture tranchera » | `preset.json:142`, `arrivee-star/README.md:52` |
| Seedance 2.5 : 0,2773 $/s | calcul : 0,0214 $ les 1 000 tokens, (entrée + sortie) x 0,6, en 720x1280 | `preset.json:180` |
| Vision : 0,002 $ par appel | **aucune source indiquée** | `preset.json:233` |
| Taux d'échec preset : 15 % | prévu, « le taux d'échec réel remplacera les 15 % » | `preset.json:297`, `arrivee-star/README.md:70` |
| Frais Mollie | « tarif standard, à vérifier » | `economics.mjs:20` |
| Frais fixes : 58,70 €/mois | estimation (Vercel Pro 20 $, Supabase Pro 25 $, divers 20 €) | `economics.mjs:21` |

- Tarifs Kling, Recast, PixVerse, SAM 3, Depth : « page du modèle fal », relevés le 2026-11-04 (`preset.json:129,155,167`, `arrivee-star/README.md:39`). Ils sont notés comme « à revérifier avant de fixer le prix ».
- Suivi réel : `generations` n'a pas de colonne de coût (`supabase/migrations/20261031000000_tokens.sql:42-51`). `preset_jobs.cost_usd` est un « coût estimé d'après le tarif du preset » (`migrations/20261104120000_presets.sql:25-26`, `machine.ts:127-128`). Le coût de vision renvoyé par l'API (`vision.ts:54`) n'est pas conservé (`machine.ts:22,139`).

**Contradiction** : `preset.json:142` retient pour O3 le prix de l'API de fal, alors que `reference-fal-privacy-defaults.md` dit que cette API est trompeuse (Kling 4 edit à 0,157 au lieu de 0,094 $/s, Recast à 0,05 « unité » au lieu de 0,30 $/s) et demande de prendre la page du modèle. Le README assume ce choix « par prudence ».

**Contradiction** : `PRODUCT.videoDurationSeconds = 10` (`product.ts:7`) sert au coût du service `kling4` (`product.ts:126`), mais la vidéo envoyée dure 10,04 s, et `preset-prepare.mjs:48` rappelle que « fal facture à la seconde : pas de 10,04 s ».

La mémoire `reference-kling4-limits.md` concorde avec le code sur 0,157, 0,235, 0,094 et 0,141 $/s, et sur la facturation entrée + sortie.

### Inferences
- Vidéo de référence au réel, si la facture suit 10,04 s : 10,04 x 0,188 = **1,8875 $**, soit 0,0075 $ de plus. Négligeable sur la marge (53,8 % au lieu de 54,0 % au pire plan).
- Seedance : 720 x 1280 x 24 / 1024 = 21 600 tokens/s ; 21 600 x 0,0214 / 1 000 x 0,6 = 0,2773 $/s. La valeur du preset est donc cohérente avec sa formule. Le diviseur 1024 est ma reconstitution.
- Sensibilité de l'image au pire plan : 71,6 % de marge à 0,04 $ ; 76,2 % à 0,0336 $ ; 57,4 % à 0,06 $ ; 43,2 % à 0,08 $. Le prix non confirmé ne menace pas la rentabilité sauf s'il double.

### Gaps
- Aucune facture fal dans le dépôt. Aucun prix n'a été vérifié contre la facturation réelle.
- Le prix par défaut de Nano Banana 2.1 pour `/edit` avec plusieurs images d'entrée n'est pas distingué dans le code.
- Le coût de stockage chez fal (fichiers `expiresIn: "never"`) n'apparaît nulle part dans le code.

## Quels sont les prix en tokens, les offres vendues, le revenu net par token et la marge par génération ?

### Takeaway
Le paiement est Mollie, pas Stripe. Le token rapporte de 0,00485 € net (Réalisateur annuel) à 0,01197 € (Pack 1000), soit 54 % de marge par vidéo au pire et 81 % au mieux. Le commentaire du code annonce 60 % au minimum, ce qui est faux pour le seul Réalisateur annuel.

### Cited Findings

**Contradiction, à corriger dans la question posée** : il n'y a pas de frais Stripe. Le commit `cb4671b` (2026-10-31) dit « Paiement : Mollie remplace Stripe » ; `src/lib/mollie.ts` porte toute la facturation, `/confidentialite` et `.env.example:20` nomment Mollie. Seuls restes : le commentaire `mollie.ts:2`, les noms `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans `.env.local` et `src/.env.local` (fichier résiduel ignoré par git), et la ligne de `MEMORY.md` sur l'URL publique (le fichier de mémoire lui-même dit Mollie).

**Prix en tokens** (sortie d'economics.mjs, formule `product.ts:133-138`) : image 25 ; vidéo 5 / 10 / 15 / 20 s : 305 / 605 / 910 / 1 210 (identiques pour la vidéo avec images) ; vidéo de référence 725 ; Père Noël 965 (`effects.ts:32`) ; preset Arrivée de star 985, provisoire (`preset.json:296`).

**Offres.** Plans `product.ts:151-170`, 2 mois offerts sur l'annuel (`product.ts:175`), packs `product.ts:196-200`. Quota remis à zéro chaque mois, y compris sur l'annuel, sans report (`product.ts:145-147`). Packs sans expiration (`product.ts:193`). Les tokens d'abonnement sont dépensés avant les tokens achetés (`migrations/20261104000000_packs_annuel_chargeback.sql:120`). Aucun crédit gratuit à l'inscription trouvé (recherche dans `supabase/migrations`, `src/lib`, `src/app/api`).

| Offre | TTC | HT (TVA 20 %) | Frais Mollie | Tokens | TTC / 1 000 tokens | **Net / 1 000 tokens** | Bénéfice à 100 % du quota (règle 0,0026 $) | à 25 % du quota |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Essentiel mensuel | 9,99 € | 8,33 € | 0,43 € | 1 000 | 9,99 € | **7,895 €** | 5,66 € (68 %) | 7,34 € (88 %) |
| Essentiel annuel | 99,90 € | 83,25 € | 2,05 € | 12 000 | 8,33 € | **6,767 €** | 54,37 € (65 %) | 74,49 € (89 %) |
| Star mensuel | 24,99 € | 20,82 € | 0,70 € | 3 000 | 8,33 € | **6,708 €** | 13,42 € (64 %) | 18,45 € (89 %) |
| Star annuel | 249,90 € | 208,25 € | 4,75 € | 36 000 | 6,94 € | **5,653 €** | 123,01 € (59 %) | 183,38 € (88 %) |
| Réalisateur mensuel | 49,99 € | 41,66 € | 1,15 € | 7 000 | 7,14 € | **5,787 €** | 24,86 € (60 %) | 36,60 € (88 %) |
| Réalisateur annuel | 499,90 € | 416,58 € | 9,25 € | 84 000 | 5,95 € | **4,849 €** | 219,51 € (53 %) | 360,38 € (87 %) |
| Pack 1000 | 14,99 € | 12,49 € | 0,52 € | 1 000 | 14,99 € | **11,972 €** | 9,74 € (78 %) | 11,41 € (91 %) |
| Pack 3000 | 37,99 € | 31,66 € | 0,93 € | 3 000 | 12,66 € | **10,242 €** | 24,02 € (76 %) | 29,05 € (92 %) |
| Pack 7000 | 74,99 € | 62,49 € | 1,60 € | 7 000 | 10,71 € | **8,699 €** | 45,24 € (72 %) | 56,98 € (91 %) |

Colonnes TTC, HT, frais, bénéfices : sortie d'economics.mjs. Colonne « Net » : mon calcul, formule ci-dessous. Seuil de rentabilité d'economics.mjs, à quota plein et avec 58,70 € de frais fixes : 11 abonnés Essentiel, 5 Star ou 3 Réalisateur.

**Attention aux deux bases de pourcentage** : economics.mjs rapporte la marge au **prix HT** (`economics.mjs:59,61`, 53 % pour le Réalisateur annuel). `spec.ts:224-227`, le README du preset et mes tableaux la rapportent au **revenu net de TVA et de frais** (53,9 % pour la même offre). Ne pas mélanger les deux.

**Contradiction** : `project-santa-effect-template.md` donne le Père Noël à 8 tokens, dans l'ancienne unité. Le code dit 965 tokens (`effects.ts:31-32`, identique dans `HEAD`), comme `feedback-token-pricing-style.md`.

**Contradiction** : `product.ts:47-49` dit que 100 tokens du plan le moins cher (« Réalisateur ») rapportent 0,58 € net et que « la marge reste d'environ 60 % au moins ». C'est le Réalisateur **mensuel**. L'offre la moins chère au token est le Réalisateur **annuel**, à 0,485 € (`spec.ts:210-212`, `arrivee-star/README.md:72` ont raison). `product.ts:148-150` et `economics.mjs:23` visent d'ailleurs 50 %, pas 60 %.

### Inferences
Formule : net par token = (TTC / 1,2 - (TTC x 0,018 + 0,25)) / tokens. Marge = tokens x net par token - coût $ x 0,86. Le pourcentage est rapporté au revenu net.

- Plan le moins rentable : **Réalisateur annuel, 0,0048492 €/token**. Plan le plus rentable : **Pack 1000, 0,0119718 €/token**. Meilleur abonnement : **Essentiel mensuel, 0,0078952 €/token**.
- La règle des 0,0026 $/token donne 53,9 % de marge au Réalisateur annuel, 60,4 % au Star annuel et 61,4 % au Réalisateur mensuel. Seule la première offre passe sous les 60 % annoncés.

**Marge par génération, sans échec** (revenu net / marge / %) :

| Génération | Tokens | Coût fal | Coût € | Réalisateur annuel (le pire) | Essentiel mensuel (meilleur abonnement) | Pack 1000 (le meilleur) |
| --- | --- | --- | --- | --- | --- | --- |
| Image | 25 | 0,040 $ | 0,034 € | 0,121 € / 0,087 € / **71,6 %** | 0,197 € / 0,163 € / 82,6 % | 0,299 € / 0,265 € / **88,5 %** |
| Vidéo 5 s | 305 | 0,785 $ | 0,675 € | 1,479 € / 0,804 € / **54,4 %** | 2,408 € / 1,733 € / 72,0 % | 3,651 € / 2,976 € / **81,5 %** |
| Vidéo 10 s | 605 | 1,570 $ | 1,350 € | 2,934 € / 1,584 € / **54,0 %** | 4,777 € / 3,426 € / 71,7 % | 7,243 € / 5,893 € / **81,4 %** |
| Vidéo 15 s | 910 | 2,355 $ | 2,025 € | 4,413 € / 2,387 € / **54,1 %** | 7,185 € / 5,159 € / 71,8 % | 10,894 € / 8,869 € / **81,4 %** |
| Vidéo 20 s | 1 210 | 3,140 $ | 2,700 € | 5,868 € / 3,167 € / **54,0 %** | 9,553 € / 6,853 € / 71,7 % | 14,486 € / 11,786 € / **81,4 %** |
| Vidéo de référence 10 s | 725 | 1,880 $ | 1,617 € | 3,516 € / 1,899 € / **54,0 %** | 5,724 € / 4,107 € / 71,8 % | 8,680 € / 7,063 € / **81,4 %** |
| Père Noël (sans IA) | 965 | 0 $ | 0 € | 4,680 € / 4,680 € / 100 % | 7,619 € / 7,619 € / 100 % | 11,553 € / 11,553 € / 100 % |

« Vidéo avec images » : mêmes chiffres que « Vidéo » à durée égale. Le 100 % du Père Noël ne compte que l'IA, pas Vercel ni le stockage.

**Si chaque génération porte 15 % d'échecs payés** (coût / 0,85, le taux prévu pour le preset, que la règle de production ne compte pas) : image 66,6 % / 79,5 % / 86,5 % ; vidéo 5 s 46,3 % / 67,0 % / 78,2 % ; vidéo 10 s 45,9 % / 66,7 % / 78,1 % ; vidéo 15 s 46,0 % / 66,8 % / 78,1 % ; vidéo 20 s 45,9 % / 66,7 % / 78,1 % ; référence 45,9 % / 66,8 % / 78,1 % (Réalisateur annuel / Essentiel mensuel / Pack 1000).

**Variantes de preset, 10 s** (`spec.ts:192-236`, taux d'échec de 15 %, vision comptée avec 2 photos). Le % porte sur le coût par vidéo acceptée :

| Variante | Coût d'une commande | Coût par vidéo acceptée | Tokens min. | Marge au prix minimum : Réal. annuel / Essentiel / Pack 1000 | Marge au prix actuel de 985 tokens : Réal. annuel / Essentiel / Pack 1000 |
| --- | --- | --- | --- | --- | --- |
| `kling4-raw` (retenue) | 1,886 $ | 2,219 $ (1,908 €) | 985 | 2,87 € 60,1 % / 5,87 € 75,5 % / 9,88 € 83,8 % | identique |
| `kling4-depth` | 1,886 $ | 2,219 $ (1,908 €) | 985 | 2,87 € 60,1 % / 5,87 € 75,5 % / 9,88 € 83,8 % | identique |
| `o3-raw`, `o3-depth` | 1,406 $ | 1,654 $ (1,423 €) | 735 | 2,14 € 60,1 % / 4,38 € 75,5 % / 7,38 € 83,8 % | 3,35 € 70,2 % / 6,35 € 81,7 % / 10,37 € 87,9 % |
| `recast-raw` | 3,006 $ | 3,536 $ (3,041 €) | 1 570 | 4,57 € 60,1 % / 9,35 € 75,5 % / 15,75 € 83,8 % | 1,74 € 36,3 % / 4,74 € 60,9 % / 8,75 € 74,2 % |
| `pixverse-raw` | 0,406 $ | 0,478 $ (0,411 €) | 215 | 0,63 € 60,6 % / 1,29 € 75,8 % / 2,16 € 84,0 % | 4,37 € 91,4 % / 7,37 € 94,7 % / 11,38 € 96,5 % |
| `seedance-depth` | 5,552 $ | 6,532 $ (5,617 €) | 2 900 | 8,45 € 60,1 % / 17,28 € 75,5 % / 29,10 € 83,8 % | **-0,84 € -17,6 %** / 2,16 € 27,8 % / 6,17 € 52,4 % |
| `kling4-raw-kf`, `kling4-depth-kf` | 1,928 $ | 2,268 $ (1,951 €) | 1 010 | 2,95 € 60,2 % / 6,02 € 75,5 % / 10,14 € 83,9 % | 2,83 € 59,2 % / 5,83 € 74,9 % / 9,84 € 83,5 % |
| `o3-raw-kf`, `o3-depth-kf` | 1,448 $ | 1,704 $ (1,465 €) | 760 | 2,22 € 60,2 % / 4,54 € 75,6 % / 7,63 € 83,9 % | 3,31 € 69,3 % / 6,31 € 81,2 % / 10,33 € 87,6 % |

Mes coûts et minimums retrouvent ceux de `arrivee-star/README.md:43-49` (1,89 $ / 985 ; 1,41 $ / 735 ; 3,01 $ / 1 570 ; 0,41 $ / 215 ; 5,55 $ / 2 900). `o3-raw` au prix de la page (0,126 $/s) : 1,266 $ par commande, 1,489 $ par vidéo acceptée.

**Écart de prix à signaler** : le même endpoint Kling 4 edit, pour le même coût, est vendu 725 tokens en production et 985 en preset. La différence vient du taux d'échec de 15 % et de l'exigence de 60 % de marge (`spec.ts:231-236`, `README.md:72`), absents de la règle de production.

**Sensibilité au change, au pire plan** : à 0,80 / 0,86 / 0,92 / 1,00 €/$, la vidéo 10 s donne 57,2 % / 54,0 % / 50,8 % / 46,5 %, et l'image 73,6 % / 71,6 % / 69,6 % / 67,0 %.

Ces marges supposent que le token vendu est consommé. Un abonné qui n'utilise que 25 % de son quota laisse 87-89 % de marge. La marge réelle dépend donc du taux d'usage, inconnu.

### Gaps
- Tarif Mollie réel du compte (carte, SEPA récurrent), rétrofacturations, montées de plan au prorata : non modélisés dans le calcul.
- TVA réelle par pays (OSS, `economics.mjs:19`) : le 20 % est une approximation.
- Répartition des ventes entre offres : aucune donnée, donc le revenu net moyen par token est inconnu.

## Quel est le coût total d'un preset de bout en bout, entre coût unique et coût par commande ?

### Takeaway
Pour la variante retenue `kling4-raw`, la préparation payante est nulle et chaque commande coûte 1,884 à 1,886 $, ou 2,219 $ par vidéo acceptée avec 15 % d'échecs. La silhouette n'ajoute que 0,475 $ une seule fois, et la génération vidéo pèse 99,7 % de la commande.

### Cited Findings

**Coûts uniques, par vidéo de référence** (`preset-prepare.mjs:1-8`) :

| Étape | Commande | Coût | Requis pour |
| --- | --- | --- | --- |
| Normalisation, son, images clés, mention | `prepare` | gratuit (ffmpeg local) | toutes |
| Images quadrillées pour viser la star | `grid` | gratuit | SAM 3 |
| Envoi des fichiers fixes chez fal | `upload` | aucune génération, `expiresIn: "never"` (`preset-prepare.mjs:131`) | toutes |
| SAM 3 | `masks --go` | 15 x 0,005 $ = 0,075 $ (`preset-prepare.mjs:201`) | variantes `depth` |
| Depth Anything | `masks --go` | 10 x 0,04 $ = 0,40 $ (`preset-prepare.mjs:202`) | variantes `depth` |
| Silhouette, masque, vidéo de contrôle | `composite` | gratuit | variantes `depth` |

Un résultat déjà reçu n'est jamais redemandé (`preset-prepare.mjs:197-202`). Le README arrondit à 0,48 $ (`arrivee-star/README.md:28`).

**Coûts à chaque commande** (`presets/README.md:9-16`, `machine.ts`) :

| Étape | Appel | Coût | Quand |
| --- | --- | --- | --- |
| Contrôle photo | vision, 1 appel par photo (1 ou 2) | 0,002 à 0,004 $ | **avant le débit des tokens** (`api/presets/[slug]/route.ts:57,71`) |
| Image-clé | Nano Banana 2.1 edit | 0,04 $ | variantes `-kf` |
| Contrôle image-clé | vision | 0,002 $ | variantes `-kf` (`machine.ts:177-179`) |
| Vidéo | selon la variante | 0,40 à 5,546 $ ; `kling4` : 1,88 $ | toujours (`machine.ts:110-128`) |
| Assemblage | ffmpeg sur Vercel | pas de coût IA | toujours (`assemble.ts:1-4`) |
| Contrôle vidéo | vision sur planche d'images | 0,002 $ | toujours, même en mode `shadow` (`machine.ts:207-210`) |

**Reprises** : `max_auto_retries: 1` (`preset.json:234`) ne s'applique qu'à l'image-clé, et seulement si `qa.mode === "enforce"` (`machine.ts:182-187`). Le mode actuel est `shadow` (`preset.json:231`) : rien n'est bloqué ni repris. La vidéo n'est jamais regénérée automatiquement (`machine.ts:212`).

**Coût d'un essai du Lab selon le plan du 2026-11-04** : 1,41 $ puis 1,89 $, puis masque + essai à 1,89-2,37 $ (`arrivee-star/README.md:60-62`).

**Contradiction** : l'économie du preset suppose 15 % d'échecs remboursés (`preset.json:297`, `spec.ts:199-203`), mais en mode `shadow` un verdict négatif ne fait échouer aucune commande. Seules les pannes et refus du modèle remboursent aujourd'hui. Les vidéos ratées seraient donc livrées et payées, et le taux réel de remboursement serait inférieur à 15 %.

### Inferences
- `kling4-raw` à 1 photo : 0,002 + 1,88 + 0,002 = **1,884 $**. À 2 photos : **1,886 $**, valeur de `runCostUsd`.
- Part de la vidéo : 1,88 / 1,886 = 99,7 %. Changer de fournisseur de vision ne changerait presque rien à la marge.
- Pire cas d'une commande réussie `kling4-raw-kf` en mode `enforce` avec une reprise : 1,88 + 2 x 0,04 + 5 x 0,002 = **1,97 $**.
- Le coût unique de 0,475 $ équivaut à 25 % d'une seule génération Kling 4 edit : il devient négligeable dès quelques commandes.
- Photo refusée : 0,002 à 0,004 $ sans revenu. Le solde de tokens est lu après le contrôle (`route.ts:71`), donc un compte à 0 token peut déclencher des appels de vision. Faible coût unitaire, mais sans plafond visible dans la route.

### Gaps
- `vision_usd` sans source (`preset.json:233`). Coût réel de `openrouter/router/vision` inconnu, et le code ne le conserve pas.
- Temps de calcul Vercel de l'assemblage ffmpeg : non chiffré.
- Rien n'a tourné : ni la qualité, ni le taux d'échec, ni le format RLE de SAM 3 (`preset-prepare.mjs:143`, « pas documenté par fal ») ne sont vérifiés.

## Comment les échecs sont-ils gérés, et que coûte une génération ratée ?

### Takeaway
Le client est toujours remboursé en tokens et aucune génération n'est relancée automatiquement, mais Cosmos ne compte le coût des échecs que pour les presets. En production, un webhook définitivement perdu laisse les tokens débités, car aucune tâche de rattrapage n'existe.

### Cited Findings

**Remboursement.** `refund_generation` rend les tokens une seule fois, chacun dans son solde d'origine. Un compte bloqué ne récupère rien (`migrations/20261104000000_packs_annuel_chargeback.sql:132-170`). Les tokens sont retirés avant l'appel au fournisseur (`api/generations/route.ts:84-87`).

**Production (`/api/generations`, `/api/webhooks/fal`) :**

| Cas | Traitement | Source |
| --- | --- | --- |
| Refus à l'envoi (`content_policy_violation`) | remboursement, réponse 422 | `fal.ts:156-158`, `generations/route.ts:109-114` |
| Autre erreur à l'envoi | remboursement, réponse 502 | `generations/route.ts:109,116` |
| Échec en cours de génération | webhook : remboursement + email d'excuse | `webhooks/fal/route.ts:44-51` |
| Webhook non traité (500) | fal renvoie, jusqu'à 1 h ; email protégé par clé d'idempotence | `webhooks/fal/route.ts:15,55`, `email.ts:2-4` |
| Lien non enregistré après envoi | « un échec ultérieur ne pourra pas rendre les tokens » | `generations/route.ts:101-105` |
| Jeton du webhook expiré (24 h) ou illisible | webhook ignoré, sans remboursement | `webhooks/fal/route.ts:32-36`, `product.ts:233` |
| Reprise automatique | aucune : le client relance lui-même | `webhooks/fal/route.ts:49-51` |

**Presets (`machine.ts`, `jobs.ts`) :**

| Cas | Traitement | Source |
| --- | --- | --- |
| Envoi sans identifiant | échec et remboursement, jamais de relance | `machine.ts:6-7,153-155` |
| Fournisseur injoignable | tâche ouverte, reprise plus tard sans nouvel appel | `provider.ts:16-17,82`, `jobs.ts:253-255` |
| Modèle en échec ou refus | fermeture, remboursement, type `refused` ou `failed` | `machine.ts:163-166` |
| Panne d'assemblage | reprise sans repayer la vidéo | `machine.ts:204-206` |
| Vision indisponible | vidéo livrée quand même | `machine.ts:133-143`, `preset-selftest.mjs:216` |
| Commande ouverte depuis plus de 6 h | échec et remboursement | `jobs.ts:26,282-289` |
| Plus de 20 % d'échecs sur 7 jours (10 commandes min., refus exclus) | preset fermé, alerte aux administrateurs | `jobs.ts:28,329-355` |

**Coût pour Cosmos.** Le seul texte du dépôt sur le sujet : « Une vidéo échouée est remboursée au client mais payée au fournisseur : chaque vidéo acceptée porte aussi le coût des échecs » (`spec.ts:199-200`). La règle de production `tokensFor` n'intègre aucun taux d'échec (`product.ts:133-138`).

**Contradiction** : le preset majore de 15 % pour les échecs, la production non, sur le même endpoint Kling 4 edit (985 contre 725 tokens).

### Inferences
- `settleGeneration` n'est appelé en production que depuis `generations/route.ts:109` et `webhooks/fal/route.ts:44`. La route de suivi `api/generations/[id]/route.ts` ne fait que lire le statut. Aucun cron ne traite `generations` : `vercel.json` ne vise que purge, rappels et presets. Donc une génération de production en échec dont les webhooks sont tous perdus reste débitée, sans remboursement ni email, avec une ligne bloquée à `queued`.
- Coût d'un échec, si fal le facture : image 0,034 €, vidéo 10 s 1,350 €, référence 1,617 €, preset `kling4-raw` 1,622 €, avec 0 € de revenu. Le client garde ses tokens et peut relancer : une seule vente peut donc payer deux générations.
- Coût d'un refus à l'envoi : aucune tâche créée, donc probablement 0 $ de génération. Mais en production les photos ont déjà été déposées chez fal (`fal.ts:143` avant `fal.ts:149`), sans expiration.
- En production, un refus survenu pendant la génération n'est pas distingué : `readResult` renvoie un échec générique, et l'email parle d'un échec « de notre côté » (`fal.ts:166-169`, `email.ts:89`).
- Taux d'échec maximal avant perte, au pire plan : égal à la marge, soit 54 % pour la vidéo et 72 % pour l'image.

### Gaps
- **Non vérifié et décisif pour la comparaison** : fal facture-t-il les tâches échouées ou refusées ? `spec.ts:199` l'affirme sans source. À trancher dans la documentation ou sur une facture.
- Taux d'échec réel par modèle : aucune donnée. Le 15 % est une hypothèse de conception.

## Comment l'intégration est-elle bâtie ?

### Takeaway
L'intégration est presque entièrement en REST direct sur la file d'attente de fal, avec webhook signé en Ed25519 et suivi par le navigateur. Le SDK ne sert qu'au dépôt de fichiers et à la préparation. Deux chaînes coexistent : la production, qui livre l'URL fal sans en-têtes de confidentialité, et les presets, qui copient le résultat dans un stockage privé avec ces en-têtes.

### Cited Findings

**SDK et HTTP.** `@fal-ai/client ^1.10.1` (`package.json:14`, version installée 1.10.1). Usage du SDK limité à `fal.config`, `fal.storage.upload` (`fal.ts:141,143`, scripts) et `fal.subscribe` (`preset-prepare.mjs:188`). Tout le reste passe par `fetch` :
- envoi : `POST https://queue.fal.run/{endpoint}?fal_webhook=…` (`fal.ts:8,148-153`, `provider.ts:64-70`) ;
- statut : `GET …/{propriétaire/app}/requests/{id}/status` (`fal.ts:37-40,179`) ;
- résultat : `GET …/{propriétaire/app}/requests/{id}` (`fal.ts:189`) ;
- annulation : `PUT …/cancel` (`provider.ts:112`), jamais appelée (aucun `.cancel(` dans `src` ou `scripts`) ;
- synchrone (vision) : `POST https://fal.run/{endpoint}` (`provider.ts:36,116`).

**Webhooks.**
- Signature : Ed25519 sur `request id`, `user id`, `timestamp`, SHA-256 du corps brut, séparés par `\n` ; en-têtes `x-fal-webhook-*` ; clés du JWKS `rest.fal.ai` gardées 12 h ; anti-rejeu 300 s (`fal-webhook.ts:1-56`).
- `/api/webhooks/fal` : l'email chiffré est dans le jeton de l'URL, le résultat est relu chez fal avec la clé plutôt que cru dans le corps (`webhooks/fal/route.ts:11-14,24,39`).
- `/api/webhooks/presets` : ne lit pas le contenu, réveille la commande après la réponse via `after()`, car « fal attend une réponse sous 15 s » (`webhooks/presets/route.ts:10-13,25`). Non déployée.
- Le proxy exclut `api/webhooks` de la session (`src/proxy.ts:29-30`).

**Suivi navigateur.** Toutes les 5 s (`product.ts:230`, `useGeneration.ts:45,57`). `GET /api/generations/[id]` ne vérifie aucun compte : un UUID valide et un modèle suffisent pour obtenir le statut et l'URL du résultat (`api/generations/[id]/route.ts:4-11`). Côté presets, propriétaire vérifié, et relance de la commande si elle n'a pas bougé depuis 15 s (`api/presets/jobs/[id]/route.ts:10,24-28`).

**Crons** (`vercel.json:2-6`) : `/api/cron/purge-videos` à 4 h, `/api/cron/renewal-reminders` à 7 h, `/api/cron/presets` à 4 h 30 (ce dernier absent de `HEAD`). Secret `Authorization: Bearer` (`cron/purge-videos/route.ts:10-12`). Le cron presets traite 50 commandes au plus, en 45 s (`jobs.ts:275`, `cron/presets/route.ts:16`).

**Stockage et conservation :**

| Donnée | Lieu | Durée | Source |
| --- | --- | --- | --- |
| Photos, production | stockage fal, `fal.storage.upload(photo)` sans durée | aucune suppression dans le code | `fal.ts:143` |
| Résultat, production | URL fal envoyée telle quelle par email | aucune copie, aucune suppression dans le code | `webhooks/fal/route.ts:46`, `fal.ts:171` |
| Vidéo de référence, production | stockage fal | aucune durée demandée | `prepare-video.mjs:32` |
| Photos, presets | bucket Supabase privé `preset-inputs`, liens de 50 min | supprimées en fin de commande, filet à 24 h | `jobs.ts:19-21,191,308-325` |
| Résultat, presets et Père Noël | bucket Supabase privé `videos`, lien signé | 7 jours, purge quotidienne | `video-storage.ts:1-9,29-55`, `product.ts:8` |
| Fichiers fixes des presets | stockage fal | `expiresIn: "never"` | `preset-prepare.mjs:125,131` |
| Fichiers du Lab | stockage fal | 30 jours (scène), 1 jour (photos, planche) | `preset-lab.mjs:166,207,212,250` |

**Confidentialité.**
- Presets : `X-Fal-Store-IO: 0` et `X-Fal-Object-Lifecycle-Preference` à 24 h sur chaque appel (`provider.ts:44-48`).
- Production : `falHeaders` ne pose que `Authorization` et `Content-Type` (`fal.ts:68-70`). Sans option, le SDK n'ajoute pas d'en-tête de durée de vie (`node_modules/@fal-ai/client/src/storage.js:43-47`).
- La purge quotidienne ne vise que les dossiers d'effets et de presets du bucket Supabase (`cron/purge-videos/route.ts:15`).
- Défauts de fal d'après la mémoire (docs lues le 2026-11-04, non relues ici) : fichiers « kept forever and publicly readable », historique de 90 jours (`reference-fal-privacy-defaults.md`).

**Contradiction** : `/confidentialite` promet que « les photos, images et vidéos sont supprimées automatiquement sous 7 jours » (`src/app/confidentialite/page.tsx:22-23`) et l'email dit que le résultat « reste disponible pendant 7 jours » (`email.ts:75`), alors que le code de production ne supprime rien chez fal. Déjà signalé à l'utilisateur le 2026-11-04, qui a demandé de ne pas toucher à ces flux (`reference-fal-privacy-defaults.md`). Rappelé ici uniquement parce que la question porte sur ce point et parce que le réglage compte dans la comparaison des fournisseurs.

**Contradiction** : `/confidentialite:29` cite un « service de modération d'images ». Aucun n'existe dans le code de production (la seule occurrence du mot dans `src` et `scripts` est cette ligne). Seul le filtre du modèle agit. Le contrôle de vision des presets n'est pas déployé, et `arrivee-star/README.md:82` prévoit de mettre cette page à jour.

**Contraintes Vercel.**
- `maxDuration = 60` sur `api/effets/pere-noel`, `api/presets/[slug]`, `api/presets/jobs/[id]`, `api/webhooks/presets`, `api/cron/presets`. Aucune valeur sur `api/generations` ni `api/webhooks/fal`.
- Requêtes limitées à 4,5 Mo : photos réduites dans le navigateur à 1 536 px, ou 2 048 px pour `/creer` et les presets (`product.ts:256-259`, `photo-upload.ts:23-24`, `UploadForm.tsx:57`, `PresetForm.tsx:85`). Limite côté serveur : 10 Mo (`product.ts:246`).
- ffmpeg et fichiers fixes ajoutés au déploiement par `outputFileTracingIncludes` (`next.config.ts:9-20`).
- Verrou de 3 min, plus long qu'une exécution (`jobs.ts:22-24`).
- `prebuild` envoie la vidéo de référence chez fal si elle a changé, puis vérifie les presets (`package.json:8`, `prepare-video.mjs:24-33`).

La mémoire indique aussi qu'un résultat sans stockage des requêtes n'est lisible que 1 h après la fin (`reference-fal-privacy-defaults.md`). Le filet quotidien des presets ne peut donc que rembourser une commande dont le webhook est perdu et la page fermée.

### Inferences
- Vis-à-vis d'un autre fournisseur, la forme à retrouver est : file asynchrone, webhook signé ou suivi par requête, hébergement temporaire des résultats, réglage de conservation par requête, stockage de fichiers ou acceptation d'URL signées.
- La chaîne preset est moins dépendante du stockage fal : les photos sortent de Supabase par lien signé, le résultat y revient. La production dépend du stockage fal à l'entrée comme à la sortie.
- Une vidéo Kling de 10 s doit être téléchargée, assemblée et renvoyée en moins de 60 s dans la chaîne preset. D'après la mémoire, le selftest passe en local (je ne l'ai pas relancé). Rien ne le prouve sur Vercel.

### Gaps
- Réglages du compte fal (conservation par défaut au niveau du compte) : non consultables depuis le dépôt.
- Limite de taille de fichier du bucket Supabase : ni dans le code, ni vérifiée.
- Durée effective par défaut de `api/generations` et `api/webhooks/fal` sur le plan Vercel du projet : non vérifiée.

## Quelle est la surface de migration hors de fal ?

### Takeaway
Environ 630 lignes de code dépendent directement de fal, plus 200 lignes de configuration écrites pour ses formats. L'abstraction existe pour les presets seulement et reste incomplète. La production n'en a aucune. Estimation : moins d'une journée pour changer de modèle chez fal, 1 à 4 jours pour sortir un modèle, 7 à 12 jours pour sortir de fal entièrement, requalification comprise.

### Cited Findings

**Code directement lié à fal** (lignes comptées avec `wc -l`) :

| Fichier | Lignes liées | Nature |
| --- | --- | --- |
| `src/lib/fal.ts` | 213 / 213 | client de production, formats de requête, statut, résultat |
| `src/lib/fal-webhook.ts` | 56 / 56 | signature, JWKS |
| `src/app/api/webhooks/fal/route.ts` | 59 / 59 | webhook de production |
| `src/app/api/generations/[id]/route.ts` | 16 / 16 | suivi, format UUID imposé |
| `scripts/prepare-video.mjs` | 34 / 34 | envoi de la vidéo de référence |
| `src/lib/presets/provider.ts` | 88 / 122 | implémentation fal (lignes 35-122) ; le reste est l'interface |
| `src/app/api/webhooks/presets/route.ts` | 27 / 27 | ne dépend de fal que par la signature |
| `scripts/preset-prepare.mjs` | 127 / 308 | `upload` (120-136), RLE et `masks` (140-249) |
| `scripts/preset-lab.mjs` | environ 12 / 441 | dépôts de fichiers (166, 191-193, 207, 212, 250) |
| **Total** | **environ 632** | |

**Configuration et données au format fal ou Kling** (environ 204 lignes) : `product.ts:59-97` (`MODELS`, `falModel`, `falEditModel`), `product.ts:25-43` (prompt `@Video1`, `@Element1`), `preset.json:125-207` (modèles), `preset.json:53-84` (préparation), `preset.json:87-117` (prompts), `src/config/reference-video.json` (URL fal).

**Couplages disséminés :**
- Base : `generations.fal_request_id text unique` (`migrations/20261031000000_tokens.sql:47`), `database.types.ts:89,98`, `tokens.ts:196-209`. `generations.model` garde les identifiants `kling4`, `prompt`, `promptImages`, `image`, `santa`, `preset:<id>@<version>` (`product.ts:18-20`, `effects.ts:9`, `presets.ts:30-33`), indépendants de fal. `preset_jobs.steps` garde l'endpoint et l'identifiant par étape, sans nom de fournisseur (`machine.ts:15-23`).
- Imports : `publicBaseUrl` vit dans `lib/fal.ts` mais sert à Mollie et aux presets (`mollie.ts:24`, `jobs.ts:9`). Le type `GenerationStatus` y est importé par 5 fichiers (`CosmosChat.tsx:27`, `GenerationProgress.tsx:1`, `PresetForm.tsx:8`, `useGeneration.ts:6`, `api/presets/jobs/[id]/route.ts:2`).
- Syntaxe Kling dans le code : `@Image1` (`fal.ts:114`), remplacement de `@Element1` (`spec.ts:178`).
- Autres : refus détecté par la chaîne `content_policy_violation` (`fal.ts:156`, `provider.ts:58`), identifiant supposé UUID (`fal.ts:12`), `/confidentialite:28`, `.env.example:23-26`, `package.json:6,8,14`.

**Abstraction existante.** `MediaProvider` (`provider.ts:13-23`) expose `submit`, `status`, `result`, `cancel`, `run`. `machine.ts` n'importe que ce type et `isProviderRefusal` (`machine.ts:8`). Les presets choisissent modèle et prompt dans le JSON, « changer de modèle ne demande pas de code » (`project-preset-arrivee-star.md`, `arrivee-star/README.md:34`). Le chemin de production ne l'utilise pas : `generations/route.ts:10` appelle `lib/fal` directement.

**Contradiction** : `provider.ts:1-3` affirme que pour un autre fournisseur il suffit d'« une entrée de plus dans PROVIDERS et "provider" dans le preset ; rien d'autre ne change ». Le code montre le contraire :
- `spec.ts:14` type `provider: "fal"`, seule valeur admise ;
- la vision est figée sur fal (`jobs.ts:178`, `api/presets/[slug]/route.ts:57`, `vision.ts:14`) ;
- le webhook n'accepte que la signature fal (`webhooks/presets/route.ts:17`), et son URL ne porte pas le fournisseur (`jobs.ts:176`) ;
- `Pricing` ne connaît que la seconde et l'exécution (`spec.ts:8-11`) : un tarif au token ou au mégapixel ne rentre pas ;
- les fichiers fixes sont déposés par le SDK fal (`preset-prepare.mjs:131`), et `urls.json` n'a qu'une URL par fichier, sans fournisseur (`presets.ts:11,15-16`) ;
- les en-têtes de confidentialité sont propres à fal (`provider.ts:47-48`) ;
- `estimate_cost`, demandé par le brief (`reference-genjutsu-pipeline-presets.md`), n'est pas dans l'interface.

**Réutilisable sans changement** : grand livre des tokens, Mollie, emails Resend, `assemble.ts`, `machine.ts`, `video-storage.ts`, Père Noël, vote à l'aveugle, 26 tests de la machine à fournisseur factice (`scripts/preset-selftest.mjs`, compte selon `project-preset-arrivee-star.md`).

### Inferences
Estimations personnelles en jours de travail d'un développeur assisté, sans mesure. Elles excluent les délais d'attente du fournisseur et le benchmark qualité complet.

| Chantier | Estimation | Contenu |
| --- | --- | --- |
| Changer de modèle, toujours chez fal, preset | moins de 0,5 j | `preset.json`, prompt, prix, `check`, un essai payant |
| Changer de modèle, toujours chez fal, production | 0,5 à 1 j | `MODELS`, branche de `falCall`, prix, essai |
| Sortir un modèle de preset de fal | 1 à 2 j | 60 à 90 lignes de fournisseur, élargir `spec.ts`, signature ou suivi par requête, `Pricing`, fichiers fixes |
| Sortir un modèle de production de fal | 2 à 4 j | premier passage : routage du chemin de production (statut, webhook, renommage de `fal_request_id`) ; modèle suivant : 0,5 à 1 j |
| Sortir de fal entièrement, un seul fournisseur couvrant tout | **7 à 12 j** | voir détail |
| Chaque fournisseur supplémentaire | + 1 à 2 j | client, signature, stockage, prix |

Détail du départ complet :
- couche fournisseur pour la production et migration SQL, 2 à 3 j ;
- 5 endpoints de production, image-clé et vision, 2 à 3 j ;
- webhooks et signatures, 0,5 à 1 j ;
- stockage (photos, vidéo de référence, copie du résultat), 1 à 2 j ;
- SAM 3 et profondeur, si les variantes `depth` restent, 0,5 à 1 j ;
- requalification des prompts et essais, 1 à 2 j ;
- prix, documentation, page de confidentialité, 0,5 j.

Points de vigilance :
- Bascule : garder les routes fal actives au moins 24 h, durée de vie des jetons de webhook (`product.ts:233`), pour finir les tâches en cours.
- Le prompt de la vidéo de référence et les citations `@Image` sont réglés pour Kling. Un autre modèle demande un nouveau réglage, souvent plus coûteux que le code.
- Coût minimal d'une requalification au tarif actuel : 2 images (0,08 $) + 2 vidéos de 5 s (1,57 $) + 1 référence (1,88 $) = 3,53 $ pour la production, 1,886 $ de plus pour le preset, soit **5,42 $** pour un essai par flux. Chaque essai demande un feu vert explicite.
- Si le fournisseur cible propose lui aussi Kling 4, le réglage des prompts peut être conservé. Sinon, ajouter un benchmark.

### Gaps
- Temps réel de portage inconnu : aucun portage n'a encore été fait et aucun second fournisseur n'est branché.
- Format exact des API cibles (autres chercheurs) : l'écart de formats peut déplacer ces estimations.

## Existe-t-il des données de volume réel, et que coûteraient trois scénarios ?

### Takeaway
**Il n'existe aucune donnée de volume réel dans le dépôt.** En hypothèse, avec un mix justifié par l'interface, le coût fal mensuel est d'environ 81 $, 813 $ et 8 134 $, dont 90 % pour la vidéo, pour une marge sur tokens consommés de 57 % au pire et 83 % au mieux avant frais fixes.

### Cited Findings
- Aucun log commité, aucun CSV, aucune facture (`git ls-files` filtré sur `.log`, `usage`, `invoice`, `facture`, `csv` : seuls des fichiers de code `billing` ressortent).
- Aucun outil d'analyse dans `src`, `scripts` ou `package.json` (recherche `posthog`, `plausible`, `@vercel/analytics`, `gtag`, `sentry` : aucun résultat).
- `.cache/preset-lab/` ne contient que 11 photos de test. Pas de `depenses.jsonl`.
- Les seuls chiffres d'usage du code sont des hypothèses : part du quota utilisée 25-100 % (`economics.mjs:22`), échecs 15 % (`preset.json:297`).
- La table `generations` et `token_ledger` contiendraient le volume réel (`migrations/20261031000000_tokens.sql:42-51`). Non consultées, conformément au périmètre.

**Indices du code pour répartir les vidéos :**
- Durée par défaut : **5 s** (`CosmosChat.tsx:115`, `PromptStudio.tsx:45`, `product.ts:126`). L'accueil affiche « Dès » le prix de 5 s (`GenerationCards.tsx:46`).
- Repère 10 s : la boutique traduit chaque offre en « vidéos de 10 s » (`TokenShop.tsx:32-33,38-40`).
- Vidéo de référence : bouton « Créer ma vidéo » dans l'en-tête (`Header.tsx:21`), redirection par défaut après connexion vers `/creer` (`api/auth/login/route.ts:13`, `api/auth/google/route.ts:9`, `auth/confirm/route.ts:10`, `LoginForm.tsx:15`). Prix fixe 725 tokens.
- `prompt` et `promptImages` coûtent le même prix (`product.ts:76,82`) : leur partage n'influe pas sur le coût, seulement sur le choix du fournisseur.
- Preset exclu : brouillon, non déployé. Père Noël exclu : 0 $ d'IA par commande, saisonnier.

### Inferences
**Mix vidéo retenu, HYPOTHÈSE de ma part :** 30 % référence 10 s, 40 % prompt 5 s, 20 % prompt 10 s, 5 % prompt 15 s, 5 % prompt 20 s. Justification : 5 s est le défaut, 10 s le repère de la boutique, et la référence bénéficie de l'appel principal du site ; 15 et 20 s sont des options coûteuses à sélection volontaire.

Moyenne par vidéo : 0,3 x 1,88 + 0,4 x 0,785 + 0,2 x 1,57 + 0,05 x 2,355 + 0,05 x 3,14 = **1,46675 $** ; 566,5 tokens ; 8,75 s de sortie.

**Coût fal mensuel, HYPOTHÈSES** (coût = images x 0,04 $ + vidéos x 1,46675 $, sans échec) :

| Scénario | Images | Vidéos | Coût images | Coût vidéos | **Total** | En euros | Tokens consommés |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Faible | 200 | 50 | 8,00 $ | 73,34 $ | **81,34 $** | 69,95 € | 33 325 |
| Moyen | 2 000 | 500 | 80,00 $ | 733,38 $ | **813,38 $** | 699,50 € | 333 250 |
| Élevé | 20 000 | 5 000 | 800,00 $ | 7 333,75 $ | **8 133,75 $** | 6 995,03 € | 3 332 500 |

**Bornes selon le mix vidéo** (mêmes images) :

| Scénario | Tout en 5 s | Tout en 10 s | Tout en référence | Tout en 20 s |
| --- | --- | --- | --- | --- |
| Faible | 47,25 $ | 86,50 $ | 102,00 $ | 165,00 $ |
| Moyen | 472,50 $ | 865,00 $ | 1 020,00 $ | 1 650,00 $ |
| Élevé | 4 725,00 $ | 8 650,00 $ | 10 200,00 $ | 16 500,00 $ |

**Volumes par modèle, utiles pour chiffrer un autre fournisseur** (mix retenu) :

| Scénario | Images Nano Banana 1K | Kling 4 text et reference, 720p | Kling 4 edit, 720p |
| --- | --- | --- | --- |
| Faible | 200 | 287,5 s (45,14 $) | 15 vidéos, 150 s produites, 300 s facturées (28,20 $) |
| Moyen | 2 000 | 2 875 s (451,38 $) | 150 vidéos, 1 500 s produites, 3 000 s facturées (282,00 $) |
| Élevé | 20 000 | 28 750 s (4 513,75 $) | 1 500 vidéos, 15 000 s produites, 30 000 s facturées (2 820,00 $) |

Répartition du coût : image 9,8 %, Kling 4 text et reference 55,5 %, Kling 4 edit 34,7 %.

**Revenu net et marge selon l'offre, HYPOTHÈSES** (revenu = tokens consommés x net par token ; marge avant frais fixes ; entre parenthèses, marge avec 15 % d'échecs payés) :

| Scénario | Réalisateur annuel (pire) | Star mensuel | Essentiel mensuel | Pack 1000 (meilleur) |
| --- | --- | --- | --- | --- |
| Faible | 162 € ; 92 € ; 56,7 % (79 €, 49,1 %) | 224 € ; 154 € ; 68,7 % (141 €, 63,2 %) | 263 € ; 193 € ; 73,4 % (181 €, 68,7 %) | 399 € ; 329 € ; 82,5 % (317 €, 79,4 %) |
| Moyen | 1 616 € ; 917 € ; 56,7 % (793 €, 49,1 %) | 2 236 € ; 1 536 € ; 68,7 % (1 413 €, 63,2 %) | 2 631 € ; 1 932 € ; 73,4 % (1 808 €, 68,7 %) | 3 990 € ; 3 290 € ; 82,5 % (3 167 €, 79,4 %) |
| Élevé | 16 160 € ; 9 165 € ; 56,7 % (7 931 €, 49,1 %) | 22 356 € ; 15 361 € ; 68,7 % (14 126 €, 63,2 %) | 26 311 € ; 19 316 € ; 73,4 % (18 081 €, 68,7 %) | 39 896 € ; 32 901 € ; 82,5 % (31 667 €, 79,4 %) |

- Après les frais fixes estimés de 58,70 €/mois (`economics.mjs:21`), au pire plan : 33 €, 858 €, 9 106 € par mois. Cette estimation fixe ne tiendra pas au scénario élevé (bande passante, base, stockage), non chiffré.
- Équivalent à quota plein : scénario moyen = 333 abonnés Essentiel, 111 Star ou 48 Réalisateur.
- Ces revenus sont un plancher pour les abonnements. Si les abonnés n'utilisent que 50 % de leur quota, il en faut deux fois plus pour la même consommation : le scénario moyen en Star mensuel passe de 2 236 € à 4 471 € de revenu net pour le même coût fal.
- Lecture pour la comparaison : une baisse de 10 % du prix de Kling 4 text et reference économise 45 $ par mois au scénario moyen ; une baisse de 10 % sur l'image, 8 $. La vidéo décide du résultat.

### Gaps
- Volume réel : aucun. Une simple requête sur `generations` groupée par `model` et `status` le donnerait, mais elle sort du périmètre de cette note.
- La durée choisie par les clients, la part de la référence et le mix d'offres sont inconnus. Mes pourcentages sont des hypothèses et non des mesures.
- Le mix ne compte ni le preset (s'il est publié, il prendrait probablement une part de la référence, au même coût de 1,88 $ mais à 985 tokens) ni les ventes du Père Noël (revenu sans coût IA).

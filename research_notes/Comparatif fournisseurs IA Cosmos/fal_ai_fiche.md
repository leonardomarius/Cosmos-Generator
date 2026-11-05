# fal.ai : fiche officielle et critique pour les modèles de Cosmos (état au 2026-11-04)

Conventions : chaque élément porte **[FAIT VÉRIFIÉ]** (lu sur la source citée), **[DÉDUCTION]** (calcul ou raisonnement à partir de faits cités) ou **[NON VÉRIFIÉ]** (source secondaire non ouverte, rumeur, ou page inaccessible). Sauf date indiquée, toutes les sources ont été consultées le 2026-11-04. Les prix sont en USD.

Limites de la collecte :
- Les pages ont été lues via un outil d'extraction : les citations sont celles qu'il restitue. Deux erreurs d'extraction ont été corrigées en recoupant (résolutions de Seedance, sens de la clause « Excluded Models »).
- Aucun appel facturable, aucun compte, aucune clé. Seules des routes publiques gratuites ont été appelées : `api.fal.ai/v1/models` et `fal.ai/api/openapi/queue/openapi.json`. L'API de prix a répondu 401 sans clé.
- Le budget de recherche web de la session a été épuisé en fin de travail. Cinq recherches n'ont pas abouti : valorisation à 16 Md$, annonce fal de Kling 4.0, intégration Vercel (compensée par la doc officielle), recharge automatique (compensée en partie par l'index de la doc), dates de sortie de MiniMax H3 et FLUX 3.

## Prix par modèle, ce qui est facturé, coût à spécification identique, fiabilité de l'API de prix

### Takeaway
Les prix du code de Cosmos sont confirmés sur les pages des modèles, y compris environ 0,04 $ pour Nano Banana 2.1 en 1K, qui est désormais affiché. Trois pièges : l'identifiant `fal-ai/nano-banana-2.1` du code n'a pas de page au catalogue (le modèle y figure sous `google/nano-banana-2.1`), l'API de prix ne renvoie qu'un prix de base par endpoint, et 0,188 $/s n'est qu'un plancher pour Kling 4 edit.

### Cited Findings

**Tableau de coût à spécification identique** ([DÉDUCTION] : calculs à partir des prix affichés, sources dans les puces suivantes)

| Endpoint | Tarif de base | 5 s | 10 s | 15 s | 20 s | Réserve |
|---|---|---|---|---|---|---|
| `kling/v4/text-to-video` (720p) | 0,157 $/s produite | 0,785 | 1,57 | 2,355 | 3,14 | durée 3 à 30 s |
| `kling/v4/reference-to-video` (720p, images seules) | 0,157 $/s produite | 0,785 | 1,57 | 2,355 | 3,14 | le tarif change dès qu'une vidéo est en référence |
| `kling/v4/reference-to-video` (720p, avec vidéo en référence) | 0,094 $/s, entrée + sortie, minimum 2× la sortie | 0,94 | 1,88 | 2,82 | 3,76 | si entrée ≤ sortie |
| `kling/v4/video-to-video/edit` (720p) | 0,094 $/s, entrée + sortie, minimum 2× la sortie | 0,94 | 1,88 | 2,82 | 3,76 | si entrée ≤ sortie |
| `fal-ai/kling-video/o3/standard/video-to-video/edit` | 0,126 $/s produite | 0,63 | 1,26 | 1,89 | impossible | entrée limitée à 15 s, résolution de sortie non documentée |
| `minimax/h3-max/recast` (768p, pas de 720p) | 0,30 $/s de sortie | 1,50 | 3,00 | 4,50 | 6,00 | entrée de 5 à 30 s ; 1080p : 0,45 $/s et **défaut du schéma** |
| `fal-ai/pixverse/swap` (720p) | 0,20 $ pour 5 s, le double si l'entrée dépasse 5 s | 0,20 | 0,40 | 0,40 ? | 0,40 ? | barème au-delà de 10 s non précisé |
| `bytedance/seedance-2.5/reference-to-video` (720p, sans vidéo en référence) | 0,0214 $ / 1 000 tokens, soit environ 0,473 $/s | 2,31 à 2,37 | 4,62 à 4,73 | 6,93 à 7,10 | 9,24 à 9,46 | fourchette : formule à 1280×720 / chiffre de la page |
| Idem, avec vidéo en référence (×0,6, entrée + sortie égales) | environ 0,2838 $ par seconde facturée | 2,77 à 2,84 | 5,55 à 5,68 | 8,32 à 8,51 | 11,09 à 11,35 | entrées cumulées ≤ 30,2 s |
| `fal-ai/sam-3/video-rle` (à 24 i/s) | 0,005 $ / 16 images | 0,0375 | 0,075 | 0,1125 | 0,15 | arrondi aux 16 images non documenté |
| `fal-ai/depth-anything-video` | 0,04 $/s | 0,20 | 0,40 | 0,60 | 0,80 | durée présumée être celle de l'entrée |

**Video-to-video de 10 s, du moins cher au plus cher** ([DÉDUCTION], 10 s d'entrée et 10 s de sortie) : PixVerse swap 0,40 $ (720p) ; Kling O3 edit 1,26 $ ; Kling 4 edit 1,88 $ ; Recast 3,00 $ (768p) ; Seedance 2.5 5,55 à 5,68 $. Ces modèles ne font pas la même chose (échange de visage, édition, remplacement de personnage), donc ces écarts ne valent pas comparaison de qualité.

**Image 1K, Nano Banana 2.1**
- [FAIT VÉRIFIÉ] Facturation aux tokens « as reported by Google » sans forfait par image : 1,764 $ par million en entrée, 8,823 $ en sortie texte et réflexion, 35,294 $ en sortie image. 1K représente environ 1 120 tokens de sortie, soit environ **0,040 $** (2K 0,059 $, 4K 0,134 $) — [page du modèle](https://fal.ai/models/google/nano-banana-2.1) ; [llms.txt](https://fal.ai/models/google/nano-banana-2.1/llms.txt).
- [FAIT VÉRIFIÉ] Edit : chaque image d'entrée compte environ 1 120 tokens, soit environ 0,002 $. 1K avec deux entrées : 0,044 $. 14 références ajoutent environ 0,028 $. Pas de 0,5K sur la 2.1. Avec `num_images` supérieur à 1, le prompt et les entrées sont refacturés par image — [page edit](https://fal.ai/models/google/nano-banana-2.1/edit).
- [FAIT VÉRIFIÉ] Réflexion : medium a coûté autant que minimal dans le test de fal, high ajoute 0,0078 à 0,0139 $ par image. Le guide est daté du 2026-10-22 — [guide fal](https://fal.ai/learn/tools/nano-banana-api).
- [FAIT VÉRIFIÉ] `fal-ai/nano-banana-2.1` : [page du modèle](https://fal.ai/models/fal-ai/nano-banana-2.1) et [llms.txt](https://fal.ai/models/fal-ai/nano-banana-2.1/llms.txt) en 404, et le [registre public](https://api.fal.ai/v1/models?endpoint_id=fal-ai/nano-banana-2.1&endpoint_id=google/nano-banana-2.1) ne renvoie aucune métadonnée pour lui, contrairement à `google/nano-banana-2.1` (actif). Pourtant son [schéma de file](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana-2.1) répond, tout comme [/edit](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana-2.1/edit), alors qu'un [identifiant inventé](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/zzz-endpoint-inexistant-test) renvoie 404.

**Vidéo, sources**
- [FAIT VÉRIFIÉ] Kling 4 text : « $0.157 per second at 720p and $0.235 per second at 1080p », 3 à 30 s — [page](https://fal.ai/models/kling/v4/text-to-video). Aucun paramètre audio au schéma ni prix du son — [llms.txt](https://fal.ai/models/kling/v4/text-to-video/llms.txt).
- [FAIT VÉRIFIÉ] Kling 4 reference : même tarif, mais avec vidéo en référence ou élément vidéo, 0,094 $/s en 720p et 0,141 $/s en 1080p sur « the input plus output length » (« minimum 2× the output ») — [page](https://fal.ai/models/kling/v4/reference-to-video).
- [FAIT VÉRIFIÉ] Kling 4 edit : 0,094 $/s et 0,141 $/s, entrée + sortie, minimum 2× la sortie. Entrée de 3 à 30,05 s, 300 Mo au plus, 700 px au moins — [page](https://fal.ai/models/kling/v4/video-to-video/edit) ; [llms.txt](https://fal.ai/models/kling/v4/video-to-video/edit/llms.txt).
- [FAIT VÉRIFIÉ] Kling O3 edit : 0,126 $ par seconde générée, 5 s = 0,63 $, entrée de 3 à 15 s, `keep_audio` sans surcoût indiqué — [llms.txt](https://fal.ai/models/fal-ai/kling-video/o3/standard/video-to-video/edit/llms.txt).
- [FAIT VÉRIFIÉ] Recast : 0,30 $/s de sortie en 768p, 0,45 $/s en 1080p, images de référence offertes, source de 5 à 30 s sans plan de plus de 15 s, 1080P par défaut — [llms.txt](https://fal.ai/models/minimax/h3-max/recast/llms.txt).
- [FAIT VÉRIFIÉ] PixVerse swap : 0,15 $ en 360p et 540p, 0,20 $ en 720p, 0,40 $ en 1080p pour 5 s, « If input video duration is greater than 5 s the cost will double ». Le 1080p est tarifé mais non supporté au schéma — [llms.txt](https://fal.ai/models/fal-ai/pixverse/swap/llms.txt).
- [FAIT VÉRIFIÉ] Seedance 2.5 : tokens ≈ hauteur × largeur × (durée d'entrée + durée de sortie) × 24 / 1024 ; 0,0214 $ / 1 000 tokens en 480p et 720p ; ×0,6 avec vidéo en entrée, entrée et sortie étant toutes deux facturées. Références image et audio non facturées, `generate_audio` activé par défaut. Vidéos de référence : 1,8 à 30,2 s chacune, 30,2 s cumulées — [llms.txt](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video/llms.txt). 480p, 720p et 1080p au [schéma](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedance-2.5/reference-to-video).
- [FAIT VÉRIFIÉ] Le guide fal précise que ses chiffres à la seconde dépassent la formule de quelques pour cent et les présente comme un plafond, et parle de « billed sec » avec vidéo en référence, là où la page du modèle dit « per second of generated video » — [guide du 2026-08-18](https://fal.ai/learn/tools/how-to-access-seedance-2-5-on-fal).
- [FAIT VÉRIFIÉ] SAM 3 : « $0.005 per 16 frames » — [page](https://fal.ai/models/fal-ai/sam-3/video-rle). Depth Anything Video : « $0.04 per second of video » — [page](https://fal.ai/models/fal-ai/depth-anything-video).
- [FAIT VÉRIFIÉ] Gemini : pas de page `google/gemini-2.5-flash` ([404](https://fal.ai/models/google/gemini-2.5-flash)). Le modèle n'est accessible que via [`openrouter/router/vision`](https://fal.ai/models/openrouter/router/vision), que Cosmos utilise (`src/lib/presets/vision.ts`). Facturation aux tokens, sans tarif publié sur la page ; exemple de la page : 0,0008068 pour 1 856 tokens en entrée et 100 en sortie. `fal-ai/any-llm` est marqué « no longer supported » — [page](https://fal.ai/models/fal-ai/any-llm).
- [FAIT VÉRIFIÉ] Google annonce qu'au 1er décembre 2026 les requêtes `gemini-2.5-flash` seront routées vers `gemini-3.5-flash-lite` — [tarifs Google](https://aistudio.google.com/docs/pricing).

**API de prix**
- [FAIT VÉRIFIÉ] `GET https://api.fal.ai/v1/models/pricing` exige une clé (401 constaté sans clé). `unit_price` y est décrit comme « Base price per billing unit », « with proportional adjustments for resolution/length », et « Custom pricing or discounts may be applied based on account status » — [doc de l'API](https://fal.ai/docs/platform-apis/v1/models/pricing).
- [FAIT VÉRIFIÉ] fal renvoie lui-même vers `fal.ai/models/<endpoint-id>/llms.txt` pour le prix courant — [fal.ai/pricing](https://fal.ai/pricing). Pour Kling 4 edit, ce fichier indique bien 0,094 $ — [llms.txt](https://fal.ai/models/kling/v4/video-to-video/edit/llms.txt).
- [FAIT VÉRIFIÉ] Le vrai montant facturé se lit dans les Billing Events : `quantity`, `unit`, `unit_price`, `percent_discount`, `cost_total`, par requête, avec une clé de préréglage `BILLING` ou `FULL` — [doc](https://fal.ai/docs/platform-apis/v1/models/billing-events.md). L'estimateur propose `historical_api_price` ou `unit_price`, sans se dire contractuel — [doc](https://fal.ai/docs/platform-apis/v1/models/pricing/estimate).
- [NON VÉRIFIÉ] Valeurs relevées par Cosmos (Kling 4 edit à 0,157 au lieu de 0,094 ; Recast à 0,05 « unité » au lieu de 0,30 $/s ; prix 720p seul). Non reproductibles sans clé, conformément aux consignes.

### Inferences
- [DÉDUCTION] Le constat de Cosmos est structurellement crédible : un seul couple `unit_price`/`unit` par endpoint ne peut pas exprimer un tarif par résolution, un tarif différent selon les entrées, ni une facturation entrée + sortie. L'API n'est pas fausse selon sa propre définition (« base price »), mais elle ne suffit pas à calculer un coût. Ordre de confiance proposé : Billing Events, puis page du modèle et llms.txt, puis API de prix.
- [DÉDUCTION] Nano Banana 2.1 en 1K : **0,0397 $** recalculés pour 100 tokens de prompt, cohérents avec les 0,040 $ affichés. Les 0,04 $ du code sont confirmés pour une image sans entrée, mais le commentaire « fal n'affiche pas son prix » est périmé. En mode edit, le coût réel dépasse cette estimation : environ 0,044 $ avec 2 entrées, environ 0,068 $ avec 14.
- [DÉDUCTION] `fal-ai/nano-banana-2.1` semble être un alias fonctionnel mais hors catalogue. Risque : un alias sans page ni métadonnées peut changer sans qu'aucune page ne le signale. L'identifiant documenté est `google/nano-banana-2.1`.
- [DÉDUCTION] 0,188 $/s pour Kling 4 edit est un plancher : avec 30 s en entrée et 10 s en sortie, on paie 40 s × 0,094 = 3,76 $, soit 0,376 $ par seconde produite. Les 10 s de Cosmos (entrée = sortie) donnent bien 1,88 $.
- [DÉDUCTION] Recast sans `resolution` explicite part en 1080P, soit 50 % de plus. PixVerse à 15 ou 20 s reste ambigu : 0,40 $ seulement si le doublement est forfaitaire.
- [DÉDUCTION] La formule Seedance à 1280×720 donne 0,4622 $/s contre 0,4730 $/s affichés (écart de 2,3 %). Si « 0,2838 $ par seconde générée » était pris au pied de la lettre, 10 s coûteraient 2,84 $ ; la formule et le guide donnent environ le double (5,55 $). Retenir la formule.
- [DÉDUCTION] L'exemple Gemini correspond exactement au tarif Google (1 856 × 0,30 $/M + 100 × 2,50 $/M = 0,0008068), donc aucune marge n'apparaît dans cet exemple. Ce n'est pas une preuve sur la facture réelle.
- [DÉDUCTION] Le 1er décembre 2026, le modèle de vision des presets pourrait changer de comportement, si OpenRouter suit le routage annoncé par Google.

### Gaps
- [NON VÉRIFIÉ] Prix facturé réel sur l'alias `fal-ai/nano-banana-2.1` : seuls les Billing Events du compte le diraient.
- [NON VÉRIFIÉ] Tarif par token de `openrouter/router/vision` : absent de la page et de son llms.txt.
- [NON VÉRIFIÉ] Arrondi de SAM 3, facturation du swap PixVerse au-delà de 10 s, résolution de sortie de Kling O3, durée maximale de PixVerse swap : non documentés.
- [NON VÉRIFIÉ] Facturation du son : aucune page Kling 4 n'en parle ; il n'existe pas de paramètre pour le couper. Le schéma Seedance a `generate_audio`, sans remise indiquée si on le désactive.

## Frais et minimums : marge, crédits, recharge, remises, échecs

### Takeaway
Crédits prépayés qui expirent à 365 jours, non remboursables, et compte bloqué sous un seuil non publié. La marge n'est mesurable avec certitude que sur Nano Banana 2.1 : **+17,6 %** sur Google. Les erreurs 5xx sont gratuites, mais pas forcément les 422.

### Cited Findings
- [FAIT VÉRIFIÉ] Google, `gemini-nano-banana-2.1` : 1,50 $ / 7,50 $ / 30,00 $ par million ; 0,0336 $ en 1K, 0,0504 $ en 2K, 0,113 $ en 4K ; lot à moitié prix (0,0168 $ en 1K) — [tarifs Google](https://aistudio.google.com/docs/pricing).
- [FAIT VÉRIFIÉ] MiniMax, H3 Max : 768P à 0,08 $/s en sortie et 0,143 $/s en vidéo d'entrée. La page n'a aucun tarif « recast » — [tarifs MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo). Le blog de fal parle de « H3 Max by fal » (2026-08-27) et « Built with fal Inference and Training » (2026-09-17) — [blog fal](https://blog.fal.ai).
- [NON VÉRIFIÉ] Kling : [kling.ai/dev/pricing](https://kling.ai/dev/pricing) ne donne aucun tarif à l'extraction. Le seul chiffre trouvé vient d'un revendeur (UnificAlly : 0,1134 $/s avec 10 % de remise de lancement, résolution non confirmée), résumé de recherche sur [unifically.com](https://unifically.com/fr/models/kling).
- [NON VÉRIFIÉ] Seedance chez BytePlus : 10,70 $ par million sans vidéo en entrée et 6,40 $ avec, d'après des agrégateurs non ouverts ([CometAPI](https://www.cometapi.com/seedance-2-5-api-pricing/)). La [page officielle](https://docs.byteplus.com/en/docs/modelark/model-pricing) ne donne aucun chiffre à l'extraction.
- [FAIT VÉRIFIÉ] Prépayé ; le crédit acheté fixe aussi la concurrence — [doc tarifs](https://fal.ai/docs/model-apis/pricing).
- [FAIT VÉRIFIÉ] « Credits will expire 365 days from the date of purchase » ; crédits promotionnels à 90 jours ; non remboursables sauf exception ; « All prices on the Sites are subject to change at any time without notice » — [CGU §9, mises à jour le 2026-09-08](https://fal.ai/terms). La [FAQ](https://fal.ai/docs/model-apis/faq) donne pour les crédits gratuits de 1 semaine à 1 an, ce qui contredit les 90 jours.
- [FAIT VÉRIFIÉ] Sous le seuil de blocage, le compte est verrouillé et les requêtes API rejetées. Seule la facturation sur facture des clients entreprise y échappe — [FAQ](https://fal.ai/docs/model-apis/faq). Le seuil n'y est pas chiffré.
- [FAIT VÉRIFIÉ] Recharge automatique : absente de l'[index de la doc](https://fal.ai/docs/llms.txt) ; l'[API de facturation](https://fal.ai/docs/platform-apis/v1/account/billing) ne renvoie que `current_balance`, sans date d'expiration, seuil ni recharge.
- [FAIT VÉRIFIÉ] Remises : prix et remises de volume négociés et appliqués automatiquement, sans seuil publié — [doc tarifs](https://fal.ai/docs/model-apis/pricing). « Partner API models don't receive the standard percentage discounts » — [FAQ](https://fal.ai/docs/model-apis/faq). Les pages Kling 4 et Seedance 2.5 portent le badge Partner — [Kling 4](https://fal.ai/models/kling/v4/reference-to-video) ; [Seedance US](https://fal.ai/models/bytedance/seedance-2.5/us/reference-to-video).
- [FAIT VÉRIFIÉ] Les forfaits fal Agent (50, 200 et 1 000 $ par mois) ne remisent pas l'API : « Direct API usage remains pay as you go » — [doc](https://fal.ai/docs/documentation/setting-up/agent-plans-and-retention).
- [FAIT VÉRIFIÉ] Échecs : « Server errors are never billed » (HTTP 500 et plus) ; attente en file gratuite ; cold starts non facturés sur les Model APIs — [doc tarifs](https://fal.ai/docs/model-apis/pricing). En revanche, les 422 « may still be charged if a runner spent GPU time before detecting the error » — [FAQ](https://fal.ai/docs/model-apis/faq).
- [FAIT VÉRIFIÉ] `content_policy_violation` et `no_media_generated` (« the generation completed successfully but the model did not produce any media output ») sont des 422 non réessayables, et la page ne dit pas s'ils sont facturés — [doc erreurs](https://fal.ai/docs/documentation/model-apis/errors).
- [FAIT VÉRIFIÉ] Hausses observées : Flux 3 Image passé de 0,024 à 0,048 $/mégapixel entre le 15 et le 22 octobre 2026 (fin de remise de lancement), parc GPU réévalué à la hausse le 2026-10-01, d'après un suivi tiers qui cite fal — [UsagePricing](https://www.usagepricing.com/blueprint/activity/fal-ai-2026-10-22-flux-3-image-price-doubles).
- [NON VÉRIFIÉ] Achat minimal de 1 $, résumé de recherche sur un tutoriel fal non ouvert — [tutoriel](https://fal.ai/learn/tools/how-to-generate-ai-videos-with-an-api).

### Inferences
- [DÉDUCTION] Marge de fal sur Nano Banana 2.1 : les trois tarifs valent le tarif Google divisé par 0,85 (rapports de 1,176 à 1,1765), soit +17,6 %. En 1K : 0,0336 $ chez Google contre environ 0,0395 $ de sortie image chez fal.
- [DÉDUCTION] Le lot Google à –50 % n'apparaît sur aucune page fal lue : pour les usages non urgents, l'écart atteint environ 2,4 fois (0,040 $ contre 0,0168 $).
- [DÉDUCTION] Recast (0,30 $/s) contre MiniMax H3 Max (0,08 + 0,143 = 0,223 $/s si entrée = sortie) : la comparaison est fragile, car rien ne prouve qu'il s'agit du même produit ni du même modèle.
- [DÉDUCTION] Pour un business semi-passif, le risque principal est opérationnel : sans recharge automatique documentée, un solde sous le seuil coupe les générations. Il faut surveiller `current_balance` et prévoir une alerte.
- [DÉDUCTION] Une requête Kling `multi_prompt` de plus de 512 caractères (constat Cosmos) échoue en 422 après acceptation. D'après la FAQ, elle pourrait être facturée si du temps GPU a été consommé.
- [DÉDUCTION] Remises peu probables sur le cœur de Cosmos : Kling, Seedance et Nano Banana passent par des partenaires, exclus des remises standard.

### Gaps
- [NON VÉRIFIÉ] Recharge automatique dans le tableau de bord (inaccessible sans compte) : ni confirmée, ni exclue.
- [NON VÉRIFIÉ] Marges réelles sur Kling, Seedance, PixVerse, SAM 3 : tarifs officiels non lisibles ou non comparables.
- [NON VÉRIFIÉ] Facturation réelle d'un refus de modération ou d'un `no_media_generated`, seuil de blocage, seuils de remise.

## Limites : concurrence, débit, paliers, délais, garanties

### Takeaway
2 requêtes simultanées au départ, 40 au maximum en libre-service, selon les factures payées sur 4 semaines et sans barème public. Ni délai de file ni SLA ne sont garantis hors offre entreprise.

### Cited Findings
- [FAIT VÉRIFIÉ] Départ à 2 ; ajustement selon « the total amount of paid invoices from the last four weeks » ; maximum 40 en libre-service ; au-delà, passer par les ventes. Pas de barème chiffré : le palier se lit dans le tableau de bord — [doc concurrence](https://fal.ai/docs/documentation/model-apis/concurrency-limits).
- [FAIT VÉRIFIÉ] « fal may apply additional concurrency limits on certain high-demand models », sans chiffre — [doc concurrence](https://fal.ai/docs/documentation/model-apis/concurrency-limits).
- [FAIT VÉRIFIÉ] En file, les requêtes attendent (`IN_QUEUE` ne compte pas dans la limite) et ne sont pas rejetées. En appel direct, réponse 429 `concurrent_requests_limit`, avec jusqu'à 10 reprises par le client — [doc concurrence](https://fal.ai/docs/documentation/model-apis/concurrency-limits).
- [FAIT VÉRIFIÉ] File sans limite de taille, priorités `normal` ou `low` uniquement (pas de priorité haute), « start timeout » pour borner l'attente — [doc file](https://fal.ai/docs/model-apis/model-endpoints/queue) ; [en-têtes](https://fal.ai/docs/documentation/model-apis/common-parameters).
- [FAIT VÉRIFIÉ] CGU : pas de SLA ; §16 écarte toute garantie de fonctionnement ininterrompu ; §4(a) « commercially reasonable efforts » ; responsabilité plafonnée au plus élevé de 50 $ ou des paiements sur 12 mois (§17(b)) — [CGU](https://fal.ai/terms). Les CGU API permettent de limiter les appels à la discrétion raisonnable de fal — [CGU API](https://fal.ai/legal/api-services).
- [FAIT VÉRIFIÉ] L'offre entreprise cite « SLA guarantees » sans pourcentage ni pénalité — [page entreprise](https://fal.ai/enterprise).

### Inferences
- [DÉDUCTION] Le palier de concurrence étant indexé sur les paiements récents, un petit volume reste bas. Un preset à plusieurs étapes et quelques commandes simultanées peuvent saturer 2 slots ; pas d'échec, mais un délai plus long que prévu.
- [DÉDUCTION] Le texte ne dit pas si la limite redescend quand les factures sortent de la fenêtre de 4 semaines, mais la formulation le laisse craindre.
- [DÉDUCTION] Aucun délai de file n'étant garanti, toute promesse de délai aux clients de Cosmos doit reposer sur des mesures propres.

### Gaps
- [NON VÉRIFIÉ] Montants par palier, limites par modèle pour Kling 4 ou Seedance 2.5, délais de file réels, palier actuel du compte Cosmos, contenu des SLA entreprise.

## Automatisation : file, webhooks, SDK, stockage, Vercel, durée de vie des URL

### Takeaway
Le socle est solide (file durable, webhooks signés ED25519, 31 reprises), mais il y a trois limites : fenêtre de reprise courte, aucun en-tête d'idempotence, et documentation contradictoire sur la durée de vie des fichiers.

### Cited Findings
- [FAIT VÉRIFIÉ] File durable : « Requests in the queue are never dropped » ; reprise automatique jusqu'à 10 fois sur 503, 504 et erreur de connexion ; annulation effective seulement si l'application la gère une fois lancée — [doc file](https://fal.ai/docs/model-apis/model-endpoints/queue).
- [FAIT VÉRIFIÉ] Les appels directs ne sont pas réessayés côté serveur : « Direct synchronous requests return errors immediately without retry » — [doc fiabilité](https://fal.ai/docs/documentation/model-apis/inference/reliability).
- [FAIT VÉRIFIÉ] Secours : « Fallbacks are enabled by default for all accounts » ; désactivable via `x-app-fal-disable-fallback` — [doc fiabilité](https://fal.ai/docs/documentation/model-apis/inference/reliability).
- [FAIT VÉRIFIÉ] Webhooks : signature ED25519, 4 en-têtes `X-Fal-Webhook-*`, clés sur `https://rest.fal.ai/.well-known/jwks.json` (cache de 24 h au plus), tolérance de ±300 s, délai de 15 s au premier envoi et 120 s aux reprises, 31 reprises au plus, jusqu'à expiration du résultat : « about 1 hour after the request completes, or about 6 minutes for results of 10 KB or more ». Les réponses 3xx sont des échecs définitifs. Il faut un traitement idempotent — [doc webhooks](https://fal.ai/docs/model-apis/model-endpoints/webhooks).
- [FAIT VÉRIFIÉ] Sans stockage des requêtes, le résultat n'est lisible que jusqu'à cette même expiration — [doc webhooks](https://fal.ai/docs/model-apis/model-endpoints/webhooks). Confirme la note Cosmos.
- [FAIT VÉRIFIÉ] Aucun en-tête d'idempotence sur la [page des en-têtes](https://fal.ai/docs/documentation/model-apis/common-parameters), et aucune mention sur la [page fiabilité](https://fal.ai/docs/documentation/model-apis/inference/reliability). Confirme la note Cosmos.
- [FAIT VÉRIFIÉ] Vercel : intégration officielle sur la Marketplace, variable `FAL_KEY` — [doc Vercel](https://fal.ai/docs/examples/integrations/vercel.md) ; route proxy pour garder la clé côté serveur — [index de la doc, guide Next.js](https://fal.ai/docs/llms.txt). Pas de propos sur la durée des fonctions.
- [FAIT VÉRIFIÉ] Durée de vie des URL, **contradiction dans la doc de fal** : « forever and publicly readable if not configured » sur les [en-têtes](https://fal.ai/docs/documentation/model-apis/common-parameters) ; « available for at least 7 days by default » dans la [FAQ](https://fal.ai/docs/model-apis/faq) ; « Configurable », sans défaut, sur la [page de conservation](https://fal.ai/docs/documentation/model-apis/media-expiration).
- [FAIT VÉRIFIÉ] Précédent : « On June 1st, 2026, any legacy CDN object not accessed in the past 6 months will be deleted » — [changelog](https://fal.ai/docs/changelog.md).
- [FAIT VÉRIFIÉ] Clés : préréglages de permissions depuis le 2026-10-09, anciennes clés toujours valides — [changelog](https://fal.ai/docs/changelog.md).

### Inferences
- [DÉDUCTION] Un webhook sur une URL qui redirige (apex vers www, barre finale) échoue définitivement à cause de la règle 3xx. L'URL enregistrée sur Vercel doit être exacte, ce qui compte aussi au passage à l'URL publique du site.
- [DÉDUCTION] File + webhook évite le problème de la durée des fonctions Vercel pour des vidéos longues. Les appels directs à `fal.run` sont à éviter : pas de reprise, et l'incident du 2026-09-04 les visait précisément.
- [DÉDUCTION] Sans idempotence côté fal, un envoi répété après un délai d'attente réseau peut créer et facturer deux générations. La protection doit être côté Cosmos.
- [DÉDUCTION] Le secours activé par défaut peut, en cas de panne, produire une sortie sur un autre endpoint. Prix et qualité ne sont pas documentés dans les pages lues ; à évaluer pour les presets validés sur un modèle précis.
- [DÉDUCTION] Quelle que soit la bonne réponse sur la durée de vie, télécharger les résultats dans le stockage de Cosmos reste la seule option sûre.

### Gaps
- [NON VÉRIFIÉ] Intervalles de reprise des webhooks (« increasing backoff » seulement), taille maximale d'un webhook, durée réelle des URL par défaut pour un compte non configuré, liste des endpoints avec secours.
- [NON VÉRIFIÉ] Compatibilité entre une entrée en ACL privée et un modèle partenaire : non documentée.

## Rapidité d'accès aux nouveaux modèles

### Takeaway
fal est très rapide : le jour même pour les modèles Google, quelques jours pour Kling 4.0 et Seedance 2.5. Réserve importante : les dates de lancement de Seedance sont confuses, et aucune politique de dépréciation n'est publiée.

### Cited Findings
| Modèle | Sortie officielle | Date sur fal | Écart ([DÉDUCTION]) |
|---|---|---|---|
| Nano Banana 2.1 | 2026-10-06 ([résumé de sources multiples, ex. Android Headlines](https://www.androidheadlines.com/?p=1317314), [NON VÉRIFIÉ] sur annonce Google) | 2026-10-06 15:47 UTC ([registre public](https://api.fal.ai/v1/models?endpoint_id=google/nano-banana-2.1)) [FAIT VÉRIFIÉ] | J+0 |
| Nano Banana 2 | 2026-02-26 ([Bloomberg](https://www.bloomberg.com/news/articles/2026-02-26/google-unveils-faster-version-of-viral-ai-image-tool-nano-banana)) | 2026-02-26 16:08 UTC ([registre](https://api.fal.ai/v1/models?endpoint_id=fal-ai/nano-banana-2)) [FAIT VÉRIFIÉ] | J+0 |
| Kling 4.0 | 2026-10-15 ([communiqué du 2026-10-19](https://bernama.com/en/press/news.php?id=2622471)) ; API officielle le 2026-10-22 ([ToolNavs](https://toolnavs.com/fr/article/2830-kling-40-api-opens-to-all-customers-as-fal-and-third-party-platforms-move-in), agrégateur) | Fiche créée le 2026-10-16 15:18 UTC, modifiée le 2026-10-23 ([registre](https://api.fal.ai/v1/models?endpoint_id=kling/v4/text-to-video)) ; disponibilité publique annoncée le 2026-10-23 (ToolNavs) | J+1 (fiche), J+8 du modèle et J+1 de l'API (public) |
| Seedance 2.5 | Présenté le 2026-06-23, lancé le 2026-07-31, Volcano Engine le 2026-08-07 (résumés de recherche, [NON VÉRIFIÉ]) | Message de [fal sur X](https://x.com/fal/status/2086927528032145450) : 2026-08-10 21:27 UTC ; [compte tiers](https://x.com/AIMIRAI46487/status/2085634303921451120) : 2026-08-07 ; dates décodées de l'identifiant des messages | environ J+7 à J+10 du lancement, J+0 à J+3 de Volcano Engine |
| Kling 3.0 / O3 | Janvier ou février 2026, non vérifié | 2026-02-04 ([blog fal](https://blog.fal.ai) ; [registre](https://api.fal.ai/v1/models?endpoint_id=fal-ai/kling-video/o3/standard/video-to-video/edit)) | non calculable |
| H3 Max | non vérifié | text-to-video 2026-08-23, recast 2026-10-01 ([registre](https://api.fal.ai/v1/models?endpoint_id=minimax/h3-max/text-to-video&endpoint_id=minimax/h3-max/recast)) | non calculable |

- [FAIT VÉRIFIÉ] Dépréciations : pas de page de politique dans l'[index de la doc](https://fal.ai/docs/llms.txt). Un suivi tiers relève Veo 3 et Veo 3 Fast dépréciés le 2026-08-12 et une date de fin au 2026-11-17 pour Veo 3.1 — [UsagePricing](https://www.usagepricing.com/blueprint/activity/fal-ai-2026-10-22-flux-3-image-price-doubles).
- [FAIT VÉRIFIÉ] `fal.ai/seedance-2.5` (mise à jour le 2026-10-21) ne liste plus que les endpoints `/us/`, annonce une « separate pricing » et mentionne une « eligibility » dans son formulaire — [page](https://fal.ai/seedance-2.5). Le guide du 2026-08-18 liste les endpoints sans `/us/` — [guide](https://fal.ai/learn/tools/how-to-access-seedance-2-5-on-fal). La page `/us/` affiche les mêmes chiffres — [page US](https://fal.ai/models/bytedance/seedance-2.5/us/reference-to-video).
- [FAIT VÉRIFIÉ] Le registre public ne renvoie aucune métadonnée pour `bytedance/seedance-2.5/reference-to-video`, alors que sa [page](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video) et son [schéma](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedance-2.5/reference-to-video) répondent — [registre](https://api.fal.ai/v1/models?endpoint_id=bytedance/seedance-2.5/reference-to-video).

### Inferences
- [DÉDUCTION] La rapidité est un vrai atout, mais la date de fiche ne prouve pas une ouverture à tous : pour Kling 4.0, la fiche précède de 7 jours l'annonce publique.
- [DÉDUCTION] L'endpoint Seedance 2.5 sans `/us/` de Cosmos semble moins mis en avant et pourrait être hébergé ailleurs ou soumis à conditions. À vérifier avant d'y envoyer des photos clients.
- [DÉDUCTION] Les gros modèles changent vite (Veo 3 après environ un an). Un preset figé sur un endpoint précis doit prévoir son remplacement.

### Gaps
- [NON VÉRIFIÉ] Dates officielles H3 et Kling 3 (recherche épuisée), annonce fal de Kling 4.0, hébergement et disponibilité de l'endpoint Seedance sans `/us/`.

## Conditions : usage commercial, propriété, entraînement, fichiers, DPA, sous-traitants, localisation, SOC 2

### Takeaway
Les notes de Cosmos sur les fichiers sont confirmées : publics par défaut, en-têtes valides. Les conditions contiennent des points faibles : aucune cession explicite des sorties, promesse de non-entraînement limitée, transfert des données aux partenaires, localisation non précisée.

### Cited Findings
**Fichiers et conservation**
- [FAIT VÉRIFIÉ] « Public by default -- anyone with the URL can download » — [doc CDN](https://fal.ai/docs/documentation/model-apis/fal-cdn). Par défaut « allow » pour les nouveaux comptes, ACL `allow`, `forbid` (403) ou `hide` (404), `default: "forbid"` pour tout rendre privé, uniquement sur les URL `v3b.fal.media`, lecture par jeton court ou URL signée de 7 jours au plus — [doc ACL](https://fal.ai/docs/documentation/model-apis/file-access-controls).
- [FAIT VÉRIFIÉ] `X-Fal-Store-IO` : défaut « stored for 90 days », `"0"` pour désactiver. `X-Fal-Object-Lifecycle-Preference` : « forever and publicly readable if not configured » — [en-têtes](https://fal.ai/docs/documentation/model-apis/common-parameters). `expiration_duration_seconds`, `initial_acl`, « Expired files are permanently deleted » ; ZDR désactivée par défaut, journaux applicatifs non couverts — [conservation](https://fal.ai/docs/documentation/model-apis/media-expiration). Un résumé de recherche signale 30 jours sur d'autres pages ; les pages lues ce jour indiquent 90.
- [FAIT VÉRIFIÉ] `lifecycle.expiresIn` existe à l'envoi (valeurs énumérées ou secondes, défaut non indiqué) — [SDK JS](https://fal.ai/docs/reference/client-libraries/javascript/storage). La valeur `"1d"` de la note Cosmos n'est pas lisible sur l'extraction.
- [FAIT VÉRIFIÉ] L'API de suppression efface les données et sorties d'une requête terminée, mais **pas les fichiers d'entrée** — [conservation](https://fal.ai/docs/documentation/assets/retention) ; [doc](https://fal.ai/docs/model-apis/data-retention).

**Propriété et usage commercial**
- [FAIT VÉRIFIÉ] Aucune clause n'attribue expressément la propriété des sorties ; §6(b) le client possède ses entrées ; §4(c) pas de garantie d'originalité, « at their own risk » ; §4(b) usage possible dans une solution client avec utilisateurs finaux ; §15(a) garantie du client en cas d'atteinte à la vie privée ou au droit à l'image — [CGU du 2026-09-08](https://fal.ai/terms).
- [FAIT VÉRIFIÉ] CGU API : la sortie peut ne pas ouvrir de droits de propriété intellectuelle — [CGU API](https://fal.ai/legal/api-services). Badge « Commercial use » sur les pages [Kling 4](https://fal.ai/models/kling/v4/reference-to-video) et [Seedance US](https://fal.ai/models/bytedance/seedance-2.5/us/reference-to-video).
- [FAIT VÉRIFIÉ] Politique d'usage : §3.3 interdit l'usurpation via nom, image ou voix sans consentement ; §7.1(v) et (vi) visent l'image d'une personne et les données biométriques ; §9.2 impose le contrôle d'âge légalement requis ; suspension possible — [AUP](https://fal.ai/legal/acceptable-use-policy). Suspension sans préavis si nécessaire pour protéger les services — [CGU §10(c)](https://fal.ai/terms).

**Entraînement et partenaires**
- [FAIT VÉRIFIÉ] §2.4 : « Company will not use Client Content to create, train, develop (directly or indirectly) Company's products or services », sauf pour les API tierces marquées « Pending Enterprise Ready » (« Excluded Models »), auxquelles « the DPA » et les obligations de sécurité ne s'appliquent pas. §2.3 : « Client Content will be transferred to such a third party » — [CGU API](https://fal.ai/legal/api-services).
- [FAIT VÉRIFIÉ] Aucun badge « Pending Enterprise Ready » sur les pages [Kling 4 reference](https://fal.ai/models/kling/v4/reference-to-video) et [Seedance US](https://fal.ai/models/bytedance/seedance-2.5/us/reference-to-video), qui portent « Partner ».
- [FAIT VÉRIFIÉ] Usage Data « based on or derived from Customer Input », anonymisées ou agrégées, utilisables pour « design, develop, and offer Company products, services, and AI models » — [CGU §6(c)](https://fal.ai/terms). La phrase « We never train our models on our enterprise customers' data » vise les clients entreprise — [page entreprise](https://fal.ai/enterprise).

**DPA, sous-traitants, localisation, certification**
- [FAIT VÉRIFIÉ] DPA mis à jour le 2026-07-31, intégré par référence aux CGU. SCC module 2, IDTA britannique, adaptation suisse. Préavis de 15 jours pour un nouveau sous-traitant, objection sous 10 jours. Conservation jusqu'à la fin du contrat. Pas de lieu indiqué. §3.1 : fal « may procure audits » SOC 2 Type II ou ISO 27001 — [DPA](https://fal.ai/legal/data-processing-addendum).
- [FAIT VÉRIFIÉ] « servers located in the United States and other countries » ; entité « fal - Features & Labels Inc. » ; politique du 2026-07-22 — [confidentialité](https://fal.ai/privacy).
- [FAIT VÉRIFIÉ] « fal is SOC 2 compliant with a public trust portal » — [blog du 2025-09-30](https://blog.fal.ai/fal-is-now-available-through-google-cloud-marketplace/). « SOC 2 » listé sur la [page entreprise](https://fal.ai/enterprise). [trust.fal.ai](https://trust.fal.ai) et [sa liste de sous-traitants](https://trust.fal.ai/subprocessors) ne rendent que leur titre à l'extraction.
- [FAIT VÉRIFIÉ] Droit californien, arbitrage AAA, renonciation possible sous 30 jours — [CGU §18-19](https://fal.ai/terms).

### Inferences
- [DÉDUCTION] Les photos clients envoyées à un modèle partenaire sont transmises à ce partenaire (Kuaishou pour Kling, ByteDance pour Seedance, Google pour Nano Banana). La promesse de suppression sous 7 jours de `/confidentialite` dépend donc aussi de la politique de ces tiers, non couverte ici.
- [DÉDUCTION] Avec la clause d'exception et le §6(c), « fal n'entraîne pas sur vos données » n'est vrai qu'avec réserves : données anonymisées autorisées, modèles exclus possibles, et partenaires hors du périmètre de la phrase.
- [DÉDUCTION] Pour Cosmos, qui anime la photo de personnes réelles, le consentement et le contrôle d'âge relèvent contractuellement de Cosmos, qui garantit fal en cas de litige.
- [DÉDUCTION] SOC 2 : le DPA ne l'affirme pas et le type (I ou II) reste inconnu. Une demande de rapport serait nécessaire pour s'y fier.
- [DÉDUCTION] Le fichier d'entrée échappe à l'API de suppression. Seuls `lifecycle.expiresIn` à l'envoi ou un stockage privé hors fal limitent sa durée, ce qui appuie la méthode déjà utilisée par les presets.

### Gaps
- [NON VÉRIFIÉ] Liste des sous-traitants et lieux de traitement, type et date du rapport SOC 2, conditions des partenaires (Kling, ByteDance), hébergement réel des endpoints sans `/us/`, modèles actuellement classés « Pending Enterprise Ready » (aucune liste trouvée).

## Stabilité : financement, revenus, clients, incidents, support

### Takeaway
La solidité financière paraît forte, mais les chiffres récents restent des fuites non confirmées. La disponibilité publiée est bonne, sans post-mortem. Le support en libre-service est le point le plus faible.

### Cited Findings
- [FAIT VÉRIFIÉ] Série D de 140 M$ menée par Sequoia, avec Kleiner Perkins et Nvidia, le 2025-12-09 ; valorisation de 4,5 Md$ selon Bloomberg ; revenus au-delà de 200 M$ en octobre 2025 ; clients Adobe, Shopify, Canva, Quora — [TechCrunch via Yahoo](https://finance.yahoo.com/news/fal-nabs-140m-fresh-funding-222133234.html). Montant confirmé par fal, sans valorisation — [blog fal](https://blog.fal.ai).
- [NON VÉRIFIÉ] Discussions de 300 à 350 M$ à environ 8 Md$, revenus annualisés de 400 M$, selon The Information — [Dealroom du 2026-03-22](https://dealroom.co/news/126961-fal-targets-8b-valuation-in-new-raise-as-ai-inference-revenue-doubles-to/). Un résumé de recherche indique la clôture non confirmée ([Enterprise DNA](https://enterprisedna.co/resources/ai-map/company/fal)).
- [NON VÉRIFIÉ] Discussions à 15 Md$, peut-être 17 à 20 Md$, à un stade précoce, revenus annualisés de 800 M$, selon The Information (25 septembre) ; ni fal ni Fireworks n'ont confirmé — [Sovereign Magazine](https://sovereignmagazine.com/article/fal-fireworks-inference-valuations-15b-30b).
- [NON VÉRIFIÉ] Titre sans date ni contenu vu dans les liens de la [page Yahoo](https://finance.yahoo.com/news/fal-nabs-140m-fresh-funding-222133234.html) : valorisation doublée à 16 Md$. La recherche de confirmation n'a pas pu être faite.
- [FAIT VÉRIFIÉ] « over 2,500,000 developers », logos Canva, Suno, World Labs, Adobe, Autodesk, Shopify, Krea, HeyGen, Quora, Lightricks (déclaratif) — [page entreprise](https://fal.ai/enterprise).
- [FAIT VÉRIFIÉ] Statut : Model API à 99,97 %, Serverless à 100 %, avec 99,91 % en septembre 2026 — [statut](https://status.fal.ai) ; [historique](https://status.fal.ai/history).
- [FAIT VÉRIFIÉ] Incidents visibles : 2026-09-04, « fal.run is unreachable for synchronous requests », panne majeure de 30 min, cause non donnée ; 2026-09-29, lenteur de 18 min, cause non donnée ; aucun en octobre et novembre — [historique](https://status.fal.ai/history). Aucun post-mortem sur la page 1 du [blog](https://blog.fal.ai).
- [FAIT VÉRIFIÉ] Support : « 24/7 priority » en entreprise, sans délai de réponse — [page entreprise](https://fal.ai/enterprise). L'[index de la doc](https://fal.ai/docs/llms.txt) n'a pas de page support, seulement Discord et le statut. `support@fal.ai` est le contact donné pour le commercial — [tarifs](https://fal.ai/pricing).
- [FAIT VÉRIFIÉ] Trustpilot : 2,5/5 sur 34 avis, 68 % à une étoile, 13 % de réponses aux avis négatifs, plus d'un mois de délai habituel. Deux avis récents (2026-09-21 et 2026-11-02) décrivent un compte bloqué après un ajout de fonds, sans réponse du support ; d'autres sont positifs — [Trustpilot](https://ca.trustpilot.com/review/fal.ai).

### Inferences
- [DÉDUCTION] Le risque de disparition à court terme paraît faible, compte tenu des investisseurs et des revenus rapportés. Le risque réel est plutôt commercial : hausses de prix sans préavis et priorité aux grands comptes. Marges et consommation de trésorerie ne sont pas publiques.
- [DÉDUCTION] La page de statut est globale. Une panne d'un seul partenaire (Kling, ByteDance) peut ne pas y figurer : Cosmos doit surveiller son propre taux d'échec par modèle.
- [DÉDUCTION] Pour un compte en libre-service, compter sur un support lent. L'échantillon Trustpilot est petit et biaisé vers les mécontents, mais la répétition des blocages de compte renforce le risque identifié sur les crédits.

### Gaps
- [NON VÉRIFIÉ] Clôture des tours à 8 ou 15 Md$, date et réalité du titre à 16 Md$, rentabilité, délais de réponse par palier, incidents antérieurs à septembre 2026 (l'historique lu ne remonte pas au-delà).

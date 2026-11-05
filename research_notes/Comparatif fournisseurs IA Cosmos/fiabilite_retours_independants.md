# Fiabilité et retours indépendants : fal.ai et ses alternatives, au 2026-11-04

Conventions. Toutes les pages ont été lues le 2026-11-04 sauf mention contraire ; la date indiquée est celle du document ou du témoignage.
- **[FAIT VÉRIFIÉ]** : j'ai lu la source primaire. Pour un témoignage (issue GitHub, avis Trustpilot, post de forum), le fait vérifié est l'existence du témoignage, pas la véracité de son contenu.
- **[DÉDUCTION]** : raisonnement ou calcul de ma part à partir de faits cités.
- **[NON VÉRIFIÉ]** : vu seulement en extrait de recherche, ou affirmation sans preuve, ou source intéressée impossible à recouper.

Limites de cette recherche. Reddit est refusé par l'outil de recherche, web.archive.org est bloqué, X et Discord n'ont pas été consultés, Pingoru répond 403, les graphiques d'Artificial Analysis ne sont pas lisibles par mon outil (JavaScript), et le quota de recherche web s'est épuisé en fin de parcours. L'absence de retour Reddit, X ou Discord dans ces notes est donc une limite de méthode, pas une absence de plaintes. Aucune génération, aucun appel facturable, aucun compte créé.

## Benchmarks indépendants de latence et de débit : qui, quand, comment, et existe-t-il une comparaison neutre par fournisseur ?

### Takeaway
Aucune comparaison neutre fournisseur par fournisseur n'a été trouvée pour Kling 4.0 : le modèle est absent des classements vidéo d'Artificial Analysis. Le seul ordre de grandeur indépendant est par modèle, tous hébergeurs confondus : environ 4 à 5 minutes pour Kling 4.0, environ 3,5 minutes pour Seedance 2.5, environ 22 s pour Nano Banana 2.1.

### Cited Findings

**Artificial Analysis (AA), la seule méthode neutre documentée**
- **[FAIT VÉRIFIÉ]** Méthode : réglages par défaut 1080p, 24 i/s, 10 s, 16:9 ; texte-vers-vidéo lancé toutes les 2 heures, environ 36 échantillons par hébergeur sur 3 jours ; chiffre principal = médiane des mesures **réussies** sur 3 jours, avec p05 à p95 ; chrono du premier appel au téléchargement (file d'attente incluse) ; exécuté depuis Google Cloud Run us-central1. AA déclare : « No compensation is received from any providers for listing or for favorable outcomes ». — [AA, méthodologie vidéo](https://artificialanalysis.ai/methodology/video)
- **[FAIT VÉRIFIÉ]** Limite décisive de cette même page : « seuls les modèles texte-vers-vidéo et image-vers-vidéo **silencieux** » ont une mesure de latence ; les bancs audio et l'édition silencieuse ne sont classés que sur la qualité. — [AA, méthodologie vidéo](https://artificialanalysis.ai/methodology/video)
- **[FAIT VÉRIFIÉ]** AA se contredit : sa page fournisseurs décrit une mesure en 720p, 5 s, alors que la méthodologie annonce 1080p, 10 s. — [AA, comparateur de fournisseurs](https://artificialanalysis.ai/video/providers)
- **[FAIT VÉRIFIÉ]** Le comparateur par fournisseur existe, mais la capture texte affiche « 0 of 0 providers » : les graphiques ne sont pas lisibles par mon outil. Je n'ai donc aucun chiffre AA par hébergeur. — [AA, comparateur de fournisseurs](https://artificialanalysis.ai/video/providers)
- **[FAIT VÉRIFIÉ]** Kling 4.0 est absent des classements texte-vers-vidéo et image-vers-vidéo ; seuls Kling 3.0 et Kling 3.0 Omni y figurent (sans date de mise à jour précise). Seedance 2.5 y figure sous le nom « Dreamina Seedance 2.5 » à 34,12 $/min. — [AA, texte-vers-vidéo](https://artificialanalysis.ai/video/leaderboard/text-to-video) ; [AA, image-vers-vidéo](https://artificialanalysis.ai/video/leaderboard/image-to-video)
- **[FAIT VÉRIFIÉ]** Pour l'image, AA publie une médiane sur 3 jours, téléchargement inclus. La page Nano Banana Pro cite fal.ai et Google parmi les fournisseurs, sans chiffre lisible, et ne mentionne pas Nano Banana 2.1. Modèle différent de celui de Cosmos. — [AA, Nano Banana Pro](https://artificialanalysis.ai/image/models/gemini_nano-banana-pro)

**Design Arena : données fraîches, méthode inconnue, pas de comparaison d'hébergeurs**
- **[FAIT VÉRIFIÉ]** Colonne « Time » au 2026-11-04 : Kling 4.0 278,3 s ; Seedance 2.5 206,8 s ; MiniMax H3 219,0 s. Le site se présente comme un benchmark participatif. Il ne compare pas les hébergeurs. — [Design Arena, vidéo](https://www.designarena.ai/leaderboard/video)
- **[FAIT VÉRIFIÉ]** Image au 2026-11-04 : Nano Banana 2.1 22,0 s (5 660 duels) ; Nano Banana 2 18,2 s (91 596 duels) et 23,8 s en 2K (89 345 duels). — [Design Arena, image](https://www.designarena.ai/leaderboard/image)
- **[FAIT VÉRIFIÉ]** La page de méthodologie que j'ai tentée répond 404 : hébergeur utilisé, type de moyenne et traitement des échecs restent inconnus. — [Design Arena, méthodologie](https://www.designarena.ai/methodology)
- **[NON VÉRIFIÉ]** Le 2026-10-19, Seedance 2.5 aurait été à 245,5 s sur Design Arena (rapporté par un fournisseur). — [Wireflow](https://www.wireflow.ai/blog/best-ai-inference-providers)

**Mesures publiées par des revendeurs ou concurrents (biais déclarés)**
- **[FAIT VÉRIFIÉ, source intéressée]** Sandbase, routeur qui revend l'accès, 2026-10-23, **un seul essai par point d'accès**, 720p : texte-vers-vidéo 5 s en 339 s ; image-vers-vidéo 5 s en 248 s ; référence-vers-vidéo 5 s en 153 s ; édition vidéo 5,04 s en 69 s ; texte-vers-vidéo 30 s en environ 498 s. L'auteur écrit « a first reading, not a benchmark ». Un processus de suivi est mort sur une erreur TLS alors que la tâche continuait côté serveur. L'hébergeur en amont n'est pas nommé. — [Sandbase](https://blog.sandbase.ai/kling-4-0-api-guide-2026/)
- **[NON VÉRIFIÉ]** LTX (concurrent) annoncerait 398 s pour Kling 3.0 Pro, 10 s, de bout en bout sur fal.run ; ma lecture de la page a échoué, chiffre vu en extrait seulement, autre modèle. — [LTX](https://ltx.io/blog/ai-video-model-speed-comparison)
- **[NON VÉRIFIÉ]** Atlas Cloud (concurrent) annonce 15 à 30 s de « réponse API moyenne » pour Kling 3.0, sans méthode. Écart d'un facteur 13 ou plus avec LTX : ces tableaux ne sont pas utilisables. — [Atlas Cloud](https://www.atlascloud.ai/blog/case-studies/Top-5-ai-video-apis-compared-speed-latency-and-cost-per-second-2026)
- **[NON VÉRIFIÉ]** Wireflow attribue à AA pour MiniMax H3 : environ 12 s chez fal contre environ 2 minutes sur l'API de MiniMax (médiane sur 3 jours au 2026-10-19). Il précise que AA qualifie le point d'accès de fal de « version modifiée » : ce n'est donc pas une comparaison du même modèle. Autre modèle que ceux de Cosmos. — [Wireflow](https://www.wireflow.ai/blog/best-ai-inference-providers)
- **[NON VÉRIFIÉ]** ModelsLab (concurrent) annonce 30 à 60 s de démarrage à froid chez Replicate. — [ModelsLab](https://modelslab.com/ai-api-latency-comparison)
- **[FAIT VÉRIFIÉ, ancien, autre modèle]** Un utilisateur de Hacker News mesurait environ 4 s par génération pour Flux Kontext Pro sur Replicate (2025-05-29). — [HN, minimaxir](https://news.ycombinator.com/item?id=44129188)

### Inferences
- **[DÉDUCTION]** Deux sources sans lien (Design Arena 278 s, Sandbase 153 à 339 s pour 5 s) convergent : Kling 4.0 se compte en minutes, pas en secondes. Tout flux Cosmos doit rester asynchrone. L'hébergeur précis de ces mesures reste inconnu.
- **[DÉDUCTION]** AA ne mesure que les réussites : même lisible, sa médiane ne dit rien du taux d'échec, et un fournisseur qui échoue souvent peut y paraître rapide.
- **[DÉDUCTION]** Kling 4 génère toujours du son d'après la note interne Cosmos [reference-kling4-limits, 2026-11-02]. AA ne mesure la latence que des modèles silencieux et n'en mesure aucune pour l'édition. Si cette règle reste en vigueur, le point d'accès `kling/v4/video-to-video/edit`, cœur de Cosmos, n'aura probablement jamais de chiffre de latence AA.
- **[DÉDUCTION]** Le prix de Seedance 2.5 chez AA (34,12 $/min, soit 2,84 $ pour 5 s) correspond au tarif BytePlus de 2,84 $ rapporté par [useapi.net](https://useapi.net/docs/articles/seedance-2-api-pricing) : bon recoupement sur le prix officiel.

### Gaps
- Aucun chiffre lisible par hébergeur pour Seedance 2.5 et Nano Banana 2.1. Il suffit d'ouvrir gratuitement les pages AA dans un navigateur pour les lire.
- Aucune mesure de débit (concurrence réelle soutenue) trouvée, pour aucun fournisseur et aucun modèle Cosmos.
- Rien de mesuré pour Kling 4.0 sur l'API officielle de Kling, ni pour Runware, WaveSpeed, Kie.ai, Novita, Segmind.

## Taux d'échec, générations bloquées, délais, filtres abusifs sur photos de personnes réelles, et facturation des échecs

### Takeaway
Aucun taux d'échec mesuré et publié n'existe pour ces services : seules des promesses et des témoignages sont disponibles. Le fait le mieux établi est structurel : BytePlus restreint techniquement Seedance 2.5 sur les visages réels, ce qui contrarie directement l'usage de Cosmos.

### Cited Findings

**Ce que disent les fournisseurs et ce que rapporte le terrain sur la facturation des échecs**

| Fournisseur | Règle publiée | Terrain |
|---|---|---|
| fal | **[FAIT VÉRIFIÉ]** « Server errors (HTTP 500+) are never charged » ; « Client-side errors like invalid inputs (HTTP 422) may still be charged » si un GPU a déjà tourné ; `content_policy_violation` est « a non-retryable 422 error ». [FAQ fal](https://fal.ai/docs/documentation/model-apis/faq) | **[FAIT VÉRIFIÉ, anecdote]** « Sad seeing it take $0.05 and give me an error » (2026-02-20, nouveaux modèles texte-vers-image, cause non précisée). [HN, nitroedge](https://news.ycombinator.com/item?id=47082181) |
| Replicate | **[FAIT VÉRIFIÉ, de seconde main]** « For all models, if a run fails, we don't charge you » ; annulation après démarrage facturée au temps écoulé ; modèles privés facturés au temps actif. Citation de la page de facturation au 2026-09-02. [Guide APIMART](https://dev.to/lucas_apimart/failed-ai-api-request-billing-audit-33nm) | **[FAIT VÉRIFIÉ, anecdote]** « the api was not responding, but they were still charging for hours » (2025-12-05). [Trustpilot](https://www.trustpilot.com/review/replicate.com) |
| Kie.ai | **[FAIT VÉRIFIÉ]** « failed tasks are never charged ». [Tarifs Kie](https://kie.ai/pricing) | **[FAIT VÉRIFIÉ, avis non vérifiés]** Plusieurs avis : blocage à 99 % et crédits consommés, dont « environ une génération sur cinq » (2026-10-02). Réponse de Kie : crédits rendus automatiquement. [Trustpilot](https://www.trustpilot.com/review/kie.ai). À l'opposé, « failed tasks weren't billed » lors d'un essai de deux semaines. [AI Softing, 2026-07-22](https://aisofting.com/kie-ai-review/) |
| WaveSpeed | Non lu directement | **[FAIT VÉRIFIÉ, avis non vérifié]** Facturation de générations échouées (2026-04-23). [Trustpilot](https://www.trustpilot.com/review/wavespeed.ai) |
| Google Gemini | **[FAIT VÉRIFIÉ]** La page de tarifs ne dit pas si une requête bloquée est facturée (les 1 809 derniers caractères n'ont pas été lus). [Tarifs Gemini](https://aistudio.google.com/docs/pricing) | **[FAIT VÉRIFIÉ, cas unique]** Un refus `IMAGE_SAFETY` sur `gemini-nano-banana-2.1` renvoie HTTP 200, 6 990 jetons d'entrée, 0 jeton de sortie, pas d'image. [Forum Google, 2026-10-26](https://discuss.ai.google.dev/t/possible-false-positive-image-safety-on-an-image-edit-gemini-api-gemini-nano-banana-2-1/195094) |
| Kling officiel | **[NON VÉRIFIÉ]** Sources contradictoires : pas de crédit consommé sur refus ([AnyCap](https://anycap.ai/page/en-US/ai/kling-ai-nsfw-policy-developers)) ; crédits consommés au refus de « couche 3 » ([Atlas Cloud](https://www.atlascloud.ai/blog/guides/kling-ai-nsfw-policy)) ; échec technique « not stated », modération facturée ([Higgsfield, sans lien vers ses sources](https://higgsfield.ai/blog/ai-video-api-pricing-vs-subscriptions)). Trois sources intéressées. | **[FAIT VÉRIFIÉ, avis sur l'appli grand public, pas l'API]** Crédits débités avant de voir le résultat, faux positifs des filtres. [Trustpilot](https://www.trustpilot.com/review/klingai.com) |
| BytePlus, Runware, Novita, Segmind, MiniMax | Rien de fiable trouvé | Rien de fiable trouvé |

**Visages réels et filtres**
- **[FAIT VÉRIFIÉ]** BytePlus, annonce officielle de Seedance 2.5 (2026-08-06) : « Technical controls to restrict making videos from images or videos that contain real faces ». Exception : les clients **vérifiés** peuvent passer par une « real-person verification and likeness authorization » dans la console ModelArk. BytePlus n'est pas disponible aux États-Unis. — [Blog BytePlus](https://www.byteplus.com/blog/dreamina-seedance2-5)
- **[FAIT VÉRIFIÉ, Seedance 2.0]** Doc ModelArk : générer à partir d'images de personnes réelles n'est pas pris en charge, sauf procédure de consentement par groupe d'actifs. — [Doc ModelArk](https://docs.byteplus.com/en/docs/modelark/2223965) ; [Actifs de personnes réelles](https://docs.byteplus.com/docs/ModelArk/upload-real-person-portrait-assets) (vus en extrait de recherche)
- **[NON VÉRIFIÉ]** useapi.net (vendeur d'un contournement) affirme que le travail sur visages réels exigerait un contrat d'entreprise à partir de 14 000 $/an. — [useapi.net](https://useapi.net/docs/articles/seedance-2-api-pricing)
- **[FAIT VÉRIFIÉ, deux témoins, Seedance 2.0]** Dans Adobe Firefly : « The reference content cannot include real human faces with this model » sur un visage que l'auteur dit généré par IA (2026-07-04), confirmé par un second utilisateur (2026-10-02). Pas de réponse d'Adobe. — [Communauté Adobe](https://community.adobe.com/questions-404/seedance-dont-work-correctly-detects-human-face-and-is-not-human-face-is-created-with-ia-1630600)
- **[FAIT VÉRIFIÉ, avis non vérifié]** Replicate : « Every single request was rejected by moderation » sur des vidéos, crédits restés bloqués (2026-10-09). — [Trustpilot](https://www.trustpilot.com/review/replicate.com)
- **[NON VÉRIFIÉ]** Sur Replicate, l'erreur E005 sur Seedance viendrait souvent de la résolution d'entrée et non du contenu (blog SEO). — [AIMusicVideo](https://www.aimusicvideo.com/blog/seedance-e005-input-flagged-as-sensitive-fix)
- **[NON VÉRIFIÉ, extrait de recherche]** Une tâche `nano-banana-2.1` terminée en échec E005 « flagged as sensitive » est rapportée dans une intégration tierce ; le remboursement perdu est imputé à cette intégration, pas à Replicate. — [Issue Calgooon/x402 #8](https://github.com/Calgooon/x402/issues/8)
- **[FAIT VÉRIFIÉ, Nano Banana 2.1]** Faux positif présumé : 6 images de femmes présentées comme fictives, `finishReason` `IMAGE_SAFETY`, aucune note de sécurité, aucune réponse de Google. Ce n'est pas un cas de vraie personne, et l'auteur demandait une tenue courte. — [Forum Google, 2026-10-26](https://discuss.ai.google.dev/t/possible-false-positive-image-safety-on-an-image-edit-gemini-api-gemini-nano-banana-2-1/195094)
- **[NON VÉRIFIÉ, extraits de recherche, Nano Banana Pro]** Images e-commerce non explicites bloquées, `BLOCK_NONE` sans effet ; un commentateur attribue ces blocages à la détection d'une personne réelle identifiable (opinion, pas une doc). — [Forum Google, sous-vêtements](https://discuss.ai.google.dev/t/nano-banana-pro-suddenly-blocking-non-nsfw-ecommerce-underwear-images-with-image-safety-error/113109) ; [Forum Google, mode](https://discuss.ai.google.dev/t/nano-banana-pro-non-nsfw-fashion-images-blocked-due-to-aggressive-image-safety-filtering/121805)
- **[FAIT VÉRIFIÉ, avis non vérifié, appli grand public]** Kling : faux positifs sur des images non explicites, 11 800 crédits expirés sans usage (2026-10-20). — [Trustpilot](https://www.trustpilot.com/review/klingai.com)
- **[FAIT VÉRIFIÉ, avis non vérifié]** WaveSpeed : nouveaux filtres introduits sans préavis (2025-12-13). — [Trustpilot](https://www.trustpilot.com/review/wavespeed.ai)

**Blocages et délais**
- **[FAIT VÉRIFIÉ, un seul rapport, autres modèles]** fal : 4 requêtes `ai-avatar` et `flashtalk` restées en `IN_QUEUE`, position 0, plus de 15 minutes le 2026-05-15, sans erreur ni échec. L'auteur n'a pas pu savoir si c'était facturé, l'API d'usage répondant 403. — [Issue fal #1027](https://github.com/fal-ai/fal/issues/1027)
- **[FAIT VÉRIFIÉ, extrait de la doc officielle]** Chez fal, une requête en file n'est jamais abandonnée et attend qu'un exécutant se libère ; `start_timeout` ne couvre que l'attente avant démarrage. — [Doc fal, file d'attente](https://docs.fal.ai/documentation/model-apis/inference/queue)
- **[FAIT VÉRIFIÉ, un seul rapport, Nano Banana 2]** fal : après révocation d'une clé, 6 requêtes `fal-ai/nano-banana-2` restent `IN_PROGRESS` plus de 30 minutes et occupent 6 emplacements sur 10, sans moyen de les annuler. Ouverte le 2026-03-24, toujours ouverte. — [Issue fal #939](https://github.com/fal-ai/fal/issues/939)
- **[FAIT VÉRIFIÉ, reproduction sans réseau]** SDK fal : `queue.submit()` ignore `retry: { maxRetries: 0 }` et renvoie le POST après une erreur de transport en `@fal-ai/client` 1.10.1. Risque de doublon si le serveur avait accepté le premier envoi. L'auteur précise n'avoir prouvé ni doublon réel ni double facturation. — [Issue fal-js #238](https://github.com/fal-ai/fal-js/issues/238)
- **[FAIT VÉRIFIÉ]** Cosmos déclare `"@fal-ai/client": "^1.10.1"` dans `package.json`, donc au moins la version signalée.
- **[FAIT VÉRIFIÉ, un seul rapport, Nano Banana Pro, ancien]** Google : moins d'une minute par image en test, 7 à 8 minutes en production avec des 503 « The model is overloaded », reproduit sur Vertex AI ; aucune réponse de Google (2026-01-23). — [Forum Google](https://discuss.ai.google.dev/t/naono-banana-pro-api-response-delays-and-503-errors-in-production/118070)
- **[NON VÉRIFIÉ]** Les revendeurs annoncent 60 à 100 s ou plus en cas de surcharge pour Nano Banana Pro et conseillent un second modèle en secours. Ils vendent l'alternative. — [Apiyi](https://help.apiyi.com/en/nano-banana-pro-api-overloaded-error-solution-en.html)
- **[FAIT VÉRIFIÉ, sans chiffres]** Kie.ai : « intermittent task failures that required manual retries » en vidéo, modèle non nommé, sans décompte. — [AI Softing, 2026-07-22](https://aisofting.com/kie-ai-review/)

### Inferences
- **[DÉDUCTION]** La promesse de Kie et les plaintes ne s'excluent pas : une tâche bloquée à 99 % n'est jamais déclarée « failed », donc la règle de remboursement ne se déclenche pas. Hypothèse à tester, pas un fait établi.
- **[DÉDUCTION]** Chez fal, le 422 peut être facturé. Or la note interne Cosmos [reference-kling4-limits] indique qu'un plan de plus de 512 caractères en `multi_prompt` est accepté puis échoue en 422. Ce cas pourrait coûter de l'argent sans rien produire : à vérifier sur la facture réelle.
- **[DÉDUCTION]** Comme une requête fal n'expire jamais seule en file, l'absence de `start_timeout` côté Cosmos rendrait un blocage invisible.
- **[DÉDUCTION]** La plupart des refus signalés concernent des modèles ou contextes différents de Cosmos. On ne peut pas conclure sur le taux de refus de Kling 4.0 ou Nano Banana 2.1 avec des photos réelles de clients.

### Gaps
- Aucun taux d'échec chiffré sur échantillon suffisant, pour aucun fournisseur.
- Aucun témoignage direct trouvé sur le refus de vraies personnes avec Kling 4.0, sur aucun hébergeur.
- Je n'ai pas trouvé si Seedance 2.5 chez fal, Replicate, Kie ou WaveSpeed applique le même filtre que BytePlus, ni si l'autorisation de ressemblance est utilisable hors du compte BytePlus direct.
- Aucune confirmation officielle de Google sur la facturation d'un `IMAGE_SAFETY`.

## Historique de disponibilité : pages de statut, incidents majeurs de 2026, durée, fréquence, comparaison

### Takeaway
fal est le seul à publier un historique détaillé et complet : 17 incidents déclarés de janvier à novembre 2026. Les chiffres entre fournisseurs ne sont pas comparables, car chacun déclare lui-même, avec des périmètres différents ; davantage d'incidents publiés peut simplement signifier davantage de transparence.

### Cited Findings

**fal : incidents officiels de 2026** ([sept. à nov.](https://status.fal.ai/en-us/history/1), [juin à août](https://status.fal.ai/en-us/history/2), [mars à mai](https://status.fal.ai/en-us/history/3), [déc. à fév.](https://status.fal.ai/en-us/history/4)) **[FAIT VÉRIFIÉ]**

| Date (UTC) | Durée | Titre | Gravité |
|---|---|---|---|
| 22 janv. | 7 min | Degraded performance | Panne majeure |
| 20 fév. | 1 h 39 | DNS REST API et plateforme web (« does not affect inference ») | Panne majeure |
| 23 fév. | 35 min | Latence et erreurs sur FLUX | Panne partielle |
| 4 mars | 31 min | Errors and high latency | Panne majeure |
| 6 mars | 3 h 53 | Errors and high latency | Panne partielle |
| 6 mars | 3 h 14 | Site web et volumes persistants | Panne majeure |
| 15 mars | 12 min | Errors and high latency | Panne majeure |
| 8 avr. | 4 h 14 | Degradation (API, site, modèles officiels) | Panne majeure |
| 26 avr. | 11 min | API de modèles dégradées, téléchargements KO | Panne majeure |
| 4 mai | 40 min | Errors and high latency | Dégradé |
| 7 mai | 6 h 28 | High latency | Dégradé |
| 11 mai | 15 h 04 | Enregistrement des requêtes et métriques | Panne partielle |
| 12 mai | 1 h 16 | Taux d'erreur API élevé | Dégradé |
| 29 juin | 1 h 14 | DNS sortant des exécutants | Panne majeure |
| 20 juil. | 6 h 11 | Retard des métriques | Dégradé |
| 4 sept. | 30 min | fal.run injoignable en synchrone | Panne majeure |
| 29 sept. | 18 min | Lenteur et trafic réduit | Dégradé |

- **[FAIT VÉRIFIÉ]** Page de statut fal, fenêtre affichée : Model API 99,97 % (septembre 99,91 %, octobre et novembre 100 %). — [Statut fal](https://status.fal.ai/history)
- **[FAIT VÉRIFIÉ]** Incident du 8 avril : fal annonce une analyse détaillée à venir, sans cause publiée sur cette page. — [Incident fal du 8 avril](https://status.fal.ai/en-us/cmnpm7pgw01mgx917fzjjk8hr)
- **[FAIT VÉRIFIÉ, aggrégateur]** StatusGator signale des pannes détectées jamais reconnues par fal : 2026-07-16 (1 h 11, passerelle), 2026-03-24 (14 min), 2026-01-24 (51 min). Et un chiffre brut de « plus de 757 pannes » en près de deux ans. — [StatusGator, fal](https://statusgator.com/services/fal)
- **Contradiction.** **[FAIT VÉRIFIÉ]** StatusGator liste un incident officiel du 2026-08-27 de 5 j 6 h 35, « Historical request lookup and assets generated between Aug 1–26 may be degraded », et Pingoru le cite aussi selon un [extrait de recherche](https://pingoru.io/providers/fal). Or l'[historique officiel lu aujourd'hui](https://status.fal.ai/en-us/history/2) affiche août sans incident. Je ne peux pas dire si l'entrée a été retirée ou reclassée.

**Autres fournisseurs**

| Fournisseur | Source | Période | Ce qui est affiché |
|---|---|---|---|
| Replicate | **[FAIT VÉRIFIÉ]** `replicatestatus.com` redirige désormais vers [le statut Cloudflare](https://www.cloudflarestatus.com/services?search=replicate&) | 90 jours | 5 jours avec incident sur 90, 0 sur 30. Ni pourcentage ni détail. |
| Replicate | **[FAIT VÉRIFIÉ]** [StatusGator](https://statusgator.com/services/replicate) | n/a | Affiche Cloudflare dans son ensemble : données non isolables. |
| Runware | **[FAIT VÉRIFIÉ]** [Statut Runware](https://status.runware.ai) | août à nov. | API 100 %, modèles 99,93 %, modèles officiels 99,96 %, serverless 99,995 %. |
| Runware | **[FAIT VÉRIFIÉ]** [StatusGator](https://statusgator.com/services/runware) (suivi depuis le 2026-06-26) | 4 mois | 29 oct. 2 h 20 (délais, trafic) ; 28 oct. 10 min (API serverless injoignable) ; 19 oct. 1 h 05 ; 7 oct. 1 h 40 (modèles Flux, Qwen, HiDream) ; 5 oct. 10 min. Bande continue du 10 au 13 sept. (environ 3 jours, sans titre). « Plus de 71 pannes ». |
| WaveSpeed | **[FAIT VÉRIFIÉ]** [Statut WaveSpeed](https://status.wavespeed.ai) | non libellée | Environ 99,978 à 99,986 %. 20 août : 2 min. 9 sept. : 3 à 4 min plus 13 à 15 min dégradées. |
| Novita | **[FAIT VÉRIFIÉ]** [Statut Novita](https://status.novita.ai) | 90 jours | Passerelle API 100 %. Seuls des modèles de langage et le bac à sable sont suivis, **aucun modèle image ou vidéo**. |
| Segmind | **[FAIT VÉRIFIÉ]** [IncidentHub](https://incidenthub.cloud/status/segmind/current-status-by-service-inferences) | 30 jours | 0 panne sur 30 jours ; historique complet payant. |
| Segmind | **[NON VÉRIFIÉ]** Extrait d'IncidentHub | 2026-02-13 | Deux incidents « Inferences went down », résolus. |
| Google Vertex | **[FAIT VÉRIFIÉ]** [Statut Google Cloud](https://status.cloud.google.com/summary) | liste partielle | 2026-02-27 : 1 h 58, erreurs en hausse sur le point d'accès global. |
| Kie.ai | **[FAIT VÉRIFIÉ]** `status.kie.ai` ne résout pas ; [GenGrades](https://gengrades.com/kie-ai) (2026-10-22, conflit d'intérêts) dit aussi qu'il n'y a pas de page publique, malgré 99,9 % annoncés sur sa page d'accueil | n/a | Aucune donnée. |

### Inferences
- **[DÉDUCTION]** Durée cumulée des « pannes majeures » déclarées par fal du 1er janvier au 4 novembre : 712 min au plus, soit environ 99,84 % sur 308 jours. En retirant deux incidents que fal présente comme hors inférence ou concernant le site (20 fév., 6 mars site), il reste 419 min, soit environ 99,91 %. Calcul grossier, auto-déclaré, qui ignore les pannes partielles et dégradées.
- **[DÉDUCTION]** Ce n'est pas le niveau 99,99 % que certains comparatifs lui prêtent ([exemple d'Apidog](https://apidog.com/blog/best-ai-inference-platform-guide-2026), « 99,99 % » signalé comme contradictoire en extrait).
- **[DÉDUCTION]** Mars à mai 2026 ont été nettement les pires mois de fal ; depuis juin, seuls quelques incidents courts sont déclarés. La tendance est bonne, mais elle repose sur l'auto-déclaration, et l'incident d'août non retrouvé rend cette lecture moins sûre.
- **[DÉDUCTION]** Les décomptes StatusGator (757 pour fal en environ 23 mois, 71 pour Runware en environ 4 mois) comptent des événements par composant : ne pas s'en servir pour classer les fournisseurs.
- **[DÉDUCTION]** Une page propre chez WaveSpeed ou Novita ne prouve pas une meilleure disponibilité : Novita ne suit pas les modèles qui comptent pour Cosmos.

### Gaps
- Aucune page de statut publique trouvée pour Kling, BytePlus ou MiniMax (non testées exhaustivement). Disponibilité inconnue.
- Détail des 5 jours d'incident de Replicate non lisible ; ancienne page indisponible (archives bloquées).
- La page de statut d'AI Studio n'a pas de contenu lisible pour moi : disponibilité de l'API Gemini image non établie.
- Aucune mesure externe active comparant ces services avec la même méthode.

## Retours de développeurs positifs et négatifs, en séparant le vérifiable de l'anecdote

### Takeaway
Le seul schéma à la fois vérifiable, répété et durable concerne fal : des comptes bloqués malgré un solde positif, 18 issues publiques depuis mars 2026, dont 17 encore ouvertes. Pour les autres fournisseurs, on n'a surtout que des avis Trustpilot en petit nombre, auto-sélectionnés et non vérifiés.

### Cited Findings

**fal : vérifiable**
- **[FAIT VÉRIFIÉ]** Recherche GitHub dans `fal-ai/fal` : 18 issues de comptes bloqués malgré des crédits entre le 2026-03-09 et le 2026-11-02, dont 17 ouvertes. C'est un minimum : [#1061](https://github.com/fal-ai/fal/issues/1061) n'est pas dans ce décompte. Par période : 6 de mars à mai, 4 de juin à août, 8 du 5 septembre au 2 novembre. — [API de recherche GitHub](https://api.github.com/search/issues?q=repo%3Afal-ai%2Ffal+is%3Aissue+locked+%22balance%22&sort=created&per_page=50)
- **[FAIT VÉRIFIÉ]** L'issue centrale [#922](https://github.com/fal-ai/fal/issues/922) (ouverte le 2026-03-14) rassemble 14 comptes distincts jusqu'au 2026-10-18. Attentes rapportées : plusieurs heures, plus de 2 jours avec 3 courriels sans réponse, 3 semaines sans réponse. Solutions contradictoires : nouvelle clé (efficace pour un, pas pour deux autres), mise à jour du SDK (efficace pour un, pas pour un autre), simple attente. Aucun correctif officiel visible, aucun badge d'équipe fal dans la capture lue.
- **[FAIT VÉRIFIÉ]** [#1163](https://github.com/fal-ai/fal/issues/1163) (2026-09-08) : 110,83 $ de crédit, déblocage manuel par le support, nouveau blocage quelques minutes plus tard, débit toujours actif pendant les échecs.
- **[FAIT VÉRIFIÉ]** [#1248](https://github.com/fal-ai/fal/issues/1248) (2026-10-29) : nouveau compte payant, 700 $ prépayés, « Admin lock » en quelques minutes sans aucune requête lancée, environ 400 clips Seedance en attente. Le support écrit que le blocage est levé, l'API répond encore bloqué. Un autre utilisateur écrit « mine got lifted after posting here ». Voir aussi [#1183](https://github.com/fal-ai/fal/issues/1183) et [#1168](https://github.com/fal-ai/fal/issues/1168).
- **[FAIT VÉRIFIÉ]** [#1255](https://github.com/fal-ai/fal/issues/1255) et [#1257](https://github.com/fal-ai/fal/issues/1257) (2026-11-02) : le phénomène continue, deux issues ouvertes il y a deux jours.
- **[FAIT VÉRIFIÉ]** La FAQ de fal dit l'inverse du terrain : l'ajout de crédits débloque le compte, et les clients entreprise facturés sur facture ne sont pas bloqués automatiquement. — [FAQ fal](https://fal.ai/docs/documentation/model-apis/faq)
- **[FAIT VÉRIFIÉ, un seul rapport]** [#1175](https://github.com/fal-ai/fal/issues/1175) (2026-09-17) : vidéo de 80 s sur `topaz/upscale/video/creative`, durée enregistrée 10 272,69 s, facture de 40 500 $, compte bloqué, 100 $ de recharge automatique consommés, avec identifiant de requête, sans réponse après près de 48 h. Autre modèle.
- **[FAIT VÉRIFIÉ, un seul rapport]** [#1068](https://github.com/fal-ai/fal/issues/1068) (2026-06-04) : 401 sur toutes les clés, y compris Nano Banana.
- **[FAIT VÉRIFIÉ, Nano Banana 2]** [#1022](https://github.com/fal-ai/fal/issues/1022) (ouverte) et [fal-js #213](https://github.com/fal-ai/fal-js/issues/213) (fermée le 2026-07-16) : deux images identiques alors que deux images différentes étaient demandées.
- **[FAIT VÉRIFIÉ, un seul commentaire]** « their cdn/storage speed is really bad », utilisateur intensif (2026-05-12). — [HN, cantalopes](https://news.ycombinator.com/item?id=48108558)

**fal : positif**
- **[FAIT VÉRIFIÉ]** Utilisé pour un site de benchmark d'images génératives (2026-07-27). — [HN, vunderba](https://news.ycombinator.com/item?id=49074716)
- **[FAIT VÉRIFIÉ]** « I have minimal issues », usage vidéo (2026-10-14). — [HN, sixdimensional](https://news.ycombinator.com/item?id=50082472)
- **[FAIT VÉRIFIÉ]** Un avis 5 étoiles écrit n'avoir eu aucun problème de paiement « mentioned frequently here » (2026-10-29). — [Trustpilot fal](https://www.trustpilot.com/review/fal.ai)

**fal : anecdotes**
- **[FAIT VÉRIFIÉ, avis non vérifiés]** 2,5/5 sur 34 avis, 68 % à 1 étoile. Réponse à environ 13 % des avis négatifs, souvent après plus d'un mois. Solde restant effacé sans prévenir (2026-07-05), solde négatif de -11,20 $ (2026-09-02), compte bloqué sans réponse (2026-11-02). — [Trustpilot fal](https://www.trustpilot.com/review/fal.ai)

**Autres fournisseurs** (toutes les notes Trustpilot sont **[FAIT VÉRIFIÉ]** quant à la note et à l'existence de l'avis ; le contenu n'est pas vérifié ; Trustpilot précise ne pas vérifier les faits)

| Fournisseur | Note Trustpilot | Échantillon | Thème dominant | Portée |
|---|---|---|---|---|
| [Replicate](https://www.trustpilot.com/review/replicate.com) | 1,8/5 | 16 avis, 94 % à 1 étoile | Support absent, facturation, modération (2026-10-09) | Profil non revendiqué |
| [Kie.ai](https://www.trustpilot.com/review/kie.ai) | 2,1/5 | 16 avis, 81 % à 1 étoile | Blocage à 99 %, crédits perdus ; 2 avis positifs sur le support et les crédits | Répond à 7 % des négatifs |
| [WaveSpeed](https://www.trustpilot.com/review/wavespeed.ai) | 2,3/5 | 6 avis, 100 % à 1 étoile | Échecs facturés, recharge auto double, support muet | Très petit échantillon |
| [Novita](https://www.trustpilot.com/review/novita.ai) | 2,5/5 | 9 avis | Offres de code, résiliation, double débit | Hors sujet médias |
| [Kling](https://www.trustpilot.com/review/klingai.com) | 1,2/5 | 435 avis, 91 % à 1 étoile | Crédits, faux positifs, support | Appli grand public, pas l'API |
| [BytePlus](https://www.trustpilot.com/review/www.byteplus.com) | 1,7/5 | 24 avis, 96 % à 1 étoile | 30 $ minimum, non remboursable, TVA requise, ressemblance humaine bloquée | Partiellement API, Seedance 2.5 cité le 2026-10-05 |
| Runware, Segmind | Aucun profil lu (404 aux URL essayées) | n/a | n/a | n/a |

- **[FAIT VÉRIFIÉ, sans chiffres]** Kie.ai : réponse du support environ dix heures plus tard, génération d'images et chat jugés raisonnables, l'auteur déclare ne pas être affilié. — [AI Softing](https://aisofting.com/kie-ai-review/)
- **[FAIT VÉRIFIÉ, affilié déclaré]** Un auteur utilise Kie en production pour l'image et juge la stabilité acceptable ; il rapporte que la FAQ de Kie admet une stabilité parfois inférieure aux fournisseurs officiels. — [Bitdoze, 2026-07-17](https://www.bitdoze.com/kie-ai-review/)
- **[FAIT VÉRIFIÉ]** GitHub : 242 résultats mentionnent kie.ai ; aucun des 5 premiers visibles ne décrit un vrai échec. 1 342 pour « wavespeed », où seuls [ComfyArt #704](https://github.com/ganjmeng/ComfyArt/issues/704) (2026-11-04) et voisins décrivent un usage réel, surtout des bugs de cette application. 290 pour « runware », où seule une alerte automatique sans cause ([dailystory #153](https://github.com/seq23/dailystory/issues/153)) ressort. Lecture limitée à la première page.
- **[NON VÉRIFIÉ]** Replicate répondrait très peu au support ; Hacker News ne donne aucun signal net sur 25 commentaires lus sur 212. — [Algolia HN](https://hn.algolia.com/api/v1/search_by_date?query=%22replicate.com%22&tags=comment&hitsPerPage=25)
- **[NON VÉRIFIÉ]** La discussion communautaire indépendante sur Runware est signalée comme maigre. — [Toolsforhumans](https://www.toolsforhumans.ai/ai-tools/runware)

### Inferences
- **[DÉDUCTION]** Le blocage de compte fal recouvre deux familles : le verrou « Exhausted balance » ou « TOP_UP », qui semble ne pas se lever après une recharge, et le verrou « Admin lock » sur compte neuf, qui ressemble à un contrôle antifraude. Elles n'ont sans doute pas la même cause. Certains blocages peuvent être justifiés, ce que les issues ne permettent pas d'exclure.
- **[DÉDUCTION]** 18 issues ne donnent pas de taux : on ne connaît pas le nombre total de comptes. Mais l'absence de réponse publique pendant huit mois est un signal fort sur le support, qui compte pour un business où rien ne doit être manuel.
- **[DÉDUCTION]** Un fournisseur plus petit a moins d'issues publiques simplement parce qu'il a moins d'utilisateurs ou pas de dépôt ouvert : l'absence de plaintes chez Runware n'est pas une preuve de qualité.
- **[DÉDUCTION]** Sur Trustpilot, tout le secteur est sous 3/5, sans invitation de clients : ces notes reflètent surtout qui se plaint. Le contenu des avis a plus de valeur que la note.

### Gaps
- Pas d'accès à Reddit, X, Discord ni Product Hunt : leur tonalité reste inconnue.
- Pas de témoignage vérifiable sur la disparition de modèles.
- Pas de retour de développeur identifié sur l'API officielle de Kling ou de MiniMax.
- Pas de réponse officielle de fal sur le blocage de comptes : aucune trouvée.

## Prix réellement facturés : écarts, hausses non annoncées, frais cachés

### Takeaway
Sur Kling 4.0, le prix ne départage presque rien : 0,157 $/s en 720p chez fal, Replicate, WaveSpeed et Runware, et 0,1425 $/s chez Kie. Les vrais écarts viennent des hausses vues sans annonce chez fal sur d'autres modèles, des frais d'entrée de Nano Banana 2.1, et de durées par défaut coûteuses sur Seedance 2.5.

### Cited Findings

**Tarifs affichés lus aujourd'hui**
- **[FAIT VÉRIFIÉ]** Kling 4.0 sur référence sans vidéo, 720p / 1080p : Replicate 0,157 / 0,235 $ — [Replicate](https://replicate.com/kwaivgi/kling-v4.0) ; Runware 0,157 / 0,235 $ — [Runware](https://runware.ai/kling-4) ; WaveSpeed 0,157 / 0,235 $ (22 oct.) — [WaveSpeed](https://wavespeed.ai/blog/ai-news/kling-4-0-release-date/) ; Kie.ai 0,1425 / 0,2125 $ — [Kie](https://kie.ai/pricing) ; fal 0,157 / 0,235 $ selon la note interne Cosmos [reference-kling4-limits, 2026-11-02] et `src/config/product.ts`.
- **[FAIT VÉRIFIÉ]** Kling 4.0 avec entrée vidéo, 720p : 0,094 $ par seconde comptée (entrée + sortie) chez Replicate et WaveSpeed, soit 0,94 $ pour 5 s vers 5 s ; 0,188 $/s chez Runware ; 0,085 $/s entrée + sortie chez Kie. Mêmes sources.
- **[FAIT VÉRIFIÉ, source intéressée]** Facturé conforme au tarif : 0,785 $ pour 5 s en 720p, 0,948 $ pour une édition de 5,04 s, 4,71 $ pour 30 s. — [Sandbase](https://blog.sandbase.ai/kling-4-0-api-guide-2026/)
- **[FAIT VÉRIFIÉ]** Nano Banana 2.1 chez Google : 0,0336 $ en 1K, 0,0504 $ en 2K, 0,113 $ en 4K ; entrée 1,50 $ par million de jetons, contre 0,50 $ pour Nano Banana 2. — [Tarifs Gemini](https://aistudio.google.com/docs/pricing)
- **[FAIT VÉRIFIÉ]** Le prix de Nano Banana 2.1 chez fal n'est pas confirmé : `src/config/product.ts` retient 0,04 $ par hypothèse, « à confirmer sur la première facture ». Mon appel à la page fal renvoie 404.
- **[FAIT VÉRIFIÉ]** Kie : Nano Banana 2.1 « from » 0,02 $, Seedance 2.5 « from » 0,085 $/s, options non détaillées. — [Kie](https://kie.ai/pricing)
- **[FAIT VÉRIFIÉ, source intéressée, lecture du 2026-10-05]** Seedance 2.5, 5 s : BytePlus 2,84 $ en 1080p, 1,16 $ en 720p, 0,51 $ en 480p ; Replicate 1,16 $ en 720p et 0,51 $ en 480p, pas de 1080p ; Segmind 2,94 $, Kie 3,95 $, WaveSpeed 4,50 $ en 1080p ; fal 2,31 $ en 720p et environ 5,69 $ en 1080p, chiffres que l'article signale eux-mêmes comme possiblement sur 10 s. — [useapi.net](https://useapi.net/docs/articles/seedance-2-api-pricing)

**Hausses et frais**
- **[FAIT VÉRIFIÉ, détecté par un traqueur, sans annonce citée]** fal, 2026-10-02 : MiniMax H3 Max de 0,025 à 0,05 $/s (x2), H100 serverless de 1,89 à 2,49 $/h, B300 de 4,49 à 5,99 $/h. — [PricingSaaS](https://pricingsaas.com/news/article/fal-raises-serverless-h100-rate-to-2-49-hr-adds-gb200-gpu-doubles-minimax-video-pricing)
- **[FAIT VÉRIFIÉ, détecté par un traqueur]** fal, 2026-10-16 : Flux 3 Image edit de 0,024 à 0,048 $ par mégapixel (x2). — [PricingSaaS](https://pricingsaas.com/companies/fal/diffs/2026D289)
- **[FAIT VÉRIFIÉ, constat interne]** L'API de prix de fal est trompeuse : Kling 4 edit à 0,157 $ au lieu de 0,094 $/s sur entrée + sortie, et elle ne renvoie que le prix 720p. — note interne Cosmos [reference-fal-privacy-defaults, 2026-11-04]
- **[NON VÉRIFIÉ, revendeur, test de 19 cas le 2026-08-28]** Sur Seedance 2.5, `duration` vaut -1 par défaut : sans précision, le modèle a choisi 10 s lors du test, doublant le coût. — [APIYI](https://docs.apiyi.com/en/live/2026-08/seedance-2-5-launch)
- **[FAIT VÉRIFIÉ, source intéressée, à recouper]** BytePlus exigerait environ 30 $ de pack prépayé ou de recharge pour activer l'API, et limiterait les comptes individuels à 3 tâches simultanées. — [useapi.net](https://useapi.net/docs/articles/seedance-2-api-pricing)
- **[FAIT VÉRIFIÉ, avis non vérifiés]** BytePlus : 100 $ payés, API non activable sans numéro de TVA, crédits non remboursables (2026-10-05) ; 1 000 crédits achetés pour environ 600 utilisables (2026-08-14). — [Trustpilot](https://www.trustpilot.com/review/www.byteplus.com)
- **[FAIT VÉRIFIÉ, un seul rapport]** Facture de 40 500 $ pour une vidéo de 80 s, voir ci-dessus. — [Issue fal #1175](https://github.com/fal-ai/fal/issues/1175). **[FAIT VÉRIFIÉ, ancien]** Écart de facturation sur `qwen-image` (2025-10-10), fermé comme résolu. — [Issue fal #655](https://github.com/fal-ai/fal/issues/655)
- **[FAIT VÉRIFIÉ, un seul avis]** WaveSpeed : recharge automatique au double du montant fixé, sans remboursement (2026-04-13). — [Trustpilot](https://www.trustpilot.com/review/wavespeed.ai)
- **[FAIT VÉRIFIÉ, source en conflit d'intérêts]** Kie affiche une colonne « Official / Fal Price » : les 75 % d'économie annoncés sur Veo 3.1 Fast ne font que 62,5 % face au prix de Google. Le prix de Claude Opus 5.5 y est même inférieur au tarif Batch d'Anthropic, sans explication trouvée. — [GenGrades](https://gengrades.com/kie-ai)
- **[NON VÉRIFIÉ, extraits de recherche]** Kling grand public : forfait supérieur de 75 à 180 $/mois le 2026-04-01, non lié à l'API. — [CostBench](https://costbench.com/changelog/kling-price-increase-2026-04/). CostBench affiche par endroits des valeurs nulles : source fragile.

### Inferences
- **[DÉDUCTION]** Une différence de 0,0145 $/s (Kie face aux autres) fait 0,07 $ sur 5 s : c'est insignifiant devant une tâche perdue. Sur Kling 4.0, le choix se joue sur la fiabilité, pas sur le tarif.
- **[DÉDUCTION]** Nano Banana 2.1 est moins cher en sortie, mais son entrée a triplé par rapport à Nano Banana 2. Pour des éditions avec plusieurs photos clients, le coût réel dépasse les 0,0336 $ affichés. Le post du forum Google (6 images, 6 990 jetons) donne environ 0,0105 $ d'entrée pour une requête de ce type.
- **[DÉDUCTION]** Le doublement de prix sans préavis sur MiniMax et Flux chez fal montre que le risque existe. Rien n'indique pour l'instant qu'il a touché Kling 4.0 ou Nano Banana 2.1 ; le tarif Cosmos doit toutefois pouvoir suivre, car une marge calculée sur un tarif figé peut devenir négative rapidement.

### Gaps
- Aucun témoignage vérifiable d'écart entre prix affiché et facture pour Kling 4.0 ou Nano Banana 2.1 chez fal.
- Aucune trace de préavis ou d'absence de préavis prouvée : les traqueurs voient la page, pas les courriels aux clients.
- Prix officiel de Kling 4.0 sur l'API de Kling non trouvé. Prix de MiniMax non vérifié directement.
- Dépôts minimaux réels de Replicate, WaveSpeed et Runware non vérifiés.

## Détection du contenu sponsorisé : quels comparatifs sont publiés par un fournisseur ou un affilié, lesquels sont neutres ?

### Takeaway
Presque tous les comparatifs populaires viennent d'un fournisseur, d'un revendeur ou d'un affilié, et presque aucun ne publie de mesure avec méthode. Les seules sources sans intérêt commercial direct identifié sont Artificial Analysis et les traces brutes (pages de statut, GitHub, traqueurs de prix), et leur indépendance reste en partie auto-déclarée.

### Cited Findings

| Publication | Éditeur et intérêt | Mesure réelle ? | Statut |
|---|---|---|---|
| [fal Alternative](https://runware.ai/fal-alternative) | Runware, concurrent direct | Non indépendante | **[FAIT VÉRIFIÉ]** vendeur |
| [Best fal.ai Alternatives](https://www.atlascloud.ai/blog/guides/best-fal-ai-alternatives), [Top 5 AI Video APIs](https://www.atlascloud.ai/blog/case-studies/Top-5-ai-video-apis-compared-speed-latency-and-cost-per-second-2026) | Atlas Cloud, concurrent | Tableaux sans méthode lisible | **[FAIT VÉRIFIÉ]** vendeur |
| [Best AI Video Generator 2026](https://wavespeed.ai/blog/posts/best-ai-video-generator-2026/), [Replicate review](https://wavespeed.ai/blog/posts/replicate-review-2026) | WaveSpeed, concurrent | Non indépendante | **[FAIT VÉRIFIÉ]** vendeur |
| [9 Best AI Video APIs](https://higgsfield.ai/blog/best-ai-video-generation-apis), [Pricing vs subscriptions](https://higgsfield.ai/blog/ai-video-api-pricing-vs-subscriptions) | Higgsfield, vend son API | Affirmations sur la facturation des concurrents sans lien de preuve | **[FAIT VÉRIFIÉ]** vendeur |
| [Best inference providers](https://www.wireflow.ai/blog/best-ai-inference-providers) | Wireflow, cofondateur auteur, se classe 2e, fal 1er | Cite AA et Design Arena, dates incohérentes | **[FAIT VÉRIFIÉ]** vendeur |
| [Best AI Inference Platforms](https://apidog.com/blog/best-ai-inference-platform-guide-2026) | Apidog, outil d'API ; liens avec `ref=apidog.com`, sans déclaration ; WaveSpeed en tête sans justification ; publié aussi sur dev.to par [deux](https://dev.to/preecha/best-ai-inference-platforms-in-2026-replicate-vs-falai-vs-runware-vs-novita-ai-vs-atlas-cloud-5foh) [comptes](https://dev.to/apilover/best-ai-inference-platforms-in-2026-replicate-vs-falai-vs-runware-vs-novita-ai-vs-atlas-cloud-3g1c) | Aucune mesure ; tableau de coût par calcul | **[FAIT VÉRIFIÉ]** promotionnel non déclaré |
| [fal vs Replicate vs Together](https://dev.to/artem_varganich/falai-vs-replicate-vs-together-ai-serverless-generative-media-llm-inference-benchmark-2026-4gcm) | Compte créé la veille de la publication, entonnoir vers « AI SaaS Compass » | « we tested » sans méthode ni échantillon | **[FAIT VÉRIFIÉ]** promotionnel |
| [Failed AI API billing audit](https://dev.to/lucas_apimart/failed-ai-api-request-billing-audit-33nm) | APIMART, déclare « commissioned and reviewed this vendor-affiliated guide » | Cite les pages officielles datées | **[FAIT VÉRIFIÉ]** vendeur honnête, utile pour ses citations |
| [Kling 4.0 API](https://blog.sandbase.ai/kling-4-0-api-guide-2026/) | Sandbase, routeur, sans déclaration explicite | Oui, un essai par point d'accès, limites écrites | **[FAIT VÉRIFIÉ]** vendeur mais méthode transparente |
| [Kie.ai review](https://www.bitdoze.com/kie-ai-review/) | Bitdoze, affilié Kie déclaré | Annonce des tests de vitesse dans sa description, aucun résultat | **[FAIT VÉRIFIÉ]** affilié |
| [Kie.ai review](https://gengrades.com/kie-ai) | GenGrades, dit indépendant, mais vend APIMODELS, un produit concurrent, déclaré sur une autre page | Aucun test propre, synthèse sourcée | **[FAIT VÉRIFIÉ]** conflit d'intérêts déclaré ailleurs |
| [Kie AI Review](https://aisofting.com/kie-ai-review/) | AI Softing, déclare ne pas être affilié | Essai de deux semaines, sans décompte | **[FAIT VÉRIFIÉ]** déclaration non vérifiable |
| [Seedance API pricing](https://useapi.net/docs/articles/seedance-2-api-pricing) | useapi.net, se classe premier | Dates de lecture des prix indiquées | **[FAIT VÉRIFIÉ]** vendeur, utile pour les prix |
| [Fix 503](https://help.apiyi.com/en/nano-banana-pro-api-overloaded-error-solution-en.html) et [variante](https://www.aifreeapi.com/en/posts/gemini-3-pro-image-503-overloaded) | Revendeurs d'accès Gemini ; contenu dépannage qui vend le contournement | Pas de mesure avec méthode | **[DÉDUCTION]** contenu d'acquisition |
| [Pourquoi Kling est trop restrictif](https://piapi.ai/blogs/is-kling-too-restrictive-why-developers-prefer-piapi-s-unified-model-access-for-ai-video-gen) | PiAPI, concurrent | Non | **[DÉDUCTION]** vendeur, d'après le titre et le domaine |
| [Best AI Video APIs](https://www.hedra.com/blog/best-ai-video-generation-apis-2026), [Inference Providers](https://magichour.ai/blog/best-ai-inference-providers-2026), [Latency Comparison](https://modelslab.com/ai-api-latency-comparison), [Alternatives](https://qveris.ai/guides/wavespeedai-alternatives) | Fournisseurs de la même catégorie | Non lus en entier | **[NON VÉRIFIÉ]** vendeur d'après le domaine |
| [Alerte fal 1](https://dev.to/q2408808/falai-concurrent-request-bug-stuck-inprogress-slots-with-no-fix-developers-are-switching-58l9), [Alerte fal 2](https://dev.to/q2408808/falai-account-locking-billing-issues-emergency-alternative-guide-for-developers-ae5) | Répondent 404 aujourd'hui, promotionnels d'après l'extrait de recherche | n/a | **[FAIT VÉRIFIÉ]** retirés. Leur fond, lui, se confirme sur GitHub |

Sources sans intérêt commercial direct identifié :
- **[FAIT VÉRIFIÉ]** Artificial Analysis : indépendance auto-déclarée, méthode publique. — [AA](https://artificialanalysis.ai/methodology/video)
- **[FAIT VÉRIFIÉ]** Pages de statut et GitHub : traces brutes, mais auto-déclaration ou auto-sélection.
- **[FAIT VÉRIFIÉ]** PricingSaaS : traqueur de pages de prix, ne vend pas d'inférence. — [PricingSaaS](https://pricingsaas.com/news/article/fal-raises-serverless-h100-rate-to-2-49-hr-adds-gb200-gpu-doubles-minimax-video-pricing)
- **[FAIT VÉRIFIÉ]** StatusGator et IncidentHub vendent de la surveillance, pas d'inférence. — [StatusGator](https://statusgator.com/services/fal), [IncidentHub](https://incidenthub.cloud/status/segmind/current-status-by-service-inferences)
- **[NON VÉRIFIÉ]** Design Arena : semble neutre, méthodologie non lue, éditeur sans lien clair avec les hébergeurs. — [Design Arena](https://www.designarena.ai/leaderboard/video)
- **[FAIT VÉRIFIÉ]** Un rapport généraliste souvent cité ne couvre aucun de ces fournisseurs et ne donne pas de méthode. — [Engineered.at](https://engineered.at/articles/api-reliability-report-2026-uptime-patterns-across-215-services)

### Inferences
- **[DÉDUCTION]** Règle pratique : si l'article cite une latence sans donner date, nombre d'essais, résolution et hébergeur, c'est du marketing. Aucun comparatif « fal vs Replicate » lu ne passe ce filtre pour un modèle de Cosmos.
- **[DÉDUCTION]** Une source intéressée peut rester utile quand elle cite une page officielle datée (APIMART) ou décrit honnêtement son échantillon (Sandbase). Il faut lire sa méthode, pas son classement.
- **[DÉDUCTION]** Même les articles anti-fal retirés pointaient un vrai problème : la motivation d'un article ne prouve pas que son fond est faux, seul le recoupement primaire tranche.

### Gaps
- Propriété et financement d'AI Softing, de GenGrades et de Design Arena non établis.
- Financement d'AA non vérifié au-delà de sa propre déclaration : il peut vendre d'autres services aux entreprises.
- Les contenus de X et YouTube, qui sont aussi affiliés, n'ont pas été examinés.

## Signaux rouges, solidité des preuves et test minimal pour trancher

### Takeaway
Deux signaux rouges sont solides : le blocage de comptes chez fal, documenté publiquement sans correctif visible, et la restriction officielle de Seedance 2.5 sur les visages réels. Kie.ai présente un signal orange fort sur des preuves plus faibles. Pour tout le reste, les données sont insuffisantes, et seul un test payant pourrait trancher : il n'a pas été lancé et demande un feu vert explicite.

### Cited Findings

| Fournisseur | Signal | Preuve | Solidité |
|---|---|---|---|
| **fal** | **ROUGE** opérationnel : blocage de compte malgré solde positif, support lent ou muet. Risque d'arrêt complet pour un fournisseur unique. | [18 issues, 17 ouvertes](https://api.github.com/search/issues?q=repo%3Afal-ai%2Ffal+is%3Aissue+locked+%22balance%22&sort=created&per_page=50), [#922](https://github.com/fal-ai/fal/issues/922), [#1248](https://github.com/fal-ai/fal/issues/1248) | Forte sur l'existence et la durée du problème. Fréquence inconnue. Ne remet pas en cause la qualité d'inférence. |
| **fal** | ORANGE : hausses sans annonce citée (MiniMax, Flux), facture aberrante isolée, SDK qui rejoue les POST. | [PricingSaaS](https://pricingsaas.com/news/article/fal-raises-serverless-h100-rate-to-2-49-hr-adds-gb200-gpu-doubles-minimax-video-pricing), [#1175](https://github.com/fal-ai/fal/issues/1175), [fal-js #238](https://github.com/fal-ai/fal-js/issues/238) | Moyenne. Autres modèles que ceux de Cosmos pour les prix ; #238 n'a pas prouvé de doublon réel. |
| **BytePlus / Seedance 2.5** | **ROUGE** pour Cosmos : visages réels restreints sauf vérification ; intégration commerciale plus lourde. | [Blog BytePlus](https://www.byteplus.com/blog/dreamina-seedance2-5), [Trustpilot](https://www.trustpilot.com/review/www.byteplus.com) | Forte sur le principe, officielle. Faible sur le coût et le délai de l'autorisation. |
| **Kie.ai** | ORANGE fort : crédits perdus sur blocages répétés selon les avis, pas de page de statut, prix inexplicablement bas. | [Trustpilot](https://www.trustpilot.com/review/kie.ai), [GenGrades](https://gengrades.com/kie-ai), `status.kie.ai` introuvable | Moyenne à faible : 16 avis non vérifiés, contredits par [un essai](https://aisofting.com/kie-ai-review/), aucun chiffre mesuré. |
| **Google Gemini / Vertex** | ORANGE : 503 sous charge, faux positifs `IMAGE_SAFETY`. | [Forum 2026-01-23](https://discuss.ai.google.dev/t/naono-banana-pro-api-response-delays-and-503-errors-in-production/118070), [Forum 2026-10-26](https://discuss.ai.google.dev/t/possible-false-positive-image-safety-on-an-image-edit-gemini-api-gemini-nano-banana-2-1/195094) | Faible en fréquence. Un seul cas récent sur 2.1. |
| **WaveSpeed** | JAUNE : avis négatifs, échantillon infime ; contenu autopromotionnel. | [Trustpilot](https://www.trustpilot.com/review/wavespeed.ai), [Apidog](https://apidog.com/blog/best-ai-inference-platform-guide-2026) | Faible. **Données insuffisantes.** |
| **Replicate** | JAUNE : support critiqué, 5 jours d'incident sur 90, statut fondu dans Cloudflare. | [Trustpilot](https://www.trustpilot.com/review/replicate.com), [Statut](https://www.cloudflarestatus.com/services?search=replicate&) | Faible. **Données insuffisantes.** Règle d'échec non facturé claire. |
| **Runware** | JAUNE : incidents courts répétés en octobre selon StatusGator, alors que la page officielle affiche API 100 %. | [StatusGator](https://statusgator.com/services/runware), [Statut](https://status.runware.ai) | Faible. **Données insuffisantes**, peu de retours. |
| **Kling officiel, MiniMax, Novita, Segmind** | Pas de signal établi | [Trustpilot Kling, appli uniquement](https://www.trustpilot.com/review/klingai.com), [statut Novita, langage uniquement](https://status.novita.ai) | **Données insuffisantes.** |

**Test minimal, jamais lancé par cette recherche.** Toute génération payante demande un feu vert explicite de l'utilisateur pour ce run précis. Prix publics utilisés : voir la section sur les prix. Le test utilise uniquement la photo d'un adulte consentant, jamais celle d'un client, avec le même prompt partout.

**Étape 0, gratuite**
- Ouvrir dans un navigateur le [comparateur AA](https://artificialanalysis.ai/video/providers) pour Seedance 2.5, et les pages image de Nano Banana. Médianes et p95 par hébergeur.
- Lire les durées et statuts réels dans l'historique des requêtes du compte fal de Cosmos, puis les recouper avec la facture : c'est gratuit, et mesuré sur le vrai usage.

**Étape 1, décision qualitative, un essai par fournisseur**

| Test | Détail | Coût calculé |
|---|---|---|
| A. Kling 4.0 référence-vers-vidéo, 720p, 5 s, une photo | fal, Replicate, WaveSpeed, Runware : 5 × 0,157 = 0,785 $ chacun ; Kie : 5 × 0,1425 = 0,7125 $ | **3,8525 $** |
| A' Variante Kling 4.0 édition, 5 s vers 5 s, si c'est le flux à vérifier | fal, Replicate, WaveSpeed : 10 × 0,094 = 0,94 $ ; Runware : 5 × 0,188 = 0,94 $ ; Kie : 10 × 0,085 = 0,85 $ | **4,61 $** |
| C. Nano Banana 2.1 édition 1K chez Google, 10 essais | 10 × 0,0336 = 0,336 $, plus environ 0,017 $ de jetons d'entrée estimés | **0,336 $ + environ 0,017 $** |
| D. Seedance 2.5, visage réel, 480p, 5 s chez Replicate | `duration` à préciser, sinon risque de doublement. Refus attendu, en principe non facturé | **0,51 $ maximum** |

**Total étape 1 (A + C + D) : 4,6985 $ de consommation, environ 4,72 $ avec les jetons d'entrée.** C'est le paquet le moins cher qui donne une réponse sur chaque point ouvert. Les dépôts minimaux s'ajoutent en trésorerie : au moins 5 $ chez Kie selon [Atlas Cloud](https://www.atlascloud.ai/blog/guides/kling-ai-api-pricing), autres non vérifiés.

Version réduite pour un petit budget : fal + un seul concurrent sur le test A, soit **1,57 $**, en s'arrêtant au premier résultat qui suffit, conformément à la règle de test de l'utilisateur.

**Ce que cette étape peut trancher :** accepte-t-on la photo réelle ? Le montant débité correspond-il au tarif affiché ? Un refus est-il débité ? Écart grossier de délai. **Ce qu'elle ne peut pas trancher :** le taux d'échec, ni un classement fin des délais. Un seul essai ne le permet pas.

**Étape 2, facultative, mesure de taux** (Kling 4.0, 5 s, 720p, essais espacés sur plusieurs heures)

| Plan | Calcul | Coût | Portée statistique |
|---|---|---|---|
| fal + un concurrent à 0,157 $/s, 10 essais chacun | 20 × 0,785 $ | **15,70 $** | Zéro échec sur 10 laisse encore possible jusqu'à environ 26 % d'échec (borne à 95 %) |
| Kie seul, 10 essais | 10 × 0,7125 $ | **7,125 $** | Si le taux de « un sur cinq » de l'avis Trustpilot était vrai : 89 % de chances de le voir au moins une fois |
| Les 5 fournisseurs, 30 essais chacun | 4 × 23,55 $ + 21,375 $ | **115,575 $** | Zéro échec sur 30 : borne à environ 9,5 %. Sans proportion avec le besoin |

**Ce que le test ne peut pas trancher pour fal :** le blocage de compte. Il s'évalue par la procédure de recharge, le contact d'un commercial pour la facturation entreprise mentionnée par la [FAQ fal](https://fal.ai/docs/documentation/model-apis/faq), et par un fournisseur de secours opérationnel.

### Inferences
- **[DÉDUCTION]** Le risque principal de Cosmos n'est pas une panne d'inférence, déclarée courte et en baisse chez fal, mais un blocage administratif ou de solde, sans correctif public et sans réponse garantie, alors que Cosmos dépend du seul fal (`src/config/product.ts`) et qu'aucune tâche manuelle récurrente n'est acceptable.
- **[DÉDUCTION]** Comme Kling 4.0 a le même tarif chez cinq fournisseurs (à 0,07 $ près sur 5 s), un second fournisseur de secours coûte peu à prévoir commercialement. Les candidats à départager pour ce secours sont Replicate et Runware : aucun signal rouge, mais données insuffisantes. Kie présente le risque le plus élevé pour un flux automatique où un crédit perdu n'est vu par personne.
- **[DÉDUCTION]** Avant tout test, garder le solde fal bien au-dessus du seuil de verrouillage réduit le premier risque : plusieurs rapports (#922) commencent quand le solde atteint 0 $. Ce n'est pas une garantie, d'autres comptes sont bloqués dès la première recharge.
- **[DÉDUCTION]** Seedance 2.5 n'est pas à retenir pour les photos de clients tant que la procédure de vérification de ressemblance n'a pas été vérifiée concrètement. Passer par un revendeur pour contourner le filtre serait un risque juridique et de continuité, et cela contredit l'exigence de consentement de BytePlus.
- **[DÉDUCTION]** Aucun fournisseur de cette liste ne sort « sûr » de cette enquête. Sur la fiabilité réelle, les alternatives à fal ne sont pas meilleures : elles sont moins documentées.

### Gaps
- Fréquence réelle des blocages fal : seul fal la connaît.
- Taux de refus de Kling 4.0 sur photos réelles par hébergeur : aucune donnée, seul le test A y répond partiellement.
- Disponibilité de BytePlus en France et délai réel de la vérification de ressemblance : non établis.
- Cause de l'incident fal du 8 avril 2026 et de l'entrée d'août absente de l'historique : non établies.
- Prix de Nano Banana 2.1 chez fal : non confirmé. Coût d'un test C chez fal, sous l'hypothèse de 0,04 $ : 0,40 $, non calculable avec certitude.

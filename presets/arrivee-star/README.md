# Arrivée de star

**Le look en une phrase** : une vidéo de fan filmée au téléphone où c'est le client que la foule attend.
**Mots-clés** : téléphone, foule, gardes du corps, réaliste, un seul plan.
**Ce qui ne change jamais** : mouvement, caméra, foule, décor, tenue de la star (veste noire, t-shirt blanc, baskets blanches, valable pour tout le monde) et son d'origine.

Statut : **brouillon**, invisible des clients. Toutes les variantes attendent leur premier essai payant : aucun résultat de qualité n'est encore affirmé.

## La vidéo

`public/exemple.mp4`, générée par Kling (métadonnées AIGC) : 10 s, un seul plan, 9:16, 24 images/s.

| Temps | Ce qu'on voit | Risque |
| --- | --- | --- |
| 0 – 0,6 s | SUV fermé, star invisible | aucun |
| 0,6 – 2,25 s | La porte s'ouvre, la star sort | visage petit, téléphones devant |
| 2,25 – 3,75 s | Debout, en pied, entre les gardes | visage d'environ 40 px, confusion avec les gardes |
| 3,75 – 5,5 s | De dos et de côté parmi les gardes | très petit |
| 5,5 – 6,25 s | Réapparaît et marche vers la caméra | retour vers l'identité d'origine |
| **6,25 – 7,5 s** | **Plan moyen de face, sourire** | **le moment où on juge la ressemblance, moustache d'origine** |
| 7,5 – 8,75 s | Profil vers la droite | dérive d'identité de profil |
| 8,75 – 10 s | De dos, entre au restaurant | coiffure de dos |

Trois difficultés propres à ce plan, confirmées par les sources ci-dessous : foule dense, gardes du corps habillés presque comme la star, et un seul plan de 10 s où l'identité doit tenir du début à la fin.

## Le workflow choisi, et pourquoi

Le brief prévoit un mode `depth_mask` pour « remplacer un sujet en gardant le décor ». C'est le cas ici, et la vidéo étant fixe, ce travail se fait **une seule fois**, pour 0,48 $, puis sert à toutes les commandes.

1. **Vidéo normalisée** : 720×1280, 240 images exactes (10,000 s au lieu de 10,04 : les modèles facturent à la seconde), sans son. Fait.
2. **Silhouette de profondeur** (une fois) : SAM 3 isole la star, ciblée par des cadres posés sur six images ; Depth Anything donne la profondeur ; la star devient une silhouette colorée dans la vidéo d'origine. Le modèle ne voit plus la moustache ni le visage d'origine, et sait exactement qui remplacer. C'est le cœur du workflow open source de référence. **Hypothèse à vérifier** : ce workflow a été éprouvé sur Seedance, pas sur Kling.
3. **Photo vérifiée** par un modèle de vision avant toute dépense. Les sources s'accordent : la qualité de la photo pèse plus que le prompt.
4. **Image-clé** (variantes `-kf`) : la photo intégrée à l'image de 7 s, puis donnée au modèle vidéo comme référence.
5. **Vidéo** : le modèle reste à choisir au benchmark, le preset passe de l'un à l'autre sans changer de code.
6. **Assemblage** : son d'origine remis à l'identique (vérifié paquet par paquet), mention « Généré par IA » toujours visible, et en option recollage du décor d'origine autour de la personne.

## Variantes à comparer

Prix relevés le 4 novembre 2026, à revérifier avant de fixer le prix. 10 s de vidéo, vérifications comprises (`node scripts/preset-lab.mjs economics arrivee-star`).

| Variante | Modèle | Coût par commande | Prix minimum | Pourquoi l'essayer |
| --- | --- | --- | --- | --- |
| `kling4-raw` | Kling 4 Edit, 720p | 1,89 $ | 985 tokens | Référence : le principe de `/creer` aujourd'hui, prompt affiné |
| `kling4-depth` | Kling 4 Edit + silhouette | 1,89 $ | 985 tokens | Supprime la moustache d'origine et la confusion avec les gardes ? |
| `o3-raw` | Kling O3 Standard Edit | 1,41 $ | 735 tokens | Modèle de production par défaut du brief, 25 % moins cher |
| `o3-depth` | Kling O3 + silhouette | 1,41 $ | 735 tokens | Idem avec la silhouette |
| `recast-raw` | MiniMax H3 Max Recast, 768p | 3,01 $ | 1 570 tokens | Fait pour ça, mais non testé en foule dense par les sources |
| `pixverse-raw` | PixVerse Swap, 720p | 0,41 $ | 215 tokens | Le moins cher, risque : mauvaise personne choisie dans la foule |
| `seedance-depth` | Seedance 2.5 + silhouette | 5,55 $ | 2 900 tokens | Plafond de qualité du brief, trop cher pour la production |
| `*-kf` | Les mêmes + image-clé | + 0,04 $ | | L'image-clé améliore-t-elle la ressemblance ? |

Écart à connaître : la page fal de Kling O3 Standard affiche 0,126 $/s, son API de prix 0,14 $/s. Le preset compte 0,14 $ par prudence, la première facture tranchera.

## Plan de R&D

Décision de l'utilisateur le 4 novembre 2026 : budget serré, **une seule personne de test** (la n°2) et le minimum d'essais. On s'arrête au premier résultat satisfaisant. Chaque essai demande un feu vert.

| Essai | Quoi | Coût estimé | Si le résultat est bon | Sinon |
| --- | --- | --- | --- | --- |
| 1 | Kling O3, vidéo entière, sans masque | 1,41 $ | Fin des tests, coût par commande le plus bas | Essai 2 |
| 2 | Kling 4, vidéo entière, sans masque | 1,89 $ | Fin des tests | Essai 3 |
| 3 | Masque (0,48 $), puis le meilleur des deux avec silhouette | 1,89 à 2,37 $ | Fin des tests | On en reparle |

Le protocole complet du brief (10 personnes, vote à l'aveugle) n'est pas appliqué. Tout est consigné dans `.cache/preset-lab/arrivee-star/`.

Images : les personnes de test sont générées gratuitement par l'utilisateur (prompts dans `benchmark.md`). Sur une commande client, tout reste automatique et payé à l'API.

## Prix

**985 tokens** provisoires pour `kling4-raw` (9,84 € en Essentiel, 8,21 € en Star, 7,03 € en Réalisateur). À réviser après le benchmark, le taux d'échec réel remplacera les 15 % prévus.

La règle générale de `product.ts` (1 token pour 0,0026 $) aurait donné 855 tokens, soit 54 % de marge seulement sur l'offre la moins chère au token (Réalisateur annuel, 0,485 € net les 100 tokens). `minTokens` applique donc aussi l'exigence de 60 % du brief.

## Droit et données

À faire valider par un professionnel avant la publication : ces points sont une lecture de sources secondaires, pas un avis juridique.

- **AI Act, article 50** : l'obligation de signaler un hypertrucage s'applique depuis le 2 août 2026. Le marquage lisible par machine s'impose aussi aux systèmes mis sur le marché après cette date, et au 2 décembre 2026 pour ceux déjà en service. En place : mention visible sur toute la vidéo, métadonnées du modèle conservées, commentaire ajouté. À vérifier : cela suffit-il comme marquage lisible par machine ?
- **Code pénal français, article 226-8** (hypertrucages, loi SREN) : publier un montage sans le consentement de la personne, s'il n'est pas clairement présenté comme tel, est puni. À vérifier sur Légifrance. En place : case de consentement, engagement à ne pas faire passer la vidéo pour réelle, mention visible.
- **Refusés avant tout appel payant** : mineurs apparents, nudité, personnalités publiques, photos à plusieurs personnes. La détection reste imparfaite : la case de consentement et le filtre du modèle restent nécessaires.
- **Photos** : stockage privé, liens de 50 minutes, supprimées dès la fin de la commande (filet quotidien à 24 h). Historique de fal désactivé, fichiers générés expirés sous 24 h.
- **À mettre à jour dans `/confidentialite` avant de publier** : le modèle de vision (fal, puis OpenRouter, puis Google), les éditeurs des modèles vidéo, les transferts hors UE.
- **Licences** : fal affiche « Commercial use » sur H3 Recast. Le reste est à confirmer sur la page de chaque modèle retenu, ainsi que les conditions de Kling sur les visages réels.
- **Rien n'est repris de Higgsfield** : ni nom, ni aperçu, ni sortie comme référence (interdit par leurs conditions).

## Sources

Fournisseur et code : [workflow open source Genjutsu](https://github.com/sirioberati/Genjustsu-Open-Source-Workflow) (MIT, 1 413 étoiles le 4 novembre 2026) · [Kling 4 Edit](https://fal.ai/models/kling/v4/video-to-video/edit) · [Kling O3 Standard Edit](https://fal.ai/models/fal-ai/kling-video/o3/standard/video-to-video/edit) · [H3 Max Recast](https://fal.ai/models/minimax/h3-max/recast) · [PixVerse Swap](https://fal.ai/models/fal-ai/pixverse/swap) · [Seedance 2.5 sur fal](https://fal.ai/learn/tools/how-to-access-seedance-2-5-on-fal) · [SAM 3 Video](https://fal.ai/models/fal-ai/sam-3/video-rle) · [Depth Anything Video](https://fal.ai/models/fal-ai/depth-anything-video) · [guide fal du remplacement de personnage](https://fal.ai/learn/tools/how-to-make-a-character-replacement-video) · [rétention des fichiers fal](https://fal.ai/docs/documentation/model-apis/media-expiration) · [en-têtes fal](https://fal.ai/docs/documentation/model-apis/common-parameters)

Essais et guides, tous à prendre avec prudence (éditeurs d'outils, peu de tests indépendants) : [Recast et Kling O3 testés sur un même clip](https://fuser.studio/articles/replace-people-in-video-ai) · [limites de Recast](https://fuser.studio/models/minimax-h3-recast) · [Recast : foules non testées](https://yix.ai/blog/minimax-h3-recast) · [guide Kling 4 Edit](https://www.segmind.com/models/kling-4-video-edit) · [guide Kling O3](https://www.eachlabs.ai/blog/kling-o3-pro-video-to-video-reference-guide) · [workflow PixVerse Swap](https://www.eachlabs.ai/blog/pixverse-swap-replace-anyone-in-a-video) · [masques et stabilité, H3](https://www.runcomfy.com/comfyui-workflows/minimax-h3-character-replacement-comfyui-sam3-ref2va)

Droit : [AI Act article 50, Ropes & Gray](https://www.ropesgray.com/en/insights/viewpoints/102nfqm/you-talkin-to-me-operationalising-the-eu-ai-acts-transparency-obligations) · [ICTRecht](https://www.ictrecht.nl/en/blog/heads-up-ai-act-transparency-obligations-now-in-effect) · [loi SREN et hypertrucages, Seban](https://www.seban-associes.avocat.fr/les-nouvelles-mesures-de-la-loi-sren-en-matiere-de-lutte-contre-la-desinformation-et-autres-deepfakes-prennent-une-teinte-particuliere-en-cette-periode-electorale-exceptionnelle/)

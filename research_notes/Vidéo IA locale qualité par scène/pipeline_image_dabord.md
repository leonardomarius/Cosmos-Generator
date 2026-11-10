# Pipeline « image d'abord » (keyframe image puis animation) et meilleurs modèles d'image open-weight par type de scène — état au 10 novembre 2026

Remarque générale sur les sources : beaucoup de pages trouvées sont des blogs de vendeurs ou des agrégateurs SEO. Les seules mesures chiffrées solides sont les classements Artificial Analysis (votes humains par paires) et un billet de mesure sur MiniMax H3. Aucun article scientifique comparant I2V et T2V à modèle égal n'a été trouvé.

## (a) Une keyframe générée par un modèle d'image puis animée donne-t-elle une meilleure qualité que le texte-vers-vidéo direct ?

### Takeaway
Le consensus des praticiens penche pour « image d'abord » (la keyframe fixe sujet, cadrage, lumière et couleurs ; le modèle vidéo ne gère plus que le mouvement), mais aucune comparaison contrôlée I2V contre T2V sur un même modèle n'a été trouvée. Les classements Artificial Analysis I2V et T2V ont des échelles Elo séparées et ne sont pas comparables entre eux. Le modèle vidéo dégrade bien le détail fin : environ -20 % dès le premier enchaînement, et jusqu'à -35/-39 % après 3 clips enchaînés sur MiniMax H3.

### Cited Findings
- Aucune comparaison de qualité I2V contre T2V publiée pour 2026 trouvée ; les guides décrivent le flux standard de 2026 comme « générer une image forte avec un modèle texte-vers-image, puis l'animer », avec plus de contrôle qu'en T2V pur. Source : synthèse de blogs (non académique) — [Sandbase](https://blog.sandbase.ai/text-to-video-vs-image-to-video-2026/), [ThePromptBuddy](https://www.thepromptbuddy.com/prompts/etext-to-video-vs-image-to-video-ai-models-2026-which-produces-better-results), [DEV/smophyai](https://dev.to/smophyai/text-to-video-vs-image-to-video-which-actually-produces-better-results-4h79)
- En I2V, la première image fixe sujet, composition et lumière, et le modèle ne résout plus que le mouvement. Le T2V gère plus naturellement les grands mouvements de caméra et les changements de scène — [invideo FAQ](https://invideo.io/faq/image-to-video-vs-text-to-video-which-produces-better-ai/); [Nerdbot, 3 nov. 2026](https://nerdbot.com/2026/11/03/text-to-video-vs-image-to-video-how-to-choose-an-ai-generator/)
- Le résultat ne dépasse pas la qualité de l'image de départ : envoyer une image médiocre en espérant que le modèle la corrige est une erreur courante, il faut nettoyer la source avant — [ThePromptBuddy](https://www.thepromptbuddy.com/prompts/etext-to-video-vs-image-to-video-ai-models-2026-which-produces-better-results)
- Artificial Analysis tient des arènes T2V et I2V séparées, chacune avec ses votes et son échelle Elo : un score ne se transpose pas d'un classement à l'autre. On ne peut donc pas en déduire « I2V > T2V » — [AA I2V leaderboard](https://artificialanalysis.ai/video/leaderboard/image-to-video); [Ponpon, explication des Elo](https://ponpon.ai/blog/ai-video-leaderboard-elo-scores-explained)
- Instantanés I2V AA (les valeurs varient selon la page en cache) : MiniMax H3 2e en I2V avec audio (Elo 1184, derrière Seedance 2.0 720p à 1191), 1er parmi les open-weights I2V avec audio (1185) devant LTX-2.5 Fast (1040) ; 1er sur le nouveau classement I2V v1.1 (H3 768p, 1140, devant FLUX 3 Max et Seedance 2.5 à 1138). Les pages en cache se contredisent (1140 / 1184 / 1185 / 1195 « Max ») — [AA I2V (pt)](https://artificialanalysis.ai/pt/video/leaderboard/image-to-video); [AA I2V v1.1](https://artificialanalysis.ai/video/leaderboard/image-to-video)
- **Dégradation mesurée de la keyframe (MiniMax H3 FL2VA, 768x1344, 124 images à 24 fps, 8 étapes, LoRA Turbo lightx2v, INT8)** : la part de détail le plus fin (énergie FFT > 0,25 cycle/px) tombe à 77 % et 80 % de la keyframe dès le clip 2, puis à 61-65 % au clip 4, sans jamais remonter. Après le clip 5, la netteté des bords passe au-dessus de la keyframe (jusqu'à 174 %), ce que l'auteur lit comme des bords plus durs et grossiers, pas comme du détail retrouvé. Le contraste monte de 14-16 % et les pixels quasi blancs sont multipliés par 2,3 à 2,8. Visuellement, les taches de rousseur disparaissent au clip 4 et l'ossature du visage change au clip 9 (non mesuré avec un modèle d'identité). Limites : 2 chaînes, 1 seed, 1 résolution. Billet d'un seul auteur, marqué « AI-assisted », daté du 29 oct. (2026 probable) — [DEV, Kazennov](https://dev.to/nefayran/chaining-image-to-video-clips-from-the-last-frame-what-10-links-did-to-a-face-minimax-h3-46e0)
- Recommandations du même auteur : au plus environ 3 clips enchaînés par la dernière image, puis repartir d'une keyframe redessinée. Un gros plan de visage ou un nouveau lieu commence toujours sur une keyframe fraîche. Quand un nouvel élément entre dans le champ, terminer sur une keyframe de fin dessinée (une édition de l'image de début) — [DEV, Kazennov](https://dev.to/nefayran/chaining-image-to-video-clips-from-the-last-frame-what-10-links-did-to-a-face-minimax-h3-46e0)
- LTX 2.3 : la dérive (motifs de vêtements, structure du visage, arrière-plan) apparaît au-delà d'environ 5-8 s — [MindStudio](https://www.mindstudio.ai/blog/ltx-2-3-video-to-video-modes-results)
- Première et dernière image (LTX-2.5 Pro) : les deux images doivent partager le sujet, la position et la lumière et ne différer que par ce qui doit changer. Si la dernière image n'a pas de lien avec la première, le modèle invente une transition et le mouvement devient « pâteux » — [Runware docs LTX-2.5 Pro](https://runware.ai/docs/models/lightricks-ltx-2-5-pro/guides/first-and-last-frame)
- Wan 2.7 première et dernière image : la dérive en fin de clip vient souvent d'une dernière image physiquement inatteignable. Une pose de fin atteignable compte plus qu'une jolie pose — [Wan 2.7 drift playbook](https://wan2-7ai.com/blog/wan-2-7-i2v-first-last-frame-drift-playbook)
- Workflow LTX-2 (tiers, non officiel) : dimensions de la forme 32n+1 et nombre d'images de la forme 8n+1. Commencer avec des forces modérées sur la première et la dernière image, et ajouter une image intermédiaire pour stabiliser l'identité — [RunComfy LTX-2 FLF](https://www.runcomfy.com/comfyui-workflows/ltx-2-first-last-frame-in-comfyui-audio-visual-motion-control)
- Compromis : un ancrage plus fort sur les keyframes tend à réduire le mouvement. Dans un comparatif, LTX 2.5-fast a « re-rendu » la scène avec une dérive de 34,3, contre environ 6 pour les autres modèles (un seul billet) — [Mervin Praison, sept. 2026](https://mer.vin/2026/09/which-ai-video-models-actually-take-a-first-and-last-frame/)

### Inferences
- Pour la qualité d'image pure (peau, paysages larges), l'approche image d'abord avec MiniMax H3 en FL2VA est le choix logique. H3 est le meilleur modèle I2V open-weight du classement AA, et la keyframe impose une qualité que le T2V ne garantit pas. Il faut cependant s'attendre à perdre environ 20 % du micro-détail dès le premier clip : la keyframe doit donc être plus détaillée que la cible.
- Pour du vertical 1080x1920, générer la keyframe directement en 9:16 (pas de recadrage). La mesure H3 a été faite en 768x1344 (9:16) ; un rendu H3 en 1080p natif n'est pas documenté ici.
- Première + dernière image : utile quand les deux images sont des éditions l'une de l'autre (même lumière, même cadre), par exemple avec Qwen Image Edit ou Fibo Edit à partir de la keyframe de début. Une dernière image incohérente dégrade le mouvement.
- Plans longs : préférer plusieurs keyframes fraîches (dessinées séparément) plutôt qu'un enchaînement par la dernière image, surtout pour les visages.

### Gaps
- Aucune étude ni aucun classement ne compare I2V et T2V à modèle et prompt égaux (ni article, ni Elo transposable).
- Aucune mesure d'identité faciale (ArcFace) sur un seul clip I2V : seul le cas enchaîné, jugé à l'œil, est documenté.
- Aucune donnée sur la perte de détail spécifique aux paysages larges (feuillage, texture lointaine) ni sur LTX-2.5 en I2V avec mesures chiffrées.
- Aucune consigne officielle sur la résolution optimale de la keyframe (au format de sortie ou plus grande ?) pour H3 ou LTX-2.5.

## (b) Meilleurs modèles d'image open-weight (novembre 2026), globalement et par type de scène

### Takeaway
Selon Artificial Analysis (AA-Image-T2I v2.1), le haut du classement open-weights est un trio à égalité statistique : Qwen-Image-2.1 (1046), FLUX 3 Image Klein (1042) et Fibo 2.0 (1040). Viennent ensuite Ideogram 4.0 Quality (1027) et FLUX.2 [dev] (1000, ancre). AA ne publie aucune ventilation par catégorie (portrait, paysage, etc.) : la page n'affiche que « Overall ». Pour le photoréalisme des visages et de la peau, la seule indication trouvée est communautaire et date de début 2026 : Z-Image Turbo et FLUX.2 Klein seraient devant Qwen Image 2512. **Attention licences** : Qwen-Image-2.1 (licence de recherche, non commerciale) et Fibo 2.0 (CC BY-NC selon la plupart des sources) ne sont pas utilisables commercialement en local, ce qui compte pour une activité payante.

### Cited Findings
**Classements globaux**
- Classement AA-Image-T2I v2.1 Open Weights (instantané sans date, derniers modèles d'octobre 2026) : 1 Qwen-Image-2.1 (Alibaba, sept. 2026) 1046 · 2 FLUX 3 Image Klein (BFL, oct. 2026) 1042 · 3 Fibo 2.0 (Bria, oct. 2026) 1040 · 4 Ideogram 4.0 Quality 1027 · 5 Ideogram 4.0 1003 · 6 Ming-Image-0.1-Design 1000 · 7 FLUX.2 [dev] 1000 (ancre) · 9 Cosmos3-Super-Text2Image agentic (NVIDIA) 995 · 12 HunyuanImage 3.0 Instruct 988 · 15 HiDream-O1-Image 978 · 18 Z-Image Turbo 935 · 19 HunyuanImage 3.0 933 · 20 FLUX.2 [klein] 9B 932 · 23 Qwen Image (2025) 903 · 25 FLUX.1 Krea [dev] 862. Plusieurs modèles sont à égalité (plages de rangs) — [AA open-weights](https://artificialanalysis.ai/image/leaderboard/text-to-image/open-weights)
- Le sélecteur de catégorie d'AA n'affiche que « Overall » : aucune ventilation photoréalisme, portraits, paysages, architecture ou produit n'est disponible. Classement toutes licences confondues : la tête est fermée (GPT Image 2.6 Sunburst 1259, Nano Banana 2.1 1176). Le meilleur modèle Qwen ouvert est loin derrière les versions Pro fermées (Qwen-Image-3.0-Pro 1096, Qwen-Image-3.0 1073, qui n'ont pas de lien HF et sont donc probablement fermés) — [AA T2I](https://artificialanalysis.ai/image/leaderboard/text-to-image?open-weights=true&category=photorealistic)
- Instantané du 5 nov. 2026 (theopenweights.com, données AA) : FLUX 3 Image 1119, Qwen-Image-2.1 1044, FLUX 3 Image Klein 1043, FLUX.2 [dev] 1000, Qwen Image 2.0 991, HunyuanImage 3.0 989. FLUX 3 Image (sans « Klein ») n'a pas de lien Hugging Face chez AA et est absent du classement open-weights d'AA : il est vraisemblablement fermé — [The Open Weights](https://theopenweights.com/leaderboards/text-to-image); [AA](https://artificialanalysis.ai/image/leaderboard/text-to-image/open-weights)
- AA a déclaré Qwen-Image-2.1 nouveau n°1 open-weights (T2I et édition) au 1er oct. 2026 ; sorti le 20 sept., composant visuel de 7B — [AA sur X](https://x.com/ArtificialAnlys/status/2105790682376065463) (texte complet inaccessible, HTTP 402 ; contenu repris du résultat de recherche)

**Fiches des modèles de tête**
- Qwen-Image-2.1 : 7B (32 couches DiT single-stream), génération et édition dans un seul modèle, jusqu'à 10 images de référence, 2048x2048 natif en 40 étapes, ratios dont 9:16, sortie RGBA. **Licence Qwen Research, non commerciale** (licence commerciale à demander à Qwen). La fiche ne contient aucun benchmark et Qwen ne revendique rien de précis sur le photoréalisme ou les paysages — [ai-tldr](https://ai-tldr.dev/releases/qwen-image-2-1/index.md); [Codersera](https://codersera.com/blog/how-to-run-qwen-image-2-1-locally-2026/)
- FLUX 3 Image Klein : sorti le 15 oct. 2026, 5,6B, poids de 11,2 Go en BF16 ou 5,6 Go en FP8. Licence incertaine : « FLUX Community License » selon DataLearner, licence commerciale requise au-delà d'un seuil selon d'autres sources. Aucun texte primaire BFL n'a été lu — [Digital Applied](https://www.digitalapplied.com/blog/flux-3-image-klein-open-weights-8gb-gpu); [DataLearner](https://www.datalearner.com/ai-models/pretrained-models/flux-3-image-klein); [Ayinedjimi](https://ayinedjimi-consultants.fr/news/flux3-image-klein-open-weights-2026)
- Précédent FLUX.2 [klein] : les versions 4B sont sous Apache 2.0, les 9B sous licence FLUX non commerciale — [HF FLUX.2-klein-9B LICENSE](https://huggingface.co/ModelsLab/FLUX.2-klein-9B/blob/main/LICENSE.md); [Techverda](https://techverda.com/blog/ai-image-generation-gets-a-speed-boost-black-forest-labs-unleashes-flux2-klein)
- Fibo 2.0 (Bria) : 8B flow-matching, génération et édition, Edit Turbo en 4 étapes, mis sur HF les 18-19 oct. 2026. Poids téléchargeables sous CC BY-NC 4.0 selon la plupart des sources ; seules les versions hébergées (Bria, fal) incluent les droits commerciaux. Une critique estime que son point fort en production n'est probablement pas le photoréalisme — [ComfyUI Wiki](https://comfyui-wiki.com/en/news/2026-10-20-fibo-2-0); [explainx](https://explainx.ai/blog/bria-fibo-2-0-open-weights-image-editing-text-to-image-8b-non-commercial-32-per-1k-claimed-vs-verified-2026); [Creative AI News](https://www.creativeainews.com/articles/bria-fibo-2-open-image-editor-test-2026/)

**Par type de scène (preuves faibles)**
- Style : FLUX tend vers un photoréalisme poli et « cinématique », Qwen Image suit plus précisément les prompts complexes (page vendeur fal, comparaison générale) — [fal](https://fal.ai/learn/tools/flux-vs-qwen-image)
- Photoréalisme (testeur Substack, début 2026, anciennes versions) : Z-Image Turbo bat peut-être encore Qwen Image 2512, et peut-être aussi FLUX.2 Klein. La texture de peau n'est pas toujours le point fort de Z-Image Turbo. Pour le suivi du prompt, l'ordre est FLUX.2 Klein > Z-Image Turbo > Qwen 2512 — [Diffusion Doodles, synthèse](https://diffusiondoodles.substack.com/p/open-source-diffusion-model-summary); [Diffusion Doodles, Klein](https://diffusiondoodles.substack.com/p/flux2-klein-shrinking-flux2-dev)
- Aucune comparaison propre aux paysages, à l'architecture ou intérieurs, ni aux produits n'a été trouvée.

**Support WanGP (README, consulté le 10 nov. 2026)**
- Images : Qwen Image 1/2 et 2.1 (cache KV quantifié pour Qwen Image 2.1 le 27 oct.), **Qwen Image 2.1 Viggle Image Swap** (9 nov. 2026, échange une ou plusieurs personnes en 6 étapes en gardant pose et cadrage), Flux 1/2 et **Flux 3 Klein**, Z-Image et **NitroFusion2 Z-Image Turbo** (8 nov., 1-4 étapes), **Fibo 2.0** + Edit Turbo (21 oct., présenté comme « best open-source image generator »), MOSS Image Edit SFT / HQ v4 (27 oct.), **H3 Image (P-H3-Image 8 étapes 20B, images de 8 MP**, 4 nov. ; pDMD + Regenerate en 2/4 étapes le 8 nov.), Krea 2, SenseNova, Ideogram 4, HiDream. HunyuanImage et « Qwen Image Edit 2511 » ne sont pas nommés (Kandinsky n'apparaît que côté vidéo) — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)
- LoRA : chaque modèle accepte des LoRA, et Deepy peut chercher des LoRA compatibles sur HF et Civitai (clé API Civitai nécessaire) — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- **Qualité seule** (vote humain AA, catégorie Overall) : Qwen-Image-2.1, FLUX 3 Klein et Fibo 2.0 sont indiscernables. **En usage commercial**, Qwen-Image-2.1 et Fibo 2.0 sont a priori exclus en local. Il faut vérifier la licence exacte de FLUX 3 Klein sur sa fiche HF. FLUX.2 [dev] (1000) a aussi une licence non commerciale historiquement (non revérifié ici). Restent probablement Z-Image Turbo et FLUX.2 klein 4B (Apache), mais leurs licences actuelles sont à confirmer.
- H3 Image (images de 8 MP, dans WanGP) est une piste intéressante pour des keyframes destinées à H3 vidéo (même famille), mais il ne figure pas dans le classement AA et sa licence n'a pas été vérifiée.
- Portraits et peau : sans données par catégorie, la meilleure hypothèse est FLUX 3 Klein (famille FLUX orientée photoréalisme), avec Z-Image Turbo comme alternative. Un test A/B maison s'impose.
- Paysages, architecture, produits : rien de sourcé ; Qwen (suivi du prompt, compositions complexes) est plausible pour l'architecture et les intérieurs.

### Gaps
- Aucune ventilation par catégorie chez AA (seul « Overall » est affiché) et aucune comparaison communautaire Qwen-Image-2.1 / FLUX 3 Klein / Fibo 2.0 sur la peau ou les paysages n'a été trouvée (pas de fils Reddit indexés).
- Statut et licence de FLUX 3 Image (non-Klein), H3 Image et Z-Image Turbo non vérifiés à la source primaire.
- GenAI-Bench et LMArena image non consultés (budget d'appels).

## LoRA et fine-tunes de réalisme (peau, photographie de paysage)

### Takeaway
Aucune source fiable n'a été trouvée sur les LoRA de réalisme de 2026 pour Qwen-Image-2.1, FLUX 3 Klein ou Z-Image Turbo. Le seul fait sourcé est que WanGP accepte des LoRA sur chaque modèle et peut les chercher sur HF et Civitai.

### Cited Findings
- Aucune source ne mentionne de LoRA de réalisme, de peau ou de paysage pour Qwen-Image-2.1 — [recherche Qwen-Image-2.1 / Codersera](https://codersera.com/blog/how-to-run-qwen-image-2-1-locally-2026/)
- Qwen Image Edit 2511 intègre directement des « LoRA communautaires populaires » (annonce Qwen, déc. 2025) — [Qwen sur X](https://x.com/Alibaba_Qwen/status/2003496348461728213)
- WanGP : LoRA par modèle, recherche via Deepy sur HF et Civitai, dossier de LoRA partagé entre NitroFusion2 et Z-Image Turbo — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)

### Inferences
- Comme les modèles de tête datent de septembre-octobre 2026, l'écosystème de LoRA est probablement encore jeune. Les LoRA de réalisme les plus mûrs visent sans doute Z-Image Turbo et FLUX.2, qui existent depuis plus longtemps (hypothèse non vérifiée).

### Gaps
- Noms concrets de LoRA de réalisme (peau, photo de paysage) populaires en 2026 sur Civitai : non trouvés. Il faut consulter directement Civitai, filtré par modèle de base.

## Identité sur la keyframe à partir d'une seule photo

### Takeaway
Aucun test direct comparant Qwen Image Edit 2511, Viggle Image Swap, PuLID, InfiniteYou et USO sur la ressemblance n'a été trouvé. InfiniteYou bat PuLID-FLUX selon ses propres auteurs. Qwen Image Edit 2511 revendique une meilleure cohérence d'identité sans chiffres. Dans WanGP, les options réellement disponibles sont Qwen Image 2.1 Viggle Image Swap (9 nov. 2026) et l'édition multi-références de Qwen-Image-2.1 ou Fibo 2.0.

### Cited Findings
- Qwen-Image-Edit-2511 (déc. 2025) : moins de dérive d'image, meilleure cohérence de personnage et d'identité, meilleure gestion multi-personnes. Ce sont des affirmations du vendeur ; un test amateur montre que visage et coiffure sont conservés. Aucun benchmark chiffré — [Qwen sur X](https://x.com/Alibaba_Qwen/status/2003496348461728213); [MyAIForce](https://myaiforce.com/qie-2511/); [The Decoder](https://the-decoder.com/qwen-updates-image-editing-model-with-better-character-consistency/)
- InfiniteYou contre PuLID-FLUX : ID Loss la plus basse, et préféré dans 72,8 % des cas contre 27,2 % pour PuLID-FLUX en étude utilisateurs (résultats des auteurs). PuLID-FLUX souffre d'un mauvais alignement texte-image et d'un effet « copier-coller » du visage — [InfiniteYou arXiv 2503.16418](https://arxiv.org/pdf/2503.16418)
- Qwen Image 2.1 Viggle Image Swap (WanGP, 9 nov. 2026) : échange une ou plusieurs personnes en 6 étapes en conservant pose et cadrage — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)
- Qwen-Image-2.1 accepte jusqu'à 10 images de référence et cite les portraits de groupe parmi ses cas d'usage — [ai-tldr](https://ai-tldr.dev/releases/qwen-image-2-1/index.md)

### Inferences
- Pipeline plausible dans WanGP : générer la scène (keyframe sans identité), puis faire Viggle Image Swap avec la photo du client, puis animer avec H3 en FL2VA. Il faut redessiner une keyframe fraîche pour chaque gros plan de visage, puisque la vidéo efface les détails du visage (voir section a). Viggle Swap repose sur Qwen-Image-2.1, dont la licence est non commerciale (à vérifier pour ce dérivé).

### Gaps
- Aucune mesure ArcFace commune entre ces méthodes. USO non couvert. Ressemblance de Viggle Image Swap non documentée (sorti la veille).

## Upscaling ou « détaillage » de la keyframe avant animation

### Takeaway
La recommandation d'agrandir une keyframe petite ou floue avant l'animation est fréquente mais vient de vendeurs ; aucun test contrôlé ne montre qu'elle améliore la vidéo finale. Un agrandissement trop agressif peut amplifier les artefacts. Dans WanGP, les options pour une image fixe sont FlashVSR / FlashVSR+ Turbo et RelayVSR (images et vidéos). SeedVR y figure aussi, sans précision sur l'usage en image fixe.

### Cited Findings
- Agrandir l'image avant le mouvement quand elle est petite, floue ou compressée : une source plus nette donne plus de détail au modèle vidéo (page vendeur) — [SeedVR2 image-to-video](https://seedvr2.net/image-to-video)
- Un agrandissement 4K/8K trop confiant peut amplifier les artefacts de la source — [guide SeedVR2](https://seedvr2.net/blog/tutorials/seedvr2-ai-upscale-korean-beginners-guide-2026)
- SeedVR2 : restauration par diffusion en une étape, variantes 3B et 7B, workflows officiels ComfyUI pour l'image et la vidéo — [ComfyUI docs SeedVR2](https://docs.comfy.org/tutorials/utility/seedvr2); [Comfy workflow image](https://comfy.org/workflows/utility_seedvr2_image_upscale-857e50707831/)
- WanGP : RelayVSR (images et vidéos, x4, x2 natif, 8 nov. 2026), FlashVSR / FlashVSR+ Turbo (images et vidéos, raffinement 1x à x4, 21 oct. 2026), SeedVR (sans détails), Lanczos, RIFE — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)
- Indice indirect : la perte d'environ 20 % du micro-détail dès le premier clip H3 (section a) suggère que la keyframe gagne à être plus détaillée que la cible — [DEV, Kazennov](https://dev.to/nefayran/chaining-image-to-video-clips-from-the-last-frame-what-10-links-did-to-a-face-minimax-h3-46e0)

### Inferences
- Les modèles de tête génèrent nativement en 2048 px (Qwen-Image-2.1) ou 8 MP (H3 Image) : générer directement en haute résolution 9:16 rend sans doute l'upscale de keyframe moins utile qu'un raffinement 1x (FlashVSR en mode raffinement) ou qu'un upscale de la vidéo finale. C'est une hypothèse.

### Gaps
- Aucun A/B publié comparant la vidéo finale avec et sans upscale de la keyframe. SUPIR et les upscalers Flux/Qwen n'ont pas été couverts.

## Support WanGP ou ComfyUI uniquement

### Takeaway
D'après le README WanGP (10 nov. 2026), WanGP couvre les modèles de tête utiles : Qwen-Image-2.1, Viggle Swap, Flux 3 Klein, Fibo 2.0, Z-Image Turbo, H3 Image, HiDream, et MiniMax H3 en FL2VA/Ref2VA. Sont absents par leur nom : HunyuanImage 3.x, Qwen Image Edit 2511 (en tant que tel), PuLID, InfiniteYou, USO et SeedVR2 pour l'image (ComfyUI dispose de workflows officiels SeedVR2 image).

### Cited Findings
- Liste des modèles WanGP et dates : voir la section (b) — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)
- Vidéo dans WanGP : MiniMax H3 en FL2VA et Ref2VA (FastH3 Omni le 21 oct., LoRA d'accélération FL2V/Ref2V le 27 oct., HyperFlow Flash avec son en 4/6/8 étapes le 8 nov., DMAD en 4/8 étapes le 9 nov.) ; LTX-2 / 2.3 / 2.5. Le README ne décrit pas l'I2V ni la première + dernière image pour LTX-2.5 — [WanGP README](https://github.com/deepbeepmeep/Wan2GP)
- SeedVR2 image : workflow officiel ComfyUI — [Comfy](https://comfy.org/workflows/utility_seedvr2_image_upscale-857e50707831/)

### Gaps
- PuLID, InfiniteYou et USO sont-ils disponibles dans WanGP ? Non mentionnés dans le README, à confirmer dans le code ou le Discord de WanGP.

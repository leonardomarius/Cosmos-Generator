# Identité du visage en vidéo : modèles open-weight locaux (état au 2026-11-10)

Contexte : RTX 5070 Ti 16 Go, Windows 11, WanGP. Aujourd'hui MiniMax H3 Ref2VA donne une bonne ressemblance (environ 15 min par clip), LTX-2.5 MSR une mauvaise, et Qwen Image Edit Plus 2511 avec la LoRA Lightning 4 étapes sert à remplacer la personne sur une image clé. Service payant, entreprise en France (UE).

## 1. Modèles référence ou identité vers vidéo : ressemblance, VRAM, licence

### Takeaway
Selon les benchmarks publiés, les meilleures ressemblances open-weight viennent de modèles basés sur Wan : Lynx (ByteDance, Apache 2.0) en tête de son propre benchmark, RefAlign-14B et VACE-14B en tête du FaceSim d'OpenS2V-Eval. MiniMax H3 Ref2VA, utilisé aujourd'hui, n'a publié aucune mesure de ressemblance. **Surtout, sa licence semble exclure l'UE par défaut**, ce qui est un risque juridique direct pour un service commercial basé en France.

### Cited Findings
**Classement OpenS2V-Eval** (tableau repris dans le dépôt RefAlign, ECCV 2026, FaceSim et TotalScore) — [RefAlign GitHub](https://github.com/gudaochangsheng/RefAlign) :
- RefAlign-14B (open) : TotalScore 60,42 %, FaceSim **55,23 %**. RefAlign-1.3B : 56,30 %, FaceSim 53,06 %. Poids 1.3B et 14B publiés sur HF et ModelScope. La base semble être Wan2.1-T2V (déduit des scripts). Le type de licence n'apparaît pas sur la page.
- VACE-14B (open) : 57,55 %, FaceSim **55,09 %**
- BindWeave : 57,61 %, FaceSim 53,71 %. Il est classé « Closed-Source » dans ce tableau, alors qu'un dépôt officiel existe ([bytedance/BindWeave](https://github.com/bytedance/BindWeave), ICLR 2026). Le statut des poids reste à vérifier.
- VINO (open) : 57,85 %, FaceSim 52,00 %
- Phantom-14B : 56,77 %, FaceSim 51,46 %, amplitude de mouvement la plus élevée des modèles open (33,42 %). Phantom-1.3B : 54,89 %, FaceSim 48,56 %.
- SkyReels-A2-P14B : 52,25 %, FaceSim 45,95 %
- MAGREF-480P : 52,51 %, FaceSim **30,83 %**, le plus faible. SOTA2 donne 32,94 pour MAGREF, les chiffres varient selon les sources ([SOTA2](https://www.sota2.com/research/sota/subject-to-video-on-opens2v-eval)).
- Points de comparaison fermés : Kling 1.6 a un FaceSim de 40,10 %, Vidu 2.0 de 35,11 %.

**Lynx (ByteDance, CVPR 2026)** — [arXiv 2509.15496](https://arxiv.org/html/2509.15496v1) :
- Une seule photo du visage. Base Wan2.1 avec deux adaptateurs légers.
- Similarité cosinus (facexlib / insightface / interne) :
  - **Lynx 0,779 / 0,699 / 0,781**
  - SkyReels-A2 0,715 / 0,678 / 0,725
  - Phantom 0,664 / 0,659 / 0,689
  - Stand-In 0,611 / 0,576 / 0,634
  - VACE 0,594 / 0,548 / 0,615
  - MAGREF 0,575 / 0,510 / 0,591
- Lynx est aussi premier en qualité vidéo (0,956, note Gemini) et en suivi du prompt (0,722).
- Attention : ce benchmark est fait par les auteurs, et l'ordre VACE/SkyReels y diffère de celui d'OpenS2V.
- Licence Apache 2.0, base Wan2.1-T2V-14B ([HF ByteDance/lynx](https://huggingface.co/ByteDance/lynx/blob/main/README.md)). Une variante Lynx-lite existe ([miroir gitlink](https://www.gitlink.org.cn/mirrors/lynx)).
- Ressources mesurées sur un H100 : pic de **50,73 Go** de VRAM et **563 s** de latence pour Lynx. À comparer avec 52,81 Go pour SkyReels-A2 et 64,19 Go pour Phantom (sur 8 GPU) ([supplément CVPR 2026](https://openaccess.thecvf.com/content/CVPR2026/supplemental/Sang_Lynx_Towards_High-Fidelity_CVPR_2026_supplemental.pdf)).

**Stand-In (WeChat CV et Nankai, CVPR 2026)** — [GitHub WeChatCV/Stand-In](https://github.com/WeChatCV/Stand-In) :
- Licence Apache 2.0. Seulement 153M de paramètres ajoutés (environ 1 %) sur Wan2.1-T2V-14B.
- Une version Wan2.2-T2V-A14B est sortie le 2025-12-22, plus une version compatible VACE et le support des LoRA.
- Intégré à ComfyUI-WanVideoWrapper par kijai, avec un avertissement : implémentation différente de l'officielle.
- Mode d'échange de visage en vidéo expérimental.
- Dernière annonce : « Stand-In-V2 is coming soon » (2026-08-10).
- Le téléchargement inclut `antelopev2` (InsightFace).
- Aucune VRAM officielle. Le chiffre « 12 Go et plus » vient d'un guide tiers non vérifié ([DEV Community](https://dev.to/localfaceswap/tencent-stand-in-local-ai-video-generation-with-identity-preservation-1lj4)).
- Sur le jeu OpenS2V (test) de SOTA2, Stand-In a une similarité de visage de 0,724 contre 0,519 pour Phantom-14B. Ce n'est pas le même protocole que ci-dessus ([SOTA2](https://www.sota2.com/research/sota/identity-preserving-video-generation-on-opens2v-test)).

**MiniMax H3 Ref2VA (modèle actuel)** :
- Poids publiés début août 2026. La licence prend effet le 2 août 2026.
- Tailles d'un checkpoint : 20,97 Go en int8 élagué, 34,04 Go en int8, 66,28 Go en bf16. Le minimum pour faire tourner une tâche est de 42,5 Go au total.
- ComfyUI affirme qu'une carte de 12 Go suffit avec offload (affirmation non vérifiée). Il est conseillé d'avoir 64 Go de RAM. Sortie native à 768 px sur le petit côté ([Atlas Cloud](https://www.atlascloud.ai/blog/tips/minimax-h3-open-source-weights)).
- Entrées acceptées : jusqu'à 9 images, 3 vidéos et 3 audios de référence ([comfyui-wiki](https://comfyui-wiki.com/en/news/2026-08-03-minimax-h3-open-weights-comfyui)).
- Aucune métrique de ressemblance publiée ([HF MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)).
- **Licence** : « MiniMax H3 Community License ». Selon Atlas Cloud, la zone d'application **exclut l'Union européenne, le Royaume-Uni, la Corée du Sud et les États-Unis** ([Atlas Cloud](https://www.atlascloud.ai/blog/tips/minimax-h3-open-source-weights)). La page officielle sur HF confirme indirectement : elle propose un « Application form (only for USA/EU/UK/South Korea) » ([HF](https://huggingface.co/MiniMaxAI/MiniMax-H3)).
- Autres clauses : afficher « MiniMax H3 » de façon visible dans l'interface d'un produit commercial, et obtenir une autorisation écrite au-delà de 20 M$ de chiffre d'affaires annuel ([Atlas Cloud](https://www.atlascloud.ai/blog/tips/minimax-h3-open-source-weights)).

**Nouveautés WanGP** (journal des versions, octobre-novembre 2026) — [Wan2GP GitHub](https://github.com/deepbeepmeep/Wan2GP) :
- 9 novembre : LoRA H3 HyperFlow pour un Ref2VA en 8 étapes, accélérateurs DMAD en 4 ou 8 étapes pour Ref2VA et FL2VA, et « H3 Regenerate 2K IC with better identity retention ».
- 21 octobre : FastH3 Omni (Ref2VA, variante NVFP4) et profil mémoire 0.
- Lynx, Stand-In, Phantom, MAGREF et HuMo n'apparaissent pas dans les entrées récentes du README.

**Recherche 2026 sans poids vérifiés** : AnyID (CVPR 2026), KeyID et ARGUS existent en papier, mais leur statut open-weight n'est pas confirmé ([AnyID CVPR 2026](https://openaccess.thecvf.com/content/CVPR2026/papers/Wang_AnyID_Ultra-Fidelity_Universal_Identity-Preserving_Video_Generation_from_Any_Visual_References_CVPR_2026_paper.pdf), [KeyID](https://arxiv.org/pdf/2608.16154)).

**Wan après la 2.2** : selon un tutoriel CyberLink, Wan 2.2 est la dernière version de Wan publiée avec ses poids, aucune plus récente en septembre 2026 ([CyberLink](https://www.cyberlink.com/blog/trending-topics/5091/wan-2-2)).

### Inferences
- **Ressemblance** : d'après les chiffres publiés, Lynx > SkyReels-A2 ≈ Phantom > Stand-In ≈ VACE > MAGREF. Sur OpenS2V, RefAlign-14B ≈ VACE-14B > BindWeave > VINO > Phantom > SkyReels-A2 > MAGREF. MAGREF est faible partout.
- **Risque juridique** : si l'exclusion de l'UE se confirme dans le texte officiel, faire tourner MiniMax H3, et donc Viggle Remake qui en dérive, dans un service commercial français demande une autorisation de MiniMax. Lire le fichier LICENSE et la Q&A officielle est prioritaire.
- **Alternatives Apache 2.0** : Lynx et Stand-In sont sous Apache 2.0 et basés sur Wan. Ce sont les remplaçants juridiquement les plus propres pour la ressemblance. Sur 16 Go, il faudra de la quantification et de l'offload : le pic de 50 Go est mesuré sur H100 sans optimisation.
- **Licence cachée** : Stand-In, et probablement les autres méthodes à embeddings ArcFace, utilisent des poids InsightFace (antelopev2) pour la détection et l'encodage du visage. Ces poids sont non commerciaux (voir section 6). C'est une contrainte de licence indirecte.

### Gaps
- Aucune donnée trouvée sur HuMo, ConsisID, Concat-ID ni sur la licence de SkyReels-A2. Les recherches ont manqué de temps.
- Licences de Phantom et de RefAlign non confirmées.
- Aucune mesure de VRAM ou de vitesse sur une carte de 16 Go pour Lynx, Stand-In ou Phantom.
- Le support de Lynx et Stand-In dans WanGP n'est pas vérifié (seules les entrées récentes du README ont été lues).
- Le texte exact de la licence MiniMax H3 (fichier LICENSE) n'a pas été lu. L'exclusion de l'UE vient d'une source secondaire, recoupée seulement par le libellé du formulaire officiel.

## 2. Remplacer la personne dans une vidéo existante et transférer le mouvement

### Takeaway
Les deux voies locales principales sont Wan2.2-Animate-14B en mode replace (Apache 2.0, lumière harmonisée par une LoRA de relighting) et Viggle Remake (novembre 2026, LoRA sur MiniMax H3, intégré à WanGP le 8 novembre). Viggle Remake hérite de la licence MiniMax H3, donc probablement de l'exclusion de l'UE. Aucun benchmark de ressemblance indépendant n'existe pour l'un ou l'autre.

### Cited Findings
**Wan2.2-Animate-14B** :
- Poids et code publiés le 19 septembre 2025, avec deux modes : animation et remplacement ([Wan sur X](https://x.com/Alibaba_Wan/status/1968921551392432175), [HF](https://huggingface.co/Wan-AI/Wan2.2-Animate-14B)).
- Licence Apache 2.0 et LoRA de relighting ([AlphaSignal](https://alphasignal.ai/news/alibaba-s-wan2-2-animate-lets-you-swap-characters-into-any-video)).
- Fonctionnement : le personnage d'origine est segmenté, l'arrière-plan est conservé, puis le nouveau personnage est généré à sa place ([résumé du papier](https://www.themoonlight.io/review/wan-animate-unified-character-animation-and-replacement-with-holistic-replication)).
- VRAM : aucun chiffre mesuré trouvé. Le 720p demande nettement plus que le 480p, et une variante fp8 « scaled » existe ([comfyui-wiki](https://comfyui-wiki.com/en/tutorial/advanced/video/wan2.2/wan2-2-animate), [AI FILMS](https://studio.aifilms.ai/blog/wan-2-2-animate)).
- Défaut signalé : le personnage suit bien le jeu de l'acteur source mais peut ne plus ressembler à la référence. Il faut contrôler les ombres, la température de couleur, le contact avec le sol et les bords des cheveux ([AI FILMS](https://studio.aifilms.ai/blog/wan-2-2-animate)).
- « Wan Animate 2 » : WanGP en parle (cache KV quantifié ajouté le 27 octobre 2026) ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)). AlphaSignal mentionne un « Animate-2-14B » (multi-personnages, 10 étapes distillées) sans source primaire, et CyberLink affirme qu'aucun Wan plus récent n'a de poids publics. **Statut contradictoire.**

**Viggle Remake** ([HF Viggle/Viggle-Remake](https://huggingface.co/Viggle/Viggle-Remake)) :
- 20B paramètres, LoRA de rang 256 sur MiniMax-H3, deux modes : `swap` (personnes) et `edit` (objets, décor, météo, lumière).
- Entrées : la vidéo source, 1 à 4 images clés repeintes, éventuellement épinglées à une image précise de la source, et un prompt en 6 sections. La bande-son d'origine est conservée.
- Format : 1280×736, par fenêtres de 90 à 345 images à 24 fps.
- Matériel :
  - environ **28 min par fenêtre de 345 images sur une RTX 5090** (32 Go, avec environ 60 Go de RAM) ;
  - 12 à 24 Go de VRAM possibles via ComfyUI en int8 ou GGUF ;
  - 80 Go et plus en bf16.
- Licence : MiniMax H3 Community License pour les poids, Apache 2.0 pour le code.
- La fiche avertit que le modèle mettra aussi facilement le visage d'une personne réelle sans son consentement. Il n'a aucun garde-fou.
- Intégré à WanGP le 8 novembre 2026 sous le nom « Viggle Remake » (meilleur en 720p, plus difficile sur les petits visages et les coupes rapides), avec l'automatisation Showrunner ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).
- Antériorité : SwapAnyone, modèle académique open source, restait derrière Viggle AI (alors fermé) en cohérence d'identité ([arXiv 2503.09154](https://arxiv.org/pdf/2503.09154)).

**Mode échange de visage de Stand-In** : expérimental car Wan2.1 ne sait pas faire d'inpainting. Avec `--denoising_strength` 0,85, le visage paraît plus naturel mais une plus grande part de l'arrière-plan est redessinée. L'option `--force_background_consistency` garde le fond mais crée des artefacts de contour ([Stand-In GitHub](https://github.com/WeChatCV/Stand-In)).

**VACE combiné à Stand-In** : il faut baisser `vace_scale` à environ 0,5, car VACE tire vers les visages ([Stand-In GitHub](https://github.com/WeChatCV/Stand-In)).

### Inferences
- Pour une scène fixe déjà tournée (arrivée au restaurant, statue), on peut générer une vidéo de référence une fois, puis remplacer seulement la personne à chaque commande. Wan2.2-Animate en replace (Apache 2.0) est l'option juridiquement sûre. Cela rejoint l'approche « vidéo de référence unique » déjà retenue pour le Père Noël.
- Viggle Remake suit exactement le même flux (image clé repeinte avec Qwen, puis propagation) et il est déjà dans WanGP. Mais sa licence pose le même problème UE que H3, et 28 min sur une 5090 laisse prévoir bien plus sur une 5070 Ti de 16 Go.

### Gaps
- Aucune source trouvée sur UniAnimate-DiT, MimicMotion, Ditto ou Lucy Edit : pas de recherche faute de temps.
- Aucune mesure de ressemblance publiée pour Wan2.2-Animate en replace ni pour Viggle Remake.
- Aucun temps de rendu mesuré sur 16 Go.

## 3. Édition d'identité sur l'image clé (une photo vers une image)

### Takeaway
Aucun benchmark rigoureux de 2026 ne départage Qwen-Image-Edit-2511, FLUX.2, InfiniteYou et PuLID. Les comparaisons jugées par IA mettent Qwen 2511 et FLUX.2 à peu près à égalité, selon le cas. WanGP a ajouté le 9 novembre 2026 « Qwen Image 2.1 Viggle Image Swap », spécialisé dans le remplacement de personnes.

### Cited Findings
- **Qwen 2511 contre FLUX.2** : sur l'arène Lumenfall (juge IA), les résultats sont partagés. Qwen garde mieux le visage dans certains tests, FLUX.2 [flex] en garde mieux l'identité dans d'autres, Qwen y modifiant la structure du visage ([max](https://lumenfall.ai/arena/compare/flux.2-max/qwen-image-edit-2511), [flex](https://lumenfall.ai/arena/compare/flux.2-flex/qwen-image-edit-2511), [pro](https://lumenfall.ai/compare/flux.2-pro/qwen-image-edit-2511)).
- **InfiniteYou (mars 2025, FLUX.1)** : perte d'identité la plus faible de son benchmark, et préféré à PuLID-FLUX dans 72,8 % des cas d'une étude utilisateurs. PuLID souffre d'un effet « copier-coller » du visage. Évaluation faite par les auteurs ([arXiv 2503.16418](https://arxiv.org/html/2503.16418v1)).
- **Qwen Image 2.1 Viggle Image Swap** (WanGP, 9 novembre 2026) : remplace une ou plusieurs personnes en 6 étapes, à partir d'une image source et d'une fiche personnage par personne, à environ 1 MP. Les sorties peuvent être un peu plus sombres ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).
- **Éditeurs multi-références dans WanGP** : Fibo 2.0 (jusqu'à 4 références), MOSS Edit SFT (jusqu'à 4 références ordonnées), MOSS Edit HQ v4 (retouches locales) ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).

### Inferences
- Qwen Image 2.1 Viggle Image Swap correspond exactement à l'usage « mettre le client dans l'image clé ». À tester contre Qwen 2511 avec Lightning, sur la même photo, avec un score ArcFace.
- Sa licence (dérivée de Qwen ou de Viggle) n'est pas vérifiée.

### Gaps
- Aucune donnée trouvée sur USO, InstantID en 2026 ni sur FLUX.2 Kontext en local.
- Aucune comparaison de type ArcFace indépendante en 2026.
- Licence de Qwen Image 2.1 et de la variante Viggle non vérifiée.

## 4. Restauration et cohérence du visage après génération

### Takeaway
Les outils classiques existent, mais leurs licences diffèrent : GFPGAN et RestoreFormer sont sous Apache 2.0 (utilisables commercialement), CodeFormer et GPEN sont non commerciaux. WanGP a ajouté TaoMate-FVSR, un raffineur de visages vidéo qui ne remplace pas le visage et peut modifier la bouche.

### Cited Findings
- Licences selon la documentation FaceFusion ([FaceFusion Licenses](https://docs.facefusion.io/introduction/licenses)) :
  - Apache 2.0 : GFPGAN, RestoreFormer.
  - Non commerciaux : CodeFormer (S-Lab 1.0), GPEN, StyleGANEX.
  - Upscalers permissifs : Real-ESRGAN (BSD-3), Swin2SR (Apache 2.0).
- TaoMate-FVSR (WanGP, 8 novembre 2026) : affine jusqu'à 5 visages. Ce n'est pas un remplacement de visage, et les mouvements de bouche peuvent changer. FlashVSR et RelayVSR sont aussi disponibles comme upscalers ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).
- « H3 Regenerate 2K IC » : passe de régénération en 2K avec une meilleure rétention de l'identité, environ 3 étapes de plus ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).

### Inferences
- Un restaurateur (GFPGAN, CodeFormer) améliore la netteté, pas la ressemblance. Pour gagner en ressemblance après coup, il faut un échangeur de visage, qui pose les problèmes de licence de la section 6.

### Gaps
- Aucune mesure trouvée du gain de ressemblance (ArcFace) apporté par une passe de restauration.

## 5. Pipelines pratiques recommandés par la communauté (16 Go)

### Takeaway
Aucun fil r/StableDiffusion ni Banodoco de 2026 n'a été trouvé. Les sources disponibles se limitent à des repères matériels généraux. Le schéma qui se dessine, et que WanGP outille désormais (Showrunner, Viggle Remake) : éditer une image clé avec l'identité du client, puis propager en vidéo.

### Cited Findings
- 16 Go est présenté comme le minimum pratique pour la vidéo IA en 2026, avec ComfyUI et VideoHelperSuite comme base ([Radiance Systems](https://www.radiancesystems.eu/en/blogs/intelligence-artificielle-et-llm-local/pc-pour-generation-video-ia)).
- Un blog vendeur affirme que LTX-Video 2.3 offre la meilleure identité faciale des modèles open source. C'est contredit par l'expérience de l'utilisateur avec LTX-2.5 MSR et ce n'est pas vérifié ([Radiance Systems](https://www.radiancesystems.eu/en/blogs/intelligence-artificielle-et-llm-local/pc-pour-generation-video-ia)).
- Showrunner (WanGP, octobre-novembre 2026) garde visages, tenues et voix cohérents d'un plan à l'autre. Les aperçus Draft/Final sont en 480p ([Wan2GP](https://github.com/deepbeepmeep/Wan2GP)).

### Inferences
- Deux pipelines sont candidats pour 16 Go :
  - **(a) Image clé puis vidéo** : Qwen Image Swap ou Qwen 2511 pour mettre le client sur l'image clé, puis Wan2.2 I2V ou FL2V, puis éventuellement GFPGAN.
  - **(b) Vidéo de référence puis remplacement** : vidéo tournée une fois, puis Wan2.2-Animate en replace avec la photo du client.
- Les deux évitent la licence H3. Mesurer chaque option avec un score ArcFace sur une seule photo test, conformément à la règle de budget minimal.

### Gaps
- Aucun consensus communautaire de 2026 vérifié (la recherche Reddit n'a rien donné).

## 6. Consentement et restrictions de licence des modèles de visage

### Takeaway
La plupart des échangeurs de visage open (inswapper, SimSwap, BlendSwap, HyperSwap) sont non commerciaux ou sous ResearchRAIL, tout comme ArcFace, RetinaFace et SCRFD (InsightFace). Un service payant doit éviter ces modèles ou acheter une licence. Côté consentement, Viggle Remake n'a aucun garde-fou intégré.

### Cited Findings
- Le code InsightFace est sous MIT, mais les modèles préentraînés sont réservés à la recherche non commerciale. Une licence commerciale payante d'InSwapper-128 est proposée ([InsightFace](https://www.insightface.ai/solutions/face-swapping), [Magic Hour](https://magichour.ai/blog/how-to-use-facefusion)).
- Dans FaceFusion ([FaceFusion Licenses](https://docs.facefusion.io/introduction/licenses)) :
  - non commerciaux : INSwapper, SimSwap, BlendSwap, ArcFace, RetinaFace, SCRFD, AlphaFace ;
  - ResearchRAIL : HyperSwap ;
  - licence inconnue : HifiFace ;
  - Apache 2.0 : GHOST (échange de visage) et LivePortrait (MIT).
- Viggle Remake n'a aucune vérification d'identité ni de consentement. Il demande de ne pas l'utiliser sur des personnes non consentantes et d'étiqueter les sorties comme générées par IA ([HF Viggle-Remake](https://huggingface.co/Viggle/Viggle-Remake)).
- MiniMax H3 : zone d'application hors UE, Royaume-Uni, Corée du Sud et États-Unis, mention « MiniMax H3 » obligatoire dans l'interface, autorisation au-delà de 20 M$ de CA ([Atlas Cloud](https://www.atlascloud.ai/blog/tips/minimax-h3-open-source-weights), [HF](https://huggingface.co/MiniMaxAI/MiniMax-H3)).

### Inferences
- **Choix commercialement propres** : Lynx, Stand-In et Wan2.2-Animate (Apache 2.0) pour la génération, GHOST pour l'échange de visage, GFPGAN et RestoreFormer pour la restauration.
- **Point de vigilance** : des dépendances comme antelopev2 ou ArcFace (InsightFace) restent non commerciales même dans des projets Apache.
- **Consentement** : c'est le service qui doit l'assurer (case de consentement, photo de soi uniquement, mention IA). Le Règlement IA de l'UE impose l'étiquetage des deepfakes, mais cela n'a pas été vérifié dans cette recherche.

### Gaps
- Licence exacte de GHOST et qualité de GHOST en vidéo non vérifiées.
- Texte primaire de la licence MiniMax H3 non lu.
- Obligations du Règlement IA de l'UE non recherchées.

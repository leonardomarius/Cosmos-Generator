# Presets vidéo

Un preset est une vidéo de référence fixe où la personne d'une photo remplace le personnage principal. Tout le travail lourd est fait une fois, en amont : le client envoie sa photo et reçoit le résultat, sans réglage.

Chaque preset est un dossier : `preset.json` (le réglage complet, versionné), `benchmark.md` (les preuves), `assets/` (fichiers fixes).

## Une commande, du début à la fin

1. **Vérifications gratuites et par vision** : compte, accès, consentement, photo jugée par un modèle de vision (une seule personne, majeure, visage net…). Une photo refusée ne coûte aucun token.
2. **Tokens retirés**, photos dans un stockage privé. Les fournisseurs ne reçoivent que des liens signés de 50 minutes.
3. **Image-clé** (si la variante en utilise une) : la photo du client intégrée à l'image de 7 s de la vidéo.
4. **Vidéo** chez le modèle de la variante retenue.
5. **Assemblage sans IA** : son d'origine remis à l'identique, mention « Généré par IA », et, si demandé, décor d'origine recollé autour de la personne.
6. **Vérification de la vidéo**, puis livraison par lien signé et email. Photos supprimées aussitôt, vidéo au bout de 7 jours.

Échec à n'importe quelle étape : tokens rendus, email d'excuse. Aucune génération payante n'est relancée après une réponse ambiguë.

Le code : `src/lib/presets/` (`machine.ts` pour le déroulé, `provider.ts` pour le fournisseur, `jobs.ts` pour le site). Le Preset Lab utilise la même machine que le site : ce qui est testé est ce qui est vendu.

## Créer ou régler un preset

```bash
node scripts/preset-prepare.mjs <id>                 # gratuit : normalise la vidéo, son, images clés, mention
node scripts/preset-prepare.mjs <id> grid            # gratuit : images quadrillées pour viser le personnage (prep.sam)
node scripts/preset-selftest.mjs                     # gratuit : tests de toute la chaîne, sans appel payant
node scripts/preset-lab.mjs check                    # gratuit : le preset est-il valide ? (aussi lancé par npm run build)
node scripts/preset-lab.mjs economics <id>           # gratuit : coût, prix minimum et marge de chaque variante
node scripts/preset-lab.mjs plan <id> --variants a,b --photos 1 --clip 4.5-9.5   # gratuit : coût exact d'un essai
```

Les commandes suivantes demandent `node --env-file=.env.local` :

```bash
scripts/preset-prepare.mjs <id> upload               # envoie les fichiers fixes chez fal (aucune génération)
scripts/preset-prepare.mjs <id> masks --go           # PAYANT : masque SAM 3 et profondeur, une seule fois par vidéo
scripts/preset-lab.mjs run <id> --variant a --photos p1.jpg,p2.jpg --clip 4.5-9.5 --go --max-usd 1.5   # PAYANT : un essai
scripts/preset-lab.mjs blind <id> --candidate a --against b   # crée le lien du vote à l'aveugle
scripts/preset-lab.mjs score <id> --campaign <uuid>  # calcule les critères et écrit benchmark.json
```

Puis, sans clé : `scripts/preset-prepare.mjs <id> composite` (silhouette et vidéo de contrôle), `approve-mask --by … --note …` (après avoir regardé toute la vidéo de contrôle) et `scripts/preset-lab.mjs report <id>` (comparaison locale de tous les essais).

Règles : aucune génération payante sans feu vert pour cet essai précis, et toute dépense est notée dans `.cache/preset-lab/<id>/depenses.jsonl`.

## Publier

`"status": "published"` n'est accepté par `check`, donc par le build, que si `benchmark.json` correspond à la version et à la variante retenues et si :

- le preset gagne ou fait égalité sur au moins 70 % des paires, d'après au moins 5 votants extérieurs ;
- au plus 15 % de ses vidéos ont une note moyenne de 2 ou moins ;
- la marge est d'au moins 60 % sur le coût par vidéo acceptée, sur l'offre la moins chère au token.

Toute modification d'un preset publié est une nouvelle version, avec un nouveau benchmark. En production, un preset qui dépasse 20 % d'échecs sur 7 jours (au moins 10 commandes, hors refus du filtre du modèle) se ferme seul et prévient les administrateurs. Pour le rouvrir : supprimer sa ligne dans la table `preset_switches`.

Avant de publier le premier preset : ajouter la carte sur l'accueil, remplacer l'aperçu par un vrai résultat autorisé par la personne filmée, et mettre à jour `/confidentialite` (voir la fiche du preset).

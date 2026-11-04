# Benchmark : Arrivée de star

**Version testée** : aucune pour l'instant (0.1.0 en brouillon). **Résultats** : aucun essai payant n'a encore été lancé.

Une version publiée est gelée : toute modification de `preset.json` crée une nouvelle version et demande un nouveau benchmark.

## Protocole réduit

Décision de l'utilisateur le 4 novembre 2026 : budget serré, une seule personne (la n°2) et le minimum d'essais. La suite d'essais est dans `README.md`. On regarde chaque vidéo en entier et on s'arrête au premier résultat satisfaisant : bonne personne remplacée, ressemblance tenue du début à la fin, plus de moustache d'origine, foule et décor intacts.

La publication se fera sur la validation de l'utilisateur à l'œil. Le contrôle du build, écrit pour le protocole complet ci-dessous, sera adapté à ce moment-là. La vérification par vision reste en mode `shadow` : elle note sans bloquer.

## Protocole complet, non appliqué

Gardé au cas où le budget le permettrait un jour : tri de 6 variantes, vidéo entière avec et sans image-clé, validation sur 10 photos, puis vote à l'aveugle d'au moins 5 personnes extérieures sur `/lab/vote/<campagne>`.

## Jeu de photos

Personnes générées par l'utilisateur avec son outil d'images gratuit (décision du 4 novembre 2026) : aucune dépense, aucune personne réelle, donc aucun consentement à recueillir et rien à cacher aux votants. Images reçues le 4 novembre 2026 dans `.cache/preset-lab/photos/`, hors du dépôt (`02-pied.png`, `02-visage.png`…), en 1086×1448. Le gros plan n'existe que pour la personne 2 : les 9 autres ne seront demandés que si l'essai à 1 ou 2 photos montre une différence de ressemblance.

Limite : un visage généré est plus net qu'une vraie photo de téléphone, et peut donner de meilleurs résultats que ceux des clients. La validation finale garde donc 2 ou 3 vraies photos, avec l'accord écrit des personnes.

| # | Personne | Ce que ça teste | Fournie |
| --- | --- | --- | --- |
| 1 | Homme, peau claire, cheveux courts, rasé | La moustache d'origine doit disparaître | en pied |
| 2 | Femme, cheveux longs | Le plus éloigné de la star : photo du tri de l'étape 2 | en pied + gros plan |
| 3 | Homme, peau foncée | Teint fidèle sous la lumière de la scène | en pied |
| 4 | Femme, peau foncée, cheveux bouclés | Teint et coiffure volumineuse | en pied |
| 5 | Homme avec barbe | Pilosité différente de l'original | en pied |
| 6 | Femme d'origine est-asiatique | Traits fidèles | en pied |
| 7 | Femme de plus de 60 ans | Âge conservé (une dérive d'âge est signalée par les sources) | en pied |
| 8 | Homme de forte corpulence | Le corps ne doit pas revenir à celui d'origine | en pied |
| 9 | Femme avec lunettes de vue | Les lunettes restent, sans déformation | en pied |
| 10 | Homme de petite taille, photo d'intérieur moyenne | Le cas réel le plus courant | en pied |

### Prompts utilisés

Photo en pied, un prompt par personne :

1. Realistic smartphone photo of a 34-year-old man with fair skin and short dark blond hair, clean-shaven, standing alone on a quiet city sidewalk in soft daylight. He wears a navy blue hoodie, grey jeans and brown leather shoes. Full body visible from head to shoes, with a little space above the head and below the feet. He faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at his sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
2. Realistic smartphone photo of a 31-year-old woman with light olive skin and long straight chestnut brown hair past her shoulders, standing alone in a quiet park in soft daylight. She wears a mustard yellow sweater, light blue jeans and white canvas shoes. Full body visible from head to shoes, with a little space above the head and below the feet. She faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at her sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
3. Realistic smartphone photo of a 27-year-old Black man with dark brown skin and a short fade haircut, clean-shaven, standing alone in front of a plain light brick wall in soft daylight. He wears an olive green jacket, beige chinos and dark sneakers. Full body visible from head to shoes, with a little space above the head and below the feet. He faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at his sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
4. Realistic smartphone photo of a 36-year-old Black woman with deep brown skin and voluminous natural curly hair, standing alone on a calm residential street in soft daylight. She wears a burgundy knit dress and tan ankle boots. Full body visible from head to shoes, with a little space above the head and below the feet. She faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at her sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
5. Realistic smartphone photo of a 42-year-old man of Middle Eastern descent with tan skin, short black hair and a full trimmed black beard, standing alone in a quiet town square in soft daylight. He wears a grey wool coat, a light blue shirt, navy trousers and black shoes. Full body visible from head to shoes, with a little space above the head and below the feet. He faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at his sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
6. Realistic smartphone photo of a 29-year-old East Asian woman with light skin and straight black shoulder-length hair, standing alone on a quiet sidewalk in soft daylight. She wears a light pink blouse, a dark green skirt and white sneakers. Full body visible from head to shoes, with a little space above the head and below the feet. She faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at her sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
7. Realistic smartphone photo of a 66-year-old woman with fair skin, visible wrinkles and short silver-grey hair, standing alone in a quiet garden in soft daylight. She wears a teal cardigan, a cream blouse, dark grey trousers and comfortable brown shoes. Full body visible from head to shoes, with a little space above the head and below the feet. She faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at her sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
8. Realistic smartphone photo of a 45-year-old heavyset man with a large build and round belly, light brown skin and short dark hair, clean-shaven, standing alone on a quiet sidewalk in soft daylight. He wears a red checked shirt, dark jeans and brown boots. Full body visible from head to shoes, with a little space above the head and below the feet. He faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at his sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
9. Realistic smartphone photo of a 38-year-old woman with pale freckled skin and auburn shoulder-length hair, wearing rectangular prescription glasses with thin dark frames and clear lenses, standing alone in front of a plain light wall in soft daylight. She wears a white shirt, a camel coat, black trousers and black flat shoes. Full body visible from head to shoes, with a little space above the head and below the feet. She faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at her sides. Sharp focus on the face, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.
10. Ordinary indoor smartphone photo taken by a friend of a short 41-year-old man about 1.60 m tall, with light skin and thinning brown hair, clean-shaven, standing alone in a living room under warm lamp light, with slight image noise. He wears a striped polo shirt, khaki shorts and blue sneakers. Full body visible from head to shoes, with a little space above the head and below the feet. He faces the camera, looks straight at the lens, relaxed neutral expression, arms relaxed at his sides. The face is in focus, natural skin texture, an ordinary non-famous person, not a model. Vertical 3:4. No sunglasses, no hat, no other people, no text, no logo, no watermark.

Gros plan, le même prompt pour tous, avec la photo en pied jointe :

> Using the attached photo as the reference, create a new realistic smartphone photo of this exact same person: same face, same age, same skin tone, same hair, same glasses if any, same clothes. Close-up portrait from the middle of the chest to just above the head. The person faces the camera, looks straight at the lens, relaxed neutral expression, soft even daylight, plain blurred background. Sharp focus on the face, natural skin texture, nothing covering the face. Vertical 3:4. No other people, no text, no logo, no watermark.

## Critères de publication

| Critère | Seuil | Résultat |
| --- | --- | --- |
| Gagne ou égalité (moins de 0,25 point d'écart) face à la comparatrice | au moins 70 % des paires | à mesurer |
| Taux d'échec (note moyenne de 2 ou moins) | au plus 15 % | à mesurer |
| Marge sur le coût par vidéo acceptée, sur l'offre la moins chère au token | au moins 60 % | 60 %, selon le taux d'échec prévu |
| Votants extérieurs | au moins 5 | à mesurer |

Si un critère manque : retour à l'étape 3. Après 3 itérations ratées : passer au meilleur challenger, ou abandonner.

`node scripts/preset-lab.mjs score arrivee-star --campaign <uuid>` calcule ces valeurs et écrit `benchmark.json`, que `check` et le build exigent pour tout preset publié.

Pas de comparatif avec Genjutsu (décision du 4 novembre 2026) : la comparatrice est la meilleure autre variante du tri.

## Journal des essais

*À remplir au fil des lancements : date, variante, photo, coût réel, ce qui change, résultat.*

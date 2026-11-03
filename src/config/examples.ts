// Exemple avant / après de la carte « Génération Image & Photo » de
// l'accueil : la photo d'origine, puis le résultat. Les images sont dans
// public/exemples/ (WebP, 1200 px de large au plus). "position"
// (object-position CSS) choisit la partie gardée si le format diffère de
// celui de la carte.
export type ExampleImage = { src: string; alt: string; position?: string };

export const IMAGE_EXAMPLE: { before: ExampleImage; after: ExampleImage } = {
  before: {
    src: "/exemples/joueur-origine.webp",
    alt: "Photo d'origine : un joueur de football en maillot de l'Argentine qui célèbre un but",
  },
  after: {
    src: "/exemples/joueur-genere.webp",
    alt: "Image générée par Cosmos : une autre personne à sa place, dans la même pose et la même tenue",
  },
};

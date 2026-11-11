This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Offre de lancement (tokens de bienvenue)

Les comptes créés entre `PROMO_START` et `PROMO_END` (fuseau Europe/Paris,
jours inclus) reçoivent le prix d'une vidéo preset en tokens (1 300), à
récupérer depuis la carte de l'accueil. Un seul cadeau par compte, email
vérifié, pas d'email jetable, et au plus `FREE_DAILY_BUDGET` cadeaux par jour. Ces règles sont garanties en base
(`claim_welcome_bonus`, migration `20261111000000_welcome_promo.sql`).
Les comptes qui n'ont jamais payé passent après les clients dans la file du PC.

- **Lancer** : appliquer la migration dans Supabase (SQL Editor) *avant* de
  déployer, puis renseigner les variables de `.env.example` (sans elles, les
  dates par défaut de `src/config/promo.ts` s'appliquent).
- **Couper l'offre tout de suite** : `/admin` → « Couper l'offre maintenant »
  (réservé à `ADMIN_EMAILS`, sans redéploiement). Le plafond du jour s'y règle aussi.
- **Couper par configuration** : `FREE_PROMO_ENABLED=false`, puis redéployer.
- Hors des dates, la bannière et la carte disparaissent seules et l'API refuse.

## Tests

`npm test` : dates au fuseau de Paris, fenêtre et interrupteurs de l'offre, et,
sur un vrai Postgres local où toutes les migrations sont appliquées, les
garanties de la base sous requêtes simultanées (un cadeau par compte, plafond
du jour, idempotence, ordre de la file, limites de fréquence).

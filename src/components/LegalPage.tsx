export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-14">
      <h1 className="text-title font-semibold">{title}</h1>
      <p className="mt-6 rounded-2xl border border-amber-600/25 bg-amber-500/10 px-4 py-3 text-base text-amber-800 sm:text-sm">
        Brouillon — à faire relire par un juriste avant la mise en ligne.
      </p>
      <div className="mt-8 space-y-4 text-secondary [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground">
        {children}
      </div>
    </div>
  );
}

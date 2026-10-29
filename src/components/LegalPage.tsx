export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-300">
        Brouillon — à faire relire par un juriste avant la mise en ligne.
      </p>
      <div className="mt-8 space-y-4 text-zinc-300 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white">
        {children}
      </div>
    </div>
  );
}

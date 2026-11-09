import { useId } from "react";
import { BODY_BUILDS, BODY_MEASUREMENTS, type MeasurementId } from "@/lib/body-measurements";

export type MeasurementValues = Partial<Record<MeasurementId | "build", string>>;

// Bloc « Mensurations » d'un formulaire de vidéo, facultatif. Clavier numérique
// sur téléphone ; seuls les chiffres sont gardés. Les limites sont vérifiées à
// l'envoi (readBodyMeasurements). Mobile : 2 colonnes, le dernier champ en
// largeur ; dès 640 px, taille et poids puis les trois tours.
export function MeasurementsFields({
  values,
  onChange,
  disabled,
}: {
  values: MeasurementValues;
  onChange: (id: MeasurementId | "build", value: string) => void;
  disabled: boolean;
}) {
  const titleId = useId();
  const buildId = useId();
  return (
    <div role="group" aria-labelledby={titleId} className="liquid-glass rounded-[24px] p-5">
      <h2 id={titleId} className="text-lg font-semibold">Mensurations</h2>
      <p className="mt-1 text-base leading-relaxed text-secondary sm:text-sm">
        Facultatif : elles aident la vidéo à reprendre sa silhouette.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
        {BODY_MEASUREMENTS.map(({ id, label, unit }, i) => (
          <label
            key={id}
            className={`block ${i < 2 ? "sm:col-span-3" : "sm:col-span-2"} ${i === BODY_MEASUREMENTS.length - 1 ? "max-sm:col-span-2" : ""}`}
          >
            <span className="block whitespace-nowrap text-sm font-medium">{label}</span>
            <span className="relative mt-1.5 block">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                value={values[id] ?? ""}
                onChange={(e) => onChange(id, e.target.value.replace(/\D/g, ""))}
                disabled={disabled}
                className="min-h-11 w-full rounded-2xl border border-foreground/15 bg-white/80 pl-4 pr-11 text-base focus:border-foreground/40 focus:outline-none disabled:opacity-60"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-secondary">
                {unit}
              </span>
            </span>
          </label>
        ))}
      </div>
      <div role="radiogroup" aria-labelledby={buildId} className="mt-4">
        <span id={buildId} className="block text-sm font-medium">Corpulence</span>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BODY_BUILDS.map(({ id, label }) => {
            const selected = values.build === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                // Un second clic retire le choix : le champ reste facultatif.
                onClick={() => onChange("build", selected ? "" : id)}
                disabled={disabled}
                className={`min-h-11 rounded-2xl border px-4 text-base transition-colors disabled:opacity-60 sm:text-sm ${
                  selected
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-foreground/15 bg-white/80 hover:border-foreground/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Largeur d'un texte dans une police TrueType, lue directement dans le
// fichier de la police. ffmpeg dessine le texte mais ne sait pas le mesurer :
// on choisit ici la taille qui fait tenir chaque ligne dans la carte.
// Le crénage est ignoré : la largeur mesurée est un peu plus grande que la
// largeur dessinée, ce qui laisse une marge.

export type FontMetrics = {
  unitsPerEm: number;
  // Identifiant du glyphe d'un caractère (0 : absent de la police).
  glyphId: (codePoint: number) => number;
  // Avancée d'un glyphe, en unités de la police.
  advance: (glyphId: number) => number;
};

function tables(data: Buffer): Map<string, number> {
  const offsets = new Map<string, number>();
  const count = data.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const record = 12 + i * 16;
    offsets.set(data.toString("latin1", record, record + 4), data.readUInt32BE(record + 8));
  }
  return offsets;
}

// Table cmap : sous-table Unicode au format 12 (tout Unicode) ou 4 (plan de base).
function readCmap(data: Buffer, cmap: number): (codePoint: number) => number {
  const count = data.readUInt16BE(cmap + 2);
  let format4: number | null = null;
  for (let i = 0; i < count; i++) {
    const record = cmap + 4 + i * 8;
    const platform = data.readUInt16BE(record);
    const encoding = data.readUInt16BE(record + 2);
    const sub = cmap + data.readUInt32BE(record + 4);
    const format = data.readUInt16BE(sub);
    const unicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
    if (!unicode) continue;
    if (format === 12) {
      const groups = data.readUInt32BE(sub + 12);
      return (cp) => {
        for (let g = 0; g < groups; g++) {
          const group = sub + 16 + g * 12;
          const start = data.readUInt32BE(group);
          if (cp >= start && cp <= data.readUInt32BE(group + 4)) return data.readUInt32BE(group + 8) + cp - start;
        }
        return 0;
      };
    }
    if (format === 4) format4 ??= sub;
  }
  if (format4 === null) throw new Error("Police sans table Unicode lisible");

  const sub = format4;
  const segments = data.readUInt16BE(sub + 6) / 2;
  const ends = sub + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const rangeOffsets = deltas + segments * 2;
  return (cp) => {
    if (cp > 0xffff) return 0;
    for (let s = 0; s < segments; s++) {
      if (cp > data.readUInt16BE(ends + s * 2)) continue;
      const start = data.readUInt16BE(starts + s * 2);
      if (cp < start) return 0;
      const delta = data.readInt16BE(deltas + s * 2);
      const rangeOffset = data.readUInt16BE(rangeOffsets + s * 2);
      if (rangeOffset === 0) return (cp + delta) & 0xffff;
      const glyph = data.readUInt16BE(rangeOffsets + s * 2 + rangeOffset + (cp - start) * 2);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };
}

export function readFontMetrics(data: Buffer): FontMetrics {
  const offsets = tables(data);
  const head = offsets.get("head");
  const hhea = offsets.get("hhea");
  const hmtx = offsets.get("hmtx");
  const cmap = offsets.get("cmap");
  if (head === undefined || hhea === undefined || hmtx === undefined || cmap === undefined) {
    throw new Error("Police TrueType incomplète");
  }
  const longMetrics = data.readUInt16BE(hhea + 34);
  return {
    unitsPerEm: data.readUInt16BE(head + 18),
    glyphId: readCmap(data, cmap),
    // Au-delà des métriques complètes, les glyphes gardent la dernière avancée.
    advance: (glyph) => data.readUInt16BE(hmtx + Math.min(glyph, longMetrics - 1) * 4),
  };
}

// Caractères du texte absents de la police (ils s'afficheraient en carrés).
export function missingCharacters(font: FontMetrics, text: string): string[] {
  return [...new Set([...text].filter((c) => c.trim() && font.glyphId(c.codePointAt(0)!) === 0))];
}

// Largeur du texte en pixels, pour une police de sizePx pixels.
export function textWidth(font: FontMetrics, text: string, sizePx: number): number {
  let units = 0;
  for (const c of text) units += font.advance(font.glyphId(c.codePointAt(0)!));
  return (units * sizePx) / font.unitsPerEm;
}

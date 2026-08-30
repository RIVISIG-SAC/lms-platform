/**
 * Resalte de la frase destacada del hero.
 *
 * El match es tolerante: ignora mayúsculas, tildes y espacios de más, para que
 * el editor no tenga que copiar el fragmento carácter por carácter. Se devuelve
 * el texto ORIGINAL del título (no el normalizado), así el resalte respeta el
 * formato tal cual se escribió.
 */

type NormalizedText = { text: string; map: number[] };

/** Normaliza (minúsculas, sin tildes, espacios colapsados) manteniendo el índice original de cada carácter. */
function normalizeWithMap(input: string): NormalizedText {
  let text = "";
  const map: number[] = [];
  let lastWasSpace = true; // arranca en true para descartar espacios iniciales

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (/\s/.test(char)) {
      if (!lastWasSpace) {
        text += " ";
        map.push(i);
        lastWasSpace = true;
      }
      continue;
    }

    lastWasSpace = false;
    const base = char.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();
    for (const c of base) {
      text += c;
      map.push(i);
    }
  }

  // espacio final sobrante
  if (text.endsWith(" ")) {
    text = text.slice(0, -1);
    map.pop();
  }

  return { text, map };
}

export type HighlightParts = { before: string; match: string; after: string };

/**
 * Parte el título en {antes, coincidencia, después}. Devuelve null si no hay
 * frase o si no aparece en el título.
 */
export function splitHighlight(title: string, highlight?: string | null): HighlightParts | null {
  if (!title || !highlight || !highlight.trim()) return null;

  const source = normalizeWithMap(title);
  const needle = normalizeWithMap(highlight);
  if (!needle.text) return null;

  const at = source.text.indexOf(needle.text);
  if (at === -1) return null;

  const start = source.map[at];
  const end = source.map[at + needle.text.length - 1] + 1;

  return {
    before: title.slice(0, start),
    match: title.slice(start, end),
    after: title.slice(end),
  };
}

/** true si la frase se va a resaltar realmente en la landing. */
export function highlightMatches(title: string, highlight?: string | null): boolean {
  return splitHighlight(title, highlight) !== null;
}

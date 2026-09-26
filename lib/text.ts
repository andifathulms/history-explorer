/**
 * A closed-vocabulary value as a label: hyphens to spaces, first letter up,
 * the rest as stored. "capital-move" is "Capital move", not "Capital Move" —
 * CSS `capitalize` title-cases every word, which turns a coded term into
 * something that reads like a proper noun.
 */
export function sentenceCase(value: string): string {
  const s = value.replace(/-/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

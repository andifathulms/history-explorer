/**
 * Missing-data handling. Hard rule 3: null renders as "No cited figure", never
 * as zero, and a missing axis is excluded from weighted totals rather than
 * contributing a zero to them.
 *
 * The rule that actually matters, and the reason this is a module rather than
 * a convention: a polity with two of four axes must never appear to score lower
 * than one with four. Every reduction over axes in this codebase goes through
 * `presentValues` or `renormalise` so that cannot happen by accident.
 */

export const NO_FIGURE = 'No cited figure' as const

/** Either a real measurement or an explicit, rendered absence. */
export type Gapped<T> = { present: true; value: T } | { present: false; reason: GapReason }

export type GapReason =
  /** No source in sources.yaml gives this figure for this polity. */
  | 'uncited'
  /** The figure exists but era-normalised mode has no denominator for its date. */
  | 'no-denominator'

export const gap = (reason: GapReason = 'uncited'): Gapped<never> => ({
  present: false,
  reason,
})

export const value = <T>(v: T): Gapped<T> => ({ present: true, value: v })

/** Lift a nullable into a Gapped. `0` is a value; only null/undefined is a gap. */
export function fromNullable<T>(v: T | null | undefined, reason: GapReason = 'uncited'): Gapped<T> {
  return v === null || v === undefined ? gap(reason) : value(v)
}

export function isPresent<T>(g: Gapped<T>): g is { present: true; value: T } {
  return g.present
}

/** The values that actually exist, in order, dropping gaps. */
export function presentValues<T>(gs: Gapped<T>[]): T[] {
  return gs.filter(isPresent).map((g) => g.value)
}

/**
 * Renormalise weights across the axes that are present.
 *
 * Given weights for all axes and a mask of which are present, returns weights
 * over the present axes summing to 1. If nothing is present, returns null —
 * the caller must render a gap, not a zero total.
 *
 * This is the whole of hard rule 3 in one function. Weighting a missing axis at
 * its nominal weight and multiplying by zero would silently penalise the
 * under-documented polities, which are exactly the ones the PRD cares about.
 */
export function renormalise(weights: number[], present: boolean[]): number[] | null {
  if (weights.length !== present.length) {
    throw new Error('renormalise: weights and present must be the same length')
  }
  const total = weights.reduce((sum, w, i) => (present[i] ? sum + w : sum), 0)
  if (total <= 0) return null
  return weights.map((w, i) => (present[i] ? w / total : 0))
}

/** How a total should describe itself: "computed from 2 of 4 axes". */
export function provenanceLabel(available: number, total: number): string {
  if (available === 0) return NO_FIGURE
  return `computed from ${available} of ${total} axes`
}

/** Human-readable count for the display layer, keeping 0 and null apart. */
export function formatCount(n: number | null): string {
  return n === null ? NO_FIGURE : String(n)
}

export function formatKm2(n: number | null): string {
  if (n === null) return NO_FIGURE
  return `${n.toLocaleString('en-GB')} km²`
}

export function formatPopulation(n: number | null): string {
  if (n === null) return NO_FIGURE
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('en-GB')} million`
  return n.toLocaleString('en-GB')
}

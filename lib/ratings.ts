/**
 * Percentile and weighting maths.
 *
 * Three commitments run through this file:
 *
 * 1. Percentiles are global: computed over the narrative corpus union the
 *    reference set, per axis, on whichever scale is active.
 * 2. Nothing is estimated. Longevity is a min-max range in the sources, so it
 *    stays a range here — it percentiles at both ends rather than collapsing to
 *    a midpoint, because a midpoint is a number no source published.
 * 3. Influence is never fused by the app. The three counts percentile
 *    separately and are only ever combined under weights the reader chose, in
 *    the reader's own view.
 */

import type { Polity, ReferencePolity, WorldDenominator } from './types.ts'
import { type Gapped, gap, value, isPresent, renormalise, provenanceLabel } from './gaps.ts'

export type Scale = 'absolute' | 'era-normalised'

export const AXES = ['reach', 'longevity', 'demographic', 'influence'] as const
export type AxisId = (typeof AXES)[number]

export const AXIS_LABELS: Record<AxisId, string> = {
  reach: 'Reach',
  longevity: 'Longevity',
  demographic: 'Demographic weight',
  influence: 'Influence',
}

export const INFLUENCE_KEYS = ['scripts', 'religions', 'claims'] as const
export type InfluenceKey = (typeof INFLUENCE_KEYS)[number]

export const INFLUENCE_LABELS: Record<InfluenceKey, string> = {
  scripts: 'Descendant scripts',
  religions: 'Religions carried',
  claims: 'Successor claims',
}

export interface Weights {
  reach: number
  longevity: number
  demographic: number
  influence: number
  /** How the reader fuses the three influence counts. The app never picks this. */
  influenceMix: Record<InfluenceKey, number>
}

export const DEFAULT_WEIGHTS: Weights = {
  reach: 0.25,
  longevity: 0.25,
  demographic: 0.25,
  influence: 0.25,
  influenceMix: { scripts: 1, religions: 1, claims: 1 },
}

export const PRESETS: Record<string, { label: string; weights: Weights }> = {
  even: { label: 'Even', weights: DEFAULT_WEIGHTS },
  reach: {
    label: 'Reach lens',
    weights: { ...DEFAULT_WEIGHTS, reach: 0.7, longevity: 0.1, demographic: 0.1, influence: 0.1 },
  },
  longevity: {
    label: 'Longevity lens',
    weights: { ...DEFAULT_WEIGHTS, reach: 0.1, longevity: 0.7, demographic: 0.1, influence: 0.1 },
  },
  influence: {
    label: 'Influence lens',
    weights: { ...DEFAULT_WEIGHTS, reach: 0.1, longevity: 0.1, demographic: 0.1, influence: 0.7 },
  },
}

// ---------------------------------------------------------------------------
// Raw axis values
// ---------------------------------------------------------------------------

/** Duration as the sources give it: a range, never a single number. */
export interface DurationRange {
  min: number
  max: number
}

/**
 * Shortest and longest durations consistent with the cited start and end
 * ranges. Shortest is latest-start to earliest-end; longest is the reverse.
 * Both endpoints are dates a source actually published.
 */
export function duration(p: Polity): DurationRange {
  const min = Math.max(0, p.span.end.min - p.span.start.max)
  const max = Math.max(0, p.span.end.max - p.span.start.min)
  return { min, max }
}

export function referenceDuration(p: ReferencePolity): DurationRange {
  const d = Math.max(0, p.span.end - p.span.start)
  return { min: d, max: d }
}

/** The year an era-normalised denominator should be looked up at. */
function measureYear(p: Polity, which: 'reach' | 'population'): number | null {
  const m = which === 'reach' ? p.measures.reach_km2 : p.measures.peak_population
  if (!m) return null
  return m.at ?? null
}

/**
 * Denominator lookup. Exact-year match only.
 *
 * Deliberately does not interpolate between the surrounding entries. An
 * interpolated denominator would silently turn every era-normalised figure into
 * an estimate, which is the one thing this app must not do. Content files carry
 * denominators at the dates the measures actually use, or the axis gaps.
 */
export function denominatorAt(
  denominators: WorldDenominator[],
  year: number,
  which: 'population' | 'land',
): Gapped<number> {
  const row = denominators.find((d) => d.year === year)
  if (!row) return gap('no-denominator')
  const cell = which === 'population' ? row.world_population : row.world_land_under_state_control_km2
  if (!cell) return gap('no-denominator')
  return value(cell.value)
}

/**
 * The comparable number for one axis on one scale, or a gap.
 *
 * On era-normalised, a present absolute figure with no denominator for its date
 * becomes a gap rather than silently falling back to the absolute figure. That
 * fallback would make two different quantities share an axis.
 */
export function reachValue(
  p: Polity,
  scale: Scale,
  denominators: WorldDenominator[],
): Gapped<number> {
  const m = p.measures.reach_km2
  if (!m) return gap('uncited')
  if (scale === 'absolute') return value(m.value)
  const year = measureYear(p, 'reach')
  if (year === null) return gap('no-denominator')
  const d = denominatorAt(denominators, year, 'land')
  return isPresent(d) ? value(m.value / d.value) : gap('no-denominator')
}

export function populationValue(
  p: Polity,
  scale: Scale,
  denominators: WorldDenominator[],
): Gapped<number> {
  const m = p.measures.peak_population
  if (!m) return gap('uncited')
  if (scale === 'absolute') return value(m.value)
  const year = measureYear(p, 'population')
  if (year === null) return gap('no-denominator')
  const d = denominatorAt(denominators, year, 'population')
  return isPresent(d) ? value(m.value / d.value) : gap('no-denominator')
}

// ---------------------------------------------------------------------------
// Percentiles
// ---------------------------------------------------------------------------

/**
 * Share of the field this value stands at or above, in 0..1.
 *
 * Ties count as half, so identical figures percentile identically and no
 * arbitrary ordering is introduced between polities a source did not
 * distinguish. The field is only ever the values that exist: polities missing
 * the axis are absent from the comparison rather than sitting at its bottom.
 */
export function percentile(v: number, field: number[]): number {
  if (field.length === 0) return 0
  let below = 0
  let equal = 0
  for (const f of field) {
    if (f < v) below += 1
    else if (f === v) equal += 1
  }
  return (below + equal / 2) / field.length
}

/** The comparison field for one axis, drawn from corpus and backdrop together. */
export interface Field {
  reach: number[]
  population: number[]
  /** Durations enter the field at both ends, so a range percentiles as a range. */
  longevity: number[]
  influence: Record<InfluenceKey, number[]>
}

export function buildField(
  corpus: Polity[],
  backdrop: ReferencePolity[],
  scale: Scale,
  denominators: WorldDenominator[],
): Field {
  const reach: number[] = []
  const population: number[] = []
  const longevity: number[] = []
  const influence: Record<InfluenceKey, number[]> = { scripts: [], religions: [], claims: [] }

  for (const p of corpus) {
    const r = reachValue(p, scale, denominators)
    if (isPresent(r)) reach.push(r.value)
    const pop = populationValue(p, scale, denominators)
    if (isPresent(pop)) population.push(pop.value)
    const d = duration(p)
    longevity.push(d.min, d.max)
    const inf = p.measures.influence
    if (inf.descendant_scripts.count !== null) influence.scripts.push(inf.descendant_scripts.count)
    if (inf.religions_carried.count !== null) influence.religions.push(inf.religions_carried.count)
    if (inf.successor_claims.count !== null) influence.claims.push(inf.successor_claims.count)
  }

  // The backdrop carries no influence counts by design: it is numbers only, and
  // coding influence for fifty polities without reading fifty sources is
  // exactly what the coding rulebook forbids. Influence therefore percentiles
  // against the narrative corpus alone, and the UI says so.
  for (const p of backdrop) {
    if (scale === 'absolute') {
      if (p.reach_km2) reach.push(p.reach_km2.value)
      if (p.peak_population) population.push(p.peak_population.value)
    } else {
      if (p.reach_km2?.at !== undefined) {
        const d = denominatorAt(denominators, p.reach_km2.at, 'land')
        if (isPresent(d)) reach.push(p.reach_km2.value / d.value)
      }
      if (p.peak_population?.at !== undefined) {
        const d = denominatorAt(denominators, p.peak_population.at, 'population')
        if (isPresent(d)) population.push(p.peak_population.value / d.value)
      }
    }
    const rd = referenceDuration(p)
    longevity.push(rd.min, rd.max)
  }

  return { reach, population, longevity, influence }
}

// ---------------------------------------------------------------------------
// Per-polity axis results
// ---------------------------------------------------------------------------

export interface SimpleAxis {
  id: AxisId
  label: string
  /** The cited figure on the active scale, or a gap. */
  raw: Gapped<number>
  /** Percentile in 0..1, or a gap when raw is a gap. */
  pct: Gapped<number>
}

export interface LongevityAxis extends Omit<SimpleAxis, 'raw' | 'pct'> {
  id: 'longevity'
  years: DurationRange
  /** Percentile at each end of the cited range. Never averaged into one. */
  pct: { min: number; max: number }
}

export interface InfluenceAxis {
  id: 'influence'
  label: string
  counts: Record<InfluenceKey, { count: number | null; items: string[]; pct: Gapped<number> }>
  /** Only ever produced under reader-supplied weights. Never published alone. */
  readerFused: Gapped<number>
}

export interface Rating {
  polity: PolityRef
  reach: SimpleAxis
  longevity: LongevityAxis
  demographic: SimpleAxis
  influence: InfluenceAxis
  /** Weighted total over available axes, renormalised. Null when none are. */
  total: Gapped<number>
  /** "computed from 3 of 4 axes" — always rendered next to the total. */
  totalProvenance: string
  axesAvailable: number
  axesTotal: number
}

export interface PolityRef {
  id: string
  latin: string
  script: string | null
}

/**
 * Fuse the three influence counts under the reader's mix.
 *
 * The app never calls this with weights of its own: `mix` comes from the URL,
 * which comes from the reader's sliders. A count that is null drops out and the
 * remaining weights renormalise, so an unaddressed count cannot drag a polity
 * down.
 */
function fuseInfluence(
  pcts: Record<InfluenceKey, Gapped<number>>,
  mix: Record<InfluenceKey, number>,
): Gapped<number> {
  const present = INFLUENCE_KEYS.map((k) => isPresent(pcts[k]))
  const w = renormalise(
    INFLUENCE_KEYS.map((k) => mix[k]),
    present,
  )
  if (!w) return gap('uncited')
  let acc = 0
  INFLUENCE_KEYS.forEach((k, i) => {
    const p = pcts[k]
    if (isPresent(p)) acc += p.value * w[i]
  })
  return value(acc)
}

export function rate(
  p: Polity,
  field: Field,
  weights: Weights,
  scale: Scale,
  denominators: WorldDenominator[],
): Rating {
  const reachRaw = reachValue(p, scale, denominators)
  const reach: SimpleAxis = {
    id: 'reach',
    label: AXIS_LABELS.reach,
    raw: reachRaw,
    pct: isPresent(reachRaw) ? value(percentile(reachRaw.value, field.reach)) : reachRaw,
  }

  const popRaw = populationValue(p, scale, denominators)
  const demographic: SimpleAxis = {
    id: 'demographic',
    label: AXIS_LABELS.demographic,
    raw: popRaw,
    pct: isPresent(popRaw) ? value(percentile(popRaw.value, field.population)) : popRaw,
  }

  const years = duration(p)
  const longevity: LongevityAxis = {
    id: 'longevity',
    label: AXIS_LABELS.longevity,
    years,
    pct: {
      min: percentile(years.min, field.longevity),
      max: percentile(years.max, field.longevity),
    },
  }

  const inf = p.measures.influence
  const counts = {
    scripts: inf.descendant_scripts,
    religions: inf.religions_carried,
    claims: inf.successor_claims,
  }
  const infPcts = {} as Record<InfluenceKey, Gapped<number>>
  const infOut = {} as InfluenceAxis['counts']
  for (const k of INFLUENCE_KEYS) {
    const c = counts[k]
    const pct: Gapped<number> =
      c.count === null ? gap('uncited') : value(percentile(c.count, field.influence[k]))
    infPcts[k] = pct
    infOut[k] = { count: c.count, items: c.items, pct }
  }
  const influence: InfluenceAxis = {
    id: 'influence',
    label: AXIS_LABELS.influence,
    counts: infOut,
    readerFused: fuseInfluence(infPcts, weights.influenceMix),
  }

  // Longevity is always present: a span is the one thing every polity here has.
  // It enters the total at the midpoint of its two percentiles, which is a
  // statement about percentile position rather than about years, and so does
  // not manufacture a duration no source published.
  const axisPresence = [
    isPresent(reach.pct),
    true,
    isPresent(demographic.pct),
    isPresent(influence.readerFused),
  ]
  const axisValues = [
    isPresent(reach.pct) ? reach.pct.value : 0,
    (longevity.pct.min + longevity.pct.max) / 2,
    isPresent(demographic.pct) ? demographic.pct.value : 0,
    isPresent(influence.readerFused) ? influence.readerFused.value : 0,
  ]
  const w = renormalise(
    [weights.reach, weights.longevity, weights.demographic, weights.influence],
    axisPresence,
  )

  const total: Gapped<number> = w
    ? value(axisValues.reduce((acc, v, i) => acc + v * w[i], 0))
    : gap('uncited')

  const axesAvailable = axisPresence.filter(Boolean).length

  return {
    polity: { id: p.id, latin: p.name.latin, script: p.name.script },
    reach,
    longevity,
    demographic,
    influence,
    total,
    totalProvenance: provenanceLabel(axesAvailable, AXES.length),
    axesAvailable,
    axesTotal: AXES.length,
  }
}

// ---------------------------------------------------------------------------
// Reader state <-> URL
// ---------------------------------------------------------------------------

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)

/** Reader weights serialise to the query string so a view can be linked. */
export function weightsToQuery(w: Weights, scale: Scale): string {
  const p = new URLSearchParams()
  p.set('w', [w.reach, w.longevity, w.demographic, w.influence].map((n) => n.toFixed(2)).join('-'))
  p.set('i', INFLUENCE_KEYS.map((k) => w.influenceMix[k].toFixed(2)).join('-'))
  if (scale !== 'absolute') p.set('scale', 'era')
  return p.toString()
}

export function weightsFromQuery(qs: string | URLSearchParams): { weights: Weights; scale: Scale } {
  const p = typeof qs === 'string' ? new URLSearchParams(qs) : qs
  const weights: Weights = {
    ...DEFAULT_WEIGHTS,
    influenceMix: { ...DEFAULT_WEIGHTS.influenceMix },
  }

  const w = p.get('w')?.split('-').map(Number)
  if (w && w.length === 4 && w.every(Number.isFinite)) {
    ;[weights.reach, weights.longevity, weights.demographic, weights.influence] = w.map(clamp01)
  }

  const i = p.get('i')?.split('-').map(Number)
  if (i && i.length === 3 && i.every(Number.isFinite)) {
    INFLUENCE_KEYS.forEach((k, idx) => {
      weights.influenceMix[k] = clamp01(i[idx])
    })
  }

  const scale: Scale = p.get('scale') === 'era' ? 'era-normalised' : 'absolute'
  return { weights, scale }
}

export function formatPercentile(g: Gapped<number>): string {
  if (!g.present) return '—'
  return `${Math.round(g.value * 100)}th`
}

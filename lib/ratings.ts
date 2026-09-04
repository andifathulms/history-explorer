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

/**
 * How a raw figure becomes a position in the field.
 *
 * `percentile` is the default and stays the default: it is rank-honest, it is
 * unaffected by outliers, and it degrades gracefully when a field is small.
 *
 * It also destroys magnitude, which is the reason the second mode exists. Reach
 * in this corpus runs from 650,000 km² to 35,500,000 — about one and three
 * quarter orders of magnitude — and under percentile the Mongol empire and the
 * Umayyad caliphate both land near the hundredth, so the ranking says they were
 * the same size when they differ by more than the whole Sasanian empire.
 * `log-magnitude` places a value on a logarithmic scale between the smallest
 * and largest in the same field, which is the right transform for a quantity
 * spanning orders of magnitude.
 *
 * Neither is more correct. They answer different questions — "how many did it
 * beat" and "how much bigger was it" — and the two disagreeing is itself
 * informative, which is why both are offered and labelled rather than one being
 * chosen.
 */
export type Normalisation = 'percentile' | 'log-magnitude'

export const NORMALISATION_LABELS: Record<Normalisation, string> = {
  percentile: 'Percentile',
  'log-magnitude': 'Log magnitude',
}

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

/**
 * Position on a logarithmic scale between the smallest and largest in the
 * field, in 0..1.
 *
 * Gaps rather than guesses in the two cases where the transform is undefined:
 * a non-positive value has no logarithm, and a field whose extremes coincide
 * has no scale to place anything on. Returning 0, 0.5 or 1 in either case would
 * be a number the data does not support, sitting in a column of numbers it
 * does.
 */
export function logMagnitude(v: number, field: number[]): Gapped<number> {
  if (v <= 0) return gap('not-comparable')
  const positive = field.filter((f) => f > 0)
  if (positive.length === 0) return gap('not-comparable')
  const lo = Math.log(Math.min(...positive))
  const hi = Math.log(Math.max(...positive))
  if (hi === lo) return gap('not-comparable')
  const t = (Math.log(v) - lo) / (hi - lo)
  return value(Math.min(1, Math.max(0, t)))
}

/**
 * Place a value in its field on the active normalisation.
 *
 * Applied to the magnitude axes only — reach, population, longevity. The three
 * influence counts stay on percentile in both modes, and deliberately: they run
 * from 0 to 3, they span no orders of magnitude for a logarithm to express, and
 * a count of 0 has no logarithm at all. Log-magnitude is a transform for
 * quantities that vary by multiples, and applying it to a small integer count
 * would dress an arbitrary rescaling as a second opinion.
 */
export function place(v: number, field: number[], mode: Normalisation): Gapped<number> {
  return mode === 'percentile' ? value(percentile(v, field)) : logMagnitude(v, field)
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
  /**
   * Position at each end of the cited range. Never averaged into one.
   *
   * Gapped, because log-magnitude has no answer for a zero-length span. Under
   * percentile these are always present — a span is the one thing every polity
   * here has.
   */
  pct: { min: Gapped<number>; max: Gapped<number> }
}

/**
 * Peak extent divided by the years it was held: a flash-versus-slow-burn axis.
 *
 * A ratio of two cited figures, which is the same operation class the site
 * already permits for era-normalisation, and it is not an estimate: both
 * numbers came off a page. It comes out as a range because longevity is a
 * range — the shortest cited duration gives the highest intensity — and the
 * range is carried rather than collapsed.
 */
export interface IntensityAxis {
  /** km² per year, at each end of the cited duration. */
  perYear: Gapped<{ min: number; max: number }>
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
  intensity: IntensityAxis
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
  mode: Normalisation = 'percentile',
): Rating {
  const reachRaw = reachValue(p, scale, denominators)
  const reach: SimpleAxis = {
    id: 'reach',
    label: AXIS_LABELS.reach,
    raw: reachRaw,
    pct: isPresent(reachRaw) ? place(reachRaw.value, field.reach, mode) : reachRaw,
  }

  const popRaw = populationValue(p, scale, denominators)
  const demographic: SimpleAxis = {
    id: 'demographic',
    label: AXIS_LABELS.demographic,
    raw: popRaw,
    pct: isPresent(popRaw) ? place(popRaw.value, field.population, mode) : popRaw,
  }

  const years = duration(p)
  const longevity: LongevityAxis = {
    id: 'longevity',
    label: AXIS_LABELS.longevity,
    years,
    pct: {
      min: place(years.min, field.longevity, mode),
      max: place(years.max, field.longevity, mode),
    },
  }

  // Both ends come from cited numbers: the peak extent as published, over each
  // end of the cited duration. The shortest span gives the largest figure, so
  // the ends are assigned rather than assumed to be in order.
  const intensity: IntensityAxis = {
    perYear:
      isPresent(reachRaw) && years.min > 0 && years.max > 0
        ? value({
            min: reachRaw.value / years.max,
            max: reachRaw.value / years.min,
          })
        : gap('uncited'),
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

  // Longevity enters the total at the midpoint of its two positions, which is a
  // statement about position in the field rather than about years, and so does
  // not manufacture a duration no source published. Under percentile it is
  // always present — a span is the one thing every polity here has — but
  // log-magnitude has no answer for a zero-length span, so it is masked like
  // any other axis rather than assumed.
  const longevityMid =
    isPresent(longevity.pct.min) && isPresent(longevity.pct.max)
      ? value((longevity.pct.min.value + longevity.pct.max.value) / 2)
      : gap('not-comparable')

  const axisPresence = [
    isPresent(reach.pct),
    isPresent(longevityMid),
    isPresent(demographic.pct),
    isPresent(influence.readerFused),
  ]
  const axisValues = [
    isPresent(reach.pct) ? reach.pct.value : 0,
    isPresent(longevityMid) ? longevityMid.value : 0,
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
    intensity,
    total,
    totalProvenance: provenanceLabel(axesAvailable, AXES.length),
    axesAvailable,
    axesTotal: AXES.length,
  }
}

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

/**
 * The site publishes several rankings, not one.
 *
 * A single ordering — however carefully weighted — reads as the site's opinion
 * about which polity was greatest, which is exactly the claim the PRD refuses
 * to make. Naming the question each board answers is what keeps them honest:
 * "largest" and "longest" are different questions with different answers, and a
 * reader who can see both is better off than one handed their average.
 *
 * `overall` remains the reader's own, and is the only board that fuses axes.
 * `legacy` orders by the reader's influence mix rather than by anything the app
 * chose, which is what hard rule 6 requires: the site never combines the three
 * counts itself, so the board that ranks on them is a function of the sliders.
 */
export const BOARDS = ['overall', 'size', 'endurance', 'legacy', 'intensity'] as const
export type Board = (typeof BOARDS)[number]

export const BOARD_META: Record<
  Board,
  { label: string; question: string; note: string; readerOwned: boolean }
> = {
  overall: {
    label: 'Overall',
    question: 'How does it stand once the axes are combined?',
    note: 'Yours, not the site\u2019s. The ordering is a function of the sliders and travels in the link.',
    readerOwned: true,
  },
  size: {
    label: 'Size',
    question: 'How much ground did it hold at its greatest extent?',
    note: 'The cited peak extent on the active scale. Twenty-three polities carry no figure and are not ranked here \u2014 an absence of tabulation, not of empire.',
    readerOwned: false,
  },
  endurance: {
    label: 'Endurance',
    question: 'How long did it last?',
    note: 'Ordered by the shortest duration the sources support, with the longest shown beside it. Ranking by the generous end would reward contested dates.',
    readerOwned: false,
  },
  legacy: {
    label: 'Legacy',
    question: 'How much of it outlasted it?',
    note: 'Ordered by your own mix of the three counts. The site never fuses them itself, so this board has no ordering of its own to publish.',
    readerOwned: true,
  },
  intensity: {
    label: 'Intensity',
    question: 'How much ground per year of existence?',
    note: 'Peak extent over cited duration \u2014 a flash-versus-slow-burn axis. Both numbers came off a page; the ratio is not an estimate, and it is a range because the duration is.',
    readerOwned: false,
  },
}

/** Sort key for a board, plus whether the row is rankable on it at all. */
function boardKey(r: Rating, board: Board): number | null {
  switch (board) {
    case 'overall':
      return r.total.present ? r.total.value : null
    case 'size':
      return r.reach.raw.present ? r.reach.raw.value : null
    case 'endurance':
      return r.longevity.years.min
    case 'legacy':
      return r.influence.readerFused.present ? r.influence.readerFused.value : null
    case 'intensity':
      // The conservative end: the longest duration the sources support, which
      // gives the smallest figure. Ranking by the other end would reward a
      // contested early ending.
      return r.intensity.perYear.present ? r.intensity.perYear.value.min : null
  }
}

/**
 * Rows in board order, unrankable ones last.
 *
 * Unrankable is not last-place. A polity with no cited extent is not the
 * smallest polity here; it is one nobody tabulated, and the view must show it
 * below the ranking rather than at the bottom of it.
 */
export function sortForBoard(rows: Rating[], board: Board): { ranked: Rating[]; unranked: Rating[] } {
  const ranked: { r: Rating; k: number }[] = []
  const unranked: Rating[] = []
  for (const r of rows) {
    const k = boardKey(r, board)
    if (k === null) unranked.push(r)
    else ranked.push({ r, k })
  }
  ranked.sort((a, b) => b.k - a.k || a.r.polity.latin.localeCompare(b.r.polity.latin))
  unranked.sort((a, b) => a.polity.latin.localeCompare(b.polity.latin))
  return { ranked: ranked.map((x) => x.r), unranked }
}

/**
 * How many polities actually carry each axis.
 *
 * Published beside the weight sliders because an axis can be weighted to 1.00
 * and move nothing. `peak_population` is null for every polity in this corpus
 * and every entry in the reference set, so demographic weight is a control over
 * an empty field — hard rule 3 renormalises it away correctly and the reader is
 * left wondering why the slider does nothing. Counting is better than either
 * hiding the axis or hard-coding a warning that would go stale the day a
 * population figure is entered.
 */
export function axisCoverage(
  corpus: Polity[],
  scale: Scale,
  denominators: WorldDenominator[],
): Record<AxisId, { carried: number; of: number }> {
  const of = corpus.length
  let reach = 0
  let demographic = 0
  let influence = 0
  for (const p of corpus) {
    if (isPresent(reachValue(p, scale, denominators))) reach += 1
    if (isPresent(populationValue(p, scale, denominators))) demographic += 1
    const inf = p.measures.influence
    if (
      inf.descendant_scripts.count !== null ||
      inf.religions_carried.count !== null ||
      inf.successor_claims.count !== null
    ) {
      influence += 1
    }
  }
  return {
    reach: { carried: reach, of },
    // A span is the one thing every polity here has.
    longevity: { carried: of, of },
    demographic: { carried: demographic, of },
    influence: { carried: influence, of },
  }
}

// ---------------------------------------------------------------------------
// Reader state <-> URL
// ---------------------------------------------------------------------------

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)

/** Everything about the rankings view that the reader chose. */
export interface View {
  weights: Weights
  scale: Scale
  normalisation: Normalisation
  board: Board
}

/** The reader's whole view serialises to the query string so it can be linked. */
export function weightsToQuery(
  w: Weights,
  scale: Scale,
  normalisation: Normalisation = 'percentile',
  board: Board = 'overall',
): string {
  const p = new URLSearchParams()
  p.set('w', [w.reach, w.longevity, w.demographic, w.influence].map((n) => n.toFixed(2)).join('-'))
  p.set('i', INFLUENCE_KEYS.map((k) => w.influenceMix[k].toFixed(2)).join('-'))
  if (scale !== 'absolute') p.set('scale', 'era')
  if (normalisation !== 'percentile') p.set('n', 'log')
  if (board !== 'overall') p.set('board', board)
  return p.toString()
}

export function weightsFromQuery(qs: string | URLSearchParams): View {
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
  const normalisation: Normalisation = p.get('n') === 'log' ? 'log-magnitude' : 'percentile'
  const asked = p.get('board')
  const board: Board = (BOARDS as readonly string[]).includes(asked ?? '')
    ? (asked as Board)
    : 'overall'
  return { weights, scale, normalisation, board }
}

/**
 * English ordinal suffix. The site was printing "81th", "42th" and "1th",
 * because every call site appended a literal "th" — which on a page whose
 * whole argument is that its numbers were handled carefully is not a small
 * thing to get wrong.
 *
 * The teens are the exception that the naive rule misses: 11, 12 and 13 take
 * "th" despite ending in 1, 2 and 3, and so do 111, 112, 113.
 */
export function ordinal(n: number): string {
  const abs = Math.abs(Math.round(n))
  const tens = abs % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  switch (abs % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

export function formatPercentile(g: Gapped<number>): string {
  if (!g.present) return '—'
  return ordinal(Math.round(g.value * 100))
}

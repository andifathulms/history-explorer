/**
 * Shapes of the content files. These mirror the YAML exactly; the loader
 * validates against them at build time rather than trusting the files.
 */

export type SourceId = string
export type PolityId = string
export type RegionId = string

/**
 * A grouping for browsing, and the scope of a continuity thread.
 *
 * `thread` says whether this region's polities are joined by enough sourced
 * succession edges to be walked end to end. A region with `thread: false` is
 * complete and ordinary — succession is a property some polities have, not the
 * site's organising principle.
 */
export interface Region {
  id: RegionId
  name: string
  blurb: string
  thread: boolean
}

/** A value that exists only when a source says so. Hard rule 2: no estimates. */
export interface Cited<T> {
  value: T
  source: SourceId
  /** Set when the source dates the figure to a particular year. */
  at?: number
}

/**
 * Where scholarship disagrees, both figures are kept with both sources. Never
 * averaged into one. `min === max` is a source agreeing with itself, not a
 * degenerate case to be flattened.
 */
export interface CitedRange {
  min: number
  max: number
  source: SourceId
  /** Present when min and max come from different works. */
  max_source?: SourceId
}

export interface Span {
  start: CitedRange
  end: CitedRange
}

export interface Capital {
  name: string
  script?: string
  from?: number
  to?: number
  source: SourceId
}

export interface Ruler {
  name: string
  script?: string
  reign?: [number, number]
  source: SourceId
}

export interface Rulers {
  founder: Ruler | null
  peak: Ruler | null
  last: Ruler | null
}

/** Closed vocabulary, PRD section 4. Not prose, so it can be filtered on. */
export const END_TYPES = [
  'conquest',
  'fragmentation',
  'dynastic replacement',
  'gradual absorption',
  'internal usurpation',
  'still contested',
] as const
export type EndType = (typeof END_TYPES)[number]

export interface Ending {
  type: EndType
  by: PolityId[]
  year: number | null
  source: SourceId
}

/** One influence count. `count: null` means unaddressed; `0` means none found. */
export interface InfluenceCount {
  count: number | null
  items: string[]
  source: SourceId | null
}

export interface Influence {
  descendant_scripts: InfluenceCount
  religions_carried: InfluenceCount
  successor_claims: InfluenceCount
}

export interface Measures {
  reach_km2: Cited<number> | null
  peak_population: Cited<number> | null
  influence: Influence
}

export interface Polity {
  id: PolityId
  /** Which region groups this polity, and whose thread it may stand in. */
  region: RegionId
  name: { latin: string; script: string | null; script_lang: string | null }
  span: Span
  identity: string
  capitals: Capital[]
  core_region: string
  rulers: Rulers
  scripts_and_languages: {
    administration: string[]
    writing_system: string | null
  }
  ended: Ending | null
  measures: Measures
  /** Context polities appear on the timeline and as edge targets, no chapters. */
  context_only?: boolean
}

/** PRD section 5. Directional, typed, dated, cited. */
export const EDGE_TYPES = [
  'seceded from',
  'overthrew',
  'slave-general of',
  'vassal of',
  'absorbed remnants of',
  'claimed legitimacy of',
  'partitioned from',
  'conquered by',
] as const
export type EdgeType = (typeof EDGE_TYPES)[number]

/**
 * Which end of an edge is the grammatical subject of its type.
 *
 * Edges are recorded predecessor -> successor: `to` is the later party and the
 * one that acted, `from` the earlier one acted upon. Seven of the eight types
 * are worded actively or relationally, so they read "to <type> from" — the
 * Ghaznavids slave-general of the Samanids, the Tulunids seceded from the
 * Abbasids. Checked against every type's own note.
 *
 * "conquered by" is the vocabulary's only passive phrasing, and passive voice
 * puts the acted-upon first: "Saffarid Dynasty conquered by Samanid Empire".
 * Rendering it like the others inverts the claim, which is what the Samanid
 * page was doing — "900 conquered by Saffarid Dynasty" sat directly above a
 * note saying Isma'il b. Ahmad defeated Amr b. al-Layth.
 *
 * This is a fact about English, not about the data, and it is recorded here so
 * that adding a passive type cannot silently reverse fifteen claims. The
 * vocabulary itself is untouched.
 */
export const EDGE_VOICE: Record<EdgeType, 'active' | 'passive'> = {
  'seceded from': 'active',
  overthrew: 'active',
  'slave-general of': 'active',
  'vassal of': 'active',
  'absorbed remnants of': 'active',
  'claimed legitimacy of': 'active',
  'partitioned from': 'active',
  'conquered by': 'passive',
}

export interface Edge {
  from: PolityId
  to: PolityId
  type: EdgeType
  year: number | null
  note: string
  source: SourceId
  /** Where scholarship disagrees on the nature of a transition, both edges are
   *  recorded and both are marked contested rather than one being picked. */
  contested: boolean
}

/** Who does what to whom, in the order the type's wording requires. */
export function edgeParties(edge: Edge): { subject: PolityId; object: PolityId } {
  return EDGE_VOICE[edge.type] === 'passive'
    ? { subject: edge.from, object: edge.to }
    : { subject: edge.to, object: edge.from }
}

export const PHASES = [
  'formation',
  'expansion',
  'peak',
  'contraction',
  'end',
  'afterlife',
] as const
export type Phase = (typeof PHASES)[number]

export interface Chapter {
  polity: PolityId
  slug: string
  order: number
  title: string
  /** Required. Hard rule 4: a chapter without this does not render. */
  drafted_from: SourceId
  phase: Phase | null
  body: string
}

export interface Source {
  id: SourceId
  kind: string
  author?: string
  title: string
  container?: string
  publisher?: string
  edition?: string
  year?: number
  url?: string
  licence?: string
  note?: string
}

/** A backdrop polity: numbers only, no prose, not browsable. */
export interface ReferencePolity {
  id: PolityId
  name: string
  span: { start: number; end: number; source: SourceId }
  reach_km2: Cited<number> | null
  peak_population: Cited<number> | null
}

/** Denominators for era-normalised mode. Both come from cited sources. */
export interface WorldDenominator {
  year: number
  world_population: Cited<number> | null
  world_land_under_state_control_km2: Cited<number> | null
}

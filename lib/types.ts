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

/**
 * One cited territorial extent at one date.
 *
 * Separate from `Cited<number>` because `at` is mandatory here: a figure with
 * no date cannot stand in a trajectory, and a trajectory is the only reason
 * this shape exists. Transcribed from a source that publishes a series —
 * Taagepera prints several datapoints per polity, and the site was keeping one
 * of them.
 */
export interface ExtentPoint {
  km2: number
  at: number
  source: SourceId
  /** What the source ties the figure to, where it names more than a year. */
  note?: string
}

export interface Measures {
  /**
   * The greatest cited extent. Kept as its own field rather than derived from
   * `extent`, so that the number the rankings use is one an author wrote down
   * and a source printed, not one the app picked by scanning a list.
   */
  reach_km2: Cited<number> | null
  /**
   * Cited extents in date order. Ordinarily empty: most polities here have one
   * figure, and a series only appears when someone has opened a source that
   * publishes one. An empty series is not a gap in a measure — `reach_km2`
   * carries that — it is the ordinary state of a polity nobody has transcribed
   * a series for.
   */
  extent: ExtentPoint[]
  peak_population: Cited<number> | null
  influence: Influence
}

/**
 * Closed vocabulary for a turning point.
 *
 * Deliberately small, and deliberately not a list of things that happened. Each
 * value names a *kind of hinge*, and the test for admitting a new one is
 * whether an existing value would misdescribe a real case — not whether a new
 * label would be tidier.
 *
 * Nothing here duplicates an object the corpus already has. A partition between
 * two polities is an edge in `edges.yaml`; how a polity stopped is `ended`;
 * where its capital sat is `capitals`. A turning point is the third thing: an
 * event inside one polity's life that changed its trajectory, which no other
 * file records.
 */
export const TURNING_POINT_TYPES = [
  'battle',
  'siege',
  'treaty',
  'revolt',
  'succession-crisis',
  'conversion',
  'capital-move',
  'catastrophe',
  'reform',
] as const
export type TurningPointType = (typeof TURNING_POINT_TYPES)[number]

/**
 * A dated event that changed the polity's trajectory.
 *
 * `changed` is the field that keeps this from becoming a battle list. It must
 * say what the event altered, not what the event was — the same discipline
 * `Edge.note` is held to. If it cannot be written, the entry is not a turning
 * point: it is something that happened, and things that happened belong in a
 * chapter.
 *
 * A polity with none is complete. Most conflicts in most polities' lives were
 * not hinges, and a page with an empty list is making no admission.
 */
export interface TurningPoint {
  year: number
  type: TurningPointType
  /** What it is called. "Manzikert", not "the battle of Manzikert in 1071". */
  name: string
  /** What it altered. Required, and held to the standard of an edge note. */
  changed: string
  source: SourceId
  /** Where scholarship disputes that this was a hinge at all. */
  contested: boolean
}

// ---------------------------------------------------------------------------
// Institutions
// ---------------------------------------------------------------------------

/**
 * How the fighting force was raised.
 *
 * Recruitment, not tactics or theatre. "Naval" is not here: a fleet is a domain
 * a state operates in, and the men on it were raised one of these ways like
 * everyone else. Srivijaya's crews came from coastal chiefs under obligation,
 * which is `client-levy`, and the fact that they went to sea is on its page in
 * prose where it belongs.
 */
export const MILITARY_BASES = [
  'tribal-levy',
  'client-levy',
  'conscript',
  'land-grant',
  'slave-soldier',
  'mercenary',
  'standing-professional',
] as const
export type MilitaryBasis = (typeof MILITARY_BASES)[number]

/**
 * What the state lived on.
 *
 * `land-grant` above and `land-tax` here are different questions: one is how
 * the soldier was paid, the other is where the money came from, and the iqta'
 * systems in this corpus are precisely the case where the same revenue answers
 * both.
 */
export const REVENUE_BASES = [
  'land-tax',
  'poll-tax',
  'trade-toll',
  'tribute',
  'plunder',
  'mining',
  'monopoly',
] as const
export type RevenueBasis = (typeof REVENUE_BASES)[number]

/**
 * How the next ruler was determined — the rule in force, not the outcome.
 *
 * `factional` is a real answer and not a null: the Mamluk sultanate had no
 * succession rule and a throne that went to whichever military faction could
 * impose its man, and recording that as "unaddressed" would lose the single
 * most distinctive thing about the polity.
 */
export const SUCCESSION_RULES = [
  'primogeniture',
  'tanistry',
  'appanage',
  'nomination',
  'election',
  'acclamation',
  'factional',
] as const
export type SuccessionRule = (typeof SUCCESSION_RULES)[number]

/** On what public ground the right to rule was asserted. */
export const LEGITIMATIONS = [
  'descent',
  'divine-sanction',
  'conquest',
  'caliphal-investiture',
  'titulature',
  'election',
] as const
export type Legitimation = (typeof LEGITIMATIONS)[number]

/**
 * A coded set: one or more vocabulary values, and the source for the coding.
 *
 * A set rather than a single value on purpose. Several of these polities ran
 * two arrangements at once — the Liao governed two populations under two
 * administrations, the Safavids replaced a tribal army with a slave one inside
 * a century — and forcing one value would make the site choose where its
 * sources do not. `null` for the whole field is the gap; an empty list is not a
 * legal value, because a set of nothing is a claim nobody made.
 */
export interface CodedSet<T extends string> {
  values: T[]
  source: SourceId
}

/**
 * How the polity was actually put together.
 *
 * The comparative substance km2 cannot carry. Two empires of the same extent
 * that raised their armies differently were different things, and until this
 * field existed nothing in the corpus could say so outside prose.
 *
 * Every field is independently nullable and a null renders as a gap like any
 * other missing measure: coding this requires a source that addresses the
 * question, and most polities here will carry some fields and not others for a
 * long time.
 */
export interface Institutions {
  military_basis: CodedSet<MilitaryBasis> | null
  revenue_basis: CodedSet<RevenueBasis> | null
  succession_rule: CodedSet<SuccessionRule> | null
  legitimation: CodedSet<Legitimation> | null
}

/**
 * Colours a source actually names for a polity's banner. Closed, and short on
 * purpose: this vocabulary exists to record a word a chronicler used, not to
 * describe a design. There is no hex value here and there must never be one —
 * "green" in Ṭabarī is not #00A651, and picking a shade would be hard rule 2
 * committed in a colour picker.
 */
export const BANNER_COLOURS = ['black', 'white', 'green', 'red', 'gold', 'purple'] as const
export type BannerColour = (typeof BANNER_COLOURS)[number]

/**
 * One work naming one colour. A list of these, rather than a single value,
 * because the sources disagree and the disagreement is the interesting part:
 * Ṭabarī gives the Umayyad banners as white and Balʿamī as green, and flattening
 * that to one colour would be the same invention hard rule 2 forbids of numbers.
 */
export interface BannerColourAttestation {
  colour: BannerColour
  /** The work in sources.yaml that can be opened to check this. */
  source: SourceId
  /**
   * The primary the cited work is itself reporting, named in plain text because
   * the chain matters and Ṭabarī is not an entry in sources.yaml. Never a
   * substitute for `source`: it is not a citation, it is what the citation says.
   */
  reported_from?: string
}

/**
 * A picture file, and what it actually is.
 *
 * `status` has no default and cannot be omitted, because the honest answer for
 * every polity in this corpus so far is `reconstruction` — nobody has a surviving
 * depiction of an Abbasid standard, and every SVG in circulation was drawn in
 * the last twenty years. Hard rule 9's principle applies with more force here
 * than anywhere else on the site: a flag reads as evidence at a glance, and a
 * reader who screenshots one will not screenshot the caption. So the label is
 * part of the data, not part of the styling, and the loader refuses a file
 * without one.
 */
export interface BannerImage {
  /** Basename under /public/flags. */
  file: string
  status: 'reconstruction' | 'contemporary'
  /** Key into content/flag-credits.yaml. Licences here require attribution. */
  credit: string
  /** Where the drawing departs from what the cited source describes. */
  divergence?: string
}

/**
 * What is known about how the polity marked itself in the field.
 *
 * Independently null like every coded set, and null is the ordinary answer:
 * most polities here have no cited banner and the page says so in a sentence.
 * `attested` is never empty — a banner block with no colour in it would be a
 * claim that someone described a banner and named no colour.
 */
export interface Banner {
  attested: BannerColourAttestation[]
  /** Prose from the cited work: what was carried, by whom, and when. */
  description: string
  source: SourceId
  image: BannerImage | null
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
  /** Coded per content/coding-rules.md part three. Fields are independently null. */
  institutions: Institutions
  /**
   * Banner colours as cited, and a picture only where one can be credited.
   * Null is ordinary and common — see the note on Banner.
   */
  banner: Banner | null
  /**
   * Dated hinges in this polity's life, in year order. Ordinarily empty, and
   * empty is not a gap: see the note on TurningPoint and hard rule 7, whose
   * logic this follows exactly.
   */
  turning_points: TurningPoint[]
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

/**
 * The narrative arc, in order.
 *
 * A chapter carries one of these when it narrates a stretch of the polity's
 * existence. The order is the whole point: it is what lets a page show where
 * its chapters sit in the life of the thing, and what makes a chapter tagged
 * `formation` after one tagged `end` a build error rather than a curiosity.
 */
export const PHASES = [
  'formation',
  'expansion',
  'peak',
  'contraction',
  'end',
  'afterlife',
] as const
export type Phase = (typeof PHASES)[number]

/**
 * Outside the arc.
 *
 * A large class of chapters here are not stages of anything: a coinage, a
 * treaty, a library, a poem, the examination system, or the evidence itself
 * and what it will not support. Before this value existed they were tagged
 * `peak` because the vocabulary offered nothing better, which put fifteen
 * polities on the site with two chapters both marked peak — a tag carrying no
 * information at all, and in several cases a false chronological claim.
 *
 * The test is not the subject's importance but whether it advances the
 * chronology. A chapter takes an arc phase when it narrates a stretch of the
 * polity's existence; it takes `aside` when its subject is a single object,
 * document, institution, or the record itself. An aside is never ordered and
 * never stands in the spine.
 */
export const ASIDE = 'aside' as const

/** Everything a chapter's `phase` frontmatter may say. */
export const CHAPTER_PHASES = [...PHASES, ASIDE] as const
export type ChapterPhase = (typeof CHAPTER_PHASES)[number]

/** Position in the arc, or null for anything that does not stand in it. */
export function arcIndex(phase: ChapterPhase | null | undefined): number | null {
  if (phase == null || phase === ASIDE) return null
  const i = PHASES.indexOf(phase)
  return i === -1 ? null : i
}

export interface Chapter {
  polity: PolityId
  slug: string
  order: number
  title: string
  /** Required. Hard rule 4: a chapter without this does not render. */
  drafted_from: SourceId
  /** An arc phase, `aside`, or null where the author has not tagged it yet. */
  phase: ChapterPhase | null
  body: string
}

/**
 * Provenance for one file under public/flags.
 *
 * Deliberately not a Source: sources.yaml lists works that support claims about
 * the past, and none of these files does that. A credit says who drew a picture
 * and under what terms it may be shown — which for the CC BY-SA files here is a
 * licence obligation the site has to discharge in visible text.
 */
export interface FlagCredit {
  id: string
  /** Basename under public/flags, so a credit and its file cannot drift apart. */
  file: string
  author: string
  licence: string
  licence_url?: string
  /** The file page it came from, so a reader can check this entry. */
  url: string
  retrieved: string
  /** What the uploader says the drawing was based on. Often the weakest link. */
  drawn_from?: string
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

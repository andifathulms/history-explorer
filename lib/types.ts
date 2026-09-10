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
/**
 * Browsing groups above the regions. A shelf, not an argument.
 *
 * Twenty-two regions is more than a contents list can carry, and the number
 * only goes up. This tier exists so the reader can find one, and it is
 * deliberately the weakest object in the model: a group has no page, no route,
 * no blurb and — the point — no thread. Succession is scoped to a region and
 * nothing wider. `edgesInRegion` takes a RegionId and there is no group
 * equivalent, which is the enforcement.
 *
 * The axis is geography and only geography. The tempting alternative, with ten
 * of the present regions in the Islamic era, is to group by civilisation —
 * Islamic world, Christendom, East Asia. That would assert at this level
 * exactly what `regions.yaml` refuses at the level below it, and it breaks on
 * contact with the corpus: Byzantium sits beside Anatolia because they fought
 * over one peninsula, the Islamic West spans two continents, and Cilician
 * Armenia is filed with Turkmen beyliks on purpose. Geography makes no claim
 * about who the people in a place were or what they had in common, which is
 * the property this tier needs.
 *
 * The order is fixed here rather than computed. A reader learns where a group
 * sits on the page, and sorting by earliest polity would move the furniture
 * every time an old one is added somewhere.
 */
export const REGION_GROUPS = [
  // Was 'fertile-crescent' / 'The Fertile Crescent and Egypt'. Renamed when the
  // Ancient Near East grew from four records to thirteen and stopped fitting:
  // Hatti is central Anatolia, Urartu is the Armenian highlands and both Elams
  // are the Iranian side of the Zagros, none of which is the Fertile Crescent.
  // This is now deliberately the broadest of the seven names, because its
  // oldest region reaches from the Nile to Lake Van.
  { id: 'near-east', name: 'The Near East' },
  // Was 'iran'. It was the only group of the seven named after a modern country
  // while the rest are physical geography, and it holds a region of four
  // Christian kingdoms whose orientation was Byzantine and then Russian.
  { id: 'iranian-plateau', name: 'The Iranian Plateau and the Caucasus' },
  { id: 'arabia', name: 'The Arabian Peninsula' },
  { id: 'mediterranean', name: 'The Mediterranean' },
  { id: 'africa-maghreb', name: 'Africa and the Maghreb' },
  // Split from 'mediterranean'. The Balkans, the Rus' and the Polish-Lithuanian
  // and Hungarian kingdoms were homeless: Orthodox and Latin Christian states
  // whose frontier was the steppe rather than the sea, filed on a shelf named
  // after a sea most of them never touched.
  { id: 'northern-and-eastern-europe', name: 'Northern and Eastern Europe' },
  { id: 'steppe-east-asia', name: 'The Steppe and East Asia' },
  // Was one shelf, 'south-asia' / 'South and Southeast Asia', and it held two
  // worlds. Ordering it exposed the problem: the subcontinent and the
  // archipelago alternated all the way down, because Angkor is older than the
  // Delhi Sultanate and Java is older than both. Separating them also stops a
  // healthy-looking total from hiding what is underneath it — thirty-three
  // polities on one shelf was six for the subcontinent and twenty-seven for
  // the islands and the mainland.
  { id: 'south-asia', name: 'South Asia' },
  { id: 'southeast-asia', name: 'Southeast Asia' },
  // Empty at the time of writing, and declared anyway. A shelf with nothing on
  // it renders nowhere — see isPopulatedRegion — so this costs a reader
  // nothing and gives the next polity somewhere to go.
  { id: 'the-americas', name: 'The Americas' },
] as const
export type RegionGroupId = (typeof REGION_GROUPS)[number]['id']

export interface Region {
  id: RegionId
  name: string
  blurb: string
  thread: boolean
  /** Which shelf it sits on. Browsing only — see REGION_GROUPS. */
  group: RegionGroupId
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
 *
 * `matrilineal` was added after five records had each recorded, on the page,
 * that this list could not hold a succession they could describe precisely.
 * Ghana, where al-Bakri states the rule and the reason given for it. Makuria,
 * attested in the Arabic accounts and the royal titulature. Asante, documented
 * in institutional detail by Wilks. And, on records whose own periods this
 * corpus does not carry, the Elam of Awan and Shimashki and the throne of Mali.
 *
 * The argument for adding it, set out on the Asante record's second chapter, is
 * that the gap was systematic rather than accidental. The seven original values
 * come from European, Islamic and steppe practice — primogeniture and appanage
 * from Latin Europe, tanistry from the Celtic and Turkic worlds, nomination and
 * acclamation from Rome and the caliphates, election from the Italian republics
 * and the Empire. Descent through women is not a marginal arrangement globally.
 * It was absent from this list because of where the list came from, and five
 * records were carrying a null that read as "nobody has looked" over an answer
 * everybody had.
 *
 * It names the rule of *eligibility* and not the method of selection, which is
 * why it frequently appears beside a second value: Asante reads
 * `[matrilineal, election]`, because the matriclan defined who could be chosen
 * and a council of chiefs did the choosing. Multi-value succession sets were
 * already the practice here — the Rashidun record carries three.
 *
 * `external-nomination` was added in the audit that followed, and the audit is
 * why: sweeping every null in this field turned up a cluster that had been
 * counting itself. Five records carried a null because the throne was filled or
 * confirmed by a sovereign outside the polity — Greater Armenia, nominated by
 * Parthia and crowned by Rome under a treaty between the two; Caucasian Iberia,
 * whose kings Rome acquired the right to invest at Nisibis; the Jafnids,
 * confirmed by the emperor; the Nasrids of al-Hira, confirmed at Ctesiphon; and
 * the sharifs of Mecca, appointed and deposed by whoever held Egypt. The
 * Sharifate's comment called itself the fifth.
 *
 * Two more had coded `nomination` and said in the comment that it was only half
 * the story: the Herodian record, where Herod designated and Augustus decided,
 * and the Tahirids, where the caliph appointed the last governor's son.
 *
 * It is the succession field's counterpart to `investiture` in the legitimation
 * list, and it was missing for the same reason — a vocabulary of internal
 * arrangements, in a corpus half full of clients. `nomination` means the
 * predecessor designated. This means somebody else did.
 */
export const SUCCESSION_RULES = [
  'primogeniture',
  'tanistry',
  'appanage',
  'nomination',
  'external-nomination',
  'election',
  'acclamation',
  'matrilineal',
  'factional',
] as const
export type SuccessionRule = (typeof SUCCESSION_RULES)[number]

/**
 * On what public ground the right to rule was asserted.
 *
 * `investiture` was added after nine records across four regions had recorded,
 * on the page, that the vocabulary could not say the thing that mattered most
 * about them. A Jafnid phylarch appointed by an emperor, a Timurid amir ruling
 * in a puppet khan's name, a Zand vakil regent for an infant Safavid, a Sharif
 * of Mecca confirmed by whoever held Egypt, a Shaddadid holding a Seljuk
 * diploma: every one of them rested its public claim on a grant from an
 * external sovereign, and the list had `caliphal-investiture` and nothing else.
 * Those nine were coding `conquest` or `descent` or null — each true, none of
 * them the point.
 *
 * The objection that stalled this for a long time was that a general
 * `investiture` would not say *by whom*, collapsing a Roman client kingship, a
 * Mongol yarligh, a Safavid governorship and a treaty into one word. The
 * vocabulary itself answers it: `descent` does not name the ancestor,
 * `conquest` does not name the conquered, `divine-sanction` does not name the
 * god. Not naming the counterparty is how every value in this list works, and
 * `caliphal-investiture` is the anomaly for being specific rather than the
 * standard a new value has to meet.
 *
 * Both are kept. `caliphal-investiture` is a species of `investiture` and stays
 * separately because it is the characteristic move of half this corpus, and
 * folding it into the genus would hide the pattern the site exists to show. The
 * rule for choosing between them is coding rule 8.
 */
export const LEGITIMATIONS = [
  'descent',
  'divine-sanction',
  'conquest',
  'caliphal-investiture',
  'investiture',
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
   * Predecessors and successors that have no record here. Named because the
   * history is the point; see ExternalNeighbour. Both lists are ordinarily
   * empty and an empty list is not a gap.
   */
  preceded_by_external?: ExternalNeighbour[]
  succeeded_by_external?: ExternalNeighbour[]
  /**
   * Dated hinges in this polity's life, in year order. Ordinarily empty, and
   * empty is not a gap: see the note on TurningPoint and hard rule 7, whose
   * logic this follows exactly.
   */
  turning_points: TurningPoint[]
  measures: Measures
  /**
   * The earlier record this one is the same object as, after an interruption.
   *
   * Deliberately not an edge, and the reason is worth keeping. The Ancient Near
   * East carries Babylon twice, Assyria twice and Elam twice, and in each pair
   * the later record is the same ground and the same royal title taken up again
   * after a dark age. The rendered sentence says only that, and deliberately:
   * the Bulgarian pair using this field was Christian on both sides of its
   * interruption, so a line about the same gods would have been false there. That is neither a succession nor a claim, and
   * three separate pages had recorded that the edge vocabulary has no relation
   * meaning *the same thing, later*.
   *
   * Adding one would have been wrong twice over. Every one of the corpus's
   * edges is an event with a year — a conquest, a secession, a claim made on a
   * date — and this relation has no year, because nothing happened. And an edge
   * is drawn by the region's thread, which would put a non-succession into the
   * one picture on this site that exists to show successions. CLAUDE.md's
   * single framing rule is that continuity is a section and not the spine;
   * feeding it a pseudo-succession is a step toward exactly that mistake.
   *
   * The relation is also not geographic, which is what a naive implementation
   * would have made it. Forty-seven pairs in this corpus share a capital with a
   * gap and no edge between them — Umayyad and Burid at Damascus, Idrisid and
   * Marinid at Fez, Han and Tang at Chang'an — and almost none of them are this.
   * Middle and Neo-Assyria, which are, do not even share a capital. The test is
   * whether the sources treat the two as periods of one continuous object.
   *
   * One-directional: the later record names the earlier one. The reverse view
   * is derived, never stored.
   */
  resumes?: PolityId
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

/**
 * A predecessor or successor that this collection does not carry as a record.
 *
 * The reader came to read about a polity, not about which pages exist. Aceh was
 * ended by the Dutch state; Melaka by Portugal; Ternate by a chartered company.
 * None of those is a polity here, and for a long time the succession section
 * answered "nothing continues from here", which is false about the world and
 * true only about a database.
 *
 * So an outside party can be named in plain text. It is deliberately NOT an
 * edge: an edge joins two records, is drawn by a region's thread, and is
 * counted. This is a sentence with a date and a source and nothing else, it
 * enters no thread and no tally, and hard rule 7 is untouched — a polity still
 * never requires one, and a page with neither edges nor these is complete.
 */
export interface ExternalNeighbour {
  /** Written as a reader would meet it: "the Dutch state", "Portugal". */
  name: string
  /**
   * The same closed vocabulary the edges use, so the sentence reads alike —
   * and optional, because not every real relation is a succession. Perlak was
   * the Muslim port on the north Sumatran coast before Samudera-Pasai was; it
   * did not hand anything over, was not conquered, and was simply there first.
   * Forcing one of eight succession types onto that would assert a relation
   * nobody recorded, so where none fits the field is omitted and the note
   * carries the relation in prose.
   */
  type?: EdgeType
  year: number | null
  /** What happened, in one or two sentences. */
  note: string
  source: SourceId
  contested?: boolean
}

/**
 * Territory that changed hands between two records, where the loser survived.
 *
 * The gap this fills is visible on the Byzantine page. That record carries more
 * edges than almost any other and not one of them says the empire lost Syria,
 * Egypt, Anatolia or Sicily — because every one of those was a transfer of
 * provinces and not a succession, and the eight edge types have no word for it.
 * `conquered by` would render "Byzantine Empire conquered by Rashidun
 * Caliphate", which is false: Byzantium outlived that conquest by eight
 * centuries and our own record ends it in 1453 at Ottoman hands.
 *
 * So this is deliberately NOT an edge, for the same reason `ExternalNeighbour`
 * is not one, and the reason is worth stating because it is the whole design.
 * A region's thread draws edges, and a thread is a picture of *what became
 * what*. Territorial transfers do not compose that way: a reader tracing
 * Byzantine to Rashidun to Umayyad along a drawn line would read descent, when
 * the first hop is not descent at all. Putting these in `edges.yaml` would make
 * the thread assert sequences nobody cited — hard rule 7, committed in pixels,
 * which is where hard rule 9 says it is hardest to notice.
 *
 * A transfer therefore enters no thread, no edge tally and no displacement
 * count. It is rendered on both pages and nowhere else.
 *
 * Which transfers qualify is a rule and not a judgement, because an unbounded
 * version of this would swallow every frontier war Byzantium fought for eight
 * centuries. See `content/coding-rules.md` part four: the loss must be
 * permanent and it must be a region the sources name as a province or a core.
 * Enforced in part by the build, which refuses a transfer dated at or after the
 * losing polity's own end — that is a conquest, and conquest is an edge.
 */
export interface Transfer {
  /** The polity that lost the territory, and went on existing. */
  from: PolityId
  /** The polity that took it. */
  to: PolityId
  /** What changed hands, as a reader would meet it: "Syria, Palestine and Egypt". */
  what: string
  year: number | null
  /** What happened, in one or two sentences. Held to the standard `Edge.note` is. */
  note: string
  source: SourceId
  contested: boolean
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

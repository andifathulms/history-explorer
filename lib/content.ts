/**
 * Build-time content loading and validation.
 *
 * Everything ships in the bundle, so this runs at build and never in the
 * browser. It is also where the hard rules stop being documentation and start
 * being enforcement: an unknown source id, an out-of-vocabulary edge type or a
 * chapter with no `drafted_from` fails `next build` rather than rendering
 * something plausible. A citation that does not resolve is worse than a visible
 * gap, because a gap is honest and a dangling id looks like provenance.
 */

import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import {
  arcIndex,
  CHAPTER_PHASES,
  EDGE_TYPES,
  REGION_GROUPS,
  END_TYPES,
  PHASES,
  TURNING_POINT_TYPES,
  BANNER_COLOURS,
  MILITARY_BASES,
  REVENUE_BASES,
  SUCCESSION_RULES,
  LEGITIMATIONS,
  type Banner,
  type Chapter,
  type Edge,
  type Polity,
  type ReferencePolity,
  type FlagCredit,
  type Region,
  type PolityId,
  type Source,
  type WorldDenominator,
} from './types.ts'

const CONTENT = path.join(process.cwd(), 'content')

function readYaml<T>(file: string): T {
  return parseYaml(fs.readFileSync(path.join(CONTENT, file), 'utf8')) as T
}

class ContentError extends Error {
  constructor(where: string, message: string) {
    super(`content error in ${where}: ${message}`)
    this.name = 'ContentError'
  }
}

// ---------------------------------------------------------------------------

let cache: Corpus | null = null

export interface Corpus {
  /** Browsing groups, and the scope of each continuity thread. */
  regions: Region[]
  /** Polities with chapters. The ones the site claims to have read. */
  narrative: Polity[]
  /** Edge targets and timeline presences with no chapters in v1. */
  context: Polity[]
  /** Every polity with a page or a timeline row: narrative plus context. */
  all: Polity[]
  backdrop: ReferencePolity[]
  denominators: WorldDenominator[]
  edges: Edge[]
  sources: Map<string, Source>
  chapters: Map<string, Chapter[]>
  /**
   * Author and licence for every image file under public/flags. Separate from
   * sources.yaml because it credits the drawing, not the scholarship: several
   * of these are CC BY-SA, where attribution is a licence term rather than a
   * courtesy, and the site has to be able to print it.
   */
  flagCredits: Map<string, FlagCredit>
}

export function loadCorpus(): Corpus {
  if (cache) return cache

  const sourceList = readYaml<{ sources: Source[] }>('sources.yaml').sources
  const sources = new Map(sourceList.map((s) => [s.id, s]))
  if (sources.size !== sourceList.length) {
    throw new ContentError('sources.yaml', 'duplicate source id')
  }

  /** Hard rule 1, enforced. Every citation resolves to a real listed work. */
  const requireSource = (id: string | null | undefined, where: string) => {
    if (id === null || id === undefined) return
    if (!sources.has(id)) {
      throw new ContentError(where, `source "${id}" is not in sources.yaml`)
    }
  }

  const creditList = readYaml<{ credits: FlagCredit[] }>('flag-credits.yaml').credits ?? []
  const credits = new Map(creditList.map((c) => [c.id, c]))
  if (credits.size !== creditList.length) {
    throw new ContentError('flag-credits.yaml', 'duplicate credit id')
  }
  for (const c of creditList) {
    // A licence with no author to attribute cannot be complied with, so the
    // build refuses it rather than shipping an unattributed file.
    if (!c.author?.trim() || !c.licence?.trim() || !c.url?.trim()) {
      throw new ContentError(`flag-credits.yaml/${c.id}`, 'a credit names its author, licence and source URL')
    }
  }

  const regions = readYaml<{ regions: Region[] }>('regions.yaml').regions
  const regionIds = new Set(regions.map((r) => r.id))
  if (regionIds.size !== regions.length) {
    throw new ContentError('regions.yaml', 'duplicate region id')
  }

  const refFile = readYaml<{
    polities: ReferencePolity[]
    world_denominators: WorldDenominator[]
  }>('reference-set.yaml')

  for (const r of refFile.polities) {
    requireSource(r.span?.source, `reference-set.yaml/${r.id}`)
    requireSource(r.reach_km2?.source, `reference-set.yaml/${r.id}`)
    requireSource(r.peak_population?.source, `reference-set.yaml/${r.id}`)
  }
  for (const d of refFile.world_denominators) {
    requireSource(d.world_population?.source, `reference-set.yaml/${d.year}`)
    requireSource(d.world_land_under_state_control_km2?.source, `reference-set.yaml/${d.year}`)
  }

  const polityDir = path.join(CONTENT, 'polities')
  const ids = fs
    .readdirSync(polityDir)
    .filter((d) => fs.statSync(path.join(polityDir, d)).isDirectory())
    .sort()

  const all: Polity[] = []
  const chapters = new Map<string, Chapter[]>()

  for (const id of ids) {
    const where = `polities/${id}/polity.yaml`
    const p = parseYaml(
      fs.readFileSync(path.join(polityDir, id, 'polity.yaml'), 'utf8'),
    ) as Polity

    if (p.id !== id) throw new ContentError(where, `id "${p.id}" does not match its directory`)
    if (!p.region) throw new ContentError(where, 'every polity names a region')
    if (!regionIds.has(p.region)) {
      throw new ContentError(where, `region "${p.region}" is not in regions.yaml`)
    }

    requireSource(p.span?.start?.source, where)
    requireSource(p.span?.start?.max_source, where)
    requireSource(p.span?.end?.source, where)
    requireSource(p.span?.end?.max_source, where)
    for (const c of p.capitals ?? []) requireSource(c.source, where)
    for (const r of [p.rulers?.founder, p.rulers?.peak, p.rulers?.last]) requireSource(r?.source, where)
    requireSource(p.measures?.reach_km2?.source, where)
    requireSource(p.measures?.peak_population?.source, where)

    // Extent series. Normalised to [] here so that every consumer can iterate
    // without a null check, and so an absent key and an empty list mean the
    // same ordinary thing: nobody has transcribed a series for this polity.
    if (p.measures) p.measures.extent ??= []
    const extent = p.measures?.extent ?? []
    if (!Array.isArray(extent)) {
      throw new ContentError(where, 'measures.extent must be a list of dated figures')
    }

    let previousYear: number | null = null
    for (const pt of extent) {
      const eWhere = `${where}/extent@${pt?.at}`
      if (typeof pt?.km2 !== 'number' || !Number.isFinite(pt.km2) || pt.km2 <= 0) {
        throw new ContentError(eWhere, 'every extent point needs a positive km2 figure')
      }
      // Mandatory, and the reason the shape is not Cited<number>: an undated
      // extent cannot stand anywhere on a trajectory.
      if (typeof pt.at !== 'number' || !Number.isInteger(pt.at)) {
        throw new ContentError(eWhere, 'every extent point needs the year the source dates it to')
      }
      requireSource(pt.source, eWhere)
      if (!pt.source) throw new ContentError(eWhere, 'every extent point names its source')

      // In date order, one figure per year. Two figures for the same year are
      // two sources disagreeing, which is a CitedRange question and not
      // something a trajectory can draw.
      if (previousYear !== null && pt.at <= previousYear) {
        throw new ContentError(
          eWhere,
          `extent points run in date order and one figure per year; ${pt.at} follows ${previousYear}`,
        )
      }
      previousYear = pt.at

      // The widest window any cited date supports. A figure outside it means
      // either the span or the extent is wrong, and the build should say so
      // rather than draw a bar off the end of the polity's life.
      if (pt.at < p.span.start.min || pt.at > p.span.end.max) {
        throw new ContentError(
          eWhere,
          `dated ${pt.at}, outside the cited span ${p.span.start.min}-${p.span.end.max}`,
        )
      }
    }

    if (extent.length > 0) {
      // A series with no declared peak would leave the polity ranking as
      // uncited on reach while the page shows cited figures — the one
      // inconsistency a reader could not explain.
      if (!p.measures.reach_km2) {
        throw new ContentError(
          where,
          'measures.extent has figures but reach_km2 is null; name which cited figure is the peak',
        )
      }
      // Not an equality check: the peak may come from a work the series does
      // not, and a higher peak from another source is a legitimate reading.
      // A peak *below* a figure on its own trajectory never is.
      const highest = extent.reduce((a, b) => (b.km2 > a.km2 ? b : a))
      if (p.measures.reach_km2.value < highest.km2) {
        throw new ContentError(
          where,
          `reach_km2 is ${p.measures.reach_km2.value.toLocaleString('en-GB')} km2 but the ` +
            `trajectory cites ${highest.km2.toLocaleString('en-GB')} km2 at ${highest.at}; ` +
            'a peak cannot be smaller than a point on its own series',
        )
      }
    }

    const inf = p.measures?.influence
    for (const [key, c] of Object.entries(inf ?? {})) {
      requireSource(c.source, `${where}/influence.${key}`)
      // A count without its items is not enterable, per the coding rules.
      if (c.count !== null && c.count !== c.items.length && c.count > 0) {
        throw new ContentError(
          `${where}/influence.${key}`,
          `count is ${c.count} but ${c.items.length} items are named; every counted item must be named`,
        )
      }
      // Zero is a claim that a source looked and found none, so it needs one.
      if (c.count !== null && c.source === null) {
        throw new ContentError(
          `${where}/influence.${key}`,
          'a count of 0 asserts that scholarship found none, so it requires a source; use null for unaddressed',
        )
      }
    }

    if (p.ended) {
      requireSource(p.ended.source, where)
      if (!END_TYPES.includes(p.ended.type)) {
        throw new ContentError(where, `ended.type "${p.ended.type}" is outside the closed vocabulary`)
      }
    }

    if (p.span.end.min < p.span.start.min) {
      throw new ContentError(where, 'span ends before it starts')
    }

    // Institutions. Four independently nullable coded sets; see part three of
    // content/coding-rules.md, which is binding on what may go in them.
    p.institutions ??= {
      military_basis: null,
      revenue_basis: null,
      succession_rule: null,
      legitimation: null,
    }
    const VOCABS = {
      military_basis: MILITARY_BASES,
      revenue_basis: REVENUE_BASES,
      succession_rule: SUCCESSION_RULES,
      legitimation: LEGITIMATIONS,
    } as const
    for (const [field, vocab] of Object.entries(VOCABS)) {
      const key = field as keyof typeof VOCABS
      const coded = p.institutions[key]
      if (coded === null || coded === undefined) {
        p.institutions[key] = null
        continue
      }
      const iWhere = `${where}/institutions.${field}`
      requireSource(coded.source, iWhere)
      if (!coded.source) throw new ContentError(iWhere, 'a coding names the source it was read from')
      if (!Array.isArray(coded.values) || coded.values.length === 0) {
        // The distinction hard rule 3 turns on, in a new place: a field with no
        // values is `null` — nobody addressed it. A set of nothing would be a
        // claim that the polity had no army, no revenue or no succession.
        throw new ContentError(
          iWhere,
          'an empty set is not a value; use null where no source addresses the question',
        )
      }
      for (const v of coded.values) {
        if (!(vocab as readonly string[]).includes(v)) {
          throw new ContentError(iWhere, `"${v}" is outside the closed vocabulary (${vocab.join(', ')})`)
        }
      }
      if (new Set(coded.values).size !== coded.values.length) {
        throw new ContentError(iWhere, 'the same value is coded twice')
      }
    }

    // Banner. Null is the ordinary answer and stays null; a present block is
    // held to the same standard as a measure, because a flag on a page reads as
    // evidence faster than any number does.
    p.banner ??= null
    if (p.banner) {
      const bWhere = `${where}/banner`
      requireSource(p.banner.source, bWhere)
      if (!p.banner.description?.trim()) {
        throw new ContentError(bWhere, 'a banner block says in prose what the source describes')
      }
      if (!Array.isArray(p.banner.attested) || p.banner.attested.length === 0) {
        throw new ContentError(
          bWhere,
          'an empty attestation list is not a value; use null where no source names a colour',
        )
      }
      for (const a of p.banner.attested) {
        if (!(BANNER_COLOURS as readonly string[]).includes(a?.colour)) {
          throw new ContentError(
            bWhere,
            `colour "${a?.colour}" is outside the closed vocabulary (${BANNER_COLOURS.join(', ')})`,
          )
        }
        requireSource(a.source, bWhere)
      }
      const img = p.banner.image
      if (img) {
        // The three fields that keep a picture from becoming an assertion. A
        // file with no status would render unlabelled, and an unlabelled
        // reconstruction is the failure this whole field exists to prevent.
        if (img.status !== 'reconstruction' && img.status !== 'contemporary') {
          throw new ContentError(bWhere, `image.status "${img.status}" is not reconstruction or contemporary`)
        }
        if (!img.file?.trim()) throw new ContentError(bWhere, 'a banner image names its file')
        if (!fs.existsSync(path.join(process.cwd(), 'public', 'flags', img.file))) {
          throw new ContentError(bWhere, `image file public/flags/${img.file} does not exist`)
        }
        if (!credits.has(img.credit)) {
          throw new ContentError(
            bWhere,
            `image.credit "${img.credit}" is not an entry in content/flag-credits.yaml — every file carries its author and licence`,
          )
        }
      }
    }

    // Turning points. Normalised to [] so no consumer needs a null check, and
    // so an absent key and an empty list say the same ordinary thing.
    p.turning_points ??= []
    if (!Array.isArray(p.turning_points)) {
      throw new ContentError(where, 'turning_points must be a list')
    }

    let lastTurningYear: number | null = null
    const turningSeen = new Set<string>()
    for (const t of p.turning_points) {
      const tWhere = `${where}/turning_point "${t?.name ?? '?'}"`
      if (!t?.name?.trim()) throw new ContentError(tWhere, 'a turning point is named')
      if (typeof t.year !== 'number' || !Number.isInteger(t.year)) {
        throw new ContentError(tWhere, 'a turning point is dated to a year')
      }
      if (!TURNING_POINT_TYPES.includes(t.type)) {
        throw new ContentError(
          tWhere,
          `type "${t.type}" is outside the closed vocabulary (${TURNING_POINT_TYPES.join(', ')})`,
        )
      }
      requireSource(t.source, tWhere)
      if (!t.source) throw new ContentError(tWhere, 'a turning point names its source')
      if (typeof t.contested !== 'boolean') {
        throw new ContentError(tWhere, 'contested is true or false, never absent')
      }

      // The rule that keeps this from becoming a battle list. `changed` must
      // say what the event altered; a restatement of the name or the type is
      // the failure mode, and it is cheap to catch the obvious forms of it.
      const changed = t.changed?.trim() ?? ''
      if (!changed) {
        throw new ContentError(
          tWhere,
          'changed is required: say what the event altered, not what it was. ' +
            'If that cannot be written, this is not a turning point',
        )
      }
      if (changed.length < 60) {
        throw new ContentError(tWhere, `changed is ${changed.length} characters; that is a label, not a consequence`)
      }
      const trivial = changed.toLowerCase().replace(/[^a-z0-9]/g, '')
      const nameKey = t.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (trivial === nameKey || trivial === t.type.replace(/-/g, '')) {
        throw new ContentError(tWhere, 'changed restates the name or the type')
      }

      if (t.year < p.span.start.min || t.year > p.span.end.max) {
        throw new ContentError(
          tWhere,
          `dated ${t.year}, outside the cited span ${p.span.start.min}-${p.span.end.max}`,
        )
      }
      if (lastTurningYear !== null && t.year < lastTurningYear) {
        throw new ContentError(tWhere, `dated ${t.year}, which is before ${lastTurningYear}; turning points run in year order`)
      }
      lastTurningYear = t.year

      const key = `${t.year}|${nameKey}`
      if (turningSeen.has(key)) throw new ContentError(tWhere, 'the same event is listed twice')
      turningSeen.add(key)
    }

    all.push(p)

    // Chapters. Hard rule 4: no drafted_from, no render — and here, no build.
    const files = fs
      .readdirSync(path.join(polityDir, id))
      .filter((f) => f.endsWith('.mdx'))
      .sort()

    const list: Chapter[] = files.map((file, i) => {
      const chWhere = `polities/${id}/${file}`
      const raw = fs.readFileSync(path.join(polityDir, id, file), 'utf8')
      const { data, content } = matter(raw)

      if (!data.drafted_from) {
        throw new ContentError(chWhere, 'frontmatter is missing drafted_from')
      }
      requireSource(data.drafted_from, chWhere)
      if (!data.title) throw new ContentError(chWhere, 'frontmatter is missing title')
      if (data.phase != null && !CHAPTER_PHASES.includes(data.phase)) {
        throw new ContentError(
          chWhere,
          `phase "${data.phase}" is outside the closed vocabulary ` +
            `(${CHAPTER_PHASES.join(', ')})`,
        )
      }

      return {
        polity: id,
        slug: file.replace(/\.mdx$/, ''),
        order: i,
        title: data.title as string,
        drafted_from: data.drafted_from as string,
        phase: (data.phase as Chapter['phase']) ?? null,
        body: content,
      }
    })

    // The arc runs one way. A chapter tagged `formation` sitting after one
    // tagged `end` is either a mistagging or a filing mistake, and both were
    // present before this check: four polities read backwards, and the
    // Byzantine page opened on contraction and then claimed a peak after it.
    //
    // Only arc phases are compared. Asides are unordered by definition and
    // untagged chapters make no claim, so neither can break the sequence — a
    // thematic chapter is free to sit anywhere its author wants it.
    let highest = -1
    let highestFrom = ''
    for (const ch of list) {
      const i = arcIndex(ch.phase)
      if (i === null) continue
      if (i < highest) {
        throw new ContentError(
          `polities/${id}/${ch.slug}.mdx`,
          `phase "${ch.phase}" follows "${highestFrom}"; the arc (${PHASES.join(' → ')}) ` +
            'does not run backwards. Retag the chapter, refile it, or mark it `aside` ' +
            'if it stands outside the chronology.',
        )
      }
      highest = i
      highestFrom = ch.phase as string
    }

    // PRD section 5 says 2-8 chapters. The floor is enforced because a
    // one-chapter page is what a batch import leaves behind, and it renders as
    // a finished polity rather than a stub — the reader cannot tell the
    // difference, which is the problem. Mark it context_only if it has none.
    const MIN_CHAPTERS = 2
    if (!p.context_only && list.length < MIN_CHAPTERS) {
      throw new ContentError(
        `polities/${id}`,
        `a narrative polity needs at least ${MIN_CHAPTERS} chapters (has ${list.length}); ` +
          'mark it context_only if it has none',
      )
    }
    if (p.context_only && list.length > 0) {
      throw new ContentError(`polities/${id}`, 'a context polity must not have chapters')
    }
    chapters.set(id, list)
  }

  const knownIds = new Set<string>([...all.map((p) => p.id), ...refFile.polities.map((p) => p.id)])

  for (const p of all) {
    for (const by of p.ended?.by ?? []) {
      if (!knownIds.has(by)) {
        throw new ContentError(`polities/${p.id}`, `ended.by references unknown polity "${by}"`)
      }
    }
  }

  const edges = readYaml<{ edges: Edge[] }>('edges.yaml').edges
  // A pair may legitimately carry several edges — Ghazna made the Ghurids its
  // client and the Ghurids later ended Ghazna, and collapsing those would lose
  // the point. The same triple twice is always a mistake, though: it double
  // counts a single claim in every view that tallies edges.
  const seen = new Set<string>()
  for (const e of edges) {
    const key = `${e.from}|${e.to}|${e.type}`
    if (seen.has(key)) {
      throw new ContentError('edges.yaml', `duplicate edge ${e.from} -> ${e.to} (${e.type})`)
    }
    seen.add(key)
  }
  edges.forEach((e, i) => {
    const where = `edges.yaml[${i}] ${e.from} -> ${e.to}`
    requireSource(e.source, where)
    if (!EDGE_TYPES.includes(e.type)) {
      throw new ContentError(where, `type "${e.type}" is outside the closed vocabulary`)
    }
    if (!knownIds.has(e.from)) throw new ContentError(where, `unknown polity "${e.from}"`)
    if (!knownIds.has(e.to)) throw new ContentError(where, `unknown polity "${e.to}"`)
    if (!e.note?.trim()) throw new ContentError(where, 'an edge must explain itself')
  })

  // Every region sits on exactly one shelf, and the shelf is from the closed
  // list. A typo here would silently drop a region out of the browsing nav
  // without dropping it out of anything else, which is the kind of failure
  // nobody notices for a month.
  const groupIds = new Set(REGION_GROUPS.map((g) => g.id))
  for (const r of regions) {
    if (!groupIds.has(r.group)) {
      throw new ContentError(
        `regions.yaml/${r.id}`,
        `group "${r.group ?? '(missing)'}" is outside the closed list in lib/types.ts`,
      )
    }
  }

  // A region only claims a thread if its polities are actually joined. Without
  // this, `thread: true` on an unconnected region would render an empty spine
  // and quietly imply a continuity nobody sourced.
  for (const r of regions.filter((x) => x.thread)) {
    const inRegion = new Set(all.filter((p) => p.region === r.id).map((p) => p.id))
    const joined = edges.some((e) => inRegion.has(e.from) && inRegion.has(e.to))
    if (!joined) {
      throw new ContentError(
        `regions.yaml/${r.id}`,
        'claims thread: true but no edge joins two of its polities; use thread: false',
      )
    }
  }

  const narrative = all.filter((p) => !p.context_only).sort((a, b) => a.span.start.min - b.span.start.min)
  const context = all.filter((p) => p.context_only)

  cache = {
    regions,
    narrative,
    context,
    all: [...narrative, ...context],
    backdrop: refFile.polities,
    denominators: refFile.world_denominators,
    edges,
    sources,
    chapters,
    flagCredits: credits,
  }
  return cache
}

// ---------------------------------------------------------------------------
// Views over the corpus
// ---------------------------------------------------------------------------

export function getPolity(id: string): Polity | undefined {
  return loadCorpus().all.find((p) => p.id === id)
}

export function getChapters(id: string): Chapter[] {
  return loadCorpus().chapters.get(id) ?? []
}

export interface Neighbours {
  predecessors: Edge[]
  successors: Edge[]
}

/** The polity's position in the thread: what led here, and what led away. */
export function getNeighbours(id: string): Neighbours {
  const { edges } = loadCorpus()
  return {
    predecessors: edges.filter((e) => e.to === id),
    successors: edges.filter((e) => e.from === id),
  }
}

/** Display name for any id, including backdrop entries that have no page. */
export function displayName(id: string): string {
  const c = loadCorpus()
  const p = c.all.find((x) => x.id === id)
  if (p) return p.name.latin
  const r = c.backdrop.find((x) => x.id === id)
  if (r) return r.name
  return id
}

export function hasPage(id: string): boolean {
  const p = loadCorpus().all.find((x) => x.id === id)
  return !!p && !p.context_only
}

export function getFlagCredit(id: string): FlagCredit | undefined {
  return loadCorpus().flagCredits.get(id)
}

export function getSource(id: string): Source | undefined {
  return loadCorpus().sources.get(id)
}

/** "Bosworth, The New Islamic Dynasties (1996)" — for the chapter byline. */
export function citeShort(id: string): string {
  const s = getSource(id)
  if (!s) return id
  const author = s.author ? `${s.author.split(' ').slice(-1)[0]}, ` : ''
  const year = s.year ? ` (${s.year})` : ''
  return `${author}${s.container ?? s.title}${year}`
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export function getRegion(id: string): Region | undefined {
  return loadCorpus().regions.find((r) => r.id === id)
}

/** Everything in a region, narrative and context alike, in date order. */
export function politiesInRegion(id: string): Polity[] {
  return loadCorpus()
    .all.filter((p) => p.region === id)
    .sort((a, b) => a.span.start.min - b.span.start.min)
}

/** Edges with both ends inside the region — the ones a thread can draw. */
export function edgesInRegion(id: string): Edge[] {
  const ids = new Set(politiesInRegion(id).map((p) => p.id))
  return loadCorpus().edges.filter((e) => ids.has(e.from) && ids.has(e.to))
}

/**
 * Regions arranged on their browsing shelves, for the contents nav.
 *
 * Groups come back in the fixed order declared in `lib/types.ts`; regions
 * inside a group come back oldest first, by the earliest polity standing in
 * them, so each shelf reads forwards. An empty group is dropped rather than
 * rendered as a heading with nothing under it — a group is furniture and has
 * no gap to declare, unlike every other absence on this site.
 *
 * There is deliberately no `edgesInGroup`. Succession is scoped to a region.
 */
export function regionsByGroup(
  filter: (r: Region) => boolean = () => true,
): { id: string; name: string; regions: Region[] }[] {
  const { regions } = loadCorpus()
  const earliest = (r: Region) => {
    const ps = politiesInRegion(r.id)
    return ps.length ? Math.min(...ps.map((p) => p.span.start.min)) : Infinity
  }
  return REGION_GROUPS.map((g) => ({
    id: g.id,
    name: g.name,
    regions: regions
      .filter((r) => r.group === g.id && filter(r))
      .sort((a, b) => earliest(a) - earliest(b)),
  })).filter((g) => g.regions.length > 0)
}

/** Regions that can be walked end to end. May legitimately be empty. */
export function threadedRegions(): Region[] {
  return loadCorpus().regions.filter((r) => r.thread)
}

/**
 * Whether this polity stands in a thread. False is ordinary: a polity that
 * seceded from nothing and was inherited by nobody is not incomplete.
 */
export function inThread(p: Polity): boolean {
  return getRegion(p.region)?.thread === true
}

/**
 * Edges with exactly one end inside the region.
 *
 * The Intermezzo dynasties all held their authority from a caliphate in another
 * region, and that is the most important fact about several of them. A thread
 * must not draw those edges — it would assert a sequence across regions — but
 * dropping them silently would lose the context entirely, so they are named
 * beside the thread instead.
 */
export function crossRegionEdges(id: string): Edge[] {
  const ids = new Set(politiesInRegion(id).map((p) => p.id))
  return loadCorpus().edges.filter(
    (e) => ids.has(e.from) !== ids.has(e.to),
  )
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export interface SourceUse {
  source: Source
  /** Polity ids citing this work anywhere: measures, facts, chapters, edges. */
  polities: PolityId[]
  /** Chapters drafted from it. */
  chapters: number
  /** Distinct claims resolving to it — the same tally the worklist counts. */
  claims: number
  /** Polities whose every citation resolves to this one work. */
  soleSourceFor: PolityId[]
}

/**
 * Who cites what.
 *
 * The build already guarantees that every citation resolves. It says nothing
 * about concentration, and concentration is the more useful question once a
 * corpus is large: a polity whose every claim rests on one book is not better
 * sourced than one with a gap, it is one disagreement away from being wrong
 * throughout, and nothing on its page shows that.
 */
export function sourceUsage(): SourceUse[] {
  const c = loadCorpus()
  const byId = new Map<string, { polities: Set<string>; chapters: number; claims: number }>()
  const bump = (id: string | null | undefined, polity: string | null) => {
    if (!id) return
    if (!byId.has(id)) byId.set(id, { polities: new Set(), chapters: 0, claims: 0 })
    const e = byId.get(id)!
    e.claims += 1
    if (polity) e.polities.add(polity)
  }

  // Per-polity citations, counted the same way the verification worklist does.
  const perPolity = new Map<string, Set<string>>()
  const note = (polity: string, id: string | null | undefined) => {
    if (!id) return
    if (!perPolity.has(polity)) perPolity.set(polity, new Set())
    perPolity.get(polity)!.add(id)
  }

  for (const p of c.all) {
    const ids = [
      p.span?.start?.source,
      p.span?.start?.max_source,
      p.span?.end?.source,
      p.span?.end?.max_source,
      ...(p.capitals ?? []).map((x) => x.source),
      p.rulers?.founder?.source,
      p.rulers?.peak?.source,
      p.rulers?.last?.source,
      p.measures?.reach_km2?.source,
      ...(p.measures?.extent ?? []).map((x) => x.source),
      ...(p.turning_points ?? []).map((x) => x.source),
      ...Object.values(p.institutions ?? {}).map((c) => c?.source ?? null),
      p.banner?.source ?? null,
      ...(p.banner?.attested ?? []).map((a) => a.source),
      p.measures?.peak_population?.source,
      ...Object.values(p.measures?.influence ?? {}).map((x) => x.source),
      p.ended?.source,
    ]
    for (const id of ids) {
      bump(id, p.id)
      note(p.id, id)
    }
    for (const ch of c.chapters.get(p.id) ?? []) {
      bump(ch.drafted_from, p.id)
      note(p.id, ch.drafted_from)
      const e = byId.get(ch.drafted_from)
      if (e) e.chapters += 1
    }
  }
  for (const e of c.edges) bump(e.source, null)
  for (const r of c.backdrop) {
    bump(r.span?.source, null)
    bump(r.reach_km2?.source, null)
    bump(r.peak_population?.source, null)
  }
  // Era-normalised mode's denominators. Missing these once reported McEvedy &
  // Jones as cited by nothing, when it is the source for all six of them — a
  // page about provenance getting provenance wrong.
  for (const d of c.denominators) {
    bump(d.world_population?.source, null)
    bump(d.world_land_under_state_control_km2?.source, null)
  }

  const sole = new Map<string, string[]>()
  for (const [polity, ids] of perPolity) {
    if (ids.size === 1) {
      const only = [...ids][0]
      sole.set(only, [...(sole.get(only) ?? []), polity])
    }
  }

  return [...c.sources.values()]
    .map((source) => {
      const e = byId.get(source.id)
      return {
        source,
        polities: [...(e?.polities ?? [])].sort(),
        chapters: e?.chapters ?? 0,
        claims: e?.claims ?? 0,
        soleSourceFor: (sole.get(source.id) ?? []).sort(),
      }
    })
    .sort((a, b) => b.claims - a.claims || a.source.id.localeCompare(b.source.id))
}

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
  EDGE_TYPES,
  END_TYPES,
  PHASES,
  type Chapter,
  type Edge,
  type Polity,
  type ReferencePolity,
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
      if (data.phase != null && !PHASES.includes(data.phase)) {
        throw new ContentError(chWhere, `phase "${data.phase}" is outside the closed vocabulary`)
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

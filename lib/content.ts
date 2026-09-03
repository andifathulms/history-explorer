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

    if (!p.context_only && list.length === 0) {
      throw new ContentError(
        `polities/${id}`,
        'a narrative polity needs at least one chapter; mark it context_only if it has none',
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

/**
 * Regenerates polities-metadata.json at the repository root: every group,
 * region and polity, with each polity's native name alongside its Latin one.
 *
 * Run with: node scripts/generate-metadata.mjs
 *
 * Not part of the content build or its validation - this is a read-only
 * dump for external tooling, not enforced content. Group order follows
 * REGION_GROUPS in lib/types.ts; region order within a group follows
 * regions.yaml; polity order within a region follows the order polities
 * carrying that region appear on disk.
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const readYaml = (f) => parse(fs.readFileSync(path.join(CONTENT, f), 'utf8'))

// REGION_GROUPS lives in TypeScript, not YAML. Extracted with a regex rather
// than a TS import so this script stays a plain Node script with no build
// step of its own - matches the literal `{ id: '...', name: '...' }` shape
// the source has used consistently since the list was introduced.
const typesSource = fs.readFileSync(path.join(ROOT, 'lib', 'types.ts'), 'utf8')
const groupsBlock = typesSource.match(/export const REGION_GROUPS = \[([\s\S]*?)\] as const/)?.[1] ?? ''
const groupOrder = [...groupsBlock.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'\s*\}/g)].map(
  ([, id, name]) => ({ id, name }),
)

const regions = readYaml('regions.yaml').regions

const polityDirs = fs.readdirSync(path.join(CONTENT, 'polities')).sort()
const politiesByRegion = new Map()
for (const dir of polityDirs) {
  const polityPath = path.join(CONTENT, 'polities', dir, 'polity.yaml')
  if (!fs.existsSync(polityPath)) continue
  const p = readYaml(path.relative(CONTENT, polityPath))
  const chapterCount = fs
    .readdirSync(path.join(CONTENT, 'polities', dir))
    .filter((f) => f.endsWith('.mdx')).length

  const entry = {
    id: p.id,
    name: p.name.latin,
    // Native name as the polity's own sources render it - the Arabic of a
    // caliphate, the Egyptian hieroglyphs, the Cyrillic or Han or Devanagari
    // of whatever the record itself carries. Null where a polity.yaml's own
    // `name.script` is null, which is the ordinary state for many records
    // rather than an omission here.
    native_name: p.name.script ?? null,
    native_name_lang: p.name.script_lang ?? null,
    start: p.span.start.min,
    end: p.span.end.min,
    end_max: p.span.end.max,
    ended_type: p.ended?.type ?? null,
    chapter_count: chapterCount,
  }

  if (!politiesByRegion.has(p.region)) politiesByRegion.set(p.region, [])
  politiesByRegion.get(p.region).push(entry)
}

const regionsByGroup = new Map()
for (const r of regions) {
  const polities = politiesByRegion.get(r.id) ?? []
  const regionEntry = {
    id: r.id,
    name: r.name,
    thread: r.thread,
    polity_count: polities.length,
    polities,
  }
  if (!regionsByGroup.has(r.group)) regionsByGroup.set(r.group, [])
  regionsByGroup.get(r.group).push(regionEntry)
}

const groups = groupOrder
  .map((g) => ({ id: g.id, name: g.name, regions: regionsByGroup.get(g.id) ?? [] }))
  .filter((g) => g.regions.length > 0)

const totalPolities = groups.reduce(
  (sum, g) => sum + g.regions.reduce((s, r) => s + r.polity_count, 0),
  0,
)
const totalRegions = groups.reduce((sum, g) => sum + g.regions.length, 0)

const output = {
  generated_at: new Date().toISOString(),
  total_groups: groups.length,
  total_regions: totalRegions,
  total_polities: totalPolities,
  groups,
}

fs.writeFileSync(
  path.join(ROOT, 'polities-metadata.json'),
  JSON.stringify(output, null, 2) + '\n',
  'utf8',
)

console.log(
  `polities-metadata.json written: ${groups.length} groups, ${totalRegions} regions, ${totalPolities} polities.`,
)

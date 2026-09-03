import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Feature, Geometry } from 'geojson'

/**
 * Peak-extent polygons, loaded at build.
 *
 * Three honesty requirements from PRD section 7 are enforced here rather than
 * left to the renderer:
 *
 * 1. The polygon is the nearest snapshot to the peak, not the peak. Both years
 *    are returned so the UI can always show the difference.
 * 2. No area is ever computed from these shapes. There is deliberately no
 *    function in this file that could produce one.
 * 3. BORDERPRECISION drives edge softness, so a border you cannot trust looks
 *    like one.
 */

export interface BasemapProps {
  NAME: string
  SUBJECTO: string | null
  /** 1 approximate, 2 moderately precise, 3 determined by international law. */
  BORDERPRECISION: number | null
}

export interface BasemapView {
  /** The dataset's own tag for the file, e.g. "900" or "bc500". */
  snapshot: string
  /** That tag as a signed year, for arithmetic and for display. */
  snapshotYear: number
  peakYear: number
  /** The polity's own polygons, drawn at reading weight. */
  subject: { d: string; precision: number | null; name: string }[]
  /** Everything else in frame, drawn faint, so the shape sits somewhere. */
  context: { d: string; name: string }[]
  width: number
  height: number
}

interface Link {
  polity: string
  /** YAML gives a number for AD tags and a string for the "bc" ones. */
  snapshot: string | number
  peak_year: number
  features: string[]
}

/**
 * "bc500" -> -500, "900" -> 900.
 *
 * The dataset names its pre-Christian files with a bc prefix, so the tag is not
 * a number and must not be treated as one: subtracting it from a peak year
 * silently yields NaN, which renders as no drift at all rather than as an
 * error. That is the worst possible failure for a label whose entire job is to
 * say how far the polygon is from the peak.
 */
function snapshotYear(tag: string | number): number {
  const s = String(tag)
  return s.startsWith('bc') ? -Number(s.slice(2)) : Number(s)
}

let links: Link[] | null = null

function getLinks(): Link[] {
  if (!links) {
    links = parseYaml(
      fs.readFileSync(path.join(process.cwd(), 'content', 'basemap-links.yaml'), 'utf8'),
    ).links as Link[]
  }
  return links
}

const cache = new Map<string, FeatureCollection<Geometry, BasemapProps>>()

function snapshot(tag: string): FeatureCollection<Geometry, BasemapProps> {
  const hit = cache.get(tag)
  if (hit) return hit
  const file = path.join(process.cwd(), 'data', 'basemaps', `${tag}.json`)
  const fc = JSON.parse(fs.readFileSync(file, 'utf8')) as FeatureCollection<Geometry, BasemapProps>
  cache.set(tag, fc)
  return fc
}

/**
 * Softness in pixels, from the dataset's own ordinal.
 *
 * The dataset author suggests exactly this use for the field. In this period
 * every feature is 1, approximate, so every border in this corpus dissolves —
 * which is the correct picture for polities whose frontiers were zones of
 * control rather than lines, and not a bug to be tuned away.
 */
export function blurFor(precision: number | null): number {
  switch (precision) {
    case 3:
      return 0
    case 2:
      return 1.5
    default:
      return 4
  }
}

export function getBasemap(polityId: string, width = 640, height = 380): BasemapView | null {
  const link = getLinks().find((l) => l.polity === polityId)
  if (!link) return null

  const fc = snapshot(String(link.snapshot))
  const wanted = new Set(link.features)
  const subjectFeatures = fc.features.filter((f) => wanted.has(f.properties.NAME))
  if (subjectFeatures.length === 0) return null

  const projection = geoMercator().fitExtent(
    [
      [24, 24],
      [width - 24, height - 24],
    ],
    { type: 'FeatureCollection', features: subjectFeatures } as FeatureCollection,
  )
  const toPath = geoPath(projection)

  const subject = subjectFeatures
    .map((f) => ({
      d: toPath(f as Feature) ?? '',
      precision: f.properties.BORDERPRECISION,
      name: f.properties.NAME,
    }))
    .filter((s) => s.d)

  // The projection is fitted to the subject, so most of the snapshot lands off
  // canvas. Emitting its path data anyway was most of the page weight, so
  // context is clipped to what is actually in frame.
  const context = fc.features
    .filter((f) => !wanted.has(f.properties.NAME))
    .filter((f) => {
      const [[x0, y0], [x1, y1]] = toPath.bounds(f as Feature)
      return x1 > 0 && y1 > 0 && x0 < width && y0 < height
    })
    .map((f) => ({ d: toPath(f as Feature) ?? '', name: f.properties.NAME }))
    .filter((c) => c.d)

  return {
    snapshot: String(link.snapshot),
    snapshotYear: snapshotYear(link.snapshot),
    peakYear: link.peak_year,
    subject,
    context,
    width,
    height,
  }
}

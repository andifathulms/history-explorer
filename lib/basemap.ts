import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { geoContains, geoGraticule10, geoMercator, geoPath } from 'd3-geo'
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

export type BasemapDataset = 'historical-basemaps' | 'cliopatria'

export interface BasemapView {
  dataset: BasemapDataset
  /** The dataset's own tag for the file, e.g. "900" or "bc500". */
  snapshot: string
  /**
   * Cliopatria only: the years the subject's row is valid for. Its rows are
   * ranges rather than fixed snapshots, and the range is what the UI shows.
   */
  range: [number, number] | null
  /** That tag as a signed year, for arithmetic and for display. */
  snapshotYear: number
  peakYear: number
  /** The polity's own polygons, drawn at reading weight. */
  subject: { d: string; precision: number | null; name: string }[]
  /** Everything else in frame, drawn faint, so the shape sits somewhere. */
  context: { d: string; name: string }[]
  /**
   * Modern land, clipped to the frame. Neither dataset draws the ground, so
   * without this unclaimed land and the sea would be the same colour.
   */
  land: string
  /** Ten-degree lines, drawn under the land so they show only at sea. */
  graticule: string
  /**
   * Where names go: the subject's, and the largest neighbours' that fit.
   * Placed at a centroid only when it falls inside the shape, and dropped
   * rather than allowed to collide.
   */
  labels: { name: string; x: number; y: number; subject: boolean }[]
  width: number
  height: number
}

interface Link {
  polity: string
  /** Absent means historical-basemaps. */
  dataset?: BasemapDataset
  /** historical-basemaps: YAML gives a number for AD tags and a string for the "bc" ones. */
  snapshot?: string | number
  /** cliopatria: the year whose row is drawn. */
  year?: number
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

let landCache: Geometry | null = null

function getLand(): Geometry {
  if (!landCache) {
    landCache = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'basemaps', 'land.json'), 'utf8'),
    ) as Geometry
  }
  return landCache
}

function getLinks(): Link[] {
  if (!links) {
    links = parseYaml(
      fs.readFileSync(path.join(process.cwd(), 'content', 'basemap-links.yaml'), 'utf8'),
    ).links as Link[]
  }
  return links
}

const cache = new Map<string, FeatureCollection<Geometry, BasemapProps>>()

/** Cliopatria rows carry their validity range and no border precision. */
interface CliopatriaProps {
  NAME: string
  FROM: number
  TO: number
}

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

  const dataset: BasemapDataset = link.dataset ?? 'historical-basemaps'
  const tag = dataset === 'cliopatria' ? `cliopatria-${link.year}` : String(link.snapshot)
  const fc = snapshot(tag)
  const wanted = new Set(link.features)
  const subjectFeatures = fc.features.filter((f) => wanted.has(f.properties.NAME))
  if (subjectFeatures.length === 0) return null

  const projection = geoMercator().fitExtent(
    [
      [24, 24],
      [width - 24, height - 24],
    ],
    {
      type: 'FeatureCollection',
      features: subjectFeatures,
    } as FeatureCollection,
  )
  // Everything is clipped just outside the frame: the path data stays small,
  // and a neighbour cut by the frame edge does not draw its hairline along it.
  projection.clipExtent([
    [-8, -8],
    [width + 8, height + 8],
  ])
  // A tenth of a unit is a fifteenth of a pixel at the widest this renders;
  // d3's default of three places was a third of the page weight in digits.
  const toPath = geoPath(projection).digits(1)

  const subject = subjectFeatures
    .map((f) => ({
      d: toPath(f as Feature) ?? '',
      // Cliopatria does not grade its borders, so this is null and blurFor
      // gives it the approximate softness — the honest reading of a frontier
      // nobody claims to know to the line.
      precision: f.properties.BORDERPRECISION ?? null,
      name: f.properties.NAME,
    }))
    .filter((s) => s.d)

  const inFrame = fc.features
    .filter((f) => !wanted.has(f.properties.NAME))
    .filter((f) => toPath.area(f as Feature) > 0)
  const context = inFrame
    .map((f) => ({ d: toPath(f as Feature) ?? '', name: f.properties.NAME }))
    .filter((c) => c.d)

  const land = toPath(getLand()) ?? ''
  const graticule = toPath(geoGraticule10()) ?? ''

  // Labels, largest first. Mono caps at 8 units: about 5.4 units a character
  // with the tracking, 10 tall. A name that would overlap one already placed,
  // or run off the frame, is left off rather than squeezed in.
  const labels: BasemapView['labels'] = []
  const boxes: [number, number, number, number][] = []
  const place = (f: Feature, name: string, isSubject: boolean) => {
    // A neighbour's name is a landmark, not a caption. Cliopatria names some
    // rows as sentences — "(Alliance between Byzantine Empire and Khazaria)"
    // — and those are left to the hover title rather than laid across a
    // country.
    if (!isSubject && name.length > 32) return
    const [x, y] = toPath.centroid(f)
    const at = projection.invert?.([x, y])
    if (!Number.isFinite(x) || !at || !geoContains(f, at)) return
    const w = name.length * (isSubject ? 6.2 : 5.4) + 6
    const box: [number, number, number, number] = [x - w / 2, y - 7, x + w / 2, y + 7]
    if (box[0] < 6 || box[2] > width - 6 || box[1] < 6 || box[3] > height - 6) return
    if (boxes.some((o) => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1])) return
    boxes.push(box)
    labels.push({ name, x, y, subject: isSubject })
  }
  // The subject first, so a neighbour never takes its place. Its largest part
  // carries the name when it is in several pieces.
  const largest = subjectFeatures
    .flatMap((f) =>
      f.geometry.type === 'MultiPolygon'
        ? f.geometry.coordinates.map(
            (c) =>
              ({
                type: 'Feature',
                properties: {},
                geometry: { type: 'Polygon', coordinates: c },
              }) as Feature,
          )
        : [f as Feature],
    )
    .sort((a, b) => toPath.area(b) - toPath.area(a))[0]
  if (largest) place(largest, subjectFeatures[0].properties.NAME, true)
  inFrame
    .map((f) => ({ f: f as Feature, a: toPath.area(f as Feature) }))
    .filter(({ a }) => a > 3000)
    .sort((a, b) => b.a - a.a)
    .slice(0, 8)
    .forEach(({ f }) => place(f, (f.properties as BasemapProps).NAME, false))

  const row = subjectFeatures[0].properties as unknown as Partial<CliopatriaProps>

  return {
    dataset,
    snapshot: tag,
    range:
      dataset === 'cliopatria' && row.FROM != null && row.TO != null ? [row.FROM, row.TO] : null,
    snapshotYear: dataset === 'cliopatria' ? (link.year as number) : snapshotYear(link.snapshot!),
    peakYear: link.peak_year,
    subject,
    context,
    land,
    graticule,
    labels,
    width,
    height,
  }
}

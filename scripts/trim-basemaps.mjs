/**
 * Fetch and trim historical-basemaps snapshots into data/basemaps/.
 *
 * Run with: npm run basemaps
 *
 * The full world files are about a megabyte each and this site ships
 * everything in the bundle, so each snapshot is cut to the region and its
 * coordinates rounded. Rounding is a rendering decision about a polygon that is
 * already an illustration, not a measurement — see hard rule 5. No area is ever
 * computed from these files and no figure is ever derived from them.
 *
 * BORDERPRECISION is carried through untouched so the renderer can drive edge
 * softness from it.
 */

import fs from 'node:fs'
import path from 'node:path'

const SNAPSHOTS = [800, 900, 1000, 1100, 1200]
const BASE = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson'
const OUT = path.join(process.cwd(), 'data', 'basemaps')

// Iran, Transoxiana, Afghanistan and the approaches, with enough margin that
// neighbouring polities render as context rather than the target floating alone.
const BBOX = { west: 30, east: 92, south: 18, north: 52 }

const round = (n) => Math.round(n * 100) / 100

/** Round to 2dp and drop points that collapse onto their predecessor. */
function simplifyRing(ring) {
  const out = []
  for (const pt of ring) {
    const p = [round(pt[0]), round(pt[1])]
    const last = out[out.length - 1]
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p)
  }
  // A ring needs four points to close; anything less is not drawable.
  if (out.length < 4) return null
  const [f, l] = [out[0], out[out.length - 1]]
  if (f[0] !== l[0] || f[1] !== l[1]) out.push([f[0], f[1]])
  return out
}

function simplifyGeometry(geom) {
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(simplifyRing).filter(Boolean)
    return rings.length ? { type: 'Polygon', coordinates: rings } : null
  }
  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates
      .map((poly) => poly.map(simplifyRing).filter(Boolean))
      .filter((poly) => poly.length)
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null
  }
  return null
}

function touchesRegion(geom) {
  let hit = false
  const walk = (c) => {
    if (hit) return
    if (typeof c[0] === 'number') {
      if (c[0] > BBOX.west && c[0] < BBOX.east && c[1] > BBOX.south && c[1] < BBOX.north) hit = true
      return
    }
    for (const x of c) walk(x)
  }
  walk(geom.coordinates)
  return hit
}

fs.mkdirSync(OUT, { recursive: true })

for (const year of SNAPSHOTS) {
  const res = await fetch(`${BASE}/world_${year}.geojson`)
  if (!res.ok) throw new Error(`world_${year}: HTTP ${res.status}`)
  const world = await res.json()

  const features = []
  for (const f of world.features) {
    if (!f.geometry || !f.properties?.NAME) continue
    if (!touchesRegion(f.geometry)) continue
    const geometry = simplifyGeometry(f.geometry)
    if (!geometry) continue
    features.push({
      type: 'Feature',
      properties: {
        NAME: f.properties.NAME,
        SUBJECTO: f.properties.SUBJECTO ?? null,
        // Carried through verbatim: the renderer blurs edges from this.
        BORDERPRECISION: f.properties.BORDERPRECISION ?? null,
      },
      geometry,
    })
  }

  const out = { type: 'FeatureCollection', name: `world_${year}_trimmed`, year, features }
  const file = path.join(OUT, `${year}.json`)
  fs.writeFileSync(file, JSON.stringify(out))
  const kb = (fs.statSync(file).size / 1024).toFixed(0)
  console.log(`${year}: ${features.length} features, ${kb} kB`)
}

console.log('\nSource: aourednik/historical-basemaps, CC-BY-4.0.')

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

const BASE = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson'
const OUT = path.join(process.cwd(), 'data', 'basemaps')
const LINKS = path.join(process.cwd(), 'content', 'basemap-links.yaml')

// Which snapshots to fetch, and which features matter in each, is read from
// content/basemap-links.yaml rather than hardcoded — the links are the claim
// about which polygon illustrates which polity, and this script should follow
// them rather than keep a second copy of the same list.
//
// The region kept per snapshot used to be a fixed box around Iran, which was
// right when the corpus was one region. It is computed per snapshot now: the
// bounding box of that snapshot's own target features, widened by MARGIN so
// neighbours render as context rather than the target floating alone. A global
// keep would be about 430 kB per snapshot and this site ships everything in
// the bundle.
const MARGIN = 12

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

function touchesRegion(geom, BBOX) {
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

/** Bounding box of a geometry, in degrees. */
function bboxOf(geom, box) {
  const walk = (c) => {
    if (typeof c[0] === 'number') {
      box.west = Math.min(box.west, c[0])
      box.east = Math.max(box.east, c[0])
      box.south = Math.min(box.south, c[1])
      box.north = Math.max(box.north, c[1])
      return
    }
    for (const x of c) walk(x)
  }
  walk(geom.coordinates)
  return box
}

// Minimal YAML read: this file is a flat list and pulling in a parser for the
// build scripts is not worth it.
const linkText = fs.readFileSync(LINKS, 'utf8')
const wanted = new Map() // snapshot -> Set(feature names)
{
  let snapshot = null
  for (const line of linkText.split('\n')) {
    const snap = line.match(/^\s*snapshot:\s*(\S+)/)
    if (snap) snapshot = snap[1].replace(/['"]/g, '')
    const feats = line.match(/^\s*features:\s*\[(.*)\]/)
    if (feats && snapshot) {
      const names = feats[1].split(',').map((n) => n.trim().replace(/^['"]|['"]$/g, ''))
      if (!wanted.has(snapshot)) wanted.set(snapshot, new Set())
      for (const n of names) wanted.get(snapshot).add(n)
    }
  }
}
const SNAPSHOTS = [...wanted.keys()]

fs.mkdirSync(OUT, { recursive: true })

let total = 0
for (const year of SNAPSHOTS) {
  const res = await fetch(`${BASE}/world_${year}.geojson`)
  if (!res.ok) throw new Error(`world_${year}: HTTP ${res.status}`)
  const world = await res.json()

  // The box this snapshot has to cover: its own targets, plus a margin.
  const targets = wanted.get(year)
  const box = { west: 180, east: -180, south: 90, north: -90 }
  let found = 0
  for (const f of world.features) {
    if (f.geometry && targets.has(f.properties?.NAME)) {
      bboxOf(f.geometry, box)
      found++
    }
  }
  if (!found) throw new Error(`world_${year}: none of [${[...targets].join(', ')}] found`)
  const BBOX = {
    west: box.west - MARGIN,
    east: box.east + MARGIN,
    south: box.south - MARGIN,
    north: box.north + MARGIN,
  }

  const features = []
  for (const f of world.features) {
    if (!f.geometry || !f.properties?.NAME) continue
    if (!touchesRegion(f.geometry, BBOX)) continue
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
  const kb = fs.statSync(file).size / 1024
  total += kb
  console.log(`${year}: ${features.length} features, ${kb.toFixed(0)} kB`)
}

console.log(`\n${SNAPSHOTS.length} snapshots, ${(total / 1024).toFixed(2)} MB total.`)
console.log('Source: aourednik/historical-basemaps, CC-BY-4.0.')

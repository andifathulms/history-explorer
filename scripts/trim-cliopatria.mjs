/**
 * Trim Cliopatria into data/basemaps/ for the links that name it.
 *
 * Run with:
 *   npm run basemaps:cliopatria -- <cliopatria_polities_only.geojson>
 *
 * The land underneath is not this script's: see trim-land.mjs.
 *
 * The release is a 44 MB zip on GitHub (Seshat-Global-History-Databank/
 * cliopatria), so it is downloaded and unzipped by hand rather than fetched
 * here. Unlike historical-basemaps it is not a set of world snapshots but one
 * file of rows, each valid from FromYear to ToYear inclusive; a "snapshot" is
 * every row whose range contains the linked year. That set is cut to the
 * region and rounded exactly as trim-basemaps.mjs does.
 *
 * The dataset carries an Area column. It is dropped here, not carried through:
 * hard rule 5 forbids publishing an area derived from a polygon, and the
 * safest way to keep a number off the page is to never ship it.
 */

import fs from 'node:fs'
import path from 'node:path'
import { geoArea } from 'd3-geo'

const OUT = path.join(process.cwd(), 'data', 'basemaps')
const LINKS = path.join(process.cwd(), 'content', 'basemap-links.yaml')
const MARGIN = 12

const input = process.argv[2]
if (!input) throw new Error('usage: trim-cliopatria.mjs <cliopatria_polities_only.geojson>')

const round = (n) => Math.round(n * 100) / 100

function simplifyRing(ring) {
  const out = []
  for (const pt of ring) {
    const p = [round(pt[0]), round(pt[1])]
    const last = out[out.length - 1]
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p)
  }
  if (out.length < 4) return null
  const [f, l] = [out[0], out[out.length - 1]]
  if (f[0] !== l[0] || f[1] !== l[1]) out.push([f[0], f[1]])
  return out
}

/**
 * Cliopatria mixes winding orders: about half its rows are wound the RFC 7946
 * way, which d3 reads as the complement — the globe minus the polity — so a
 * Saxon kingdom drew as a veil over the whole frame. Any polygon larger than a
 * hemisphere is turned round. No polity here is larger than a hemisphere.
 */
function upright(rings) {
  return geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI
    ? rings.map((r) => [...r].reverse())
    : rings
}

function simplifyGeometry(geom) {
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(simplifyRing).filter(Boolean)
    return rings.length ? { type: 'Polygon', coordinates: upright(rings) } : null
  }
  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates
      .map((poly) => poly.map(simplifyRing).filter(Boolean))
      .filter((poly) => poly.length)
      .map(upright)
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null
  }
  return null
}

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

function touchesRegion(geom, B) {
  let hit = false
  const walk = (c) => {
    if (hit) return
    if (typeof c[0] === 'number') {
      if (c[0] > B.west && c[0] < B.east && c[1] > B.south && c[1] < B.north) hit = true
      return
    }
    for (const x of c) walk(x)
  }
  walk(geom.coordinates)
  return hit
}

// Minimal YAML read, as in trim-basemaps.mjs: year -> Set(feature names), for
// the entries that say `dataset: cliopatria`.
const wanted = new Map()
{
  let entry = null
  const flush = () => {
    if (entry?.dataset === 'cliopatria' && entry.year != null && entry.features) {
      if (!wanted.has(entry.year)) wanted.set(entry.year, new Set())
      for (const n of entry.features) wanted.get(entry.year).add(n)
    }
  }
  for (const line of fs.readFileSync(LINKS, 'utf8').split('\n')) {
    if (/^\s*- polity:/.test(line)) {
      flush()
      entry = {}
    }
    if (!entry) continue
    const ds = line.match(/^\s*dataset:\s*(\S+)/)
    if (ds) entry.dataset = ds[1]
    const yr = line.match(/^\s*year:\s*(-?\d+)/)
    if (yr) entry.year = Number(yr[1])
    const feats = line.match(/^\s*features:\s*\[(.*)\]/)
    if (feats) entry.features = feats[1].split(',').map((n) => n.trim().replace(/^['"]|['"]$/g, ''))
  }
  flush()
}

const rows = JSON.parse(fs.readFileSync(input, 'utf8')).features
fs.mkdirSync(OUT, { recursive: true })

for (const [year, targets] of wanted) {
  const alive = rows.filter(
    (f) => f.geometry && f.properties.FromYear <= year && year <= f.properties.ToYear,
  )

  const box = { west: 180, east: -180, south: 90, north: -90 }
  const found = alive.filter((f) => targets.has(f.properties.Name))
  if (found.length !== targets.size) {
    throw new Error(
      `cliopatria ${year}: wanted [${[...targets].join(', ')}], found ${found.length}`,
    )
  }
  for (const f of found) bboxOf(f.geometry, box)
  const B = {
    west: box.west - MARGIN,
    east: box.east + MARGIN,
    south: box.south - MARGIN,
    north: box.north + MARGIN,
  }

  const features = []
  for (const f of alive) {
    if (!touchesRegion(f.geometry, B)) continue
    const geometry = simplifyGeometry(f.geometry)
    if (!geometry) continue
    features.push({
      type: 'Feature',
      properties: {
        NAME: f.properties.Name,
        FROM: f.properties.FromYear,
        TO: f.properties.ToYear,
      },
      geometry,
    })
  }

  const file = path.join(OUT, `cliopatria-${year}.json`)
  fs.writeFileSync(
    file,
    JSON.stringify({
      type: 'FeatureCollection',
      name: `cliopatria_${year}_trimmed`,
      year,
      features,
    }),
  )
  console.log(
    `cliopatria ${year}: ${features.length} features, ${(fs.statSync(file).size / 1024).toFixed(0)} kB`,
  )
}

console.log('Source: Seshat Global History Databank, Cliopatria, CC-BY-4.0.')

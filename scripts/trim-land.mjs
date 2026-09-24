/**
 * Round Natural Earth land into data/basemaps/land.json, the ground every map
 * is drawn on.
 *
 * Run with: npm run basemaps:land -- <ne_50m_land.geojson>
 *
 * Downloaded by hand from naturalearthdata.com (public domain). Neither map
 * dataset draws the ground itself: Cliopatria draws polities only, so
 * unclaimed land — the Sahara, the steppe — would render as sea, and
 * historical-basemaps leaves gaps wherever nobody was named. Modern coastline,
 * which every map's caveat already says. The file is read at build and never
 * shipped; the renderer clips it to the frame.
 */

import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2]
if (!input) throw new Error('usage: trim-land.mjs <ne_50m_land.geojson>')

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

const land = []
for (const f of JSON.parse(fs.readFileSync(input, 'utf8')).features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys) {
    const rings = poly.map(simplifyRing).filter(Boolean)
    if (rings.length) land.push({ type: 'Polygon', coordinates: rings })
  }
}

const file = path.join(process.cwd(), 'data', 'basemaps', 'land.json')
fs.writeFileSync(file, JSON.stringify({ type: 'GeometryCollection', geometries: land }))
console.log(`land: ${land.length} polygons, ${(fs.statSync(file).size / 1024).toFixed(0)} kB`)
console.log('Source: Natural Earth 1:50m Land, public domain.')

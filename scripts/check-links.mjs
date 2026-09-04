/**
 * Every internal link in the export must carry the basePath and resolve to a
 * file that exists.
 *
 * Written after breadcrumbs shipped as bare <a href="/polities/">. next/link
 * applies basePath; a raw anchor does not, so on GitHub Pages — where the site
 * lives under /history-explorer — every breadcrumb on 66 polity pages and 15
 * thread pages pointed at the domain root and 404'd. The build was green, the
 * tests were green, and the only thing that would have caught it was clicking.
 *
 *   npm run check:links
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const OUT = 'out'
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry)
    if ((await stat(full)).isDirectory()) out.push(...(await walk(full)))
    else if (full.endsWith('.html')) out.push(full)
  }
  return out
}

const pages = await walk(OUT)
const missingBase = new Map()
const dangling = new Map()

const note = (map, key, page) => {
  if (!map.has(key)) map.set(key, new Set())
  map.get(key).add(path.relative(OUT, page))
}

for (const page of pages) {
  const html = await readFile(page, 'utf8')
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1]
    // Protocol-relative and Next's own asset paths are not our concern.
    if (href.startsWith('//')) continue

    if (BASE && !href.startsWith(`${BASE}/`) && href !== BASE) {
      note(missingBase, href, page)
      continue
    }

    const rel = BASE ? href.slice(BASE.length) : href
    const clean = rel.split('#')[0].split('?')[0]
    if (!clean || clean.startsWith('/_next/')) continue

    const target = clean.endsWith('/')
      ? path.join(OUT, clean, 'index.html')
      : path.join(OUT, clean)
    try {
      await stat(target)
    } catch {
      note(dangling, href, page)
    }
  }
}

const report = (label, map) => {
  if (!map.size) return 0
  console.error(`\n${label}:`)
  for (const [href, pagesFound] of map) {
    const list = [...pagesFound]
    const shown = list.slice(0, 3).join(', ')
    console.error(
      `  ${href}  — on ${list.length} page${list.length === 1 ? '' : 's'} (${shown}${
        list.length > 3 ? ', …' : ''
      })`,
    )
  }
  return map.size
}

const problems =
  report(`Internal links missing the basePath "${BASE}"`, missingBase) +
  report('Internal links pointing at a file that does not exist', dangling)

if (problems) {
  console.error(`\n${problems} broken link target${problems === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`${pages.length} pages checked, every internal link resolves.`)

/**
 * Give the generated share cards a .png extension.
 *
 * Next writes the opengraph-image route as an extensionless file — out/polity/
 * samanid/opengraph-image — which is correct on a host that reads the route's
 * declared content type and wrong on GitHub Pages, which serves a file by its
 * extension and hands an extensionless one out as application/octet-stream.
 * A scraper asked for an image and given a binary blob draws no card, which is
 * exactly the bug this whole change set is about.
 *
 * So the file is renamed after the export and the metadata points at the
 * renamed path. Runs as postbuild, which npm invokes for us.
 *
 *   npm run og:extension
 */
import { readdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'

const OUT = 'out'
const NAME = 'opengraph-image'

async function walk(dir) {
  let renamed = 0
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry)
    if ((await stat(full)).isDirectory()) renamed += await walk(full)
    else if (entry === NAME) {
      await rename(full, `${full}.png`)
      renamed += 1
    }
  }
  return renamed
}

const n = await walk(OUT)
console.log(`${n} share card${n === 1 ? '' : 's'} renamed to .png.`)

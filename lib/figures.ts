/**
 * Figure validation: the rules that make a picture on this site citable.
 *
 * A figure is declared in a chapter's frontmatter and placed in its body with
 * `<Figure id="..." />`. Both halves are checked here, because each half fails
 * silently on its own: a declared-but-unplaced figure is an image nobody sees
 * and nobody notices is missing, and a placed-but-undeclared one throws inside
 * MDX compilation with a stack trace that names the component and not the file.
 *
 * The dimension check exists for a specific failure. Re-exporting an image at a
 * new size and forgetting to update the frontmatter leaves numbers that are
 * plausible, wrong, and invisible until a reader on a slow connection watches
 * the paragraph they are reading jump down the page.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { Figure, SourceId } from './types.ts'

/** Banned by hard rule 12, in captions as much as in prose. */
const AVAILABILITY = [
  /\bhas a page here\b/i,
  /\b(not|isn't|is not) in this (corpus|collection)\b/i,
  /\bthis (record|corpus|collection|site)\b/i,
  /\bno (image|photograph|picture) (is )?(available|survives here)\b/i,
  /\bthe only (surviving )?(image|photograph)\b/i,
]

/**
 * Intrinsic pixel size, from the file's own header.
 *
 * Deliberately not a dependency. PNG puts width and height in the IHDR chunk at
 * a fixed offset; JPEG carries them in whichever SOF marker the encoder chose,
 * which is why this walks the segment chain rather than reading a fixed offset.
 */
export function imageSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(file)

  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let i = 2
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++
        continue
      }
      const marker = buf[i + 1]
      // SOF0..SOF15, minus the four markers in that range that are not frame
      // headers (DHT c4, JPG c8, DAC cc, and the RSTn/other non-SOF codes).
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      }
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }

  throw new Error(`${file}: not a PNG or JPEG this build can measure`)
}

const REQUIRED = ['id', 'file', 'width', 'height', 'alt', 'caption', 'source', 'credit', 'licence', 'file_page'] as const

/**
 * Validate one chapter's figures against its frontmatter, its body and the
 * files on disk. Throws with the chapter path on the first problem.
 */
export function parseFigures(
  raw: unknown,
  body: string,
  where: string,
  publicDir: string,
  requireSource: (id: SourceId, where: string) => void,
  fail: (where: string, message: string) => never,
): Figure[] {
  if (raw == null) return []
  if (!Array.isArray(raw)) fail(where, 'frontmatter `figures` must be a list')

  const figs: Figure[] = []
  const seen = new Set<string>()

  for (const f of raw as Record<string, unknown>[]) {
    for (const key of REQUIRED) {
      if (f[key] == null || f[key] === '') {
        fail(where, `figure ${String(f.id ?? '(unnamed)')} is missing \`${key}\``)
      }
    }
    const id = String(f.id)
    if (seen.has(id)) fail(where, `two figures share the id "${id}"`)
    seen.add(id)

    // Hard rule 1. A picture's identification is a claim like any other, and a
    // caption that names a museum and a date with nothing behind it is exactly
    // the plausible-looking citation the rule exists to refuse.
    requireSource(f.source as SourceId, `${where} figure ${id}`)

    const caption = String(f.caption)
    for (const pattern of AVAILABILITY) {
      if (pattern.test(caption)) {
        fail(where, `figure ${id}'s caption tells the reader what this collection holds (hard rule 12): ${pattern}`)
      }
    }
    if (String(f.alt).trim() === caption.trim()) {
      fail(where, `figure ${id}'s alt text repeats its caption; the alt describes the object, the caption makes the claim`)
    }

    const file = String(f.file)
    const abs = path.join(publicDir, 'images', file)
    if (!fs.existsSync(abs)) fail(where, `figure ${id} points at public/images/${file}, which does not exist`)

    const real = imageSize(abs)
    if (real.width !== Number(f.width) || real.height !== Number(f.height)) {
      fail(
        where,
        `figure ${id} declares ${f.width}x${f.height} but public/images/${file} is ` +
          `${real.width}x${real.height} — the declared size is what reserves space before the file lands`,
      )
    }

    figs.push({
      id,
      file,
      width: real.width,
      height: real.height,
      alt: String(f.alt),
      caption,
      source: f.source as SourceId,
      holder: f.holder ? String(f.holder) : undefined,
      credit: String(f.credit),
      licence: String(f.licence),
      file_page: String(f.file_page),
      wide: f.wide === true,
    })
  }

  // Both directions. `<Figure id="a,b" />` places two, so the marker is split
  // the same way the component splits it.
  const placed = new Set<string>()
  for (const m of body.matchAll(/<Figure\s+id=["']([^"']+)["']/g)) {
    for (const one of m[1].split(',').map((s) => s.trim())) {
      if (!seen.has(one)) fail(where, `the body places <Figure id="${one}" />, which the frontmatter does not declare`)
      if (placed.has(one)) fail(where, `figure ${one} is placed twice in the body`)
      placed.add(one)
    }
  }
  for (const f of figs) {
    if (!placed.has(f.id)) {
      fail(where, `figure ${f.id} is declared but never placed — add <Figure id="${f.id}" /> where it belongs, or remove it`)
    }
  }

  return figs
}

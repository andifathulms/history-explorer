import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * The shared furniture of a share card: the palette, the faces, and the axis
 * the span is drawn on.
 *
 * A card is rendered once at build time into a PNG, which means none of the
 * site's CSS reaches it — no tokens, no @font-face, no Tailwind. Everything it
 * uses has to be restated here as literal values, and the only thing keeping
 * the card on the site's palette is that these are copied from
 * tailwind.config.ts by hand. Change a colour there and change it here.
 */

export const OG_SIZE = { width: 1200, height: 630 }

/** Copied from tailwind.config.ts. See the note above. */
export const C = {
  ground: '#0B1520', // dawat
  raise: '#111F2C', // dawat.raise
  edge: '#20364A', // dawat.edge
  paper: '#E4E7E0', // kaghaz
  dust: '#868A82', // debu-paper, the dust that is legible on the dark band
  thread: '#3E9C9C', // firuze
  threadBright: '#5AC6BF', // firuze.bright
}

/**
 * The faces, as TrueType.
 *
 * The site ships woff2 and the renderer cannot read it, so app/fonts/og holds
 * TrueType copies of the four faces a card uses: Fraunces instanced to the
 * one weight and optical size a card title is set at, and the mono and
 * interface faces converted as they are. Derivation is in app/fonts/README.md.
 */
function face(file: string): Buffer {
  return readFileSync(path.join(process.cwd(), 'app/fonts/og', file))
}

export function ogFonts() {
  return [
    { name: 'Fraunces', data: face('fraunces-600.ttf'), weight: 600 as const, style: 'normal' as const },
    { name: 'Plex Mono', data: face('plexmono-400.ttf'), weight: 400 as const, style: 'normal' as const },
    { name: 'Plex Sans', data: face('plexsans-500.ttf'), weight: 500 as const, style: 'normal' as const },
    { name: 'Spectral', data: face('spectral-400.ttf'), weight: 400 as const, style: 'normal' as const },
  ]
}

/**
 * How large a title can be set and still fit two lines.
 *
 * "Rum" and "The Sultanate of Rum after the Mongol settlement" are both polity
 * names, and one type size cannot hold both. The steps are chosen by eye
 * against the longest name in the corpus.
 */
export function titleSize(text: string): number {
  if (text.length <= 18) return 88
  if (text.length <= 30) return 72
  if (text.length <= 46) return 58
  return 48
}

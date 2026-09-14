import { citeShort, getFigure } from '@/lib/content'
import type { Figure as FigureData } from '@/lib/types'

/**
 * A picture that is evidence, rendered to the standard evidence is held to.
 *
 * Hard rule 9 says a picture that reads as a measurement is held to the
 * standard of one. This component is the general case of that: a photograph of
 * an object is a claim about the past — that this thing exists, that it looks
 * like this, that it is what the caption says it is — and a claim on this site
 * carries its source. So a figure has two provenances, and they are two
 * different facts that were confused every time this was tried informally:
 *
 *   `source`  — who says what the object is. An id in sources.yaml, enforced at
 *               build exactly like a chapter's `drafted_from`. A caption reading
 *               "carved in the Fifth Dynasty, compiling annals running back
 *               seven hundred years" is a sourced historical claim that happens
 *               to sit under a picture.
 *   `credit` + `licence` + `file_page`
 *             — who made and owns the image. Nothing to do with the history;
 *               everything to do with being allowed to ship the file.
 *
 * Both render. A reader who wants to check either can.
 *
 * One `id` renders one picture. Several, comma-separated, render a comparison
 * row — which exists because chapter 6's argument is literally three serekh
 * tops side by side, and splitting that across three separate figures would
 * lose the comparison the prose is making.
 */

/** GitHub Pages serves a project page from a subpath. A bare `/images/...`
 *  works in development and 404s in production, silently, on every figure. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function One({ fig, grouped }: { fig: FigureData; grouped: boolean }) {
  return (
    <div className={grouped ? 'min-w-0 flex-1' : ''}>
      {/* Explicit intrinsic dimensions. `images: { unoptimized: true }` is set
          for static export, so nothing downstream is going to work the aspect
          ratio out — without these the page reflows as each file lands, which
          on a reading page means the paragraph you are on jumps. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/images/${fig.file}`}
        alt={fig.alt}
        width={fig.width}
        height={fig.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full border border-kashi/15 bg-kaghaz-lift"
      />

      {/* The caption makes the claim; the alt describes the object. They are
          not the same text and neither substitutes for the other — a reader on
          a screen reader gets both, in that order, and a caption that merely
          repeats the alt wastes one of them. */}
      <figcaption className="mt-3 text-[14.5px] leading-relaxed text-dawat/85">
        {fig.caption}
      </figcaption>

      <p className="mt-2 font-mono text-micro leading-relaxed text-debu-ink">
        {fig.holder ? <span>{fig.holder} &middot; </span> : null}
        <cite className="not-italic">{citeShort(fig.source)}</cite>
        {' · '}
        <span>{fig.credit}</span>
        {' · '}
        <a
          href={fig.file_page}
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-firuze-ink"
        >
          {fig.licence}
        </a>
      </p>
    </div>
  )
}

export function Figure({ id, polity }: { id: string; polity: string }) {
  const figs = id.split(',').map((one) => getFigure(polity, one.trim()))
  const grouped = figs.length > 1
  const wide = figs.some((f) => f.wide)

  return (
    <figure
      className={`mt-8 ${
        // A plan is unreadable at reading measure — the whole argument of
        // Petrie's plate is 174 numbered rectangles in rows, and at 68
        // characters wide they are specks. `wide` lets a figure use the column
        // it is in rather than the measure the prose is set to.
        wide ? 'max-w-full' : 'max-w-measure'
      }`}
    >
      <div
        className={
          grouped
            ? 'flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-5'
            : ''
        }
      >
        {figs.map((f) => (
          <One key={f.id} fig={f} grouped={grouped} />
        ))}
      </div>
    </figure>
  )
}

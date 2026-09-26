import Link from 'next/link'
import type { Chapter, Polity, Region } from '@/lib/types'
import { formatRange, formatYear } from '@/lib/years'
import { getBasemap } from '@/lib/basemap'
import { scriptLang } from '@/lib/scripts'
import { Crumbs, HeroBand, Shell } from '@/components/Shell'
import { MapDrawing } from '@/components/MapDrawing'

export interface HeroFigure {
  label: string
  value: React.ReactNode
  /** Renders as an absence rather than a figure — italic, in dust. */
  gap?: boolean
  /** A 0–1 share to draw as a bar, where the figure is itself a share. */
  bar?: number
  note?: React.ReactNode
}

/**
 * The top of a polity page: what it was, when, and where.
 *
 * On the dark ground, because this is where a reader orients rather than
 * reads, and because the map already lives on dawat — putting the name and the
 * map on one ground lets them be one picture. The map was the ninth of ten
 * sections, below a five-thousand-word essay on the longer pages; it is the
 * most immediate thing the page has, and it now sits beside the name.
 *
 * It keeps every one of its caveats in the move. The snapshot year sits on the
 * drawing itself, the caption says it is the nearest snapshot to the cited
 * peak and not the peak, and the full section — with the cited figure beside
 * the shape and the note that the two are never reconciled — is one link
 * away. A polity the datasets do not draw gets no map here and no placeholder:
 * the name takes the width.
 *
 * The span is drawn rather than printed. Where the sources give an endpoint as
 * a range, the range is drawn pale and the stretch both readings agree on is
 * solid, and both ranges are printed in full beside it.
 */
export function PolityHero({
  polity: p,
  region,
  threadSize,
  chapters,
  figures,
}: {
  polity: Polity
  region: Region | undefined
  /** How many polities stand in this polity's thread, when it has one. */
  threadSize: number
  chapters: Chapter[]
  figures: HeroFigure[]
}) {
  const map = getBasemap(p.id)
  const { start, end } = p.span
  const words = chapters.reduce((n, c) => n + c.body.split(/\s+/).filter(Boolean).length, 0)
  const minutes = Math.max(1, Math.round(words / 230))

  return (
    <HeroBand>
      <Shell className="pb-0">
        <Crumbs
          ground="dark"
          trail={[
            { href: '/polities/', label: 'Polities' },
            // The region crumb links to its own section on /polities/, which
            // already carries `id={r.id}` and a scroll-margin for exactly this.
            ...(region ? [{ href: `/polities/#${region.id}`, label: region.name }] : []),
            { label: p.name.latin },
          ]}
        />

        <div
          className={`mt-7 grid items-center gap-x-12 gap-y-8 ${
            map ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]' : ''
          }`}
        >
          <header className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              {region ? (
                <Link
                  href={`/polities/#${region.id}`}
                  className="tag border-dawat-edge bg-dawat-raise text-kaghaz transition-colors hover:border-kashi-soft"
                >
                  {region.name}
                </Link>
              ) : null}
              {threadSize ? (
                <Link
                  href={`/continuity/${p.region}/`}
                  className="tag border-dawat-edge bg-dawat-raise text-kaghaz transition-colors hover:border-kashi-soft"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-firuze-bright" />
                  In a thread of <span className="font-mono tabular-nums">{threadSize}</span>
                </Link>
              ) : null}
              {chapters.length ? (
                <a
                  href="#chapters-heading"
                  className="tag border-dawat-edge bg-dawat-raise text-kaghaz transition-colors hover:border-kashi-soft"
                >
                  <span className="font-mono tabular-nums">{chapters.length}</span>
                  {chapters.length === 1 ? 'chapter' : 'chapters'} ·{' '}
                  <span className="font-mono tabular-nums">{minutes}</span> min read
                </a>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <h1 className="display-cut font-display text-hero font-semibold text-kaghaz">
                {p.name.latin}
              </h1>
              {p.name.script ? (
                <p
                  lang={p.name.script_lang ?? scriptLang(p.name.script)}
                  className="text-[clamp(2rem,1.4rem+2.4vw,3.4rem)] leading-tight text-kaghaz/65"
                >
                  {p.name.script}
                </p>
              ) : null}
            </div>

            <p className="mt-5 max-w-[52ch] text-lede text-kaghaz/85">{p.identity}</p>

            <SpanRuler polity={p} />
          </header>

          {map ? (
            <figure className="overflow-hidden rounded-xl border border-dawat-edge bg-dawat-sink">
              <a href="#map-heading" className="relative block" aria-label="Go to the full map">
                <MapDrawing polity={p} map={map} idPrefix="hero" />
                {/* Never in a footnote: the year sits on the drawing. */}
                <span className="absolute left-3 top-3 rounded-md border border-dawat-edge bg-dawat-sink/80 px-2 py-1.5 font-mono text-[12px] leading-none text-kaghaz backdrop-blur-sm">
                  {map.dataset === 'cliopatria' && map.range
                    ? `${formatYear(map.range[0])}–${formatYear(map.range[1])}`
                    : `Snapshot ${formatYear(map.snapshotYear)}`}
                </span>
              </a>
              <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-dawat-edge bg-dawat-raise px-4 py-3 font-sans text-[13px] leading-snug text-debu-paper">
                <span>
                  <span className="text-kaghaz">
                    {map.dataset === 'cliopatria' &&
                    map.range &&
                    map.range[0] <= map.peakYear &&
                    map.peakYear <= map.range[1]
                      ? `One shape for these years, which contain the cited peak of ${formatYear(map.peakYear)}.`
                      : `Nearest ${map.dataset === 'cliopatria' ? 'range' : 'snapshot'} to the cited peak of ${formatYear(map.peakYear)}.`}
                  </span>{' '}
                  An illustration, not a measurement.
                </span>
                <a href="#map-heading" className="font-medium text-firuze-bright hover:text-kaghaz">
                  Full map <span aria-hidden="true">↓</span>
                </a>
              </figcaption>
            </figure>
          ) : null}
        </div>

        {/* The four a reader asks first, on the ground they are asked on. */}
        <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-t-xl border border-b-0 border-dawat-edge bg-dawat-raise/75 lg:grid-cols-4">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className={`min-w-0 px-4 pb-5 pt-4 sm:px-5 ${i % 2 ? 'border-s border-dawat-edge' : ''} ${
                i > 1 ? 'border-t border-dawat-edge lg:border-t-0' : ''
              } ${i === 2 ? 'lg:border-s' : ''}`}
            >
              <dt className="font-sans text-[12.5px] font-medium text-debu-paper">{f.label}</dt>
              <dd
                className={`mt-2 leading-tight [overflow-wrap:break-word] ${
                  f.gap
                    ? 'font-latin text-[17px] italic text-debu-paper sm:text-[19px]'
                    : 'font-mono text-[17px] tabular-nums text-kaghaz sm:text-[24px]'
                }`}
              >
                {f.value}
              </dd>
              {f.bar != null || f.gap ? (
                <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-dawat-lift">
                  {f.bar != null ? (
                    <div className="h-full rounded-full bg-kashi-soft" style={{ width: `${f.bar * 100}%` }} />
                  ) : null}
                </div>
              ) : null}
              {f.note ? (
                <p className="mt-2 font-sans text-[12px] leading-snug text-debu-paper">{f.note}</p>
              ) : null}
            </div>
          ))}
        </dl>
      </Shell>
    </HeroBand>
  )
}

/**
 * The span on a short axis of its own, padded a little either side so the
 * ends are visible as ends.
 */
function SpanRuler({ polity: p }: { polity: Polity }) {
  const { start, end } = p.span
  const length = end.max - start.min
  const pad = Math.max(10, Math.round(length * 0.08))
  const a0 = start.min - pad
  const a1 = end.max + pad
  const pct = (y: number) => ((y - a0) / (a1 - a0)) * 100
  const step = [10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => (a1 - a0) / s <= 6) ?? 1000
  const ticks: number[] = []
  for (let y = Math.ceil(a0 / step) * step; y <= a1; y += step) ticks.push(y)
  const core = start.max < end.min

  return (
    <figure className="mt-8 max-w-[34rem]">
      <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-1 font-sans text-[13px] text-debu-paper">
        <span>
          Began{' '}
          <span className="font-mono tabular-nums text-kaghaz">
            {formatRange(start.min, start.max)}
          </span>
        </span>
        <span>
          Ended{' '}
          <span className="font-mono tabular-nums text-kaghaz">{formatRange(end.min, end.max)}</span>
        </span>
      </figcaption>
      <div aria-hidden="true" className="relative mt-3 h-3">
        <span className="absolute inset-x-0 top-[5px] h-px bg-dawat-edge" />
        <span
          className={`absolute top-0 h-3 rounded-[2px] ${core ? 'bg-kashi-soft/40' : 'bg-kashi-soft'}`}
          style={{ left: `${pct(start.min)}%`, width: `${pct(end.max) - pct(start.min)}%` }}
        />
        {core ? (
          <span
            className="absolute top-0 h-3 rounded-[2px] bg-kashi-soft"
            style={{ left: `${pct(start.max)}%`, width: `${pct(end.min) - pct(start.max)}%` }}
          />
        ) : null}
      </div>
      <div aria-hidden="true" className="relative mt-2 h-4 font-mono text-[10.5px] tabular-nums text-debu-paper">
        {ticks.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pct(t)}%` }}>
            {t === 0 ? 'AD 1' : formatYear(t)}
          </span>
        ))}
      </div>
    </figure>
  )
}

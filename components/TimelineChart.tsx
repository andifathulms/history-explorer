'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatSpan, formatYear } from '@/lib/years'
import { PHASES } from '@/lib/types'

/**
 * The corpus as overlapping spans, rebuilt around three things it could not do.
 *
 * **The names are HTML now, not SVG text.** SVG text does not wrap and it does
 * not clip to a column — it simply runs on. Forty-five of the two hundred and
 * twelve names are wider than the hundred-and-fifty-unit label column, and
 * "Dai Viet under the Ly and the Tran" overran it by ninety-eight units,
 * straight into the plot. Nothing visibly collided only because the long names
 * happen to sit in the AD half of the axis, where the space to their left is
 * empty; one early polity with a long name and the chart would have drawn a
 * name across its own gridlines. It is the bug PolityRail was fixed for. As a
 * column of HTML beside a separately scrolling plot the names wrap, they stay
 * put while the plot scrolls sideways on a phone, and they are real links
 * rather than text inside an anchor.
 *
 * **The phase marks are off the time axis.** They were one dot per chapter,
 * spaced evenly along the span, at a position computed rather than cited —
 * because chapters carry no dates. The page said so honestly in a footnote and
 * the picture still read as a claim: this is a chart whose horizontal axis is
 * labelled in years, so a mark at a horizontal position on it is a date, and a
 * gold one is "the peak was here". Hard rule 9 refuses to join two cited
 * extents with a line for exactly this reason — a picture that reads as a
 * measurement is held to the standard of one, and an interpolation is harder
 * to notice in pixels than in YAML. That was the same act, 1,537 times. The
 * six-cell spine says which phases a polity has without saying when they were,
 * which is all the old dots honestly said.
 *
 * **What is left on the axis is cited.** Sixty records date their peak extent
 * to a year — the `at` on `reach_km2`, with a source behind it. Those get a
 * mark. The corpus carries no turning points at all yet; when it does, they
 * belong here too, and for the same reason: they have years somebody published.
 *
 * The two controls do different things on purpose. The filter hides, because a
 * shorter chart on an unchanged axis is easier to read and every bar keeps its
 * true position. The year cursor dims, because the question it answers is who
 * was standing at that moment and who was not, and hiding the ones who were
 * not would delete the comparison being asked for.
 */

export interface TimelineRow {
  id: string
  name: string
  regionName: string
  startMin: number
  startMax: number
  endMin: number
  endMax: number
  hasPage: boolean
  /** Which arc phases have at least one chapter. Order is not significant. */
  phases: string[]
  /** The year a source dates the peak extent to, where one does. */
  peakYear: number | null
}

/** Fold case, diacritics and the punctuation names disagree about. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’ʻʼ-]/g, '')
}

const ROW = 46
/** Rows between repeats of the scale. */
const BAND = 14
const W = 900
const PAD = 16

export function TimelineChart({
  rows,
  first,
  last,
  ticks,
}: {
  rows: TimelineRow[]
  first: number
  last: number
  /** Tick years, chosen at build time by the same helper the thread uses. */
  ticks: number[]
}) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState<number | null>(null)
  // 212 rows re-render on every keystroke; deferring keeps the field itself
  // responsive while the chart catches up.
  const q = fold(useDeferredValue(query).trim())

  const shown = useMemo(
    () => (q === '' ? rows : rows.filter((r) => fold(`${r.name} ${r.regionName}`).includes(q))),
    [rows, q],
  )

  const standing = useMemo(
    () => (year == null ? 0 : shown.filter((r) => r.startMin <= year && r.endMax >= year).length),
    [shown, year],
  )

  const x = (y: number) => PAD + ((y - first) / (last - first)) * (W - PAD * 2)

  /** Which vertical slot a row sits in, counting the scale rows above it. */
  const slot = (i: number) => i + Math.floor(i / BAND) + 1
  const slots = shown.length + Math.ceil(shown.length / BAND)
  const H = Math.max(ROW * 2, slots * ROW + 12)

  const alive = (r: TimelineRow) => year == null || (r.startMin <= year && r.endMax >= year)

  return (
    <section aria-labelledby="chart-heading" className="mt-16">
      <h2 id="chart-heading" className="sr-only">
        Spans
      </h2>

      {/* ---- Controls -------------------------------------------------- */}
      <div className="border-t border-kashi/15 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="timeline-filter" className="kicker text-debu-ink">
              Filter the rows
            </label>
            <input
              id="timeline-filter"
              type="search"
              value={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="Sasanian, Java and Bali, Kush…"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setQuery('')
                  e.currentTarget.blur()
                }
              }}
              className="mt-3 w-full max-w-[22rem] border border-kashi/25 bg-kaghaz-raise px-3.5 py-2.5 text-[16px] text-kashi-deep placeholder:text-debu-ink/70 focus-visible:border-firuze-ink"
            />
            <p aria-live="polite" className="mt-2 font-mono text-micro uppercase text-debu-ink">
              {q === '' ? (
                <>Searches names and regions</>
              ) : (
                <span className="tabular-nums">
                  {shown.length} of {rows.length} rows
                </span>
              )}
            </p>
          </div>

          <div>
            <label htmlFor="timeline-year" className="kicker text-debu-ink">
              Stand at a year
            </label>
            <div className="mt-3 flex items-center gap-4">
              <input
                id="timeline-year"
                type="range"
                min={first}
                max={last}
                step={1}
                value={year ?? Math.round((first + last) / 2)}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full max-w-[18rem] accent-zarrin-ink"
              />
              {year != null ? (
                <button
                  type="button"
                  onClick={() => setYear(null)}
                  className="shrink-0 font-mono text-micro uppercase text-firuze-ink hover:text-kashi"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p aria-live="polite" className="mt-2 font-mono text-micro uppercase text-debu-ink">
              {year == null ? (
                <>Drag to see who was standing</>
              ) : (
                <>
                  <span className="tabular-nums text-zarrin-ink">{standing}</span> standing in{' '}
                  <span className="tabular-nums text-zarrin-ink">{formatYear(year)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Key ------------------------------------------------------- */}
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-kashi/15 pt-5 font-mono text-micro uppercase text-debu-ink">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-full bg-kashi/70" /> cited span
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-full bg-kashi/15" /> contested end
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-[3px] bg-zarrin-ink" /> cited peak extent
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex gap-px">
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={`inline-block h-2.5 w-1.5 ${i < 3 ? 'bg-kashi' : 'bg-kashi/20'}`}
              />
            ))}
          </span>
          phases written
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 max-w-measure text-body">
          No row here answers to that name. Try a shorter fragment, or the region
          it sat in.
        </p>
      ) : (
        <div className="mt-8 flex">
          {/* ---- Names: HTML, and outside the scroller ------------------ */}
          <div className="w-[9.5rem] shrink-0 sm:w-[15rem]">
            {Array.from({ length: Math.ceil(shown.length / BAND) }).map((_, band) => (
              <div key={band}>
                {/* Matches the scale row in the plot, so the two columns stay
                    in lockstep without either knowing the other's layout. */}
                <div style={{ height: ROW }} aria-hidden="true" />
                {shown.slice(band * BAND, band * BAND + BAND).map((r) => (
                  <div
                    key={r.id}
                    style={{ height: ROW }}
                    className={`flex flex-col justify-center pe-4 transition-opacity ${
                      alive(r) ? '' : 'opacity-35'
                    }`}
                  >
                    {r.hasPage ? (
                      <Link
                        href={`/polity/${r.id}/`}
                        className="link-underline self-start text-[13px] font-semibold leading-tight text-kashi-deep hover:text-firuze-ink"
                      >
                        {r.name}
                      </Link>
                    ) : (
                      <span className="text-[13px] leading-tight text-debu-ink">{r.name}</span>
                    )}
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[10px] tabular-nums text-debu-ink">
                        {formatSpan(r.startMin, r.endMax)}
                      </span>
                      {/* The spine: which phases are written, never when. */}
                      <span
                        className="hidden gap-px sm:inline-flex"
                        title={
                          r.phases.length
                            ? `Chapters at: ${r.phases.join(', ')}`
                            : 'No chapter carries an arc phase'
                        }
                      >
                        {PHASES.map((ph) => (
                          <span
                            key={ph}
                            className={`inline-block h-2 w-1.5 ${
                              r.phases.includes(ph) ? 'bg-kashi' : 'bg-kashi/15'
                            }`}
                          />
                        ))}
                        <span className="sr-only">
                          {r.phases.length
                            ? `chapters at ${r.phases.join(', ')}`
                            : 'no chapter carries an arc phase'}
                        </span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ---- Plot: scrolls sideways, names stay ---------------------- */}
          <div className="-me-5 min-w-0 flex-1 overflow-x-auto sm:-me-8">
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              className="min-w-[520px]"
              role="img"
              aria-label={`Spans of ${shown.length} polities from ${formatYear(
                first,
              )} to ${formatYear(last)}. The names and dates are listed beside the chart.`}
            >
              {ticks.map((t) => (
                <line
                  key={`g${t}`}
                  x1={x(t)}
                  x2={x(t)}
                  y1={ROW - 14}
                  y2={H - 6}
                  className="stroke-kashi/15"
                  strokeWidth={1}
                />
              ))}

              {/* The scale, once per band. It gets a row of its own rather than
                  borrowing from the gap: at eight pixels of clearance for
                  eleven-pixel text it was printing into the span label of the
                  row above, at every band. */}
              {Array.from({ length: Math.ceil(shown.length / BAND) }).map((_, band) => {
                const top = band * (BAND + 1) * ROW
                return (
                  <g key={`a${band}`}>
                    {band > 0 ? (
                      <line
                        x1={0}
                        x2={W}
                        y1={top + 6}
                        y2={top + 6}
                        className="stroke-kashi/20"
                        strokeWidth={1}
                      />
                    ) : null}
                    {ticks.map((t) => (
                      <text
                        key={t}
                        x={x(t)}
                        y={top + ROW - 18}
                        className="fill-debu-ink font-mono text-[11px] tabular-nums"
                        textAnchor="middle"
                      >
                        {formatYear(t)}
                      </text>
                    ))}
                  </g>
                )
              })}

              {shown.map((r, i) => {
                const cy = slot(i) * ROW + ROW / 2
                const on = alive(r)
                return (
                  <g key={r.id} opacity={on ? 1 : 0.28}>
                    <rect
                      x={x(r.startMin)}
                      y={cy - 5}
                      width={Math.max(2, x(r.endMax) - x(r.startMin))}
                      height={10}
                      rx={5}
                      className="fill-kashi/25"
                    />
                    <rect
                      x={x(r.startMax)}
                      y={cy - 5}
                      width={Math.max(2, x(r.endMin) - x(r.startMax))}
                      height={10}
                      rx={5}
                      className={r.hasPage ? 'fill-kashi/70' : 'fill-debu-ink/50'}
                    />
                    {/* The only mark on this axis that a source dates. */}
                    {r.peakYear != null ? (
                      <rect
                        x={x(r.peakYear) - 1.5}
                        y={cy - 8}
                        width={3}
                        height={16}
                        rx={1}
                        className="fill-zarrin-ink"
                      >
                        {/* One string, not two children. React accepts a
                            single text child on <title> and silently drops
                            anything else — which is why three SVG titles on
                            this site have been rendering empty. */}
                        <title>{`Peak extent cited at ${formatYear(r.peakYear)}`}</title>
                      </rect>
                    ) : null}
                  </g>
                )
              })}

              {/* The cursor, over everything. */}
              {year != null ? (
                <line
                  x1={x(year)}
                  x2={x(year)}
                  y1={ROW - 20}
                  y2={H - 6}
                  className="stroke-zarrin-ink"
                  strokeWidth={1.5}
                />
              ) : null}
            </svg>
          </div>
        </div>
      )}
    </section>
  )
}

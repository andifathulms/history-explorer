'use client'

import { useState } from 'react'
import type { Rating } from '@/lib/ratings'
import { INFLUENCE_KEYS, INFLUENCE_LABELS, formatPercentile, ordinal } from '@/lib/ratings'
import { NO_FIGURE, formatKm2, formatPopulation, type Gapped } from '@/lib/gaps'
import type { Scale } from '@/lib/ratings'

/**
 * Collapsed by default, at the foot of the page, on paper ground.
 *
 * The visual rule that matters: a missing axis is the axis name and "No cited
 * figure", with the bar area left visibly empty. Not grey-hatched, not an error
 * state, not apologetic. An empty bar next to three full ones is the honest
 * picture and it should look intentional, because which polities scholarship
 * has bothered to quantify is itself content.
 */

function Bar({ pct, gold = false }: { pct: Gapped<number>; gold?: boolean }) {
  return (
    <div className="h-[10px] w-full rounded-full bg-kashi/10">
      {pct.present ? (
        <div
          className={`h-[10px] rounded-full ${gold ? 'bg-zarrin' : 'bg-kashi'}`}
          style={{ width: `${Math.max(1.5, pct.value * 100)}%` }}
        />
      ) : null}
    </div>
  )
}

/** A range bar: longevity percentiles at both ends of a contested span. */
function RangeBar({ min, max }: { min: number; max: number }) {
  const left = Math.min(min, max) * 100
  const width = Math.abs(max - min) * 100
  return (
    <div className="relative h-[10px] w-full rounded-full bg-kashi/10">
      <div className="absolute h-[10px] rounded-full bg-kashi" style={{ width: `${left}%` }} />
      {width > 0.5 ? (
        <div
          className="absolute h-[10px] rounded-full bg-kashi/40"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      ) : null}
    </div>
  )
}

function AxisRow({
  label,
  figure,
  pct,
  children,
}: {
  label: string
  figure: React.ReactNode
  pct?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-kashi/15 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-kashi">
          {label}
        </h3>
        <p className="font-mono text-[15px] tabular-nums text-dawat/85">{figure}</p>
      </div>
      <div className="mt-2.5">{children}</div>
      {pct ? (
        <p className="mt-2 font-mono text-[11.5px] text-debu-ink">{pct}</p>
      ) : null}
    </div>
  )
}

export function RatingPanel({ rating, scale }: { rating: Rating; scale: Scale }) {
  const [open, setOpen] = useState(false)
  const r = rating

  const scaleNote =
    scale === 'era-normalised'
      ? 'Era-normalised: share of world land or world population at that date.'
      : 'Absolute figures.'

  return (
    <section aria-labelledby="rating-heading" className="mt-20">
      <h2 id="rating-heading" className="sr-only">
        Rating
      </h2>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="rating-body"
        className="group flex w-full items-baseline justify-between gap-4 border-t border-kashi/25 py-5 text-left"
      >
        <span className="kicker text-debu-ink transition-colors group-hover:text-firuze-ink">
          Rating
        </span>
        <span className="font-mono text-micro uppercase text-kashi">
          {r.totalProvenance}{' '}
          <span aria-hidden="true" className="ms-2 inline-block text-firuze-ink">
            {open ? '−' : '+'}
          </span>
        </span>
      </button>

      <div id="rating-body" hidden={!open}>
        <p className="max-w-measure text-[15px] leading-relaxed text-debu-ink">
          Four axes, all computed from cited numbers and never from editorial judgement.
          Percentiles are against the eight polities here plus a reference backdrop of
          fifty-one from world history. {scaleNote} A missing axis is excluded from the
          total rather than counted as zero.
        </p>

        <AxisRow
          label="Reach"
          figure={r.reach.raw.present ? formatKm2(r.reach.raw.value) : NO_FIGURE}
          pct={r.reach.pct.present ? `${formatPercentile(r.reach.pct)} percentile` : undefined}
        >
          <Bar pct={r.reach.pct} />
        </AxisRow>

        <AxisRow
          label="Longevity"
          figure={
            r.longevity.years.min === r.longevity.years.max
              ? `${r.longevity.years.min} year${r.longevity.years.min === 1 ? '' : 's'}`
              : `${r.longevity.years.min}–${r.longevity.years.max} years`
          }
          pct={
            !r.longevity.pct.min.present || !r.longevity.pct.max.present
              ? NO_FIGURE
              : Math.abs(r.longevity.pct.max.value - r.longevity.pct.min.value) < 0.005
                ? `${ordinal(Math.round(r.longevity.pct.min.value * 100))} percentile`
                : `${ordinal(Math.round(r.longevity.pct.min.value * 100))} to ${ordinal(
                    Math.round(r.longevity.pct.max.value * 100),
                  )} percentile — the sources disagree on the span, so the rank is a range too`
          }
        >
          {r.longevity.pct.min.present && r.longevity.pct.max.present ? (
            <RangeBar min={r.longevity.pct.min.value} max={r.longevity.pct.max.value} />
          ) : (
            <Bar pct={r.longevity.pct.min} />
          )}
        </AxisRow>

        <AxisRow
          label="Demographic weight"
          figure={
            r.demographic.raw.present ? formatPopulation(r.demographic.raw.value) : NO_FIGURE
          }
          pct={
            r.demographic.pct.present
              ? `${formatPercentile(r.demographic.pct)} percentile`
              : undefined
          }
        >
          <Bar pct={r.demographic.pct} />
        </AxisRow>

        {/* Influence is never one number. Three counts, shown separately, with no
            bar between them, because they are not one quantity. Only the reader's
            sliders on the rankings view may combine them. */}
        <div className="border-t border-kashi/15 py-4">
          <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-kashi">
            Influence
          </h3>
          <p className="mt-2 max-w-measure text-[15px] leading-relaxed text-debu-ink">
            Three separate counts. This site never publishes a single influence number of
            its own; the sliders on the rankings view fuse them only in your view.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {INFLUENCE_KEYS.map((k) => {
              const c = r.influence.counts[k]
              return (
                <div key={k}>
                  <p className="font-mono text-micro uppercase text-debu-ink">
                    {INFLUENCE_LABELS[k]}
                  </p>
                  <p
                    className={`mt-1 tabular-nums ${
                      c.count === null
                        ? 'text-[15px] italic text-debu-ink'
                        : 'font-mono text-[30px] text-kashi-deep'
                    }`}
                  >
                    {c.count === null ? NO_FIGURE : c.count}
                  </p>
                  {c.items.length ? (
                    <p className="mt-0.5 text-[14px] text-debu-ink">{c.items.join(' · ')}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-kashi/30 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-kashi">
              Weighted total
            </h3>
            <p className="font-mono text-[15px] tabular-nums text-kashi-deep">
              {r.total.present
                ? `${ordinal(Math.round(r.total.value * 100))} percentile`
                : NO_FIGURE}
            </p>
          </div>
          <div className="mt-2">
            <Bar pct={r.total} gold />
          </div>
          <p className="mt-2 max-w-measure text-[14px] leading-relaxed text-debu-ink">
            {r.totalProvenance}, renormalised across the axes that have figures. A polity
            with two documented axes is not penalised against one with four.
          </p>
        </div>
      </div>
    </section>
  )
}

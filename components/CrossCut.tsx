'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  MILITARY_BASES,
  REVENUE_BASES,
  SUCCESSION_RULES,
  LEGITIMATIONS,
  type Institutions,
} from '@/lib/types'

/**
 * The corpus cut across regions instead of along them.
 *
 * Regions are how this site browses, and they stay that way — this is an extra
 * lens over the same polities, not a replacement for the grouping. What it
 * buys: "everything that lived on trade tolls" puts Srivijaya, the Rustamids
 * and Mali on one line, and nothing else on the site can draw that line at all.
 *
 * The honesty problem is the whole design problem here. Institutional coding is
 * sparse — most polities are uncoded on most fields — and a filter over sparse
 * data invites exactly the wrong reading: a reader who selects `slave-soldier`
 * and gets four names will conclude those were the four, when the truth is that
 * those are the four somebody has read a source for. So every facet states its
 * own coverage before the reader picks anything, an uncoded polity is counted
 * and named rather than silently dropped, and the vocabulary is shown in full
 * with zero-carrier values visibly present rather than hidden.
 */

export interface CrossCutPolity {
  id: string
  latin: string
  regionName: string
  institutions: Institutions
}

type FieldKey = keyof Institutions

const FACETS: { key: FieldKey; label: string; vocab: readonly string[] }[] = [
  { key: 'military_basis', label: 'Army raised by', vocab: MILITARY_BASES },
  { key: 'revenue_basis', label: 'Revenue from', vocab: REVENUE_BASES },
  { key: 'succession_rule', label: 'Succession by', vocab: SUCCESSION_RULES },
  { key: 'legitimation', label: 'Right to rule from', vocab: LEGITIMATIONS },
]

export function CrossCut({ polities }: { polities: CrossCutPolity[] }) {
  const [selected, setSelected] = useState<{ field: FieldKey; value: string } | null>(null)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    const coded = new Map<FieldKey, number>()
    for (const f of FACETS) coded.set(f.key, 0)
    for (const p of polities) {
      for (const f of FACETS) {
        const c = p.institutions[f.key]
        if (!c) continue
        coded.set(f.key, (coded.get(f.key) ?? 0) + 1)
        for (const v of c.values) {
          const k = `${f.key}|${v}`
          counts.set(k, (counts.get(k) ?? 0) + 1)
        }
      }
    }
    return { counts, coded }
  }, [polities])

  const matches = useMemo(() => {
    if (!selected) return []
    return polities.filter((p) =>
      (p.institutions[selected.field]?.values as string[] | undefined)?.includes(selected.value),
    )
  }, [polities, selected])

  const codedForField = selected ? (stats.coded.get(selected.field) ?? 0) : 0

  return (
    <section aria-labelledby="crosscut-heading" className="mt-16 border-t border-kashi/15 pt-8">
      <h2 id="crosscut-heading" className="kicker text-debu-ink">
        Cut across the regions
      </h2>
      <p className="mt-3 max-w-measure text-[16px] leading-relaxed text-debu-ink">
        How a polity raised an army, paid for itself, chose a ruler and justified
        him — coded against closed vocabularies, from a source that addressed the
        question. Picking a value gathers every polity carrying it, from any
        region.
      </p>

      <div className="mt-8 space-y-7">
        {FACETS.map((f) => {
          const coded = stats.coded.get(f.key) ?? 0
          return (
            <div key={f.key}>
              <h3 className="flex flex-wrap items-baseline gap-x-3 font-mono text-[12.5px] uppercase tracking-[0.06em] text-kashi">
                {f.label}
                {/* Coverage stated before the reader picks anything, not after.
                    A facet covering 18 of 66 cannot support "these are the
                    ones", and saying so afterwards is saying so too late. */}
                <span className="font-normal normal-case tracking-normal text-debu-ink">
                  {coded} of {polities.length} polities coded
                </span>
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {f.vocab.map((v) => {
                  const n = stats.counts.get(`${f.key}|${v}`) ?? 0
                  const on = selected?.field === f.key && selected.value === v
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={n === 0}
                      aria-pressed={on}
                      onClick={() => setSelected(on ? null : { field: f.key, value: v })}
                      className={`rounded-full border px-3 py-1 font-mono text-micro uppercase transition-colors ${
                        on
                          ? 'border-kashi bg-kashi text-kaghaz'
                          : n === 0
                            ? 'cursor-not-allowed border-kashi/12 text-debu-ink/45'
                            : 'border-kashi/30 text-kashi hover:border-firuze-ink hover:text-firuze-ink'
                      }`}
                      title={
                        n === 0
                          ? 'In the vocabulary, carried by nothing coded so far'
                          : undefined
                      }
                    >
                      {v.replace(/-/g, ' ')}
                      <span className="ms-1.5 tabular-nums opacity-70">{n}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-9 border-t border-kashi/15 pt-6" aria-live="polite">
        {selected === null ? (
          <p className="max-w-measure text-[15px] leading-relaxed text-debu-ink">
            Nothing selected. Values greyed out are in the vocabulary and carried
            by nothing coded so far — which is a fact about the coding, not about
            history.
          </p>
        ) : (
          <>
            <p className="max-w-measure text-[16px] leading-relaxed">
              <span className="text-kashi-deep">
                {matches.length} {matches.length === 1 ? 'polity' : 'polities'} coded{' '}
                <span className="font-semibold">{selected.value.replace(/-/g, ' ')}</span>
              </span>{' '}
              <span className="text-debu-ink">
                — out of {codedForField} coded on this field at all, and{' '}
                {polities.length - codedForField} where no consulted source
                addressed it. Those are gaps, not evidence of absence: this list
                is what has been read, not what was the case.
              </span>
            </p>

            <ul className="mt-5 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((p) => (
                <li key={p.id} className="border-b border-kashi/10 py-2">
                  <Link
                    href={`/polity/${p.id}/`}
                    className="link-underline text-[16px] text-kashi hover:text-firuze-ink"
                  >
                    {p.latin}
                  </Link>
                  <span className="ms-2 font-mono text-micro uppercase text-debu-ink">
                    {p.regionName}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

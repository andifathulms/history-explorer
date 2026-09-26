'use client'

import { useEffect, useRef, useState } from 'react'
import { formatYear } from '@/lib/years'

/**
 * Find a polity, narrow the index, and choose how it is laid out.
 *
 * Search came first and stays the heart of it. There was no way to find a
 * polity by name anywhere on the site: a reader who wanted the Ghurids had to
 * already know which region they were filed under. It matches the Latin name,
 * the name in its own script and the region, folded for case, diacritics and
 * the apostrophes names disagree about.
 *
 * Era and ending chips narrow the same cards. Both read data every record
 * already carries — the span and `ended.type` — so no polity is dropped for
 * want of a field it could not have. A polity whose ending is uncited simply
 * does not answer to an ending chip; it is not counted as any of them.
 *
 * The density strip under the chips is the corpus counted in fifty-year bins,
 * polities alive in each. It is there so that choosing an era also shows how
 * much of the corpus sits in it: "500–1000" and "Before 1000 BC" are not the
 * same size of question. Columns, never a line, for the reason hard rule 9
 * gives — though these are counts rather than cited figures, a joined line
 * would still draw values between the bins that nobody counted.
 *
 * Everything filters the rendered cards rather than re-rendering them: every
 * name and date is already in the document, so this needs no index and no
 * second copy of the corpus in the bundle. Regions and shelves left with
 * nothing visible are hidden too, with their entries in both navs.
 */

/** Fold case, strip diacritics, and drop the punctuation names disagree about. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Ma'munid and Mamunid, Kanem-Bornu and Kanem Bornu: a reader should not
    // have to guess which apostrophe the record used.
    .replace(/['’ʻʼ-]/g, '')
}

/** Half-open [from, to). Open ends are the corpus's own edges. */
const ERAS: { id: string; label: string; from: number; to: number }[] = [
  { id: 'bronze', label: 'Before 1000 BC', from: -Infinity, to: -1000 },
  { id: 'iron', label: '1000 BC – AD 1', from: -1000, to: 0 },
  { id: 'first-half', label: '1–500', from: 0, to: 500 },
  { id: 'second-half', label: '500–1000', from: 500, to: 1000 },
  { id: 'medieval', label: '1000–1500', from: 1000, to: 1500 },
  { id: 'modern', label: 'After 1500', from: 1500, to: Infinity },
]

type View = 'cards' | 'list'

export function PolityBrowser({
  total,
  bins,
  binFrom,
  binSize,
  axis,
  endings,
}: {
  total: number
  /** Polities alive in each bin, from `binFrom` in steps of `binSize`. */
  bins: number[]
  binFrom: number
  binSize: number
  axis: [number, number]
  endings: { type: string; count: number }[]
}) {
  const [query, setQuery] = useState('')
  const [era, setEra] = useState<string | null>(null)
  const [ending, setEnding] = useState<string | null>(null)
  const [view, setView] = useState<View>('cards')
  const [shown, setShown] = useState(total)
  const input = useRef<HTMLInputElement>(null)

  // Arriving from the search button on another page: /polities/#find.
  useEffect(() => {
    if (window.location.hash === '#find') input.current?.focus({ preventScroll: true })
    try {
      const v = window.localStorage.getItem('he:polities-view')
      if (v === 'list' || v === 'cards') setView(v)
    } catch {
      // Storage can be blocked; the default view is fine.
    }
  }, [])

  // The view is a data attribute on the shelves, so the same markup reflows.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-shelf]').forEach((ul) => {
      ul.dataset.view = view
    })
    try {
      window.localStorage.setItem('he:polities-view', view)
    } catch {
      // As above.
    }
  }, [view])

  useEffect(() => {
    const q = fold(query.trim())
    const e = ERAS.find((x) => x.id === era)
    const filtering = q !== '' || e != null || ending != null
    const cards = document.querySelectorAll<HTMLElement>('[data-polity]')
    const visibleRegions = new Set<string>()
    const visiblePolities = new Set<string>()
    let count = 0

    cards.forEach((card) => {
      const start = Number(card.dataset.start)
      const end = Number(card.dataset.end)
      const hit =
        (q === '' || fold(card.dataset.name ?? '').includes(q)) &&
        (e == null || (start < e.to && end >= e.from)) &&
        (ending == null || card.dataset.ended === ending)
      card.hidden = !hit
      if (hit) {
        count += 1
        if (card.dataset.region) visibleRegions.add(card.dataset.region)
        if (card.dataset.polityId) visiblePolities.add(card.dataset.polityId)
      }
    })

    // A lane for a polity the filter hid would leave a bar with no card.
    document.querySelectorAll<HTMLElement>('[data-lane]').forEach((lane) => {
      const li = lane.closest('li')
      if (li) li.hidden = filtering && !visiblePolities.has(lane.dataset.lane ?? '')
    })

    document.querySelectorAll<HTMLElement>('[data-region-section]').forEach((sec) => {
      sec.hidden = filtering && !visibleRegions.has(sec.dataset.regionSection ?? '')
    })

    document.querySelectorAll<HTMLElement>('[data-group]').forEach((group) => {
      const live = group.querySelectorAll<HTMLElement>('[data-region-section]')
      group.hidden = filtering && Array.from(live).every((s) => s.hidden)
    })

    document.querySelectorAll<HTMLElement>('[data-nav-region]').forEach((row) => {
      const on = !filtering || visibleRegions.has(row.dataset.navRegion ?? '')
      const li = row.closest('li')
      if (li) li.hidden = !on
    })

    setShown(count)
  }, [query, era, ending])

  // A lane and its card light together, whichever the pointer is over.
  useEffect(() => {
    let lit: string | null = null
    const light = (id: string | null) => {
      if (id === lit) return
      if (lit) {
        document
          .querySelectorAll(`[data-lane="${lit}"], [data-polity-id="${lit}"] .pcard`)
          .forEach((n) => n.classList.remove('is-hot'))
      }
      lit = id
      if (id) {
        document
          .querySelectorAll(`[data-lane="${id}"], [data-polity-id="${id}"] .pcard`)
          .forEach((n) => n.classList.add('is-hot'))
      }
    }
    const over = (ev: Event) => {
      const t = ev.target as HTMLElement
      const lane = t.closest<HTMLElement>('[data-lane]')
      const card = t.closest<HTMLElement>('[data-polity-id]')
      light(lane?.dataset.lane ?? card?.dataset.polityId ?? null)
    }
    document.addEventListener('mouseover', over)
    document.addEventListener('focusin', over)
    return () => {
      document.removeEventListener('mouseover', over)
      document.removeEventListener('focusin', over)
    }
  }, [])

  const active = ERAS.find((x) => x.id === era)
  const max = Math.max(...bins)
  const filtering = query.trim() !== '' || era != null || ending != null
  const [a0, a1] = axis
  const axisLabels = [a0, -2000, -1000, 0, 1000, a1].filter((y, i, all) => y >= a0 && y <= a1 && all.indexOf(y) === i)

  return (
    <div id="find" className="scroll-mt-28">
      <div
        role="search"
        className="mt-8 flex items-center gap-3 rounded-xl bg-kaghaz-raise py-1.5 pe-2 ps-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] focus-within:ring-2 focus-within:ring-firuze-bright"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-kashi-soft">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="polity-filter" className="sr-only">
          Find a polity
        </label>
        <input
          ref={input}
          id="polity-filter"
          type="search"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder={`Search ${total} polities: Ghurid, Srivijaya, Aksum…`}
          onChange={(ev) => setQuery(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === 'Escape') {
              setQuery('')
              ev.currentTarget.blur()
            }
          }}
          // The field's own focus ring is the wrapper's; the outline would
          // draw a second box inside it.
          className="min-w-0 flex-1 bg-transparent py-3 font-latin text-[18px] text-ink outline-none placeholder:text-debu-ink/80 focus-visible:outline-none"
        />
        <kbd
          aria-hidden="true"
          className="hidden rounded border border-kashi/25 px-1.5 py-0.5 font-mono text-[11px] leading-none text-debu-ink sm:inline"
        >
          /
        </kbd>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div role="group" aria-label="Era" className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 font-sans text-[12.5px] text-debu-paper">Era</span>
          {ERAS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={era === x.id}
              onClick={() => setEra(era === x.id ? null : x.id)}
              className="chip chip-dark"
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="How it ended" className="flex flex-wrap items-center gap-1.5">
            <span className="me-1 font-sans text-[12.5px] text-debu-paper">Ended by</span>
            {endings.map((x) => (
              <button
                key={x.type}
                type="button"
                aria-pressed={ending === x.type}
                onClick={() => setEnding(ending === x.type ? null : x.type)}
                className="chip chip-dark"
              >
                {x.type}
                <span className="font-mono text-[11px] tabular-nums opacity-60">{x.count}</span>
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Layout"
            className="inline-flex rounded-lg border border-dawat-edge bg-dawat-raise p-[3px]"
          >
            {(['cards', 'list'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 font-sans text-[13px] font-medium leading-none transition-colors ${
                  view === v ? 'bg-dawat-lift text-kaghaz' : 'text-debu-paper hover:text-kaghaz'
                }`}
              >
                {v === 'cards' ? <CardsIcon /> : <ListIcon />}
                {v === 'cards' ? 'Cards' : 'List'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <figure className="mt-7">
        <svg
          viewBox={`0 0 ${bins.length} 60`}
          preserveAspectRatio="none"
          className="block h-14 w-full"
          role="img"
          aria-label={`Polities alive in each ${binSize}-year period, ${formatYear(a0)} to ${formatYear(a1)}, peaking at ${max}.`}
        >
          {bins.map((n, i) => {
            const y0 = binFrom + i * binSize
            const on = active ? y0 + binSize > active.from && y0 < active.to : false
            const h = Math.max(1.2, (n / max) * 58)
            return (
              <rect
                key={i}
                x={i + 0.12}
                y={60 - h}
                width={0.76}
                height={h}
                className={on ? 'fill-firuze-bright' : 'fill-debu-paper/40'}
              />
            )
          })}
        </svg>
        <figcaption className="relative mt-2 h-4 font-mono text-[10.5px] tabular-nums text-debu-paper">
          {axisLabels.map((y, i) => (
            <span
              key={y}
              className={`absolute top-0 ${i === 0 ? '' : i === axisLabels.length - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
              style={{ left: `${((y - a0) / (a1 - a0)) * 100}%` }}
            >
              {y === 0 ? 'AD 1' : formatYear(y)}
            </span>
          ))}
        </figcaption>
      </figure>

      <p aria-live="polite" className="mt-5 font-sans text-[13px] text-debu-paper">
        {filtering ? (
          <>
            <span className="font-mono tabular-nums text-kaghaz">{shown}</span> of{' '}
            <span className="font-mono tabular-nums">{total}</span> shown
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setEra(null)
                setEnding(null)
              }}
              className="ms-3 font-medium text-firuze-bright hover:text-kaghaz"
            >
              Clear
            </button>
          </>
        ) : (
          <>Search matches names in either script and region names.</>
        )}
      </p>

      {filtering && shown === 0 ? (
        <p className="mt-3 max-w-measure text-[15px] leading-relaxed text-debu-paper">
          No polity answers to that combination. Try a shorter fragment of the name,
          the region it sat in, or a wider era.
        </p>
      ) : null}
    </div>
  )
}

function CardsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <rect x="0" y="0" width="6" height="6" rx="1.5" />
      <rect x="8" y="0" width="6" height="6" rx="1.5" />
      <rect x="0" y="8" width="6" height="6" rx="1.5" />
      <rect x="8" y="8" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1" />
      <rect x="0" y="6" width="14" height="2" rx="1" />
      <rect x="0" y="11" width="14" height="2" rx="1" />
    </svg>
  )
}

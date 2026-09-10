'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Find a polity by name.
 *
 * There was no way to. Not on this page and not anywhere on the site: the only
 * routes into 212 records were thirty-five region anchors and the
 * institutional facets, so a reader who wanted the Ghurids had to already know
 * they are filed under the Iranian Intermezzo. The rankings page has inputs and
 * they are weight sliders; there was no text field on the site at all.
 *
 * It filters the rendered cards rather than re-rendering them from data. Every
 * name is already in the document, so this needs no index, no library and no
 * second copy of the corpus in the bundle — it reads `data-name` off the cards
 * the server drew and toggles `hidden`, which the base layer now settles with
 * an `!important` so a display utility beside it cannot win.
 *
 * Regions and shelves left with nothing visible are hidden too, along with
 * their entries in both navs. A filter that leaves thirty-five empty headings
 * standing has not filtered anything.
 *
 * It does nothing until it is typed in, so a reader who came to browse never
 * meets it.
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

export function PolityFilter({ total }: { total: number }) {
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(total)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = fold(query.trim())
    const cards = document.querySelectorAll<HTMLElement>('[data-polity]')
    const visibleRegions = new Set<string>()
    let count = 0

    cards.forEach((card) => {
      const hit = q === '' || fold(card.dataset.name ?? '').includes(q)
      card.hidden = !hit
      if (hit) {
        count += 1
        const region = card.dataset.region
        if (region) visibleRegions.add(region)
      }
    })

    document.querySelectorAll<HTMLElement>('[data-region-section]').forEach((sec) => {
      sec.hidden = q !== '' && !visibleRegions.has(sec.dataset.regionSection ?? '')
    })

    document.querySelectorAll<HTMLElement>('[data-group]').forEach((group) => {
      const live = group.querySelectorAll<HTMLElement>('[data-region-section]')
      group.hidden = q !== '' && Array.from(live).every((s) => s.hidden)
    })

    // Both navs: the gutter on wide screens, the shelf grid below it.
    document.querySelectorAll<HTMLElement>('[data-nav-region]').forEach((row) => {
      const on = q === '' || visibleRegions.has(row.dataset.navRegion ?? '')
      const li = row.closest('li')
      if (li) li.hidden = !on
    })

    setShown(count)
  }, [query])

  return (
    <div className="mt-10 border-t border-kashi/15 pt-6">
      <label htmlFor="polity-filter" className="kicker text-debu-ink">
        Find a polity
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <input
          ref={input}
          id="polity-filter"
          type="search"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ghurid, Srivijaya, Aksum…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('')
              e.currentTarget.blur()
            }
          }}
          className="w-full max-w-[22rem] border border-kashi/25 bg-kaghaz-raise px-3.5 py-2.5 text-[16px] text-kashi-deep placeholder:text-debu-ink/70 focus-visible:border-firuze-ink"
        />
        <p aria-live="polite" className="font-mono text-micro uppercase text-debu-ink">
          {query.trim() === '' ? (
            <>Searches names and regions</>
          ) : (
            <span className="tabular-nums">
              {shown} of {total} shown
            </span>
          )}
        </p>
      </div>

      {query.trim() !== '' && shown === 0 ? (
        <p className="mt-4 max-w-measure text-[15px] leading-relaxed text-debu-ink">
          No polity here answers to that name. It may still have existed &mdash;
          try a shorter fragment, or the region it sat in.
        </p>
      ) : null}
    </div>
  )
}

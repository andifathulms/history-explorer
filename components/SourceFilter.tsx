'use client'

import { useEffect, useState } from 'react'

/**
 * Find a work in the bibliography.
 *
 * Five hundred and thirty-seven entries, ordered by how much rests on each,
 * which is the right default and the wrong thing for "what does this site say
 * about Bosworth". The ordering answers the page's own question; this answers
 * the reader's.
 *
 * It filters the rendered rows rather than re-rendering them, the same way the
 * polities index does: every author, title and id is already in the document,
 * so this needs no index, no library and no second copy of the bibliography in
 * the bundle. It scopes itself to the main list — the sole-source section
 * above it is short and is the page's argument rather than its index, and
 * hiding rows out of an argument would be a different thing entirely.
 */

/** Fold case, strip diacritics, drop the punctuation citations disagree about. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’ʻʼ-]/g, '')
}

export function SourceFilter({ total }: { total: number }) {
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(total)

  useEffect(() => {
    const q = fold(query.trim())
    let count = 0
    document.querySelectorAll<HTMLElement>('[data-source]').forEach((row) => {
      const hit = q === '' || fold(row.dataset.name ?? '').includes(q)
      row.hidden = !hit
      if (hit) count += 1
    })
    setShown(count)
  }, [query])

  return (
    <div className="mt-8 border-t border-kashi/15 pt-6">
      <label htmlFor="source-filter" className="kicker block text-debu-ink">
        Find a work
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <input
          id="source-filter"
          type="search"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder="Bosworth, Taagepera, Iranica…"
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
            <>Searches authors, titles and ids</>
          ) : (
            <span className="tabular-nums">
              {shown} of {total} works
            </span>
          )}
        </p>
      </div>

      {query.trim() !== '' && shown === 0 ? (
        <p className="mt-4 max-w-measure text-[15px] leading-relaxed text-debu-ink">
          Nothing in the bibliography answers to that. Try an author&rsquo;s surname, or
          a word from the title.
        </p>
      ) : null}
    </div>
  )
}

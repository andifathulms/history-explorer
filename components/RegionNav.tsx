'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The thirty-five regions, kept beside the reader.
 *
 * The index is 871,000 characters of rendered HTML — twice the largest polity
 * page — and every route into it was at the very top. Once a reader had
 * scrolled into Anatolia there was no way to reach Java except the scrollbar,
 * and nothing anywhere said which of thirty-five regions they were standing
 * in. A page whose whole job is to be an index has a better claim on a
 * persistent one than the polity page did.
 *
 * This replaces the shelf grid on wide screens rather than joining it: two
 * lists of the same thirty-five links, one of them permanently in view, is one
 * list too many. Below `lg` there is no gutter, so the grid stays and this
 * renders nothing.
 *
 * Threaded regions are marked. The region sections offer "Walk the thread"
 * where there is one, but nothing above them said which — so the single
 * feature that distinguishes one region from another was invisible from the
 * index of regions.
 */

export interface NavRegion {
  id: string
  name: string
  count: number
  thread: boolean
}

export interface NavGroup {
  id: string
  name: string
  regions: NavRegion[]
}

export function RegionNav({ groups }: { groups: NavGroup[] }) {
  const flat = groups.flatMap((g) => g.regions)
  const threaded = flat.filter((r) => r.thread).length
  const [active, setActive] = useState<string | null>(flat[0]?.id ?? null)
  // What the reader has chosen for each group, where they have chosen. A
  // group with no choice follows the scroll: open while it holds the region
  // being read, folded otherwise.
  const [chosen, setChosen] = useState<Map<string, boolean>>(() => new Map())
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!flat.length) return
    let frame = 0

    const resolve = () => {
      frame = 0
      // The same rule as the polity page's gutter: a heading a third of the
      // way down the viewport is the section you are reading, not the one
      // above it.
      const line = Math.max(140, window.innerHeight * 0.32)
      let current = flat[0].id
      for (const r of flat) {
        const el = document.getElementById(r.id)
        if (!el) continue
        // A filtered-out section has no boxes, and a rect of all zeroes reads
        // as "above the line" — which would mark whichever region the filter
        // hid last. Skip anything that is not on the page right now.
        if (!el.getClientRects().length) continue
        if (el.getBoundingClientRect().top <= line) current = r.id
      }
      const atFoot =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 4
      if (atFoot) current = flat[flat.length - 1].id
      setActive(current)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(resolve)
    }

    resolve()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // `flat` is rebuilt each render from a prop that never changes on this
    // page; keying the effect on its length keeps it from re-subscribing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.length])

  /**
   * Keep the marked region in view inside the column, and only inside it.
   *
   * Forty-one rows do not fit a viewport, so the mark walks off the end as the
   * reader scrolls. `scrollIntoView` would have been the short way and is the
   * wrong one — it is entitled to scroll every scrollable ancestor, the
   * document included, so following the reader down the page would have yanked
   * the page itself. This moves one element's `scrollTop` and nothing else.
   */
  useEffect(() => {
    const c = box.current
    if (!c || !active) return
    const a = c.querySelector<HTMLElement>(`[data-region="${active}"]`)
    if (!a) return
    const cr = c.getBoundingClientRect()
    const ar = a.getBoundingClientRect()
    if (ar.top < cr.top) c.scrollTop -= cr.top - ar.top + 8
    else if (ar.bottom > cr.bottom) c.scrollTop += ar.bottom - cr.bottom + 8
  }, [active])

  if (!flat.length) return null

  const activeGroup = groups.find((g) => g.regions.some((r) => r.id === active))?.id

  return (
    <div
      ref={box}
      className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-6 pe-1"
    >
      <nav aria-label="Regions" className="font-sans">
        <p className="label border-b border-kashi/15 pb-2.5 text-debu-ink">
          <span className="font-mono tabular-nums">{flat.length}</span> regions
        </p>

        {groups.map((g) => {
          // Fifty-seven rows do not fit a viewport, so groups fold. The one the
          // reader is standing in opens by itself, and any group — that one
          // included — stays however the reader last set it. It used to be
          // forced open, so the group you were reading could not be closed.
          const open = chosen.get(g.id) ?? g.id === activeGroup
          const count = g.regions.reduce((n, r) => n + r.count, 0)
          return (
            <div key={g.id} className="border-b border-kashi/10 py-1.5">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`rnav-${g.id}`}
                onClick={() =>
                  setChosen((prev) => new Map(prev).set(g.id, !open))
                }
                className="flex w-full items-center justify-between gap-3 rounded-md py-1.5 text-left text-[13px] font-semibold leading-snug text-kashi-deep"
              >
                <span className="min-w-0">{g.name}</span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-normal tabular-nums text-debu-ink">
                  {count}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className={`transition-transform ${open ? 'rotate-90' : ''}`}
                  >
                    <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </button>
              <ul id={`rnav-${g.id}`} hidden={!open} className="mb-1.5 mt-0.5">
                {g.regions.map((r) => {
                  const here = r.id === active
                  return (
                    <li key={r.id}>
                      <a
                        href={`#${r.id}`}
                        data-region={r.id}
                        data-nav-region={r.id}
                        aria-current={here ? 'true' : undefined}
                        className={`flex items-baseline gap-2 rounded-md px-2.5 py-[6px] text-[13.5px] leading-snug transition-colors ${
                          here
                            ? 'bg-kaghaz-raise font-medium text-kashi-deep shadow-paper'
                            : 'text-debu-ink hover:bg-kaghaz-raise/70 hover:text-kashi-deep'
                        }`}
                      >
                        <span className="min-w-0">{r.name}</span>
                        {r.thread ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="ms-auto h-1.5 w-1.5 shrink-0 self-center rounded-full bg-firuze"
                            />
                            <span className="sr-only"> — carries a thread</span>
                          </>
                        ) : null}
                        <span
                          className={`font-mono text-[11px] font-normal tabular-nums ${
                            r.thread ? '' : 'ms-auto'
                          } shrink-0 text-debu-ink`}
                        >
                          {String(r.count).padStart(2, '0')}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}

        {/* What the mark means, in text. A glyph a reader cannot ask about is
            decoration, so the dot is explained here rather than in a title. */}
        <p className="mt-4 flex items-baseline gap-2 text-[12.5px] leading-snug text-debu-ink">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-firuze" />
          <span>
            Marks the {threaded} regions where sourced edges join two polities, and a
            thread can be walked.
          </span>
        </p>
      </nav>
    </div>
  )
}

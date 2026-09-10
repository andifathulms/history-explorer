'use client'

import { useEffect, useState } from 'react'

/**
 * Where you are in a long polity page, and what else is on it.
 *
 * The gutter existed before this and was empty on most pages: the thread rail
 * rendered only for a polity standing in a thread, so the page's whole width
 * changed between polities on a property the reader cannot see, and prose
 * capped at 68ch left two to five hundred pixels of nothing beside every
 * paragraph. Meanwhile a nine-section page with a five-thousand-word essay in
 * the middle of it had no way to move around except the scrollbar.
 *
 * So the gutter is permanent now and this is what stands in it, with the rail
 * as a module underneath where there is one. It is furniture, not content: it
 * asserts nothing about the past, it is one column of section names, and it
 * disappears entirely below `lg` where there is no gutter to stand in.
 *
 * The current section is resolved from scroll position rather than from
 * IntersectionObserver. A polity page has sections of wildly different heights
 * — Facts is fifteen rows, Chapters is thirteen chapters — and an observer
 * keyed on visibility makes the tall one win for minutes at a time while the
 * reader is plainly inside a short one. Asking which heading was passed most
 * recently is the question a reader is actually asking.
 */

export interface NavSection {
  /** The `id` on the section's own heading, which is the anchor target. */
  id: string
  label: string
}

export function PageNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null)

  useEffect(() => {
    if (!sections.length) return

    let frame = 0

    const resolve = () => {
      frame = 0
      // Where a heading counts as passed.
      //
      // A fixed 120px was too tight against the sticky nav. A section head
      // sitting 137px down the viewport is plainly the section you are
      // reading — its rule is at the top of the screen and its rows fill the
      // rest — but the mark still read the one above it, so the gutter named
      // Facts while the screen showed Institutions.
      //
      // A share of the viewport puts the line where the eye is instead. The
      // floor keeps it clear of the nav on a short window, and a clicked link
      // still lands its own section: `scroll-padding-top` puts the heading at
      // 88px, which is above the line at any height.
      const line = Math.max(140, window.innerHeight * 0.32)
      let current = sections[0].id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = s.id
      }
      // At the very foot of the page the last section may never reach the line
      // — a short final section under a long one cannot scroll that far — so
      // hitting the bottom means you are in it.
      const atFoot =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 4
      if (atFoot) current = sections[sections.length - 1].id
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
  }, [sections])

  if (!sections.length) return null

  return (
    <nav aria-label="On this page">
      <p className="kicker border-b border-kashi/15 pb-2 text-debu-ink">On this page</p>
      <ol className="mt-1">
        {sections.map((s) => {
          const here = s.id === active
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={here ? 'true' : undefined}
                className={`block border-s-2 py-[5px] ps-3 font-mono text-[11.5px] uppercase leading-snug tracking-[0.05em] transition-colors ${
                  here
                    ? 'border-firuze-ink text-firuze-ink'
                    : 'border-kashi/15 text-debu-ink hover:border-kashi/40 hover:text-kashi'
                }`}
              >
                {s.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

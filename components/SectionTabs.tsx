'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { NavSection } from '@/components/PageNav'

/**
 * A polity page's sections, as a sticky bar under the hero.
 *
 * This was a column of uppercase section names in the gutter. The gutter is
 * the thread's place — DESIGN.md sets the reading column against the rail —
 * and the list stood in it on every page, so a polity with no thread had a
 * gutter holding nothing but furniture, and a polity with one had the rail
 * pushed half a screen down under it. Across the top it serves every width:
 * on a phone it is the same row, swiped, where the gutter version did not
 * exist at all and the page had a folded list instead.
 *
 * The current section is resolved from scroll position rather than from
 * IntersectionObserver. A polity page has sections of wildly different heights
 * — Facts is a handful of panels, Chapters is thirteen chapters — and an
 * observer keyed on visibility makes the tall one win for minutes at a time
 * while the reader is plainly inside a short one. Asking which heading was
 * passed most recently is the question a reader is actually asking.
 *
 * The hairline along the bottom is how far down the page the reader is. It is
 * a position, not a measurement of anything, and it moves only when they do.
 */
export function SectionTabs({
  sections,
  next,
}: {
  sections: (NavSection & { count?: number })[]
  /** The next polity on the shelf, offered at the end of the bar. */
  next?: { href: string; label: string }
}) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!sections.length) return
    let frame = 0

    const resolve = () => {
      frame = 0
      // Below the nav and this bar, with room for the heading to be read.
      const line = Math.max(170, window.innerHeight * 0.32)
      let current = sections[0].id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = s.id
      }
      const max = document.body.scrollHeight - window.innerHeight
      // At the very foot a short last section may never reach the line.
      if (window.scrollY >= max - 4) current = sections[sections.length - 1].id
      setActive(current)
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
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

  // Keep the current tab in view inside the bar on a narrow screen, moving the
  // bar's own scroll and nothing else — scrollIntoView would move the page.
  useEffect(() => {
    const bar = document.getElementById('section-tabs')
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (!bar || !tab) return
    const b = bar.getBoundingClientRect()
    const t = tab.getBoundingClientRect()
    if (t.left < b.left + 16) bar.scrollLeft -= b.left + 16 - t.left
    else if (t.right > b.right - 16) bar.scrollLeft += t.right - (b.right - 16)
  }, [active])

  if (!sections.length) return null

  return (
    <div className="section-tabs sticky top-16 z-30 border-b border-kashi/20 bg-kaghaz-raise/95 backdrop-blur-md">
      <nav aria-label="On this page" className="relative mx-auto max-w-shell">
        <div
          id="section-tabs"
          className="flex items-center gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((s) => {
            const here = s.id === active
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-tab={s.id}
                aria-current={here ? 'true' : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 pb-[13px] pt-[15px] font-sans text-[14px] font-medium leading-none transition-colors ${
                  here
                    ? 'border-firuze-ink text-kashi-deep'
                    : 'border-transparent text-debu-ink hover:text-kashi-deep'
                }`}
              >
                {s.label}
                {s.count != null ? (
                  <span className="rounded-full border border-kashi/15 bg-kaghaz px-1.5 py-[3px] font-mono text-[10.5px] tabular-nums leading-none text-debu-ink">
                    {s.count}
                  </span>
                ) : null}
              </a>
            )
          })}
          {next ? (
            <Link
              href={next.href}
              className="ms-auto hidden shrink-0 whitespace-nowrap ps-6 font-sans text-[13.5px] font-semibold text-firuze-ink hover:text-kashi-deep xl:block"
            >
              Next: {next.label} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </nav>
      <span
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-[2px] bg-firuze"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * What a term of art means, for a reader who can reach it.
 *
 * These definitions lived in `title` attributes. A `title` has a hover delay of
 * about a second, never appears on keyboard focus, and does not exist at all on
 * touch — so the entire coded vocabulary was invisible to every reader on a
 * phone. That is the wrong half of the audience to hide it from: the whole
 * reason the vocabulary is coded is that "land-grant" means iqta' here and
 * nothing about feudalism, and a reader who cannot see that is reading a word
 * they have every reason to misunderstand.
 *
 * So it is a button. It opens on click and on Enter, closes on Escape and on a
 * click elsewhere, and announces itself to a screen reader. The panel is
 * absolutely positioned but its container is not, so it never reserves space
 * and never pushes a row apart.
 *
 * Where a definition is short enough to simply print, print it — see
 * Institutions, where the values now carry their meaning on the page. This is
 * for the places where four visible definitions a row would bury the row.
 */
export function Hint({
  label,
  children,
}: {
  /** What the button is asking about, for the accessible name. */
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <span ref={box} className="relative inline-block align-baseline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        // 24px of target inside a text row, which is as much as a badge row can
        // give without the badges drifting apart. It is a supplementary
        // control, not a primary one.
        className={`ms-1 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border font-mono text-[10px] leading-none transition-colors ${
          open
            ? 'border-firuze-ink bg-firuze-ink text-kaghaz'
            : 'border-kashi/35 text-debu-ink hover:border-firuze-ink hover:text-firuze-ink'
        }`}
      >
        <span aria-hidden="true">?</span>
        <span className="sr-only">What {label} means</span>
      </button>

      {/* Rendered only when open, never `hidden` plus a display class.
          Tailwind's `block` is an author rule and the `[hidden] { display:
          none }` it is fighting comes from the user agent, so the class wins
          and every panel on the page stood open at once — three definitions
          lying across the prose of three turning points.

          The face is reset explicitly. This sits inside a mono uppercase
          badge and inherits all of it, so a definition came out as tracked-out
          monospace: readable, but not a sentence. */}
      {open ? (
        <span
          id={id}
          role="note"
          className="absolute start-0 top-[calc(100%+6px)] z-20 block w-[248px] max-w-[76vw] border border-kashi/25 bg-kaghaz-lift p-3 font-latin text-[14px] font-normal normal-case not-italic leading-relaxed tracking-normal text-dawat/85 shadow-paper"
        >
          {children}
        </span>
      ) : null}
    </span>
  )
}

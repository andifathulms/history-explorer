'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * Click a figure to see it larger than the reading column allows.
 *
 * The column a figure sits in tops out around 1000px, and a `wide` plan is
 * saved at up to 1800-2000px precisely because reading measure would make its
 * detail illegible — but the column still crops that gain short. Khufu's
 * mastabas, Petrie's numbered graves, the Palermo Stone's registers: all of
 * them have detail below the threshold the column can show, on a desktop
 * screen as much as a phone. This shows the same file already shipped for
 * the figure, just not width-limited to the column — it is not a second,
 * higher-resolution image, because none is stored.
 *
 * No animation. A fade would need to be disabled under prefers-reduced-motion
 * to meet the quality floor, and an instant show/hide already meets it
 * without the extra state to get wrong.
 */
export function Zoom({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogId = useId()

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    // Captured now, not read from the ref inside the cleanup below — by the
    // time that runs (on close, or on unmount) the ref may already point
    // somewhere else, and focus needs to go back to the button that was
    // actually clicked.
    const trigger = triggerRef.current

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)

    // The page behind a full-viewport overlay must not also scroll — a
    // reader on a long chapter who opens a figure near the bottom would
    // otherwise find the body creeping under their thumb while they look at
    // it.
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = prevOverflow
      trigger?.focus()
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        className="group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={`h-auto w-full border border-kashi/15 bg-kaghaz-lift transition-[filter] group-hover:brightness-95 ${className ?? ''}`}
        />
      </button>

      {open ? (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dawat-sink/94 p-4 sm:p-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full cursor-zoom-out object-contain"
            // Stopping propagation here, not on the backdrop, means every
            // inch of visible backdrop closes the overlay — including the
            // strip around a tall portrait image, which is most of the
            // click target for exactly the images tall enough to need this.
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-kaghaz/30 bg-dawat-raise font-mono text-[15px] text-kaghaz transition-colors hover:border-firuze-bright hover:text-firuze-bright sm:right-8 sm:top-8"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      ) : null}
    </>
  )
}

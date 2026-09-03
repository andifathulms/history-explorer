'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mark } from '@/components/Mark'

const links = [
  { href: '/polities/', label: 'Polities' },
  { href: '/rankings/', label: 'Rankings' },
  { href: '/continuity/', label: 'Continuity' },
  { href: '/timeline/', label: 'Timeline' },
  { href: '/endings/', label: 'Endings' },
  { href: '/sources/', label: 'Sources' },
  { href: '/about/', label: 'About' },
]

/**
 * `ground` is not decoration. Dark for navigating, light for reading — the
 * switch tells you which mode you are in without a label, so the nav has to
 * follow the page rather than impose one ground everywhere.
 *
 * The bar is sticky and translucent because the sections are meant to be moved
 * between mid-read, and a nav you have to scroll back up to find quietly
 * discourages that. Below `md` the seven links collapse to a disclosure rather
 * than wrapping to three lines.
 */
export function SiteNav({ ground, current }: { ground: 'dark' | 'paper'; current?: string }) {
  const dark = ground === 'dark'
  const [open, setOpen] = useState(false)

  // A menu that survives navigation would cover the page you just asked for.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const idle = dark ? 'text-debu-paper' : 'text-debu-ink'
  const live = dark ? 'text-firuze-bright' : 'text-firuze-ink'
  const hover = dark ? 'hover:text-kaghaz' : 'hover:text-kashi-deep'

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        dark
          ? 'border-dawat-edge bg-dawat/80 text-kaghaz'
          : 'border-kashi/12 bg-kaghaz/85 text-kashi-deep'
      }`}
    >
      <nav
        aria-label="Sections"
        className="mx-auto flex max-w-shell items-center gap-6 px-5 py-3.5 sm:px-8"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="History Explorer, home"
        >
          <Mark className="h-5 w-5" />
          <span className="font-display text-[17px] font-semibold tracking-tight">
            History Explorer
          </span>
        </Link>

        <ul className="ms-auto hidden items-center gap-x-6 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current === l.label ? 'page' : undefined}
                className={`font-mono text-[12.5px] uppercase tracking-[0.08em] transition-colors ${
                  current === l.label ? live : `${idle} ${hover}`
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-menu"
          className={`ms-auto rounded border px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] md:hidden ${
            dark ? 'border-dawat-edge text-debu-paper' : 'border-kashi/20 text-debu-ink'
          }`}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      <div
        id="nav-menu"
        hidden={!open}
        className={`border-t md:hidden ${dark ? 'border-dawat-edge bg-dawat' : 'border-kashi/12 bg-kaghaz'}`}
      >
        <ul className="mx-auto max-w-shell px-5 py-2 sm:px-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={current === l.label ? 'page' : undefined}
                className={`block border-b py-3 font-mono text-[13px] uppercase tracking-[0.08em] last:border-b-0 ${
                  dark ? 'border-dawat-edge' : 'border-kashi/10'
                } ${current === l.label ? live : idle}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

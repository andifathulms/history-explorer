'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
 *
 * The links are in the interface face, sentence case. They were uppercase
 * tracked mono, the same voice as every label, kicker and table head on the
 * site, and a navigation that looks like a caption does not look clickable.
 *
 * Search lives here, on every page, and answers to "/". There was one text
 * field on the site and it was halfway down the polities index; now the bar
 * sends a reader there from anywhere, focused and ready to type.
 */
export function SiteNav({ ground, current }: { ground: 'dark' | 'paper'; current?: string }) {
  const dark = ground === 'dark'
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // "/" from anywhere that is not already a text field. On the index the
  // field is on the page, so focus it; elsewhere go to it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      e.preventDefault()
      findPolity(router)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  // A menu that survives navigation would cover the page you just asked for.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const idle = dark ? 'text-debu-paper' : 'text-debu-ink'
  const hover = dark
    ? 'hover:bg-dawat-lift hover:text-kaghaz'
    : 'hover:bg-kaghaz-raise hover:text-kashi-deep'
  // The current section is a filled pill with a turquoise underline, rather
  // than a colour change alone.
  const live = dark
    ? 'bg-dawat-lift text-kaghaz shadow-[inset_0_-2px_0_theme(colors.firuze.bright)]'
    : 'bg-kaghaz-raise text-kashi-deep shadow-[inset_0_-2px_0_theme(colors.firuze-ink)]'

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

        <ul className="ms-auto hidden items-center gap-x-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current === l.label ? 'page' : undefined}
                className={`block rounded-md px-3 py-2 font-sans text-[14px] font-medium leading-none transition-colors ${
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
          onClick={() => findPolity(router)}
          aria-label="Find a polity"
          className={`ms-auto flex items-center gap-2.5 rounded-lg border px-2.5 py-2 font-sans text-[13px] leading-none transition-colors lg:ms-2 ${
            dark
              ? 'border-dawat-edge bg-dawat-raise text-debu-paper hover:border-kashi-soft hover:text-kaghaz'
              : 'border-kashi/20 bg-kaghaz-raise text-debu-ink hover:border-kashi/40 hover:text-kashi-deep'
          }`}
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search</span>
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-current px-1.5 py-0.5 font-mono text-[11px] leading-none opacity-70 sm:inline"
          >
            /
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-menu"
          className={`rounded-lg border px-3 py-2 font-sans text-[13px] font-medium leading-none lg:hidden ${
            dark ? 'border-dawat-edge text-debu-paper' : 'border-kashi/20 text-debu-ink'
          }`}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      <div
        id="nav-menu"
        hidden={!open}
        className={`border-t lg:hidden ${dark ? 'border-dawat-edge bg-dawat' : 'border-kashi/12 bg-kaghaz'}`}
      >
        <ul className="mx-auto max-w-shell px-5 py-2 sm:px-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={current === l.label ? 'page' : undefined}
                className={`block border-b py-3 font-sans text-[15px] font-medium last:border-b-0 ${
                  dark ? 'border-dawat-edge' : 'border-kashi/10'
                } ${
                  current === l.label ? (dark ? 'text-firuze-bright' : 'text-firuze-ink') : idle
                }`}
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

/**
 * Where "Search" goes. The field is the polities index's own filter; on that
 * page this focuses it, and from anywhere else it navigates there with a hash
 * the filter reads on mount to take focus itself.
 */
function findPolity(router: ReturnType<typeof useRouter>) {
  const field = document.getElementById('polity-filter') as HTMLInputElement | null
  if (field) {
    field.focus({ preventScroll: true })
    field.scrollIntoView({ block: 'center' })
    return
  }
  router.push('/polities/#find')
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

import Link from 'next/link'
import { Mark } from '@/components/Mark'

const columns = [
  {
    heading: 'Read',
    links: [
      { href: '/polities/', label: 'Polities' },
      { href: '/continuity/', label: 'Continuity' },
      { href: '/timeline/', label: 'Timeline' },
    ],
  },
  {
    heading: 'Measure',
    links: [
      { href: '/rankings/', label: 'Rankings' },
      { href: '/endings/', label: 'Endings' },
    ],
  },
  {
    heading: 'Method',
    links: [
      { href: '/sources/', label: 'Sources' },
      { href: '/about/', label: 'About' },
    ],
  },
]

/**
 * The footer restates the constraint rather than the branding, because the
 * constraint is the only thing a reader needs to carry off the site: a figure
 * here either has a work behind it or is drawn as absent.
 */
export function SiteFooter() {
  return (
    <footer className="ground-dark border-t border-dawat-edge">
      <div className="mx-auto max-w-shell px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="max-w-[38ch]">
            <Link href="/" className="flex items-center gap-2.5">
              <Mark className="h-5 w-5" />
              <span className="font-display text-[17px] font-semibold tracking-tight text-kaghaz">
                History Explorer
              </span>
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-debu-paper">
              Nothing on this site is estimated. Every figure carries the work it came
              from, and where no figure exists the gap is drawn rather than filled.
            </p>
          </div>

          {columns.map((c) => (
            <nav key={c.heading} aria-label={c.heading}>
              <h2 className="kicker text-debu-paper">{c.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-kaghaz/80 transition-colors hover:text-firuze-bright"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 border-t border-dawat-edge pt-6 font-mono text-micro uppercase text-debu-paper">
          Chapters drafted against named sources · coverage follows one person&rsquo;s
          curiosity and claims no completeness
        </p>
      </div>
    </footer>
  )
}

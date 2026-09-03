import Link from 'next/link'

const links = [
  { href: '/', label: 'Thread' },
  { href: '/timeline/', label: 'Timeline' },
  { href: '/comparison/', label: 'Comparison' },
  { href: '/about/', label: 'About' },
]

/**
 * `ground` is not decoration. Dark for navigating, light for reading — the
 * switch tells you which mode you are in without a label, so the nav has to
 * follow the page rather than impose one ground everywhere.
 */
export function SiteNav({ ground, current }: { ground: 'dark' | 'paper'; current?: string }) {
  const dark = ground === 'dark'
  return (
    <nav
      aria-label="Views"
      className={`flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b px-5 py-4 sm:px-8 ${
        dark ? 'border-kashi/40 text-kaghaz' : 'border-kashi/20 text-kashi'
      }`}
    >
      <Link href="/" className="text-[17px] font-semibold tracking-tight">
        Sambung
      </Link>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
        {links.slice(1).map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={current === l.label ? 'page' : undefined}
              className={
                current === l.label
                  ? dark
                    ? 'text-firuze'
                    : 'text-firuze-ink'
                  : dark
                    ? 'text-debu-paper hover:text-firuze'
                    : 'text-debu-ink hover:text-firuze-ink'
              }
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

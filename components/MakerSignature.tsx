/**
 * Who built this.
 *
 * It shares the footer's bottom bar with the standing note about sourcing
 * rather than opening a seam of its own: one divider across the whole foot of
 * the page, the note on the left and the credit on the right, stacking on a
 * phone. The two are kept apart because they are different kinds of statement
 * — one is what the site promises about its figures, the other is a personal
 * credit — and merging them would make the credit read as part of the terms.
 *
 * Everything personal is in MAKER below, so updating a link or a name is one
 * edit in one place.
 *
 * The voice is the bar's own: mono, micro, uppercase, dust on ink. Proper
 * nouns are set in that voice elsewhere on the site — every breadcrumb does
 * it — and the name carries only as much extra weight as it needs to read as
 * a link. `text-transform` is presentational, so a screen reader still gets
 * the name as written.
 */

const MAKER = {
  name: 'Andi Fathul Mukminin',
  /** The name in the credit line links here too; the globe repeats it. */
  portfolio: 'https://andifathulms.github.io/en/',
  links: [
    { label: 'Portfolio', href: 'https://andifathulms.github.io/en/', icon: 'globe' },
    { label: 'GitHub', href: 'https://github.com/andifathulms', icon: 'github' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/andifathulmukminin/',
      icon: 'linkedin',
    },
    { label: 'Instagram', href: 'https://www.instagram.com/andifathulms/', icon: 'instagram' },
  ],
} as const

type IconName = (typeof MAKER.links)[number]['icon']

/**
 * Eighteen pixels in a 24-unit box, coloured by `currentColor` so the link's
 * own hover state carries them. The globe is drawn in strokes and the three
 * marks are filled, which is how each is normally drawn.
 */
function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-[18px] w-[18px]',
    'aria-hidden': true,
    focusable: false,
  } as const

  if (name === 'globe') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="12" cy="12" r="9.25" />
        <ellipse cx="12" cy="12" rx="4" ry="9.25" />
        <path d="M2.9 9h18.2M2.9 15h18.2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'github') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
      </svg>
    )
  }

  if (name === 'linkedin') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    )
  }

  return (
    <svg {...common} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.413.56.218.96.478 1.38.898.42.42.68.82.898 1.38.164.423.36 1.058.413 2.228.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.218.56-.478.96-.898 1.38-.42.42-.82.68-1.38.898-.422.164-1.058.36-2.228.413-1.265.058-1.645.07-4.849.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.413a3.72 3.72 0 0 1-1.38-.898 3.72 3.72 0 0 1-.898-1.38c-.164-.422-.36-1.058-.413-2.228-.058-1.265-.07-1.645-.07-4.849s.012-3.584.07-4.85c.054-1.17.249-1.805.413-2.227.218-.56.478-.96.898-1.38.42-.42.82-.68 1.38-.898.422-.164 1.058-.36 2.228-.413 1.265-.058 1.645-.07 4.849-.07ZM12 0C8.741 0 8.332.014 7.052.072 5.775.13 4.904.333 4.14.63a5.88 5.88 0 0 0-2.125 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.904.131 5.775.072 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.059 1.277.261 2.148.558 2.912a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.764.297 1.635.499 2.912.558C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.277-.059 2.148-.261 2.912-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.297-.764.499-1.635.558-2.912.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.059-1.277-.261-2.148-.558-2.912a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63c-.764-.297-1.635-.499-2.912-.558C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  )
}

export function MakerSignature() {
  // Build time, on a statically exported site — which is the render, so the
  // year is the year the deploy was cut.
  const year = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <p className="font-mono text-micro uppercase text-debu-paper">
        Designed &amp; built by{' '}
        <a
          href={MAKER.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-kaghaz underline decoration-kaghaz/35 underline-offset-4 transition-colors hover:text-firuze-bright hover:decoration-firuze-bright"
        >
          {MAKER.name}
        </a>{' '}
        &middot; <span className="tabular-nums">&copy; {year}</span>
      </p>

      <ul className="-ms-2 flex items-center gap-0.5 sm:-me-2 sm:ms-0">
        {MAKER.links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={l.label}
              className="flex h-9 w-9 items-center justify-center rounded text-debu-paper transition-colors hover:bg-dawat-lift hover:text-firuze-bright"
            >
              <Icon name={l.icon} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

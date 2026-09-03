import { SiteNav } from '@/components/SiteNav'

/**
 * One page shell, so a section added later inherits the grounds, the measure
 * and the vertical rhythm instead of re-deciding them. Adding a section should
 * be a new route over the existing corpus, and that is only true if the frame
 * is not part of what has to be rewritten.
 */
export function Page({
  ground,
  current,
  wash = false,
  children,
}: {
  ground: 'dark' | 'paper'
  current?: string
  /** The one gradient on the site, behind the top of a dark landing view. */
  wash?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex min-h-screen flex-col ${ground === 'dark' ? 'ground-dark' : 'ground-paper'} ${
        wash ? 'wash-dark' : ''
      }`}
    >
      <SiteNav ground={ground} current={current} />
      {children}
    </div>
  )
}

/**
 * The reading column and the wide column share one gutter and one max width.
 *
 * `wide` is for the rankings table and nothing else so far. Seven columns of
 * figures beside a control panel do not fit the reading shell, and the symptom
 * was cited figures wrapping mid-number — "11,100,000" over "km²" — which is
 * the one thing a table of measurements must never do. Prose stays at the
 * measure regardless; this only moves the frame.
 */
export function Shell({
  children,
  wide = false,
  className = '',
}: {
  children: React.ReactNode
  wide?: boolean
  className?: string
}) {
  return (
    <div
      className={`mx-auto w-full px-5 sm:px-8 ${wide ? 'max-w-[1440px]' : 'max-w-shell'} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * A section header: mono kicker, display title, lede at reading width.
 *
 * The kicker is navigation furniture, not an eyebrow in prose — it says which
 * of seven sections you are standing in, which with this many routes is worth
 * a line. DESIGN.md's ban on eyebrows still holds inside chapters.
 */
export function PageHead({
  kicker,
  title,
  ground,
  children,
}: {
  kicker: string
  title: React.ReactNode
  ground: 'dark' | 'paper'
  children?: React.ReactNode
}) {
  const dark = ground === 'dark'
  return (
    <header className="pt-12 sm:pt-16">
      <p className={`kicker ${dark ? 'text-firuze-bright' : 'text-firuze-ink'}`}>{kicker}</p>
      <h1
        className={`mt-4 max-w-[20ch] font-display text-display font-semibold ${
          dark ? 'text-kaghaz' : 'text-kashi-deep'
        }`}
      >
        {title}
      </h1>
      {children ? (
        <div
          className={`mt-6 max-w-measure text-lede ${dark ? 'text-debu-paper' : 'text-dawat/78'}`}
        >
          {children}
        </div>
      ) : null}
    </header>
  )
}

/**
 * A run of counts under a page head. Figures in mono, labels above.
 *
 * `gap: true` renders the value as an absence rather than a figure — italic,
 * in dust, at reading size. A missing measure set in 22px mono next to a real
 * one reads as data, which is the one thing it must not do.
 */
export function StatRow({
  stats,
  ground,
}: {
  stats: { value: React.ReactNode; label: string; gap?: boolean }[]
  ground: 'dark' | 'paper'
}) {
  const dark = ground === 'dark'
  return (
    <dl
      className={`mt-10 grid grid-cols-2 gap-px border sm:grid-cols-4 ${
        dark ? 'border-dawat-edge bg-dawat-edge' : 'border-kashi/12 bg-kashi/12'
      }`}
    >
      {stats.map((s) => (
        <div key={s.label} className={`px-5 py-5 ${dark ? 'bg-dawat' : 'bg-kaghaz-raise'}`}>
          <dt className={`kicker ${dark ? 'text-debu-paper' : 'text-debu-ink'}`}>{s.label}</dt>
          <dd
            className={`mt-2 leading-tight [overflow-wrap:anywhere] ${
              s.gap
                ? 'text-[16px] italic text-debu-ink'
                : `font-mono text-[22px] tabular-nums ${dark ? 'text-kaghaz' : 'text-kashi-deep'}`
            }`}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * A section heading inside a page: mono kicker over a hairline. Used wherever
 * a page changes subject — succession, facts, the map — so the eye can find
 * the joins in a long polity page without the headings shouting.
 */
export function SectionHead({
  children,
  ground,
  id,
  aside,
}: {
  children: React.ReactNode
  ground: 'dark' | 'paper'
  id?: string
  aside?: React.ReactNode
}) {
  const dark = ground === 'dark'
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t pb-4 pt-4 ${
        dark ? 'border-dawat-edge' : 'border-kashi/15'
      }`}
    >
      <h2 id={id} className={`kicker ${dark ? 'text-debu-paper' : 'text-debu-ink'}`}>
        {children}
      </h2>
      {aside}
    </div>
  )
}

/** Where you are, above the title. Two levels only — this is not a deep site. */
export function Crumbs({
  trail,
  ground,
}: {
  trail: { href?: string; label: string }[]
  ground: 'dark' | 'paper'
}) {
  const dark = ground === 'dark'
  return (
    <nav aria-label="Breadcrumb" className="pt-10">
      <ol className="flex flex-wrap items-center gap-x-2 font-mono text-micro uppercase">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className={dark ? 'text-debu-paper' : 'text-debu-ink'}>
                /
              </span>
            ) : null}
            {t.href ? (
              <a
                href={t.href}
                className={`transition-colors ${
                  dark
                    ? 'text-debu-paper hover:text-firuze-bright'
                    : 'text-debu-ink hover:text-firuze-ink'
                }`}
              >
                {t.label}
              </a>
            ) : (
              <span className={dark ? 'text-kaghaz' : 'text-kashi-deep'}>{t.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

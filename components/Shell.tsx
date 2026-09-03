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

/** The reading column and the wide column share one gutter and one max width. */
export function Shell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-shell px-5 sm:px-8 ${className}`}>{children}</div>
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

/** A run of counts under a page head. Figures in mono, labels beneath. */
export function StatRow({
  stats,
  ground,
}: {
  stats: { value: React.ReactNode; label: string }[]
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
            className={`mt-2 font-mono text-[26px] tabular-nums ${
              dark ? 'text-kaghaz' : 'text-kashi-deep'
            }`}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

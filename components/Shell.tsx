import Link from 'next/link'
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
  nav,
  children,
}: {
  ground: 'dark' | 'paper'
  current?: string
  /** The one gradient on the site, behind the top of a dark landing view. */
  wash?: boolean
  /**
   * The nav's ground, where it differs from the page's. A paper page that
   * opens on a dark hero — the polities index, a polity — wants a dark bar
   * sitting on that hero rather than a pale strip across the top of it.
   */
  nav?: 'dark' | 'paper'
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex min-h-screen flex-col ${ground === 'dark' ? 'ground-dark' : 'ground-paper'} ${
        wash ? 'wash-dark' : ''
      }`}
    >
      <SiteNav ground={nav ?? ground} current={current} />
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
          className={`mt-6 max-w-measure text-lede ${dark ? 'text-kaghaz/85' : 'text-ink'}`}
        >
          {children}
        </div>
      ) : null}
    </header>
  )
}

/**
 * The top of a section page: the dark band with the page head in it.
 *
 * Every page opens the same way now — orient on dawat, read on paper — which
 * the polities index and the polity pages started. `after` is for what belongs
 * with the head rather than the body: a pair of method paragraphs, a row of
 * counts. A paragraph in the lede that wants to be quieter than the first one
 * uses `text-kaghaz/60`, the dark ground's secondary text.
 */
export function PageHero({
  kicker,
  title,
  children,
  after,
}: {
  kicker: string
  title: React.ReactNode
  children?: React.ReactNode
  after?: React.ReactNode
}) {
  return (
    <HeroBand>
      <Shell className="pb-12 sm:pb-14">
        <PageHead kicker={kicker} title={title} ground="dark">
          {children}
        </PageHead>
        {after}
      </Shell>
    </HeroBand>
  )
}

/**
 * A run of counts under a page head. Figures in mono, labels above.
 *
 * `gap: true` renders the value as an absence rather than a figure — italic,
 * in dust, at reading size. A missing measure set in 22px mono next to a real
 * one reads as data, which is the one thing it must not do.
 *
 * The figure size steps down below `sm`, and the break rule is `break-word`
 * rather than `anywhere`. At 375px each of two columns held about 127px of
 * content while "11,100,000 km²" at 22px mono wanted about 185px — and the
 * number *alone* wanted about 132px, so the browser broke inside the digits.
 * A table of measurements wrapping mid-number is the one thing it must never
 * do; it is the same failure that moved the rankings table into the wide
 * shell. At 17px the corpus's longest figure, 24,000,000 km², sets at about
 * 102px and clears the cell even at 320px.
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
      className={`mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4 ${
        dark ? 'border-dawat-edge bg-dawat-edge' : 'border-kashi/12 bg-kashi/12 shadow-paper'
      }`}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className={`px-4 py-4 sm:px-5 sm:py-5 ${dark ? 'bg-dawat' : 'bg-kaghaz-raise'}`}
        >
          <dt className={`label ${dark ? 'text-debu-paper' : 'text-debu-ink'}`}>{s.label}</dt>
          <dd
            className={`mt-2 leading-tight [overflow-wrap:break-word] ${
              s.gap
                ? 'text-[15px] italic text-debu-ink sm:text-[16px]'
                : `font-mono text-[17px] tabular-nums sm:text-[22px] ${
                    dark ? 'text-kaghaz' : 'text-kashi-deep'
                  }`
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
 * A section heading inside a page: a display title with an optional aside on
 * the right. No rule above it — the space before a section and the title's
 * own size mark the join, and a hairline over every heading on a ten-section
 * page read as ruled paper rather than as structure. Used wherever a page changes subject —
 * succession, facts, the map — so the eye can find the joins in a long page.
 *
 * It was a 12px uppercase mono kicker, which kept the headings from shouting
 * and also kept them from being found: on a polity page ten sections all
 * opened on the same small grey capitals as every label inside them. A title
 * in the display face at a modest size is still quiet, and it is a heading.
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
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2
        id={id}
        className={`scroll-mt-36 font-display text-[clamp(1.45rem,1.2rem+0.9vw,1.85rem)] font-semibold leading-tight ${
          dark ? 'text-kaghaz' : 'text-kashi-deep'
        }`}
      >
        {children}
      </h2>
      {aside ? (
        <div className={`font-sans text-[13px] ${dark ? 'text-debu-paper' : 'text-debu-ink'}`}>
          {aside}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Where you are, above the title. Two levels only — this is not a deep site.
 * Sentence case in the interface face: these are links, and uppercase mono
 * made them read as a caption.
 */
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
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[13px] leading-snug">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className={`opacity-60 ${dark ? 'text-debu-paper' : 'text-debu-ink'}`}>
                /
              </span>
            ) : null}
            {t.href ? (
              // next/link, not a bare anchor: a raw href skips basePath, and
              // this site is served from /history-explorer on Pages. Every
              // breadcrumb on every polity and thread page was a 404.
              <Link
                href={t.href}
                className={`transition-colors ${
                  dark
                    ? 'text-debu-paper hover:text-firuze-bright'
                    : 'text-debu-ink hover:text-firuze-ink'
                }`}
              >
                {t.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className={`font-medium ${dark ? 'text-kaghaz' : 'text-kashi-deep'}`}
              >
                {t.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * The dark band a reading page opens on.
 *
 * Dark for navigating, light for reading: the top of the polities index and of
 * a polity page is where a reader orients — what this is, when, where — and
 * the chapters and tables below are where they read. The band carries its own
 * wash rather than the `ground-dark` class, whose grain is fixed to the
 * viewport and would bleed onto the paper beneath.
 */
export function HeroBand({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-dawat text-kaghaz ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(110% 90% at 8% 0%, rgba(27,74,107,0.55), transparent 60%), radial-gradient(70% 60% at 100% 100%, rgba(62,156,156,0.08), transparent 60%)',
      }}
    >
      {children}
    </div>
  )
}

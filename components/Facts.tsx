import type { Polity, Ruler } from '@/lib/types'
import { formatYear, formatSpan } from '@/lib/years'
import { NO_FIGURE } from '@/lib/gaps'
import { citeShort } from '@/lib/content'
import { scriptLang } from '@/lib/scripts'
import { SectionHead } from '@/components/Shell'

/**
 * The facts a reader looks up, as panels rather than a fifteen-row table.
 *
 * PRD section 4, item 4. Three rulers only — founder, peak-era, last — because
 * a dynasty list is a different kind of object and belongs in a reference work.
 * Where a reign is cited it is drawn on the polity's own span, so the three
 * read as positions in a life rather than as three names: the Samanids' peak
 * ruler sits a quarter of the way in, their last one past the fall of Bukhara.
 * The peak reign carries the saffron that DESIGN.md keeps for peak-phase
 * markers, which is exactly what it is.
 *
 * A null ruler renders as "No cited figure" like any other gap. The Ghurid last
 * sultan is genuinely unresolved between sources, and printing the most-cited
 * guess would be exactly the invention the hard rules forbid.
 *
 * Capitals with dates become a strip on the same span, each seat as long as
 * the years it was held. A capital with no dates is listed, not drawn: a bar
 * would have to guess where it began.
 *
 * Script runs get their language from the characters — see lib/scripts.ts.
 */

function Gap() {
  return <span className="font-latin italic text-debu-ink">{NO_FIGURE}</span>
}

function Panel({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`card-paper min-w-0 px-5 py-4 ${className}`}>
      <dt className="label text-debu-ink">{label}</dt>
      <dd className="mt-2.5">{children}</dd>
    </div>
  )
}

const ROLES = [
  { key: 'founder' as const, label: 'Founder' },
  { key: 'peak' as const, label: 'Peak-era ruler' },
  { key: 'last' as const, label: 'Last ruler' },
]

function RulerName({ r, declared }: { r: Ruler; declared?: string | null }) {
  return (
    <>
      <span className="block font-display text-[17px] font-semibold leading-snug text-kashi-deep">
        {r.name}
      </span>
      {/* Inline inside a block, so a right-to-left name keeps the left edge
          the Latin name above it sets, rather than running to the far side. */}
      {r.script ? (
        <span className="block">
          <span lang={scriptLang(r.script, declared)} className="text-[16px] leading-snug text-kashi-soft">
            {r.script}
          </span>
        </span>
      ) : null}
    </>
  )
}

function Rulers({ polity: p }: { polity: Polity }) {
  const a0 = p.span.start.min
  const a1 = p.span.end.max
  const pct = (y: number) => Math.min(100, Math.max(0, ((y - a0) / (a1 - a0)) * 100))
  const drawn = ROLES.some((r) => p.rulers[r.key]?.reign)

  return (
    <div>
      <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
        {ROLES.map(({ key, label }) => {
          const r = p.rulers[key]
          return (
            <li key={key} className="min-w-0">
              <p
                className={`font-sans text-[12px] font-medium ${
                  key === 'peak' ? 'text-zarrin-ink' : 'text-debu-ink'
                }`}
              >
                {label}
                {r?.reign ? (
                  <span className="ms-1.5 font-mono text-[11.5px] font-normal tabular-nums">
                    r. {formatSpan(r.reign[0], r.reign[1])}
                  </span>
                ) : null}
              </p>
              <div className="mt-1">{r ? <RulerName r={r} declared={p.name.script_lang} /> : <Gap />}</div>
            </li>
          )
        })}
      </ol>

      {drawn ? (
        <figure className="mt-5">
          <div aria-hidden="true" className="relative h-3">
            <span className="absolute inset-x-0 top-[5px] h-[2px] rounded-full bg-kashi-wash" />
            {ROLES.map(({ key }) => {
              const reign = p.rulers[key]?.reign
              if (!reign) return null
              return (
                <span
                  key={key}
                  className={`absolute top-0 h-3 rounded-[3px] ${key === 'peak' ? 'bg-zarrin' : 'bg-kashi'}`}
                  style={{
                    left: `${pct(reign[0])}%`,
                    width: `${Math.max(0.8, pct(reign[1]) - pct(reign[0]))}%`,
                  }}
                />
              )
            })}
          </div>
          <figcaption className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-debu-ink">
            <span>{formatYear(a0)}</span>
            <span className="font-sans">Reigns on the polity&rsquo;s span</span>
            <span>{formatYear(a1)}</span>
          </figcaption>
        </figure>
      ) : null}
    </div>
  )
}

function Capitals({ polity: p }: { polity: Polity }) {
  if (!p.capitals.length) {
    // Not a <Gap />. `NO_FIGURE` says nobody has opened a source, and an
    // empty capitals list says the opposite — the same reading this site
    // gives an empty turning-point list and an edgeless polity. The Holy
    // Roman Empire is the record that forced the distinction: it had no
    // capital, and its emperors governed from wherever their own dynasty's
    // lands were.
    return <span className="text-debu-ink">No fixed seat recorded</span>
  }

  const a0 = p.span.start.min
  const a1 = p.span.end.max
  const pct = (y: number) => Math.min(100, Math.max(0, ((y - a0) / (a1 - a0)) * 100))
  // Only seats with a start can be placed; one with no end runs to the
  // next seat's start, or to the end of the span, which is what "from 892"
  // with nothing after it means on the record.
  const dated = p.capitals
    .filter((c) => c.from != null)
    .sort((x, y) => (x.from as number) - (y.from as number))

  return (
    <>
      <ul className="space-y-1">
        {p.capitals.map((c, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-[17px] font-semibold text-kashi-deep">{c.name}</span>
            {c.script ? (
              <span lang={scriptLang(c.script, p.name.script_lang)} className="text-[16px] text-kashi-soft">
                {c.script}
              </span>
            ) : null}
            {c.from != null ? (
              <span className="font-mono text-[12.5px] tabular-nums text-debu-ink">
                {c.to != null ? formatSpan(c.from, c.to) : `from ${formatYear(c.from)}`}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {dated.length ? (
        <div aria-hidden="true" className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-kashi-wash">
          {dated.map((c, i) => {
            const from = c.from as number
            const to = c.to ?? dated[i + 1]?.from ?? a1
            return (
              <span
                key={i}
                className={`absolute top-0 h-full border-e-2 border-kaghaz-raise ${
                  i % 2 ? 'bg-kashi' : 'bg-kashi-soft'
                }`}
                style={{ left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` }}
              />
            )
          })}
        </div>
      ) : null}
    </>
  )
}

export function Facts({ polity }: { polity: Polity }) {
  const p = polity
  const admin = p.scripts_and_languages.administration
  return (
    <section aria-labelledby="facts-heading" className="mt-12">
      <SectionHead ground="paper" id="facts-heading">
        Overview
      </SectionHead>
      <dl className="grid gap-3.5 md:grid-cols-6">
        <Panel label="Rulers" className="md:col-span-6">
          <Rulers polity={p} />
        </Panel>

        <Panel label="Capitals" className="md:col-span-4">
          <Capitals polity={p} />
        </Panel>

        <Panel label="How it ended" className="md:col-span-2">
          {p.ended ? (
            <>
              <span className="block font-display text-[21px] font-semibold capitalize leading-tight text-kashi-deep">
                {p.ended.type}
              </span>
              {p.ended.year ? (
                <span className="mt-1 block font-mono text-[13px] tabular-nums text-debu-ink">
                  {formatYear(p.ended.year)}
                </span>
              ) : null}
              <cite className="mt-2 block font-latin text-[14px] not-italic leading-snug text-debu-ink">
                {citeShort(p.ended.source)}
              </cite>
            </>
          ) : (
            <Gap />
          )}
        </Panel>

        <Panel label="Languages of administration" className="md:col-span-3">
          {admin.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {admin.map((l) => (
                <li
                  key={l}
                  className="rounded-md bg-kashi-wash px-2.5 py-1.5 font-sans text-[13.5px] font-medium leading-none text-kashi-deep"
                >
                  {l}
                </li>
              ))}
            </ul>
          ) : (
            <Gap />
          )}
          <p className="mt-3 font-sans text-[13.5px] text-debu-ink">
            Writing system:{' '}
            {p.scripts_and_languages.writing_system ? (
              <span className="text-ink">{p.scripts_and_languages.writing_system}</span>
            ) : (
              <Gap />
            )}
          </p>
        </Panel>

        <Panel label="Core region" className="md:col-span-3">
          {p.core_region ? (
            <span className="font-display text-[19px] font-semibold leading-snug text-kashi-deep">
              {p.core_region}
            </span>
          ) : (
            <Gap />
          )}
        </Panel>
      </dl>
    </section>
  )
}

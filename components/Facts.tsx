import type { Polity, Ruler } from '@/lib/types'
import { NO_FIGURE } from '@/lib/gaps'
import { citeShort } from '@/lib/content'

/**
 * PRD section 4, item 4. Three rulers only — founder, peak-era, last — because
 * a dynasty list is a different kind of object and belongs in a reference work.
 *
 * A null ruler renders as "No cited figure" like any other gap. The Ghurid last
 * sultan is genuinely unresolved between sources, and printing the most-cited
 * guess would be exactly the invention the hard rules forbid.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-kashi/15 py-3 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-[15px] text-debu">{label}</dt>
      <dd className="mt-1 sm:mt-0">{children}</dd>
    </div>
  )
}

function Gap() {
  return <span className="italic text-debu">{NO_FIGURE}</span>
}

function RulerLine({ r }: { r: Ruler | null }) {
  if (!r) return <Gap />
  return (
    <span>
      {r.name}
      {r.script ? (
        <span lang="fa" className="ms-2 text-[17px] text-kashi">
          {r.script}
        </span>
      ) : null}
      {r.reign ? (
        <span className="ms-2 tabular-nums text-debu">
          r. {r.reign[0]}–{r.reign[1]}
        </span>
      ) : null}
    </span>
  )
}

export function Facts({ polity }: { polity: Polity }) {
  const p = polity
  return (
    <section aria-labelledby="facts-heading" className="mt-14">
      <h2 id="facts-heading" className="text-[15px] uppercase tracking-widest text-debu">
        Facts
      </h2>
      <dl className="mt-4">
        <Row label="Core region">{p.core_region || <Gap />}</Row>

        <Row label="Capitals">
          {p.capitals.length ? (
            <ul>
              {p.capitals.map((c, i) => (
                <li key={i}>
                  {c.name}
                  {c.script ? (
                    <span lang="fa" className="ms-2 text-[17px] text-kashi">
                      {c.script}
                    </span>
                  ) : null}
                  {c.from ? (
                    <span className="ms-2 tabular-nums text-debu">
                      from {c.from}
                      {c.to ? ` to ${c.to}` : ''}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <Gap />
          )}
        </Row>

        <Row label="Founder">
          <RulerLine r={p.rulers.founder} />
        </Row>
        <Row label="Peak-era ruler">
          <RulerLine r={p.rulers.peak} />
        </Row>
        <Row label="Last ruler">
          <RulerLine r={p.rulers.last} />
        </Row>

        <Row label="Administration">
          {p.scripts_and_languages.administration.length ? (
            p.scripts_and_languages.administration.join(', ')
          ) : (
            <Gap />
          )}
        </Row>
        <Row label="Writing system">{p.scripts_and_languages.writing_system ?? <Gap />}</Row>

        <Row label="How it ended">
          {p.ended ? (
            <span>
              <span className="font-semibold text-kashi">{p.ended.type}</span>
              {p.ended.year ? <span className="ms-2 tabular-nums text-debu">{p.ended.year}</span> : null}
              <span className="mt-1 block text-[15px] text-debu">
                {citeShort(p.ended.source)}
              </span>
            </span>
          ) : (
            <Gap />
          )}
        </Row>
      </dl>
    </section>
  )
}

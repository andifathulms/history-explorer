import Link from 'next/link'
import type { Polity } from '@/lib/types'
import { formatSpan } from '@/lib/years'
import { formatKm2 } from '@/lib/gaps'
import { scriptLang } from '@/lib/scripts'
import { SpanStrip } from '@/components/SpanStrip'

/**
 * One polity on the index.
 *
 * Span first and in mono, because the years are what a reader compares down a
 * row of cards. The name in its own script sits opposite it, where it reads as
 * the card's image rather than as a second title. Then the name, the identity
 * clamped to three lines so every row keeps one baseline, a strip placing the
 * span on the corpus's full axis, and a footer of three things that tell two
 * similar polities apart: how much there is to read, how it ended, how far it
 * reached.
 *
 * A missing reach says "No cited figure" in the reading face. It is the one
 * gap on the card that draws a real distinction — 66 of 419 carry a cited
 * extent — so it stays, and it stays calm.
 *
 * The data attributes are what the browser on the page filters on. Everything
 * the filter needs is already in the markup, so the corpus does not ship a
 * second time as JSON.
 */
export function PolityCard({
  polity: p,
  regionName,
  chapters,
  axis,
  ticks,
}: {
  polity: Polity
  regionName: string
  chapters: number
  axis: [number, number]
  ticks: number[]
}) {
  const reach = p.measures.reach_km2?.value ?? null
  return (
    <li
      data-polity=""
      data-polity-id={p.id}
      data-region={p.region}
      data-start={p.span.start.min}
      data-end={p.span.end.max}
      data-ended={p.ended?.type ?? ''}
      // Everything the search matches on, folded at read time: the Latin name,
      // the name in its own script, and the region, so "Anatolia" finds the
      // polities filed under it.
      data-name={`${p.name.latin} ${p.name.script ?? ''} ${regionName}`}
    >
      <Link href={`/polity/${p.id}/`} className="pcard">
        <div className="pcard-top">
          <span className="pcard-span">{formatSpan(p.span.start.min, p.span.end.max)}</span>
          {p.name.script ? (
            <span
              lang={p.name.script_lang ?? scriptLang(p.name.script)}
              className="pcard-script"
            >
              {p.name.script}
            </span>
          ) : null}
        </div>
        {/* h4: the group is h2 and the region h3, and a screen reader walking
            the outline should get the same three tiers the eye does. */}
        <h4 className="pcard-name">{p.name.latin}</h4>
        <p className="pcard-identity">{p.identity}</p>
        <SpanStrip span={p.span} axis={axis} ticks={ticks} className="pcard-strip" />
        <dl className="pcard-foot">
          <div>
            <dt>Chapters</dt>
            <dd>
              <span className="fig">{chapters}</span> {chapters === 1 ? 'chapter' : 'chapters'}
            </dd>
          </div>
          <div>
            <dt>Ended by</dt>
            <dd>
              {p.ended ? (
                p.ended.type
              ) : (
                <span className="font-latin italic">No cited figure</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Reach</dt>
            <dd>
              {reach == null ? (
                <>
                  Reach <span className="font-latin italic">No cited figure</span>
                </>
              ) : (
                <span className="fig">{formatKm2(reach)}</span>
              )}
            </dd>
          </div>
        </dl>
      </Link>
    </li>
  )
}

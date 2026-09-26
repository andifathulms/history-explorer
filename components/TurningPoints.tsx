import type { Polity, TurningPoint } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { citeShort } from '@/lib/content'
import { SectionHead } from '@/components/Shell'
import { Hint } from '@/components/Hint'
import { sentenceCase } from '@/lib/text'

/**
 * Dated hinges in the polity's life.
 *
 * The section exists on the strength of one field. `changed` says what the
 * event altered, and it is printed larger than the event's own name, because a
 * reader scanning this should come away with consequences rather than a list of
 * battles. Without that emphasis the section becomes military trivia, which is
 * the failure mode the coding rules are written against.
 *
 * The empty state is one sentence, and it follows Succession's precedent
 * exactly. A polity with no cited hinge is not an incomplete polity: Srivijaya
 * held a strait by a standing arrangement rather than by decisive days, and
 * saying so plainly is truer than rendering an absence.
 */

const TYPE_HINT: Record<TurningPoint['type'], string> = {
  battle: 'A field engagement',
  siege: 'A siege, or the fall of a city',
  treaty: 'A negotiated settlement',
  revolt: 'An internal rising',
  'succession-crisis': 'A disputed succession',
  conversion: 'A change of official confession',
  'capital-move': 'The centre moved',
  catastrophe: 'Plague, famine or natural disaster',
  reform: 'A deliberate restructuring of the state',
}

export function TurningPoints({ polity }: { polity: Polity }) {
  const points = polity.turning_points

  if (!points.length) {
    return (
      <section aria-labelledby="turning-heading" className="mt-16">
        <SectionHead ground="paper" id="turning-heading">
          Turning points
        </SectionHead>
        <p className="max-w-measure text-body">
          No dated event is recorded as having changed this polity&rsquo;s course.
          Not every history has one: a hinge is something some polities turn on and
          others simply do not.
        </p>
      </section>
    )
  }

  const a0 = polity.span.start.min
  const a1 = polity.span.end.max
  const pct = (y: number) => Math.min(100, Math.max(0, ((y - a0) / (a1 - a0)) * 100))

  return (
    <section aria-labelledby="turning-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="turning-heading"
        aside={points.length === 1 ? '1 hinge' : `${points.length} hinges`}
      >
        Turning points
      </SectionHead>

      {/* Where the hinges fall in the polity's life, on its own span. A mark
          per event at its cited year; a contested one is drawn open. */}
      <figure aria-hidden="true" className="mb-5">
        <div className="relative h-4">
          <span className="absolute inset-x-0 top-[7px] h-[2px] rounded-full bg-kashi/30" />
          {points.map((t) => (
            <span
              key={`${t.year}-${t.name}`}
              className={`absolute top-[2px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-kashi ${
                t.contested ? 'bg-kaghaz' : 'bg-kashi'
              }`}
              style={{ left: `${pct(t.year)}%` }}
            />
          ))}
        </div>
        <figcaption className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-debu-ink">
          <span>{formatYear(a0)}</span>
          <span>{formatYear(a1)}</span>
        </figcaption>
      </figure>

      <ol className="grid gap-3">
        {points.map((t) => (
          <li
            key={`${t.year}-${t.name}`}
            className="card-paper grid gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]"
          >
            <span className="font-mono text-[24px] leading-none tabular-nums text-kashi-deep sm:pt-1">
              {formatYear(t.year)}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span className="font-display text-[19px] font-semibold leading-snug text-kashi-deep">
                  {t.name}
                </span>
                {/* The badge's meaning is reachable rather than hovered. A
                    `title` is a hover delay, no keyboard focus and nothing at
                    all on touch, which put a closed vocabulary out of reach of
                    every reader on a phone. */}
                <span className="inline-flex items-center gap-1 rounded-full bg-kashi-wash px-2.5 py-1 font-sans text-[12px] font-medium leading-none text-kashi">
                  {sentenceCase(t.type)}
                  <Hint label={t.type.replace(/-/g, ' ')}>{TYPE_HINT[t.type]}</Hint>
                </span>
                {t.contested ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-debu/60 px-2.5 py-[3px] font-sans text-[12px] font-medium leading-none text-debu-ink">
                    Contested
                    <Hint label="contested">
                      Scholarship disputes that this was a hinge, not that it happened.
                    </Hint>
                  </span>
                ) : null}
              </p>

              {/* The point of the entry, and so the largest thing in it. */}
              <p className="mt-2 max-w-measure text-[17px] leading-relaxed text-ink">{t.changed}</p>

              <cite className="mt-2 block font-latin text-[13.5px] italic text-debu-ink">
                {citeShort(t.source)}
              </cite>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

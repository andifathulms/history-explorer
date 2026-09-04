import type { Polity, TurningPoint } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { citeShort } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

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
          No dated event is recorded here as having changed this polity&rsquo;s
          trajectory. That is a statement about what this site has read and what
          the rules admit, not a gap: a hinge is a property some polities have,
          and an entry is only made where a source names a consequence rather
          than an event.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="turning-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="turning-heading"
        aside={
          <span className="font-mono text-micro uppercase text-debu-ink">
            {points.length === 1 ? '1 hinge' : `${points.length} hinges`}
          </span>
        }
      >
        Turning points
      </SectionHead>

      <ol className="max-w-[52rem]">
        {points.map((t) => (
          <li key={`${t.year}-${t.name}`} className="border-t border-kashi/15 py-4 first:border-t-0">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[14px] tabular-nums text-debu-ink">
                {formatYear(t.year)}
              </span>
              <span className="font-display text-[19px] font-semibold text-kashi-deep">
                {t.name}
              </span>
              <span
                className="rounded-full border border-kashi/20 px-2 py-0.5 font-mono text-micro uppercase text-debu-ink"
                title={TYPE_HINT[t.type]}
              >
                {t.type.replace(/-/g, ' ')}
              </span>
              {t.contested ? (
                <span
                  className="rounded-full border border-debu/50 px-2 py-0.5 font-mono text-micro uppercase text-debu-ink"
                  title="Scholarship disputes that this was a hinge, not that it happened."
                >
                  contested
                </span>
              ) : null}
            </p>

            {/* The point of the entry, and so the largest thing in it. */}
            <p className="mt-1.5 max-w-measure text-body text-dawat/88">{t.changed}</p>

            <p className="mt-1.5 text-[14px] text-debu-ink">
              <cite className="not-italic">{citeShort(t.source)}</cite>
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

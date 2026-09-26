import type { Polity, Institutions as InstitutionsData } from '@/lib/types'
import { NO_FIGURE } from '@/lib/gaps'
import { citeShort } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

/**
 * How the polity was put together — coding-rules.md part three.
 *
 * Four fields, each independently a gap. The gap is rendered the same way a
 * missing extent figure is, and for the same reason: these vocabularies are
 * small enough that any polity could be given four plausible values from
 * general knowledge in a minute, and the result would be complete, uniform and
 * entirely unsourced. A visible gap is what stops that being tempting.
 *
 * The values are printed as words rather than as tags a reader has to decode,
 * and the vocabulary's own definition is printed under them, because
 * "land-grant" means iqta' here and nothing about feudalism.
 *
 * The definitions used to be `title` attributes. A `title` has a hover delay,
 * never appears on keyboard focus and does not exist on touch, so the entire
 * vocabulary was invisible to every reader on a phone — and the vocabulary is
 * the section. These are one short line each and there are at most three of
 * them in a row, so they are simply printed. Hidden provenance is provenance
 * nobody reads, and the same is true of a definition.
 */

const FIELDS = [
  {
    key: 'military_basis' as const,
    label: 'Army raised by',
    hint: 'How the fighting force was recruited, not how it fought.',
  },
  {
    key: 'revenue_basis' as const,
    label: 'Revenue from',
    hint: 'What the state lived on. The values are unranked: the field cannot express which mattered most.',
  },
  {
    key: 'succession_rule' as const,
    label: 'Succession by',
    hint: 'The rule in force, not the outcome. A rule repeatedly violated is still the rule.',
  },
  {
    key: 'legitimation' as const,
    label: 'Right to rule from',
    hint: 'The ground publicly asserted — on coins, in the khutba, in titles.',
  },
]

const VALUE_HINT: Record<string, string> = {
  'tribal-levy': 'Contingents raised through kin or tribal structures the ruler did not create',
  'client-levy': 'Contingents owed by subordinate chiefs or vassals under obligation',
  conscript: 'Levied from a settled population by administrative obligation',
  'land-grant': "Service in return for assigned revenue — iqta', timar, jagir",
  'slave-soldier': 'Purchased unfree troops attached to the ruler personally',
  mercenary: 'Hired for pay, with no standing obligation either way',
  'standing-professional': 'Paid, permanent, recruited and commanded centrally',
  'land-tax': 'Tax on agricultural production and land',
  'poll-tax': 'A tax per head, often on non-adherents',
  'trade-toll': 'Customs, straits dues and caravan levies',
  tribute: 'Revenue received from another polity',
  plunder: 'Campaign proceeds treated as structural income',
  mining: 'Extraction of gold, silver or salt',
  monopoly: 'A crown monopoly on a commodity',
  primogeniture: 'The eldest son',
  tanistry: 'Lateral seniority within the ruling house',
  appanage: 'Patrimonial division among heirs',
  nomination: 'A designated heir',
  election: 'Chosen by a body entitled to choose',
  acclamation: 'Raised by army or assembly',
  factional: 'No rule: whichever faction could impose its man',
  descent: 'Descent from a house or lineage, publicly invoked',
  'divine-sanction': 'A mandate from above — heaven, or a claim to be mahdi or imam',
  conquest: 'The right of the sword, asserted as such',
  'caliphal-investiture': 'A grant or diploma from the caliph',
  titulature: "A predecessor's title taken as one's own ground",
}

/**
 * One question and its answer, as a row.
 *
 * These were four cards side by side, and a grid of cards is as tall as its
 * tallest: one coded field with two values and their definitions stretched
 * three uncoded neighbours into tall empty boxes, and a polity with nothing
 * coded got four. A row is as tall as its own answer, so an uncoded field
 * takes one line and still says so plainly, and the question sits in a
 * column the eye can run down.
 *
 * Values are chips in the vocabulary's own lower case. Title-casing them made
 * "Divine Sanction" read as a proper noun.
 */
function Row({
  label,
  hint,
  coded,
}: {
  label: string
  hint: string
  coded: InstitutionsData[keyof InstitutionsData]
}) {
  return (
    <div className="grid gap-x-8 gap-y-2 px-5 py-4 sm:px-6 md:grid-cols-[15rem_minmax(0,1fr)]">
      <dt>
        <span className="block font-sans text-[14.5px] font-semibold text-kashi-deep">{label}</span>
        <span className="mt-0.5 block font-sans text-[12.5px] leading-snug text-debu-ink">{hint}</span>
      </dt>
      <dd className="min-w-0">
        {coded ? (
          <>
            {/* Each value with what it means beside it, on the page rather
                than under a hover. */}
            <ul className="space-y-1.5">
              {coded.values.map((v) => (
                <li key={v} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="shrink-0 rounded-md bg-kashi-wash px-2.5 py-1.5 font-sans text-[14px] font-semibold leading-none text-kashi-deep">
                    {v.replace(/-/g, ' ')}
                  </span>
                  {VALUE_HINT[v] ? (
                    <span className="min-w-0 text-[15.5px] leading-snug text-ink">{VALUE_HINT[v]}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <cite className="mt-2 block font-sans text-[12.5px] not-italic text-debu-ink">
              {citeShort(coded.source)}
            </cite>
          </>
        ) : (
          <span className="font-latin text-[16px] italic text-debu-ink">{NO_FIGURE}</span>
        )}
      </dd>
    </div>
  )
}

export function Institutions({ polity }: { polity: Polity }) {
  const inst = polity.institutions
  const coded = FIELDS.filter((f) => inst[f.key] !== null).length

  return (
    <section aria-labelledby="institutions-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="institutions-heading"
        aside={
          <span>
            <span className="font-mono tabular-nums">{coded}</span> of{' '}
            <span className="font-mono tabular-nums">{FIELDS.length}</span> coded
          </span>
        }
      >
        How it was governed
      </SectionHead>

      <dl className="card-paper divide-y divide-kashi/10 overflow-hidden">
        {FIELDS.map((f) => (
          <Row key={f.key} label={f.label} hint={f.hint} coded={inst[f.key]} />
        ))}
      </dl>

      <p className="mt-4 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        Each line is drawn from a source that addresses the question directly. A
        line reads <span className="italic">{NO_FIGURE}</span> where no source
        consulted does — never because the answer seemed obvious.
      </p>
    </section>
  )
}

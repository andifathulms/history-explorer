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

function Card({
  label,
  hint,
  coded,
}: {
  label: string
  hint: string
  coded: InstitutionsData[keyof InstitutionsData]
}) {
  return (
    <div className="card-paper flex min-w-0 flex-col px-5 py-4">
      <dt>
        <span className="label block text-kashi">{label}</span>
        <span className="mt-1 block font-sans text-[12.5px] leading-snug text-debu-ink">{hint}</span>
      </dt>
      <dd className="mt-3 flex flex-1 flex-col">
        {coded ? (
          <>
            <span className="font-display text-[20px] font-semibold capitalize leading-snug text-kashi-deep">
              {coded.values.map((v) => v.replace(/-/g, ' ')).join(' · ')}
            </span>
            {/* What the words mean, on the page rather than under a hover.
                The term is repeated only where there is more than one, since
                a definition has to say which value it defines. */}
            <ul className="mt-1.5 space-y-0.5">
              {coded.values.map((v) =>
                VALUE_HINT[v] ? (
                  <li key={v} className="font-sans text-[13.5px] leading-snug text-debu-ink">
                    {coded.values.length > 1 ? (
                      <>
                        <span className="text-kashi">{v.replace(/-/g, ' ')}</span> &mdash;{' '}
                      </>
                    ) : null}
                    {VALUE_HINT[v]}
                  </li>
                ) : null,
              )}
            </ul>
            <cite className="mt-auto block pt-3 font-latin text-[13.5px] italic leading-snug text-debu-ink">
              {citeShort(coded.source)}
            </cite>
          </>
        ) : (
          <span className="font-latin text-[17px] italic text-debu-ink">{NO_FIGURE}</span>
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

      {/* Four cards, each a question and its answer. A missing answer keeps
          its card and says so at the same size as a present one: an empty
          card next to three full ones is the honest picture. */}
      <dl className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {FIELDS.map((f) => (
          <Card key={f.key} label={f.label} hint={f.hint} coded={inst[f.key]} />
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

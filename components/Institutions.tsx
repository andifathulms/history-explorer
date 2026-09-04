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
 * with the vocabulary's own definition on hover, because "land-grant" means
 * iqta' here and nothing about feudalism.
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
    <div className="border-t border-kashi/15 py-3.5 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt
        className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-debu-ink"
        title={hint}
      >
        {label}
      </dt>
      <dd className="mt-1 sm:mt-0">
        {coded ? (
          <>
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {coded.values.map((v, i) => (
                <span key={v} className="text-kashi" title={VALUE_HINT[v]}>
                  {v.replace(/-/g, ' ')}
                  {i < coded.values.length - 1 ? (
                    <span className="text-debu-ink"> and</span>
                  ) : null}
                </span>
              ))}
            </span>
            <span className="mt-1 block text-[14px] text-debu-ink">
              <cite className="not-italic">{citeShort(coded.source)}</cite>
            </span>
          </>
        ) : (
          <span className="italic text-debu-ink">{NO_FIGURE}</span>
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
          <span className="font-mono text-micro uppercase text-debu-ink">
            {coded} of {FIELDS.length} coded
          </span>
        }
      >
        How it was governed
      </SectionHead>

      <dl className="max-w-[62rem]">
        {FIELDS.map((f) => (
          <Row key={f.key} label={f.label} hint={f.hint} coded={inst[f.key]} />
        ))}
      </dl>

      <p className="mt-4 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        Coded against the closed vocabularies in the site&rsquo;s coding rules,
        from a source that addresses the question. A field reads{' '}
        <span className="italic">{NO_FIGURE}</span> where no consulted source
        does — never because the answer seemed obvious.
      </p>
    </section>
  )
}

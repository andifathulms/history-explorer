import type { Metadata } from 'next'
import Link from 'next/link'
import { sourceUsage, hasPage, displayName } from '@/lib/content'
import { Page, Shell, PageHead, StatRow } from '@/components/Shell'
import { Cite } from '@/components/Cite'

export const metadata: Metadata = {
  title: 'Sources',
  description:
    'Every work this site cites, what rests on it, and where the corpus leans hardest on a single book.',
}

function PolityList({ ids }: { ids: string[] }) {
  return (
    <>
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 ? ', ' : ''}
          {hasPage(id) ? (
            <Link
              href={`/polity/${id}/`}
              className="link-underline text-kashi hover:text-firuze-ink"
            >
              {displayName(id)}
            </Link>
          ) : (
            displayName(id)
          )}
        </span>
      ))}
    </>
  )
}

export default function Sources() {
  const uses = sourceUsage()
  const used = uses.filter((u) => u.claims > 0)
  // A dataset is consumed by the map layer through basemap-links.yaml rather
  // than by a `source:` field, so it correctly has no citations and is not a
  // leftover. Listing it beside genuine orphans would be a false accusation.
  const unused = uses.filter((u) => u.claims === 0 && u.source.kind !== 'dataset')
  const datasets = uses.filter((u) => u.claims === 0 && u.source.kind === 'dataset')
  const totalClaims = used.reduce((n, u) => n + u.claims, 0)
  const concentrated = used.filter((u) => u.soleSourceFor.length > 0)
  const max = Math.max(...used.map((u) => u.claims))

  return (
    <Page ground="paper" current="Sources">
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <PageHead kicker="Where the weight sits" title="Sources" ground="paper">
            <p>
          {used.length} works carrying {totalClaims.toLocaleString('en-GB')} citations. The
          build already refuses to ship a citation that does not resolve, so this page is
          not about whether the sourcing exists. It is about how it is distributed, which
              is the more useful question once a corpus is large.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-debu-ink">
              A polity whose every claim rests on one book is not better sourced than a
              polity with a visible gap. It is one disagreement away from being wrong
              throughout, and nothing on its own page shows that. This page shows it.
            </p>
          </PageHead>

          <StatRow
            ground="paper"
            stats={[
              { value: used.length, label: 'Works cited' },
              { value: totalClaims.toLocaleString('en-GB'), label: 'Citations' },
              { value: concentrated.length, label: 'Single-source polities' },
              { value: unused.length, label: 'Listed but uncited' },
            ]}
          />

        {concentrated.length ? (
          <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
            <h2 className="font-display text-title font-semibold text-kashi-deep">
              Single-source polities
            </h2>
            <p className="mt-4 text-body">
              Every citation on these pages resolves to one work. That is not a fault —
              for several of them one monograph is genuinely most of the modern
              scholarship — but it is a fact a reader should have before relying on the
              page.
            </p>
            <ul className="mt-5 space-y-3">
              {concentrated.map((u) => (
                <li key={u.source.id} className="border-t border-kashi/15 pt-3">
                  <p className="text-body">
                    <PolityList ids={u.soleSourceFor} />
                    {' — '}
                    <Cite source={u.source} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16 border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
            Every work, by how much rests on it
          </h2>
          <ul className="mt-8">
            {used.map((u) => (
              <li key={u.source.id} className="border-t border-kashi/12 py-5">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="text-[17px]">
                    <Cite source={u.source} />
                  </p>
                </div>
                {/* Length is a cited quantity here too: the bar is the claim count. */}
                <div className="mt-3 flex items-center gap-4">
                  <span
                    className="h-[7px] max-w-[540px] shrink-0 rounded-full bg-kashi/55"
                    style={{ width: `${Math.max(1, (u.claims / max) * 100)}%` }}
                  />
                  <span className="shrink-0 font-mono text-micro uppercase tabular-nums text-debu-ink">
                    {u.claims} {u.claims === 1 ? 'citation' : 'citations'}
                    {u.chapters ? ` · ${u.chapters} chapter${u.chapters === 1 ? '' : 's'}` : ''}
                  </span>
                </div>
                {u.polities.length ? (
                  <p className="mt-2 max-w-measure text-[15px] text-debu-ink">
                    <PolityList ids={u.polities} />
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] text-debu-ink">
                    Cited by edges or the reference set only.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {unused.length ? (
          <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
            <h2 className="font-display text-title font-semibold text-kashi-deep">
              Listed but uncited
            </h2>
            <p className="mt-4 text-body">
              These are in <code className="text-[15px]">sources.yaml</code> and no{' '}
              <code className="text-[15px]">source:</code> field resolves to them. That is
              worth showing rather than hiding: an unused entry is either a work someone
              meant to draft from and did not, or a leftover, and both are easier to fix
              when visible.
            </p>
            <ul className="mt-4 space-y-1 text-body">
              {unused.map((u) => (
                <li key={u.source.id}>
                  <Cite source={u.source} />
                  <span className="ms-2 font-mono text-micro text-debu-ink">{u.source.id}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {datasets.length ? (
          <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
            <h2 className="font-display text-title font-semibold text-kashi-deep">Datasets</h2>
            <p className="mt-4 text-body">
              Consumed by the map layer through{' '}
              <code className="text-[15px]">basemap-links.yaml</code> rather than by a{' '}
              <code className="text-[15px]">source:</code> field, so they carry no citation
              count. They are never a source for a measure — hard rule 5.
            </p>
            <ul className="mt-4 space-y-1 text-body">
              {datasets.map((u) => (
                <li key={u.source.id}>
                  <Cite source={u.source} />
                  {u.source.licence ? (
                    <span className="ms-2 text-[14px] text-debu-ink">{u.source.licence}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </Shell>
      </main>
    </Page>
  )
}

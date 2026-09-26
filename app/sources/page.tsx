import type { Metadata } from 'next'
import Link from 'next/link'
import { sourceUsage, hasPage, displayName, getPolity } from '@/lib/content'
import { formatSpan } from '@/lib/years'
import { Page, Shell, PageHero, StatRow } from '@/components/Shell'
import { Cite } from '@/components/Cite'
import { SourceFilter } from '@/components/SourceFilter'
import { PageNav, type NavSection } from '@/components/PageNav'

export const metadata: Metadata = {
  title: 'Sources',
  description:
    'Every work this site cites, what rests on it, and where the corpus leans hardest on a single book.',
}

function PolityList({ ids, spans = false }: { ids: string[]; spans?: boolean }) {
  return (
    <>
      {ids.map((id, i) => {
        // The sole-source list is the page's argument, so it carries the span:
        // a book holding a hundred-year emirate and a book holding a thousand
        // years of Byzantium are not the same weight of reliance.
        const p = spans ? getPolity(id) : undefined
        return (
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
            {p ? (
              <span className="ms-1.5 font-mono text-micro tabular-nums text-debu-ink">
                {formatSpan(p.span.start.min, p.span.end.max)}
              </span>
            ) : null}
          </span>
        )
      })}
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

  /**
   * The shape of the distribution, which the page argued about and never
   * stated. All four are derived from the counts already on the page.
   *
   * `reachable` is the one that is not about distribution at all: a `url` is
   * the only thing standing between a reader and the work a claim came from —
   * the "source" link on a chapter and the link in this list both render only
   * where one exists — and a page called Where the weight sits should say how
   * much of that weight can actually be opened.
   */
  const claimsDesc = used.map((u) => u.claims)
  const topTen = claimsDesc.slice(0, 10).reduce((n, c) => n + c, 0)
  const median = [...claimsDesc].sort((a, b) => a - b)[Math.floor(claimsDesc.length / 2)] ?? 0
  const once = used.filter((u) => u.claims === 1).length
  const reachable = uses.filter((u) => u.source.url).length

  // Built from the same conditions the sections render under, so the gutter
  // can never point at one that decided not to draw itself.
  const sections: NavSection[] = [
    ...(concentrated.length ? [{ id: 'sole-heading', label: 'Single-source' }] : []),
    { id: 'works-heading', label: 'Every work' },
    ...(unused.length ? [{ id: 'unused-heading', label: 'Listed but uncited' }] : []),
    ...(datasets.length ? [{ id: 'datasets-heading', label: 'Datasets' }] : []),
  ]

  return (
    <Page ground="paper" nav="dark" current="Sources">
      <PageHero
        kicker="Where the weight sits"
        title="Sources"
        after={
          <StatRow
            ground="dark"
            stats={[
              { value: used.length, label: 'Works cited' },
              { value: totalClaims.toLocaleString('en-GB'), label: 'Citations' },
              { value: concentrated.length, label: 'Single-source polities' },
              { value: unused.length, label: 'Listed but uncited' },
            ]}
          />
        }
      >
        <p>
          {used.length} works carrying {totalClaims.toLocaleString('en-GB')} citations. The
          build already refuses to ship a citation that does not resolve, so this page is
          not about whether the sourcing exists. It is about how it is distributed, which
              is the more useful question once a corpus is large.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-kaghaz/60">
              A polity whose every claim rests on one book is not better sourced than a
              polity with a visible gap. It is one disagreement away from being wrong
              throughout, and nothing on its own page shows that. This page shows it.
            </p>
            {/* The shape, said once and counted at build. The page argued about
                distribution and stated none of it. */}
            <p className="mt-4 text-[17px] leading-relaxed text-kaghaz/60">
              The ten most-used works carry{' '}
              {Math.round((topTen / totalClaims) * 100)}% of those citations; the middle
              work is cited {median} times, and {once} are cited once.{' '}
              {reachable} of {uses.length} carry a link to something readable online — the
              rest are citations you take to a library.
            </p>
      </PageHero>
      <Shell className="flex-1 pb-24">
        <div className="flex gap-12">
          <aside className="hidden shrink-0 pt-12 lg:block lg:w-[224px]">
            <div className="sticky top-24">
              <PageNav sections={sections} />
            </div>
          </aside>

          <main id="main" className="min-w-0 flex-1">

        {concentrated.length ? (
          <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
            <h2
              id="sole-heading"
              className="font-display text-title font-semibold text-kashi-deep"
            >
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
                    <PolityList ids={u.soleSourceFor} spans />
                    {' — '}
                    <Cite source={u.source} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16 border-t border-kashi/15 pt-8">
          <h2
            id="works-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            Every work, by how much rests on it
          </h2>

          <SourceFilter total={used.length} />

          <ul className="mt-8">
            {used.map((u) => (
              <li
                key={u.source.id}
                data-source=""
                data-name={`${u.source.author ?? ''} ${u.source.title} ${
                  u.source.container ?? ''
                } ${u.source.id}`}
                className="border-t border-kashi/12 py-5"
              >
                {/* The full entry, with the note and the link. Both used to
                    render only on About, which listed the same 550 works over
                    again: 493 of them carry a note and 15 a url, and none of
                    it appeared on the page named Sources. There is one
                    bibliography now and this is it. */}
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="text-[17px]">
                    <Cite source={u.source} showUrl />
                  </p>
                  <span className="font-mono text-micro text-debu-ink">{u.source.id}</span>
                </div>
                {u.source.note ? (
                  <p className="mt-1.5 max-w-measure text-[15px] leading-relaxed text-debu-ink">
                    {u.source.note}
                  </p>
                ) : null}
                {/* Length is a cited quantity here too: the bar is the claim
                    count, so it has to keep measuring at the top of the range.

                    It was a percentage of the page clamped at 540px, and at
                    the shell's 1,176px of content width that meant everything
                    at or above 45.9% of the maximum drew the same 540 pixels.
                    Ten works were over that line, spanning a true range of 46%
                    to 100% — so the Korea volume at 201 citations and the
                    Cambridge History of India at 118 were one length. The page
                    argues that distribution is the useful question and was
                    flattening the only part of the distribution its argument
                    is about.

                    A track of fixed width with the fill scaled inside it. The
                    percentage now resolves against the track rather than
                    against the page, so nothing clamps and nothing saturates. */}
                {/* Wraps, so on a phone the count drops under a full-width
                    track instead of pushing the page sideways. */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <div className="h-[7px] w-full max-w-[420px] rounded-full bg-kashi/12">
                    <div
                      className="h-full rounded-full bg-kashi/55"
                      style={{ width: `${Math.max(0.8, (u.claims / max) * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-sans text-[12.5px] text-debu-ink">
                    <span className="font-mono tabular-nums">{u.claims}</span> {u.claims === 1 ? 'citation' : 'citations'}
                    {u.chapters ? ` · ${u.chapters} chapter${u.chapters === 1 ? '' : 's'}` : ''}
                  </span>
                </div>
                {u.polities.length ? (
                  <p className="mt-2 max-w-measure text-[15px] text-debu-ink">
                    <PolityList ids={u.polities} />
                  </p>
                ) : (
                  /* Name it, the way every row above names its polities. This
                     read identically for a work behind a single edge and one
                     behind all six world denominators. */
                  <p className="mt-2 text-[15px] text-debu-ink">
                    Cited by{' '}
                    {u.contexts.length
                      ? u.contexts.join(' and ')
                      : 'no polity record directly'}
                    , not by a polity record.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {unused.length ? (
          <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
            <h2
              id="unused-heading"
              className="font-display text-title font-semibold text-kashi-deep"
            >
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
            <h2
              id="datasets-heading"
              className="font-display text-title font-semibold text-kashi-deep"
            >
              Datasets
            </h2>
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
          </main>
        </div>
      </Shell>
    </Page>
  )
}

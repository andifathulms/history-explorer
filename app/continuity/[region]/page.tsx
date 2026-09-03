import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getRegion,
  politiesInRegion,
  edgesInRegion,
  threadedRegions,
  crossRegionEdges,
  displayName,
  hasPage,
} from '@/lib/content'
import Link from 'next/link'
import { Thread } from '@/components/Thread'
import { Page, Shell, Crumbs } from '@/components/Shell'

export function generateStaticParams() {
  return threadedRegions().map((r) => ({ region: r.id }))
}

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const r = getRegion(params.region)
  if (!r) return {}
  return { title: r.name, description: r.blurb }
}

export default function RegionThread({ params }: { params: { region: string } }) {
  const region = getRegion(params.region)
  if (!region || !region.thread) notFound()

  const polities = politiesInRegion(region.id)
  const edges = edgesInRegion(region.id)

  // Every polity in the region is drawn. The scale is the region's own span, so
  // there is nothing to exclude for being too long or too early — that was only
  // ever a problem when one global thread had to hold every polity at once.
  const onThread = polities

  // Held from, or claimed against, a polity in another region.
  const outward = crossRegionEdges(region.id)
  const outsideIds = [
    ...new Set(
      outward.flatMap((e) =>
        [e.from, e.to].filter((x) => !polities.some((p) => p.id === x)),
      ),
    ),
  ]

  return (
    <Page ground="dark" current="Continuity" wash>
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <Crumbs
            ground="dark"
            trail={[{ href: '/continuity/', label: 'Continuity' }, { label: region.name }]}
          />
          <header className="max-w-measure pt-6">
            <h1 className="font-display text-display font-semibold text-kaghaz">
              {region.name}
            </h1>
            <p className="mt-6 text-lede text-kaghaz/85">{region.blurb}</p>
            <p className="mt-5 text-[17px] leading-relaxed text-debu-paper">
            The line below is a time axis. Position on it is date, so concurrency is
              visible: concurrent polities sit side by side rather than in sequence.
            </p>
            {outsideIds.length ? (
              <p className="mt-5 text-[17px] leading-relaxed text-debu-paper">
              {outward.length} sourced edge{outward.length === 1 ? '' : 's'} run
              {outward.length === 1 ? 's' : ''} between this region and another, to{' '}
              {outsideIds.map((id, i) => (
                <span key={id}>
                  {i > 0 ? (i === outsideIds.length - 1 ? ' and ' : ', ') : ''}
                  {hasPage(id) ? (
                    <Link
                      href={`/polity/${id}/`}
                      className="link-underline text-firuze-bright"
                    >
                      {displayName(id)}
                    </Link>
                  ) : (
                    displayName(id)
                  )}
                </span>
              ))}
              . Those are not drawn on this line — a thread that crossed regions would
              assert a sequence nobody cited — but they are on each polity&rsquo;s own
                page.
              </p>
            ) : null}
          </header>

          <div className="mt-14">
            <Thread polities={onThread} edges={edges} />
          </div>
        </Shell>
      </main>
    </Page>
  )
}

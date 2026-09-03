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
import { SiteNav } from '@/components/SiteNav'

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
    <div className="min-h-screen bg-dawat text-kaghaz">
      <SiteNav ground="dark" current="Continuity" />
      <main id="main" className="px-5 pb-24 pt-10 sm:px-8">
        <header className="max-w-measure">
          <p className="text-[15px] text-debu-paper">Continuity</p>
          <h1 className="mt-1 text-[32px] leading-tight text-kaghaz">{region.name}</h1>
          <p className="mt-4 text-debu-paper">{region.blurb}</p>
          <p className="mt-4 text-debu-paper">
            The line below is a time axis. Position on it is date, so concurrency is
            visible: concurrent polities sit side by side rather than in sequence.
          </p>
          {outsideIds.length ? (
            <p className="mt-4 text-debu-paper">
              {outward.length} sourced edge{outward.length === 1 ? '' : 's'} run
              {outward.length === 1 ? 's' : ''} between this region and another, to{' '}
              {outsideIds.map((id, i) => (
                <span key={id}>
                  {i > 0 ? (i === outsideIds.length - 1 ? ' and ' : ', ') : ''}
                  {hasPage(id) ? (
                    <Link href={`/polity/${id}/`} className="text-firuze hover:underline">
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

        <div className="mt-12">
          <Thread polities={onThread} edges={edges} />
        </div>
      </main>
    </div>
  )
}

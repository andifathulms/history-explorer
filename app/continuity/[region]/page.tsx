import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRegion, politiesInRegion, edgesInRegion, threadedRegions } from '@/lib/content'
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

  // The Abbasids are an edge target for every polity here, but their span runs
  // off the top of this scale; drawing them would compress everything else into
  // the bottom third. Named in the prose instead.
  const offScale = polities.filter((p) => p.span.start.min < 800)
  const onThread = polities.filter((p) => p.span.start.min >= 800)

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
            visible: the Saffarids and Samanids ran at the same time and hostile to each
            other, and you can see that without being told.
            {offScale.length ? (
              <>
                {' '}
                {offScale.map((p) => p.name.latin).join(' and ')}, which every polity here
                held a grant from, {offScale.length > 1 ? 'run' : 'runs'} off the top of
                this scale and {offScale.length > 1 ? 'are' : 'is'} not drawn.
              </>
            ) : null}
          </p>
        </header>

        <div className="mt-12">
          <Thread polities={onThread} edges={edges} />
        </div>
      </main>
    </div>
  )
}

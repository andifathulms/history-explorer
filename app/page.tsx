import { loadCorpus } from '@/lib/content'
import { Thread } from '@/components/Thread'
import { SiteNav } from '@/components/SiteNav'

export default function ThreadView() {
  const { narrative, context, edges } = loadCorpus()
  // Context polities sit on the thread because they are edge targets, but they
  // carry no chapters and the layout treats them the same as the rest.
  const onThread = [...narrative, ...context].filter((p) => p.id !== 'abbasid')
  const abbasid = context.find((p) => p.id === 'abbasid')

  return (
    <div className="min-h-screen bg-dawat text-kaghaz">
      <SiteNav ground="dark" current="Thread" />
      <main id="main" className="px-5 pb-24 pt-10 sm:px-8">
        <header className="max-w-measure">
          <h1 className="text-[32px] leading-tight text-kaghaz">
            How one polity becomes the next
          </h1>
          <p className="mt-4 text-debu">
            Wikipedia has an article on the Samanids and an article on the Ghaznavids. It
            does not have the thing that connects them: Alptigin was a Samanid Turkic
            slave-general who took Ghazna and founded a line that outlived his masters.
            That pattern is the subject here — secession, usurpation by generals, vassals
            swallowing overlords — and it lives in the edges between articles.
          </p>
          <p className="mt-4 text-debu">
            The line below is a time axis. Position on it is date, so concurrency is
            visible: the Saffarids and Samanids ran at the same time and hostile to each
            other, and you can see that without being told.
            {abbasid ? (
              <>
                {' '}
                The Abbasid Caliphate, which every polity here held a grant from, runs off
                the top of this scale and is not drawn.
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

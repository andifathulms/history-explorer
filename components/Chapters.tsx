import { compileMDX } from 'next-mdx-remote/rsc'
import type { Chapter } from '@/lib/types'
import { citeShort, getSource } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

/**
 * Chapters are free-form, 2 to 8 per polity, with titles the author wrote.
 *
 * The phase tag is optional on purpose: the template does not fit everyone.
 * The Ghurids barely had a golden age before Khwarazm ended them, and forcing a
 * peak chapter would mean writing something untrue. Where a tag is absent
 * nothing renders, rather than a placeholder.
 */

const components = {
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-5 max-w-measure text-body text-dawat/88" {...p} />
  ),
  em: (p: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...p} />,
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-kashi" {...p} />
  ),
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-5 max-w-measure border-s-2 border-kashi/40 ps-4 text-dawat/80"
      {...p}
    />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-5 max-w-measure list-disc space-y-1 ps-5 text-body" {...p} />
  ),
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-kashi underline decoration-kashi/35 underline-offset-4 transition-colors hover:text-firuze-ink hover:decoration-firuze-ink"
      {...p}
    />
  ),
}

async function One({ chapter }: { chapter: Chapter }) {
  const { content } = await compileMDX({
    source: chapter.body,
    components,
    options: { parseFrontmatter: false },
  })
  const source = getSource(chapter.drafted_from)

  return (
    <article className="mt-16 scroll-mt-28 first:mt-0" id={chapter.slug}>
      <h2 className="font-display text-chapter text-kashi-deep">{chapter.title}</h2>

      {/* Hard rule 4: every chapter names its source, on the page, in the
          reading flow. Provenance in a footnote is provenance nobody reads. */}
      <p className="mt-3 max-w-measure border-b border-kashi/20 pb-3 text-[14.5px] leading-relaxed text-debu-ink">
        <span className="font-mono text-micro uppercase">Drafted from</span>{' '}
        <cite className="not-italic">{citeShort(chapter.drafted_from)}</cite>
        {source?.url ? (
          <>
            {' · '}
            <a
              href={source.url}
              className="underline underline-offset-2 hover:text-firuze-ink"
              rel="noreferrer"
            >
              source
            </a>
          </>
        ) : null}
        {chapter.phase ? (
          <span className="ms-3 rounded-full border border-kashi/20 px-2 py-0.5 font-mono text-micro uppercase not-italic">
            {chapter.phase}
          </span>
        ) : null}
      </p>

      {content}
    </article>
  )
}

export async function Chapters({ chapters }: { chapters: Chapter[] }) {
  return (
    <section aria-labelledby="chapters-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="chapters-heading"
        aside={
          <span className="font-mono text-micro uppercase text-debu-ink">
            {chapters.length} in order
          </span>
        }
      >
        Chapters
      </SectionHead>

      {/* A contents list, because these pages run to eight chapters and a
          reader who wants the peak should not have to scroll for it. The
          phase tag is shown where there is one and nothing stands in for it
          where there is not. */}
      {chapters.length > 2 ? (
        <nav aria-label="Chapters" className="-mt-1 mb-14">
          <ol className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {chapters.map((c, i) => (
              <li key={c.slug} className="flex gap-3 border-b border-kashi/10 py-2">
                <span className="font-mono text-micro tabular-nums text-debu-ink">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${c.slug}`}
                  className="link-underline text-[16px] text-kashi hover:text-firuze-ink"
                >
                  {c.title}
                </a>
                {c.phase ? (
                  <span className="ms-auto font-mono text-micro uppercase text-debu-ink">
                    {c.phase}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {chapters.map((c) => (
        // Each chapter compiles independently, so one malformed file cannot
        // silently swallow the rest of the polity.
        <One key={c.slug} chapter={c} />
      ))}
    </section>
  )
}

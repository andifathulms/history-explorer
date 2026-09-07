import { compileMDX } from 'next-mdx-remote/rsc'
import { ASIDE, type Chapter } from '@/lib/types'
import { citeShort, getSource } from '@/lib/content'
import { SectionHead } from '@/components/Shell'
import { Spine } from '@/components/Spine'

/**
 * Chapters are free-form, 2 to 8 per polity, with titles the author wrote.
 *
 * The phase tag does not force a template: the Ghurids barely had a golden age
 * before Khwarazm ended them, and forcing a peak chapter would mean writing
 * something untrue. Where a tag is absent nothing renders in its place.
 *
 * `aside` is the tag for a chapter that is not a stage of anything — a coinage,
 * a treaty, a library, or the evidence itself. It is rendered differently from
 * an arc phase because it is a different kind of claim: "peak" says when this
 * chapter sits, "aside" says that the question does not apply.
 */

const components = {
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-5 max-w-measure text-body text-dawat/88" {...p} />
  ),
  /**
   * A `##` inside a chapter body, rendered as an h3 because the chapter's own
   * title is already the h2 above it. Until this existed the corpus's 784
   * subheadings had no styling at all: they inherited body type and the browser
   * default margin collapsed against the paragraph above, so "The double claim"
   * read as the last line of the preceding sentence rather than the opening of
   * the next section. The generous top margin is the fix — a subheading has to
   * belong visibly to what follows it, not to what it interrupts.
   */
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-12 max-w-measure font-display text-[19px] font-semibold leading-snug text-kashi-deep"
      {...p}
    />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="mt-10 max-w-measure font-display text-[17px] font-semibold leading-snug text-kashi-deep"
      {...p}
    />
  ),
  /**
   * Inline code keeps the reading face. A monospace switch mid-sentence makes a
   * word look like something the machine said, and in a corpus where these spans
   * mostly wrap ordinary nouns the effect was to make history read like a
   * console log. The distinction is carried by colour and a touch of weight
   * instead, which marks the term without leaving the typeface.
   */
  code: (p: React.HTMLAttributes<HTMLElement>) => (
    <code className="font-latin font-medium text-kashi" {...p} />
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
          <span
            className={`ms-3 rounded-full px-2 py-0.5 font-mono text-micro uppercase not-italic ${
              chapter.phase === ASIDE
                ? 'border border-dashed border-kashi/25 text-debu-ink'
                : 'border border-kashi/20'
            }`}
            title={
              chapter.phase === ASIDE
                ? 'Outside the arc: this chapter is about one object, document or institution rather than a stretch of the polity\u2019s existence.'
                : undefined
            }
          >
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

      {/* The spine first: where these chapters sit in the polity's life, and
          how much of it they cover. Then a contents list, because these pages
          run to eight chapters and a reader who wants the peak should not have
          to scroll for it. */}
      <Spine chapters={chapters} />

      {chapters.length > 2 ? (
        <nav aria-label="Chapters" className="mt-10 mb-14">
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
      ) : (
        <div className="mb-14" />
      )}

      {chapters.map((c) => (
        // Each chapter compiles independently, so one malformed file cannot
        // silently swallow the rest of the polity.
        <One key={c.slug} chapter={c} />
      ))}
    </section>
  )
}

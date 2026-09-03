import { compileMDX } from 'next-mdx-remote/rsc'
import type { Chapter } from '@/lib/types'
import { citeShort, getSource } from '@/lib/content'

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
    <p className="mt-5 max-w-measure text-body text-dawat/90" {...p} />
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
    <a className="text-kashi underline underline-offset-2 hover:text-firuze" {...p} />
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
    <article className="mt-12 first:mt-0" id={chapter.slug}>
      <h2 className="text-chapter text-kashi">{chapter.title}</h2>

      {/* Hard rule 4: every chapter names its source, on the page, in the
          reading flow. Provenance in a footnote is provenance nobody reads. */}
      <p className="mt-2 max-w-measure border-b border-kashi/20 pb-3 text-[15px] text-debu">
        Drafted from: <cite className="not-italic">{citeShort(chapter.drafted_from)}</cite>
        {source?.url ? (
          <>
            {' · '}
            <a
              href={source.url}
              className="underline underline-offset-2 hover:text-firuze"
              rel="noreferrer"
            >
              source
            </a>
          </>
        ) : null}
        {chapter.phase ? <span className="ms-3 italic">{chapter.phase}</span> : null}
      </p>

      {content}
    </article>
  )
}

export async function Chapters({ chapters }: { chapters: Chapter[] }) {
  return (
    <section aria-labelledby="chapters-heading" className="mt-12">
      <h2 id="chapters-heading" className="sr-only">
        Chapters
      </h2>
      {chapters.map((c) => (
        // Each chapter compiles independently, so one malformed file cannot
        // silently swallow the rest of the polity.
        <One key={c.slug} chapter={c} />
      ))}
    </section>
  )
}

import { Children, isValidElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { ASIDE, type Chapter } from "@/lib/types";
import { citeShort, getSource } from "@/lib/content";
import { SectionHead } from "@/components/Shell";
import { Spine } from "@/components/Spine";
import { Hint } from "@/components/Hint";
import { Figure } from "@/components/Figure";

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

/**
 * Marks the MDX `Figure` binding as block-level, for the paragraph below.
 */
const BLOCK = Symbol.for("chapter-block");

/**
 * A paragraph, unless it holds a figure.
 *
 * MDX wraps a `<Figure />` written on its own line — or at the head of a
 * paragraph, as 684 chapter markers are — in a <p>. A <figure> cannot sit in a
 * <p>: the browser closes the paragraph before it, the DOM no longer matches
 * what the server sent, and React threw away and re-rendered the whole
 * document on every polity page with a figure. The same styling on a <div>
 * keeps the reading rhythm and gives the parser nothing to repair.
 */
function Paragraph(p: React.HTMLAttributes<HTMLParagraphElement>) {
  const block = Children.toArray(p.children).some(
    (c) => isValidElement(c) && (c.type as { [BLOCK]?: boolean })[BLOCK],
  );
  const Tag = block ? "div" : "p";
  return <Tag className="mt-5 max-w-measure text-body text-ink" {...p} />;
}

const components = {
  p: Paragraph,
  /**
   * A `##` inside a chapter body, rendered as an h4 because the chapter's own
   * title is the h3 above it and the section's heading the h2 above that.
   * Until this existed the corpus's 784
   * subheadings had no styling at all: they inherited body type and the browser
   * default margin collapsed against the paragraph above, so "The double claim"
   * read as the last line of the preceding sentence rather than the opening of
   * the next section. The generous top margin is the fix — a subheading has to
   * belong visibly to what follows it, not to what it interrupts.
   */
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="mt-12 max-w-measure font-display text-[19px] font-semibold leading-snug text-kashi-deep"
      {...p}
    />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
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
  em: (p: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...p} />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-kashi" {...p} />
  ),
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-5 max-w-measure border-s-2 border-kashi/40 ps-4 text-ink"
      {...p}
    />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mt-5 max-w-measure list-disc space-y-1 ps-5 text-body"
      {...p}
    />
  ),
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-kashi underline decoration-kashi/35 underline-offset-4 transition-colors hover:text-firuze-ink hover:decoration-firuze-ink"
      {...p}
    />
  ),
};

async function One({ chapter }: { chapter: Chapter }) {
  const { content } = await compileMDX({
    source: chapter.body,
    // `Figure` is bound to this chapter's polity here rather than taking it as
    // a prop in the MDX. A `<Figure id="..." polity="egypt-early-dynastic" />`
    // in every marker is a second place for the polity id to be wrong, in the
    // file least able to report it — and the author writing the chapter already
    // knows which polity they are in.
    components: {
      ...components,
      Figure: Object.assign(
        (p: { id: string }) => <Figure {...p} polity={chapter.polity} />,
        { [BLOCK]: true },
      ),
    },
    options: { parseFrontmatter: false },
  });
  const source = getSource(chapter.drafted_from);

  return (
    <article className="mt-16 scroll-mt-28 first:mt-0" id={chapter.slug}>
      {/* h3, not h2. The section's own heading is the h2, and a chapter is
          inside it — but both used to be h2, so a screen reader read
          "Chapters" and "The rise of the Samanids" as peers while the page set
          one at 12px mono uppercase and the other at 30px display. The outline
          and the type scale now agree about which contains which. */}
      <h3 className="font-display text-chapter text-kashi-deep [text-wrap:balance]">
        {chapter.title}
      </h3>

      {/* Hard rule 4: every chapter names its source, on the page, in the
          reading flow. Provenance in a footnote is provenance nobody reads. */}
      <p className="mt-3 flex max-w-measure flex-wrap items-center gap-x-3 gap-y-2 border-b border-kashi/20 pb-3.5 font-sans text-[13.5px] leading-relaxed text-debu-ink">
        {chapter.phase ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium capitalize leading-none ${
              chapter.phase === ASIDE
                ? "border border-dashed border-kashi/30 text-debu-ink"
                : chapter.phase === "peak"
                  ? "bg-zarrin/15 text-zarrin-ink"
                  : "bg-kashi-wash text-kashi"
            }`}
          >
            {chapter.phase}
            {chapter.phase === ASIDE ? (
              <Hint label="aside">
                Outside the arc: this chapter is about one object, document or
                institution rather than a stretch of the polity&rsquo;s
                existence.
              </Hint>
            ) : null}
          </span>
        ) : null}
        <span>
          Drafted from{" "}
          <cite className="font-latin text-[14.5px] italic text-ink">
            {citeShort(chapter.drafted_from)}
          </cite>
          {source?.url ? (
            <>
              {" · "}
              <a
                href={source.url}
                className="underline underline-offset-2 hover:text-firuze-ink"
                rel="noreferrer"
              >
                source
              </a>
            </>
          ) : null}
        </span>
      </p>

      {content}
    </article>
  );
}

/**
 * Reading time, at 230 words a minute. A property of the text on the page,
 * not a figure about the past, so rule 2's ban on estimates is not in play —
 * but it is rounded to whole minutes and never shown below one, so it does
 * not pretend to more precision than a reader's own pace allows.
 */
function minutes(chapters: Chapter[]): number {
  const words = chapters.reduce((n, c) => n + c.body.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / 230));
}

export async function Chapters({ chapters }: { chapters: Chapter[] }) {
  return (
    <section aria-labelledby="chapters-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="chapters-heading"
        aside={
          <span>
            <span className="font-mono tabular-nums">{chapters.length}</span> in order · about{" "}
            <span className="font-mono tabular-nums">{minutes(chapters)}</span> minutes
          </span>
        }
      >
        Chapters
      </SectionHead>

      {/* The spine first: where these chapters sit in the polity's life, and
          how much of it they cover. Then a contents list, because these pages
          run to thirteen chapters and a reader who wants the peak should not
          have to scroll for it.

          The contents list is folded. On a phone the spine plus thirteen rows
          put a screen and a half of furniture between this heading and the
          first sentence of chapter one — a scroll tax charged on every visit,
          to a reader who has already been given the arc immediately above and,
          on a wide screen, the same list in the gutter. One tap when it is
          wanted is the right price; a screen and a half when it is not is not. */}
      <Spine chapters={chapters} />

      {/* The contents, as cards: number, phase, title, length and source.
          It was a folded list, then an open one; either way it was thirteen
          rows of the same grey. A card per chapter lets a reader see the arc
          they are about to read — where the peak chapters are, which is long,
          what each was drafted from — and the first one says where to begin. */}
      {chapters.length > 1 ? (
        <nav aria-label="Chapters" className="mb-14 mt-8">
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {chapters.map((c, i) => (
              <li key={c.slug} className="min-w-0">
                <a
                  href={`#${c.slug}`}
                  className={`group flex h-full flex-col rounded-xl border px-4 pb-3.5 pt-3.5 transition-[box-shadow,border-color] ${
                    i === 0
                      ? "border-kashi-deep bg-kashi-deep text-kaghaz hover:shadow-paper-lift"
                      : "border-kashi/10 bg-kaghaz-raise hover:border-kashi/25 hover:shadow-paper"
                  }`}
                >
                  <span
                    className={`flex items-baseline justify-between gap-3 font-sans text-[12px] font-medium capitalize ${
                      i === 0
                        ? "text-kaghaz/70"
                        : c.phase === "peak"
                          ? "text-zarrin-ink"
                          : "text-debu-ink"
                    }`}
                  >
                    {c.phase ?? "\u00A0"}
                    <span className="font-mono tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span
                    className={`mt-2 font-display text-[17px] font-semibold leading-snug [text-wrap:balance] ${
                      i === 0 ? "text-kaghaz" : "text-kashi-deep group-hover:text-firuze-ink"
                    }`}
                  >
                    {c.title}
                  </span>
                  <span
                    className={`mt-auto pt-3 font-sans text-[12.5px] ${
                      i === 0 ? "text-kaghaz/70" : "text-debu-ink"
                    }`}
                  >
                    {i === 0 ? "Start reading · " : ""}
                    <span className="font-mono tabular-nums">{minutes([c])}</span> min ·{" "}
                    {citeShort(c.drafted_from)}
                  </span>
                </a>
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
  );
}

import type { Polity, BannerColour } from '@/lib/types'
import { citeShort, getFlagCredit } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

/**
 * What the polity raised in the field, as far as anyone cited.
 *
 * This is the most dangerous section on the page and the reason it is written
 * defensively. A flag is read as evidence in a way a number never is: nobody
 * screenshots a km² figure and reposts it as fact, and everybody does that with
 * a flag. Meanwhile the supply is almost entirely modern invention — the flags
 * circulating online for these polities were drawn in the last twenty years,
 * several from Pinterest boards and one from a Reddit thread, and they are
 * indistinguishable at a glance from the two here with real scholarship behind
 * them. Hard rule 9's principle governs: a picture that reads as a measurement
 * is held to the standard of one.
 *
 * So three things are structural rather than stylistic. The colour word comes
 * first and the swatch second, because the word is what the chronicler wrote
 * and the swatch is this site's illustration of it. The reconstruction label is
 * printed in text beside the image, never on hover, because a hover state does
 * not survive a screenshot. And an absent banner gets a plain sentence in the
 * register hard rule 7 uses for a polity with no succession edge — an ordinary
 * fact, not a gap waiting to be filled.
 */

/**
 * Vocabulary word to ink. Presentation only, and kept here rather than in the
 * data on purpose: Tabari's "white" is not a hex value, and putting one in
 * content/ would turn a chronicler's adjective into a specification. These are
 * deliberately plain — a flat green, not a considered one — so the swatch reads
 * as an illustration of a word rather than a reproduction of an object.
 */
const INK: Record<BannerColour, string> = {
  black: '#14171A',
  white: '#FAFBF7',
  green: '#1F7A4C',
  red: '#9B2C2C',
  gold: '#C08A2E',
  purple: '#5B3A78',
}

function Swatch({ colour }: { colour: BannerColour }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-9 shrink-0 rounded-[2px] border border-kashi/30 align-[-2px]"
      style={{ background: INK[colour] }}
    />
  )
}

export function Banner({ polity }: { polity: Polity }) {
  const b = polity.banner

  if (!b) {
    return (
      <section className="mt-14">
        <SectionHead ground="paper">Banner</SectionHead>
        {/* One sentence, no gap styling, no pending state. See hard rule 7. */}
        <p className="max-w-measure text-[16px] leading-relaxed text-dawat/75">
          No source in this site&rsquo;s bibliography describes a banner for{' '}
          {polity.name.latin}. Images captioned as its flag do circulate; none of
          the ones found is drawn from a work that can be cited here.
        </p>
      </section>
    )
  }

  const credit = b.image ? getFlagCredit(b.image.credit) : undefined
  const contested = b.attested.length > 1

  return (
    <section className="mt-14">
      <SectionHead ground="paper">Banner</SectionHead>

      <div className="sm:flex sm:gap-10">
        <div className="min-w-0 flex-1">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {b.attested.map((a) => (
              <li key={`${a.colour}-${a.source}`} className="flex items-baseline gap-2.5">
                <Swatch colour={a.colour} />
                <span>
                  <span className="text-[17px] capitalize text-kashi-deep">{a.colour}</span>
                  {a.reported_from ? (
                    <span className="ms-2 text-[14px] text-debu-ink">
                      {a.reported_from}
                    </span>
                  ) : null}
                  <span className="ms-2 font-mono text-[13px] text-debu-ink">
                    {citeShort(a.source)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Two colours means two chroniclers, not a two-colour flag. Saying so
              is the whole reason the attestations are a list. */}
          {contested ? (
            <p className="mt-3 text-[14px] italic text-debu-ink">
              The sources disagree. Both are printed; neither is preferred.
            </p>
          ) : null}

          <p className="mt-5 max-w-measure text-[16px] leading-relaxed text-dawat/85">
            {b.description}
          </p>
        </div>

        {b.image && credit ? (
          <figure className="mt-8 shrink-0 sm:mt-0 sm:w-[232px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export,
                images unoptimized; a plain img keeps the file exactly as credited. */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/flags/${b.image.file}`}
              alt={`${polity.name.latin}: ${b.image.status === 'reconstruction' ? 'a modern reconstruction of its banner' : 'a contemporary depiction of its banner'}`}
              width={232}
              height={139}
              className="w-full border border-kashi/25"
            />
            <figcaption className="mt-2 space-y-1.5">
              {b.image.status === 'reconstruction' ? (
                <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-debu-ink">
                  Modern reconstruction
                </p>
              ) : null}
              {b.image.divergence ? (
                <p className="text-[13.5px] leading-snug text-dawat/70">
                  {b.image.divergence}
                </p>
              ) : null}
              <p className="text-[12.5px] leading-snug text-debu-ink">
                Drawn by {credit.author},{' '}
                <a
                  href={credit.licence_url ?? credit.url}
                  className="underline decoration-kashi/40 underline-offset-2 hover:text-kashi"
                  rel="noreferrer"
                >
                  {credit.licence}
                </a>
                . Not a source, and not cited as one.
              </p>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  )
}

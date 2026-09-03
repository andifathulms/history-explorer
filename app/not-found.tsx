import Link from 'next/link'
import { Page, Shell } from '@/components/Shell'

export default function NotFound() {
  return (
    <Page ground="dark" wash>
      <main id="main" className="flex-1">
        <Shell className="py-28">
          <p className="kicker text-firuze-bright">404</p>
          <h1 className="mt-5 max-w-[16ch] font-display text-display font-semibold text-kaghaz">
            This page was never written
          </h1>
          <p className="mt-6 max-w-measure text-lede text-debu-paper">
            Coverage here follows one person&rsquo;s curiosity and makes no claim to
            completeness, so a missing page is almost always a polity nobody has opened a
            source for yet — not one that moved.
          </p>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { href: '/polities/', label: 'Browse the polities' },
              { href: '/timeline/', label: 'See the timeline' },
              { href: '/about/', label: 'Read the method' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="link-underline font-mono text-[12.5px] uppercase tracking-[0.08em] text-firuze-bright"
                >
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </Shell>
      </main>
    </Page>
  )
}

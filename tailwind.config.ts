import type { Config } from 'tailwindcss'

/**
 * Palette and scale come from DESIGN.md. Token names are the Persian/Malay
 * names used there, not semantic aliases, so that a rule like "zarrin appears
 * at most once per screen" stays greppable.
 *
 * The 2026 rework kept every role and every name and added depth to each: a
 * ground has a raised surface and a sunk one, structure has a deep variant for
 * display type and a soft one for rules. No new hue was introduced — the site
 * gets its presence from type, space and texture rather than from more colour,
 * which is what keeps a Srivijayan page from looking themed.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        /* Ink-over-lapis. Ground for navigating: home, continuity, maps. */
        dawat: {
          DEFAULT: '#0B1520',
          sink: '#060D15',
          raise: '#111F2C',
          lift: '#17293A',
          edge: '#20364A',
        },
        /* Cool grey-green paper. Ground for reading and for tables. */
        kaghaz: {
          DEFAULT: '#E9EBE5',
          sink: '#DEE1D9',
          raise: '#F3F4EF',
          lift: '#FAFBF7',
        },
        /* Tile blue. Structure: rules, rail, headings on paper. */
        kashi: {
          DEFAULT: '#1B4A6B',
          deep: '#0E3450',
          soft: '#3F7297',
        },
        /* Turquoise. The thread itself, and only the thread. */
        firuze: {
          DEFAULT: '#3E9C9C',
          bright: '#5AC6BF',
        },
        /* Saffron. Peak-phase markers only. Nothing else. */
        zarrin: {
          DEFAULT: '#C08A2E',
          bright: '#DFA945',
        },
        /* Dust. Secondary text, gap states. */
        debu: '#7C8079',

        /**
         * Reading variants of the palette above, for small text and for
         * interactive colour on paper ground.
         *
         * DESIGN.md's tokens are the design and they are kept exactly. But debu
         * on kaghaz measures 3.29:1 and firuze on kaghaz 2.66:1, both of which
         * fail WCAG AA for body-sized text, and the quality floor asks for
         * long-form text that is actually readable. These are the same hues
         * blended toward black or white only as far as 4.5:1 requires, so the
         * dust still reads as dust and the turquoise still reads as turquoise.
         *
         * Use these for text. Use the tokens above for the thread, the rails,
         * the bars and everything else graphical.
         */
        'debu-ink': '#63675F', // 4.9:1 on kaghaz
        'debu-paper': '#868A82', // 5.2:1 on dawat
        'firuze-ink': '#2A6E6E', // 4.8:1 on kaghaz
        'zarrin-ink': '#7F5B1D', // 5.1:1 on kaghaz
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        latin: ['var(--font-spectral)', 'Georgia', 'serif'],
        arabic: ['var(--font-amiri)', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        /* Fluid display sizes. A reference work should open at a size that says
           this is a made thing, then settle immediately into reading type. */
        hero: ['clamp(2.6rem, 1.4rem + 5.2vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.022em' }],
        display: ['clamp(2.1rem, 1.4rem + 3.1vw, 3.5rem)', { lineHeight: '1.04', letterSpacing: '-0.018em' }],
        title: ['clamp(1.55rem, 1.2rem + 1.5vw, 2.1rem)', { lineHeight: '1.12', letterSpacing: '-0.012em' }],
        lede: ['clamp(1.125rem, 1.04rem + 0.4vw, 1.3125rem)', { lineHeight: '1.55' }],
        body: ['18px', { lineHeight: '1.65' }],
        chapter: ['clamp(1.5rem, 1.25rem + 0.9vw, 1.875rem)', { lineHeight: '1.18', fontWeight: '600' }],
        /* The mono voice: kickers, axis labels, table heads. */
        meta: ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.1em' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em' }],
      },
      maxWidth: {
        measure: '68ch',
        shell: '1240px',
      },
      transitionTimingFunction: {
        thread: 'cubic-bezier(0.33, 0.1, 0.15, 1)',
        ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      boxShadow: {
        paper: '0 1px 2px rgba(14,52,80,0.05), 0 8px 24px -12px rgba(14,52,80,0.18)',
        'paper-lift': '0 2px 4px rgba(14,52,80,0.06), 0 18px 40px -18px rgba(14,52,80,0.28)',
      },
    },
  },
  plugins: [],
}

export default config

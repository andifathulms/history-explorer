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
        /* Cool grey-green paper. Ground for reading and for tables.

           The 2026 refresh deepened the ground a step and lifted the surface
           to near-white. The two used to measure 1.09:1 against each other,
           which is why every card read as a faint smudge on the page rather
           than as an object on it; they now measure 1.21:1, and the paper
           shadow does the rest. Same hue, same role. */
        kaghaz: {
          DEFAULT: '#E4E7E0',
          sink: '#D9DDD4',
          raise: '#FBFBF8',
          lift: '#FFFFFF',
        },
        /* Tile blue. Structure: rules, rail, headings on paper. */
        kashi: {
          DEFAULT: '#1B4A6B',
          deep: '#0E3450',
          soft: '#3F7297',
          /* A tint for state on paper: the selected tab, the active chip, the
             current row. A step of tile blue, not a new hue. */
          wash: '#D9E4EA',
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
        'debu-ink': '#5B6058', // 5.2:1 on kaghaz, 6.2:1 on kaghaz.raise
        /* Body text on paper. Was dawat at 75-88% opacity, which set reading
           text in a grey that varied component to component; this is one solid
           ink at 15.8:1 on the surface. */
        ink: '#13212C',
        'debu-paper': '#868A82', // 5.2:1 on dawat
        'firuze-ink': '#2A6E6E', // 4.8:1 on kaghaz
        'zarrin-ink': '#7F5B1D', // 5.1:1 on kaghaz
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        latin: ['var(--font-spectral)', 'Georgia', 'serif'],
        arabic: ['var(--font-amiri)', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        /* The interface voice: nav, buttons, chips, labels, in sentence case.
           Its job is to be not-a-number, so that mono can mean one. */
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        /* Fluid display sizes. A reference work should open at a size that says
           this is a made thing, then settle immediately into reading type. */
        hero: ['clamp(2.6rem, 1.4rem + 5.2vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.012em' }],
        display: ['clamp(2.1rem, 1.4rem + 3.1vw, 3.5rem)', { lineHeight: '1.04', letterSpacing: '-0.018em' }],
        title: ['clamp(1.55rem, 1.2rem + 1.5vw, 2.1rem)', { lineHeight: '1.12', letterSpacing: '-0.012em' }],
        lede: ['clamp(1.125rem, 1.04rem + 0.4vw, 1.3125rem)', { lineHeight: '1.55' }],
        body: ['18px', { lineHeight: '1.65' }],
        chapter: ['clamp(1.5rem, 1.25rem + 0.9vw, 1.875rem)', { lineHeight: '1.18', fontWeight: '600' }],
        /* The mono voice: kickers, axis labels, table heads. */
        meta: ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.1em' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em' }],
        /* The sans label: a field name, a chip, a caption over a figure. */
        label: ['0.8125rem', { lineHeight: '1.35', letterSpacing: '0.005em' }],
      },
      maxWidth: {
        measure: '68ch',
        /**
         * The one width for tabular and figure blocks, as against `measure`
         * for prose. The polity page had four — prose at 68ch, the fact lists
         * at 62rem, the turning points and the extent chart at 52rem, and the
         * contemporaries columns at the full shell — stacked down one page
         * with a common left edge and a right edge that stepped in and out for
         * no reason a reader could learn. Two widths is a rhythm; four is a
         * wobble.
         */
        data: '56rem',
        shell: '1240px',
        wide: '1440px',
      },
      transitionTimingFunction: {
        thread: 'cubic-bezier(0.33, 0.1, 0.15, 1)',
        ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      boxShadow: {
        paper: '0 1px 2px rgba(14,52,80,0.06), 0 10px 28px -14px rgba(14,52,80,0.22)',
        'paper-lift': '0 2px 4px rgba(14,52,80,0.07), 0 22px 44px -18px rgba(14,52,80,0.32)',
      },
    },
  },
  plugins: [],
}

export default config

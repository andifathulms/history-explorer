import { ImageResponse } from 'next/og'
import { getPolity, getRegion, loadCorpus } from '@/lib/content'
import { formatSpan, formatYear } from '@/lib/years'
import { C, OG_SIZE, ogFonts, titleSize } from '@/lib/og'
import { clamp } from '@/lib/seo'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'A share card: the polity, its dates, and its span drawn on the corpus axis.'
export const dynamic = 'force-static'

export function generateStaticParams() {
  return loadCorpus()
    .narrative.filter((p) => !p.context_only)
    .map((p) => ({ id: p.id }))
}

/**
 * One polity's share card.
 *
 * The picture is the site's own instrument rather than decoration: the strip
 * along the foot is the axis every span on the timeline is drawn against, with
 * this polity's stretch of it lit. Where an endpoint is a range the pale part
 * carries it and the solid part is what both readings agree on, which is the
 * same rule the polity page draws by — a card that shows a measurement is held
 * to the standard of one.
 */
export default function Image({ params }: { params: { id: string } }) {
  const p = getPolity(params.id)
  if (!p) return new ImageResponse(<div style={{ background: C.ground }} />, size)

  const region = getRegion(p.region)
  const { narrative } = loadCorpus()

  // The axis is the whole corpus, so a card read beside another card puts the
  // two polities in the same centuries rather than each in its own.
  const axisFrom = Math.min(...narrative.map((x) => x.span.start.min))
  const axisTo = Math.max(...narrative.map((x) => x.span.end.max))
  const at = (y: number) => ((y - axisFrom) / (axisTo - axisFrom)) * 100

  const { start, end } = p.span
  const pale = { left: at(start.min), width: Math.max(at(end.max) - at(start.min), 0.5) }
  const solid = { left: at(start.max), width: Math.max(at(end.min) - at(start.max), 0) }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 80px',
          background: `linear-gradient(140deg, ${C.raise} 0%, ${C.ground} 62%)`,
          color: C.paper,
          fontFamily: 'Plex Sans',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Plex Mono',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: C.threadBright,
            }}
          >
            {region?.name ?? 'History Explorer'}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Fraunces',
              fontSize: titleSize(p.name.latin),
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            {p.name.latin}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Plex Mono', fontSize: 34, color: C.paper }}>
            {formatSpan(start.min, end.max)}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Spectral',
              fontSize: 28,
              lineHeight: 1.4,
              color: C.dust,
              maxWidth: 940,
            }}
          >
            {clamp(p.identity, 150)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', position: 'relative', width: '100%', height: 18 }}>
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                left: 0,
                top: 7,
                width: '100%',
                height: 4,
                background: C.edge,
              }}
            />
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                left: `${pale.left}%`,
                top: 0,
                width: `${pale.width}%`,
                height: 18,
                background: C.thread,
                opacity: 0.45,
              }}
            />
            {solid.width > 0 ? (
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: `${solid.left}%`,
                  top: 0,
                  width: `${solid.width}%`,
                  height: 18,
                  background: C.threadBright,
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Plex Mono',
              fontSize: 20,
              color: C.dust,
            }}
          >
            <div style={{ display: 'flex' }}>{formatYear(axisFrom)}</div>
            <div style={{ display: 'flex', fontFamily: 'Plex Sans', letterSpacing: 1 }}>
              History Explorer
            </div>
            <div style={{ display: 'flex' }}>{formatYear(axisTo)}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts() },
  )
}

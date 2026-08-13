import { useId, useMemo } from 'react'

const W = 800
const H = 220
const PAD = { top: 14, right: 14, bottom: 22, left: 52 }
const MAX_POINTS = 400

/** Keep long sessions cheap to render — 10k spins becomes 400 drawn vertices. */
function downsample(points) {
  if (points.length <= MAX_POINTS) return points.map((y, i) => [i, y])
  const stride = (points.length - 1) / (MAX_POINTS - 1)
  return Array.from({ length: MAX_POINTS }, (_, i) => {
    const index = Math.round(i * stride)
    return [index, points[index]]
  })
}

/**
 * Minimal SVG line chart with a dashed reference line. Used for both the
 * bankroll curve and the win-rate convergence plot.
 */
export default function LineChart({
  points,
  baseline,
  baselineLabel,
  formatValue = (v) => String(v),
  xLabel = 'spins',
  emptyMessage = 'No data yet',
}) {
  const gradientId = useId()

  const model = useMemo(() => {
    if (points.length < 2) return null

    const sampled = downsample(points)
    const values = sampled.map(([, y]) => y)
    const candidates = baseline == null ? values : [...values, baseline]

    let lo = Math.min(...candidates)
    let hi = Math.max(...candidates)
    if (hi === lo) {
      // Flat series still needs a band to draw inside.
      const nudge = Math.abs(hi) * 0.05 || 1
      lo -= nudge
      hi += nudge
    }
    const pad = (hi - lo) * 0.08
    lo -= pad
    hi += pad

    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    const lastX = points.length - 1

    const sx = (i) => PAD.left + (lastX === 0 ? 0 : (i / lastX) * plotW)
    const sy = (v) => PAD.top + plotH - ((v - lo) / (hi - lo)) * plotH

    const line = sampled.map(([i, v]) => `${sx(i)},${sy(v)}`).join(' ')
    const area = `${PAD.left},${PAD.top + plotH} ${line} ${sx(lastX)},${PAD.top + plotH}`

    return {
      line,
      area,
      lo,
      hi,
      baselineY: baseline == null ? null : sy(baseline),
      last: { x: sx(lastX), y: sy(points[lastX]), value: points[lastX] },
      first: points[0],
      count: points.length,
    }
  }, [points, baseline])

  if (!model) {
    return (
      <div className="h-[180px] flex items-center justify-center text-text-muted font-mono text-xs">
        {emptyMessage}
      </div>
    )
  }

  const rising = model.last.value >= (baseline ?? model.first)
  const stroke = rising ? '#00e676' : '#e74c3c'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* y-axis bounds */}
      {[model.hi, model.lo].map((v, i) => (
        <text
          key={i}
          x={PAD.left - 8}
          y={i === 0 ? PAD.top + 4 : H - PAD.bottom}
          fill="#4a5568"
          fontSize="11"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {formatValue(v)}
        </text>
      ))}

      {model.baselineY != null && (
        <>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={model.baselineY}
            y2={model.baselineY}
            stroke="#d4af37"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          {baselineLabel && (
            <text
              x={W - PAD.right}
              y={model.baselineY - 5}
              fill="#d4af37"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              {baselineLabel}
            </text>
          )}
        </>
      )}

      <polyline points={model.area} fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points={model.line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={model.last.x} cy={model.last.y} r="3.5" fill={stroke} />

      <text
        x={PAD.left}
        y={H - 5}
        fill="#4a5568"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        0
      </text>
      <text
        x={W - PAD.right}
        y={H - 5}
        fill="#4a5568"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
        textAnchor="end"
      >
        {model.count - 1} {xLabel}
      </text>
    </svg>
  )
}

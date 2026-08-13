import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { getWheel, colorOf } from '../../utils/roulette'

const SIZE = 300
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 142
const R_INNER = 100
const R_LABEL = 121
const R_BALL = 88

const POCKET_FILL = {
  red: '#c0392b',
  black: '#111827',
  green: '#00b85e',
}

/** Point on a circle where angle 0 is 12 o'clock and angles run clockwise. */
function polar(r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)]
}

function sectorPath(a0, a1) {
  const [x0, y0] = polar(R_OUTER, a0)
  const [x1, y1] = polar(R_OUTER, a1)
  const [x2, y2] = polar(R_INNER, a1)
  const [x3, y3] = polar(R_INNER, a0)
  return `M${x0},${y0} A${R_OUTER},${R_OUTER} 0 0 1 ${x1},${y1} L${x2},${y2} A${R_INNER},${R_INNER} 0 0 0 ${x3},${y3} Z`
}

/**
 * The wheel and the ball are animated independently but always finish with the
 * winning pocket and the ball both at 12 o'clock, so the ball visually settles
 * into the correct pocket without any per-frame collision math.
 */
export default function Wheel({ variant, result, spinning, onSettled, duration = 3.4 }) {
  const wheel = getWheel(variant)
  const step = 360 / wheel.length

  const wheelControls = useAnimation()
  const ballControls = useAnimation()

  // Rotation accumulates so the wheel never visibly rewinds between spins.
  const wheelRotation = useRef(0)
  const ballRotation = useRef(0)

  useEffect(() => {
    if (!spinning || !result) return

    let cancelled = false
    const index = wheel.indexOf(result)

    // Land pocket `index` under the pointer, after a few full revolutions.
    const targetWheel = wheelRotation.current
    const nextWheel =
      targetWheel + 360 * 4 + ((-index * step - (targetWheel % 360)) % 360 + 360) % 360
    const nextBall = ballRotation.current - 360 * 7

    wheelRotation.current = nextWheel
    ballRotation.current = nextBall

    Promise.all([
      wheelControls.start({
        rotate: nextWheel,
        transition: { duration, ease: [0.17, 0.67, 0.16, 1] },
      }),
      ballControls.start({
        rotate: nextBall,
        transition: { duration, ease: [0.12, 0.6, 0.1, 1] },
      }),
    ]).then(() => {
      if (cancelled) return
      onSettled?.()
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, result])

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[300px] drop-shadow-[0_0_24px_rgba(212,175,55,0.25)]"
        role="img"
        aria-label={result ? `Roulette wheel, last result ${result}` : 'Roulette wheel'}
      >
        <circle cx={CX} cy={CY} r={R_OUTER + 6} fill="#0b1120" stroke="#d4af37" strokeWidth="2" />

        <motion.g animate={wheelControls} style={{ transformOrigin: `${CX}px ${CY}px` }}>
          {wheel.map((pocket, i) => {
            const a0 = i * step
            const mid = a0 + step / 2
            const [lx, ly] = polar(R_LABEL, mid)
            return (
              <g key={pocket}>
                <path
                  d={sectorPath(a0, a0 + step)}
                  fill={POCKET_FILL[colorOf(pocket)]}
                  stroke="#7a5c00"
                  strokeWidth="0.5"
                />
                <text
                  x={lx}
                  y={ly}
                  fill="#f0f4ff"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${mid} ${lx} ${ly})`}
                >
                  {pocket}
                </text>
              </g>
            )
          })}

          <circle cx={CX} cy={CY} r={R_INNER} fill="#1a2540" stroke="#7a5c00" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={R_INNER * 0.55} fill="#0b1120" stroke="#d4af37" strokeWidth="1.5" />
          <text
            x={CX}
            y={CY}
            fill="#d4af37"
            fontSize="20"
            fontFamily="Playfair Display, Georgia, serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            JT
          </text>
        </motion.g>

        {/* Ball rides its own track so it can counter-rotate against the wheel. */}
        <motion.g animate={ballControls} style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <circle
            cx={CX}
            cy={CY - R_BALL}
            r="6"
            fill="#f0f4ff"
            stroke="#d4af37"
            strokeWidth="1"
          />
        </motion.g>

        {/* Pointer */}
        <path
          d={`M${CX - 8},${CY - R_OUTER - 14} L${CX + 8},${CY - R_OUTER - 14} L${CX},${CY - R_OUTER + 2} Z`}
          fill="#d4af37"
        />
      </svg>
    </div>
  )
}

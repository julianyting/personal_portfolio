import { useMemo } from 'react'
import { getWheel, colorOf, pocketCount } from '../../utils/roulette'

/**
 * Frequency heat map across every pocket. The subtitle deliberately reports the
 * expected count alongside the observed one — "hot" numbers are the headline,
 * but the honest reading is how close everything sits to uniform.
 */
export default function HotCold({ counts, spins, variant }) {
  const wheel = getWheel(variant)
  const expected = spins / pocketCount(variant)

  const ordered = useMemo(() => {
    const pockets = wheel
      .map((p) => ({ pocket: p, count: counts[p] || 0 }))
      .sort((a, b) => Number(a.pocket === '00' ? 0.5 : a.pocket) - Number(b.pocket === '00' ? 0.5 : b.pocket))

    const max = Math.max(1, ...pockets.map((p) => p.count))
    return { pockets, max }
  }, [counts, wheel])

  const ranked = [...ordered.pockets].sort((a, b) => b.count - a.count)
  const hot = ranked.slice(0, 4).filter((p) => p.count > 0)
  const cold = ranked.slice(-4).reverse()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {ordered.pockets.map(({ pocket, count }) => {
          const intensity = count / ordered.max
          const base = colorOf(pocket)
          return (
            <div
              key={pocket}
              title={`${pocket} — hit ${count}× (expected ${expected.toFixed(1)})`}
              className="relative w-8 h-9 rounded-sm border border-luck-goldMuted/40
                flex flex-col items-center justify-center font-mono"
              style={{
                backgroundColor:
                  base === 'green'
                    ? 'rgba(0,184,94,0.25)'
                    : base === 'red'
                      ? 'rgba(192,57,43,0.25)'
                      : 'rgba(17,24,39,0.6)',
                boxShadow: count ? `inset 0 -${Math.round(intensity * 30)}px 0 rgba(212,175,55,${0.15 + intensity * 0.5})` : 'none',
              }}
            >
              <span className="text-[0.6rem] text-text-primary leading-none">{pocket}</span>
              <span className="text-[0.5rem] text-luck-gold leading-none mt-0.5">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <p className="text-text-muted uppercase tracking-widest text-[0.6rem] mb-1.5">Hottest</p>
          <p className="text-odds">
            {hot.length ? hot.map((h) => `${h.pocket} (${h.count})`).join('  ·  ') : '—'}
          </p>
        </div>
        <div>
          <p className="text-text-muted uppercase tracking-widest text-[0.6rem] mb-1.5">Coldest</p>
          <p className="text-luck-redLight">
            {spins ? cold.map((c) => `${c.pocket} (${c.count})`).join('  ·  ') : '—'}
          </p>
        </div>
      </div>

      {spins > 0 && (
        <p className="text-[0.7rem] font-mono text-text-muted leading-relaxed">
          Every pocket is expected to hit <span className="text-luck-gold">{expected.toFixed(1)}×</span> over{' '}
          {spins} spins. Spread around that number is ordinary variance — it is not a pattern, and the
          wheel has no memory of it.
        </p>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import LineChart from './LineChart'
import {
  betStats,
  betCovers,
  blendedEv,
  colorOf,
  decodeBet,
  formatMoney,
  formatPct,
  houseEdge,
  spinWheel,
} from '../../utils/roulette'

const SAMPLE_BETS = [
  'straight:17',
  'split:17-20',
  'street:0',
  'dozen:1',
  'column:1',
  'red',
]

const CONVERGENCE_TARGET = 10000
const CHUNK = 500
const WARMUP = 5 // early win-rates are 0% or 100% and would flatten the y-axis

function Row({ children }) {
  return <div className="border-t border-luck-goldMuted/25 pt-4 mt-4">{children}</div>
}

function Heading({ children, kicker }) {
  return (
    <>
      <p className="text-[0.6rem] uppercase tracking-widest font-mono text-luck-gold mb-1">{kicker}</p>
      <h4 className="font-display text-lg text-text-primary mb-2">{children}</h4>
    </>
  )
}

/** Runs a large sample of even-money spins off the main session, in chunks so
 *  the main thread stays responsive. */
function useConvergence(variant) {
  const [state, setState] = useState({ running: false, points: [], spins: 0, wins: 0 })
  const frame = useRef(null)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const reset = () => {
    cancelAnimationFrame(frame.current)
    setState({ running: false, points: [], spins: 0, wins: 0 })
  }

  const run = () => {
    cancelAnimationFrame(frame.current)

    let spins = 0
    let wins = 0
    const points = []

    const step = () => {
      const end = Math.min(spins + CHUNK, CONVERGENCE_TARGET)
      while (spins < end) {
        const pocket = spinWheel(variant)
        spins++
        if (betCovers('red', pocket)) wins++
        if (spins >= WARMUP) points.push(wins / spins)
      }

      const done = spins >= CONVERGENCE_TARGET
      setState({ running: !done, points: [...points], spins, wins })
      if (!done) frame.current = requestAnimationFrame(step)
    }

    setState({ running: true, points: [], spins: 0, wins: 0 })
    frame.current = requestAnimationFrame(step)
  }

  return { ...state, run, reset }
}

export default function TruthPanel({ variant, bets, results, avgWager }) {
  const edge = houseEdge(variant)
  const convergence = useConvergence(variant)

  const evenMoneyProb = variant === 'european' ? 18 / 37 : 18 / 38

  // Projection uses the live board when there is one, otherwise the session's
  // average wager, so the number means something before the first bet.
  const boardTotal = Object.values(bets).reduce((sum, a) => sum + a, 0)
  const perSpin = boardTotal || avgWager || 0
  const perSpinEdge = boardTotal ? -blendedEv(bets, variant) : edge

  const ranked = useMemo(
    () =>
      SAMPLE_BETS.map((id) => {
        const { label, kind } = decodeBet(id)
        return { id, label, kind, ...betStats(id, variant) }
      }).sort((a, b) => b.stdev - a.stdev),
    [variant],
  )

  // Reference volatility for the projection band. Bets on one board are
  // correlated, so rather than fake a blended sigma this quotes the
  // even-money bet — the tamest thing on the felt — and says so.
  const evenMoneySigma = betStats('red', variant).stdev

  // Empirical answer to "red is due": how often red actually followed red.
  const fallacy = useMemo(() => {
    let after = 0
    let redAfterRed = 0
    for (let i = 1; i < results.length; i++) {
      if (colorOf(results[i - 1]) !== 'red') continue
      after++
      if (colorOf(results[i]) === 'red') redAfterRed++
    }

    let streak = 0
    let streakColor = null
    for (let i = results.length - 1; i >= 0; i--) {
      const c = colorOf(results[i])
      if (c === 'green') break
      if (streakColor === null) streakColor = c
      if (c !== streakColor) break
      streak++
    }

    return { after, redAfterRed, streak, streakColor }
  }, [results])

  return (
    <div className="card-panel border-l-4 border-l-luck-red">
      <p className="text-[0.65rem] uppercase tracking-widest font-mono text-luck-redLight mb-1">
        — The Truth Panel —
      </p>
      <h3 className="font-display text-2xl text-text-primary mb-1">Why the House Always Wins</h3>
      <p className="text-text-secondary text-sm mb-4">
        Every figure below is computed from the same model that runs the wheel — no fitted numbers.
        On this wheel the house edge is{' '}
        <span className="text-luck-gold font-mono">{formatPct(edge)}</span> on every bet offered.
      </p>

      <Row>
        <Heading kicker="Long-run projection">Where this ends up</Heading>
        {perSpin > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[100, 500, 1000].map((n) => (
                <div key={n} className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                  <p className="text-[0.6rem] font-mono text-text-muted">after {n} spins</p>
                  <p className="font-mono text-lg font-bold text-luck-redLight tabular-nums">
                    {formatMoney(-(n * perSpin * perSpinEdge))}
                  </p>
                  <p className="text-[0.6rem] font-mono text-text-muted">
                    ±{formatMoney(perSpin * Math.sqrt(n) * evenMoneySigma)} swing
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[0.7rem] font-mono text-text-muted mt-2">
              At {formatMoney(perSpin)} per spin and a {formatPct(perSpinEdge)} edge. The swing column is
              one standard deviation for an even-money bet at that stake — it is why losing feels like
              variance right up until it isn&apos;t.
            </p>
          </>
        ) : (
          <p className="text-text-muted text-sm font-mono">Place a bet to see the projection.</p>
        )}
      </Row>

      <Row>
        <Heading kicker="Law of large numbers">Watch the win rate converge</Heading>
        <p className="text-text-secondary text-sm mb-3">
          {CONVERGENCE_TARGET.toLocaleString()} simulated red bets, run separately from your session.
          Short runs wander. Long runs do not.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <button
            className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50"
            onClick={convergence.run}
            disabled={convergence.running}
          >
            {convergence.running ? 'Spinning…' : `Run ${CONVERGENCE_TARGET.toLocaleString()} spins`}
          </button>
          {convergence.spins > 0 && (
            <>
              <button className="btn-outline !py-2 !px-4 !text-sm" onClick={convergence.reset}>
                Reset
              </button>
              <span className="font-mono text-sm text-text-secondary">
                {convergence.spins.toLocaleString()} spins ·{' '}
                <span className="text-luck-gold">
                  {formatPct(convergence.wins / convergence.spins)}
                </span>{' '}
                vs theoretical {formatPct(evenMoneyProb)}
              </span>
            </>
          )}
        </div>
        <LineChart
          points={convergence.points}
          baseline={evenMoneyProb}
          baselineLabel={`${formatPct(evenMoneyProb)} theoretical`}
          formatValue={(v) => formatPct(v, 1)}
          emptyMessage="Run the simulation to plot convergence"
        />
      </Row>

      <Row>
        <Heading kicker="Ranked by expected value">Best bet vs worst bet</Heading>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[420px]">
            <thead>
              <tr className="text-text-muted uppercase tracking-widest text-[0.6rem]">
                <th className="text-left pb-2">Bet</th>
                <th className="text-right pb-2">Pays</th>
                <th className="text-right pb-2">Win prob</th>
                <th className="text-right pb-2">EV / unit</th>
                <th className="text-right pb-2">Std dev</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((bet) => (
                <tr key={bet.id} className="border-t border-luck-goldMuted/20">
                  <td className="py-1.5 text-text-primary capitalize">{bet.kind}</td>
                  <td className="py-1.5 text-right text-text-secondary">{bet.payout}:1</td>
                  <td className="py-1.5 text-right text-text-secondary">{formatPct(bet.probability, 1)}</td>
                  <td className="py-1.5 text-right text-luck-redLight">{formatPct(bet.ev)}</td>
                  <td className="py-1.5 text-right text-luck-gold">{bet.stdev.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[0.7rem] font-mono text-text-muted mt-2 leading-relaxed">
          The EV column is identical for every row — {formatPct(-edge)} per unit staked. Nothing on this
          felt is a better bet than anything else. All that changes is the standard deviation: a straight
          number swings ~{ranked[0].stdev.toFixed(1)}× a unit per spin versus{' '}
          {ranked[ranked.length - 1].stdev.toFixed(2)}× for red. You are choosing how fast you find out,
          not whether.
          {variant === 'american' && ' (The one exception on an American wheel is the five-number bet 0-00-1-2-3, which is worse still at −7.89%. It is not offered here.)'}
        </p>
      </Row>

      <Row>
        <Heading kicker="Gambler&apos;s fallacy">Nothing is ever &ldquo;due&rdquo;</Heading>
        {results.length > 1 ? (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Current colour streak</p>
                <p className="font-mono text-lg font-bold text-text-primary">
                  {fallacy.streak > 0 ? `${fallacy.streak} × ${fallacy.streakColor}` : '—'}
                </p>
              </div>
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Red immediately after a red</p>
                <p className="font-mono text-lg font-bold text-luck-gold">
                  {fallacy.after ? `${formatPct(fallacy.redAfterRed / fallacy.after, 1)}` : '—'}
                  <span className="text-text-muted text-xs"> of {fallacy.after}</span>
                </p>
              </div>
            </div>
            <p className="text-[0.7rem] font-mono text-text-muted mt-2 leading-relaxed">
              That second figure is drifting toward {formatPct(evenMoneyProb, 1)} — the same probability
              red has on any other spin. The wheel stores nothing. A streak of{' '}
              {Math.max(fallacy.streak, 1)} changes the next spin by exactly zero.
            </p>
          </>
        ) : (
          <p className="text-text-muted text-sm font-mono">Spin a few times to populate this.</p>
        )}
      </Row>
    </div>
  )
}

import { useState } from 'react'
import LineChart from './LineChart'
import {
  betStats,
  decodeBet,
  formatMoney,
  formatPct,
  simulateMartingale,
  traceMartingale,
} from '../../utils/roulette'

const TRIALS = 2000

const WHAT_IF_BETS = [
  { id: 'red', label: 'Red / Black (1:1)' },
  { id: 'dozen:1', label: 'Dozen (2:1)' },
  { id: 'street:0', label: 'Street (11:1)' },
  { id: 'split:17-20', label: 'Split (17:1)' },
  { id: 'straight:17', label: 'Straight up (35:1)' },
]

const HORIZONS = [100, 500, 1000]

function NumberField({ label, value, onChange, min = 1, step = 1, suffix }) {
  return (
    <label className="block">
      <span className="block text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
          className="w-full bg-felt-950 border border-luck-goldMuted/50 rounded-card px-3 py-2
            font-mono text-sm text-text-primary focus:outline-none focus:border-luck-gold"
        />
        {suffix && <span className="font-mono text-xs text-text-muted">{suffix}</span>}
      </div>
    </label>
  )
}

export default function StrategyLab({ variant, bankroll }) {
  const [martingale, setMartingale] = useState({ stack: Math.round(bankroll) || 500, base: 5, spins: 200 })
  const [result, setResult] = useState(null)
  const [sample, setSample] = useState(null)

  const [whatIf, setWhatIf] = useState({ betId: 'red', size: 25 })

  const runMartingale = () => {
    const config = {
      bankroll: martingale.stack,
      baseBet: martingale.base,
      spins: martingale.spins,
      variant,
    }
    setResult(simulateMartingale({ ...config, trials: TRIALS }))
    setSample(traceMartingale(config))
  }

  const stats = betStats(whatIf.betId, variant)

  return (
    <div className="space-y-6">
      {/* Martingale */}
      <div className="card-panel">
        <p className="text-[0.6rem] uppercase tracking-widest font-mono text-luck-gold mb-1">
          — Strategy lab —
        </p>
        <h3 className="font-display text-xl text-text-primary mb-1">Martingale: double until it works</h3>
        <p className="text-text-secondary text-sm mb-4">
          Bet red, double after every loss, reset after every win. It wins small amounts almost every
          time — which is exactly what makes the rare loss so expensive. {TRIALS.toLocaleString()} trials
          per run.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <NumberField
            label="Bankroll"
            value={martingale.stack}
            onChange={(v) => setMartingale({ ...martingale, stack: v })}
            step={50}
          />
          <NumberField
            label="Base bet"
            value={martingale.base}
            onChange={(v) => setMartingale({ ...martingale, base: v })}
          />
          <NumberField
            label="Spins"
            value={martingale.spins}
            onChange={(v) => setMartingale({ ...martingale, spins: v })}
            step={50}
          />
        </div>

        <button className="btn-primary !py-2 !px-4 !text-sm" onClick={runMartingale}>
          Run {TRIALS.toLocaleString()} trials
        </button>

        {result && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Wiped out</p>
                <p className="font-mono text-lg font-bold text-luck-redLight">
                  {formatPct(result.ruinRate, 1)}
                </p>
                <p className="text-[0.55rem] font-mono text-text-muted">of trials</p>
              </div>
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Avg spins survived</p>
                <p className="font-mono text-lg font-bold text-text-primary">
                  {result.avgSpinsSurvived.toFixed(0)}
                </p>
                <p className="text-[0.55rem] font-mono text-text-muted">of {martingale.spins}</p>
              </div>
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Avg ending stack</p>
                <p
                  className={`font-mono text-lg font-bold ${
                    result.avgEnding >= martingale.stack ? 'text-odds' : 'text-luck-redLight'
                  }`}
                >
                  {formatMoney(result.avgEnding)}
                </p>
                <p className="text-[0.55rem] font-mono text-text-muted">
                  from {formatMoney(martingale.stack)}
                </p>
              </div>
              <div className="bg-felt-950/60 rounded-card p-3 border border-luck-goldMuted/30">
                <p className="text-[0.6rem] font-mono text-text-muted">Largest bet reached</p>
                <p className="font-mono text-lg font-bold text-luck-gold">
                  {formatMoney(result.peakBet)}
                </p>
                <p className="text-[0.55rem] font-mono text-text-muted">from {formatMoney(martingale.base)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-2">
                One sample run
                {sample?.bustedAt != null && (
                  <span className="text-luck-redLight normal-case tracking-normal">
                    {' '}— busted on spin {sample.bustedAt}
                  </span>
                )}
              </p>
              <LineChart
                points={sample?.curve ?? []}
                baseline={martingale.stack}
                baselineLabel="starting stack"
                formatValue={(v) => formatMoney(Math.round(v))}
                emptyMessage="Run the simulation"
              />
            </div>

            <p className="text-[0.7rem] font-mono text-text-muted mt-2 leading-relaxed">
              The staircase up is the strategy working. The cliff is the doubling sequence outrunning the
              bankroll — after {Math.ceil(Math.log2(martingale.stack / martingale.base))} straight losses
              the next bet is unaffordable, and that run of losses is far more likely than it feels.
            </p>
          </>
        )}
      </div>

      {/* What-if projector */}
      <div className="card-panel">
        <h3 className="font-display text-xl text-text-primary mb-1">&ldquo;What if&rdquo; projector</h3>
        <p className="text-text-secondary text-sm mb-4">
          Flat-betting one spot, repeated. Expected loss scales with the number of spins; the swing only
          scales with its square root, so the noise gets relatively smaller and the edge does not.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="block text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1">
              Bet type
            </span>
            <select
              value={whatIf.betId}
              onChange={(e) => setWhatIf({ ...whatIf, betId: e.target.value })}
              className="w-full bg-felt-950 border border-luck-goldMuted/50 rounded-card px-3 py-2
                font-mono text-sm text-text-primary focus:outline-none focus:border-luck-gold"
            >
              {WHAT_IF_BETS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="Stake per spin"
            value={whatIf.size}
            onChange={(v) => setWhatIf({ ...whatIf, size: v })}
            step={5}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[420px]">
            <thead>
              <tr className="text-text-muted uppercase tracking-widest text-[0.6rem]">
                <th className="text-left pb-2">Horizon</th>
                <th className="text-right pb-2">Total staked</th>
                <th className="text-right pb-2">Expected result</th>
                <th className="text-right pb-2">1σ swing</th>
                <th className="text-right pb-2">Chance of profit</th>
              </tr>
            </thead>
            <tbody>
              {HORIZONS.map((n) => {
                const staked = n * whatIf.size
                const expected = n * whatIf.size * stats.ev
                const swing = whatIf.size * stats.stdev * Math.sqrt(n)
                // Normal approximation — fine at these sample sizes for the
                // even-money bets, rough for a straight-up's skewed payout.
                const z = expected / swing
                const chance = 0.5 * (1 - erf(-z / Math.SQRT2))
                return (
                  <tr key={n} className="border-t border-luck-goldMuted/20">
                    <td className="py-1.5 text-text-primary">{n} spins</td>
                    <td className="py-1.5 text-right text-text-secondary">{formatMoney(staked)}</td>
                    <td className="py-1.5 text-right text-luck-redLight">{formatMoney(expected)}</td>
                    <td className="py-1.5 text-right text-luck-gold">±{formatMoney(swing)}</td>
                    <td className="py-1.5 text-right text-text-secondary">{formatPct(chance, 1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[0.7rem] font-mono text-text-muted mt-2 leading-relaxed">
          {decodeBet(whatIf.betId).kind} pays {stats.payout}:1 and lands {formatPct(stats.probability, 1)}{' '}
          of the time — an EV of {formatPct(stats.ev)} per unit, same as everything else on the felt.
          Chance-of-profit uses a normal approximation, which is generous to the high-payout bets.
        </p>
      </div>
    </div>
  )
}

/** Abramowitz & Stegun 7.1.26 — enough precision for a probability readout. */
function erf(x) {
  const sign = Math.sign(x)
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429]
  const p = 0.3275911
  const t = 1 / (1 + p * Math.abs(x))
  const y = 1 - ((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x)
  return sign * y
}

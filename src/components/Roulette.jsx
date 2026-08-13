import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp } from '../utils/motionVariants'
import Wheel from './roulette/Wheel'
import BetBoard from './roulette/BetBoard'
import StatsDashboard from './roulette/StatsDashboard'
import LineChart from './roulette/LineChart'
import HotCold from './roulette/HotCold'
import TruthPanel from './roulette/TruthPanel'
import StrategyLab from './roulette/StrategyLab'
import {
  betStats,
  blendedEv,
  colorOf,
  decodeBet,
  formatMoney,
  formatPct,
  houseEdge,
  settle,
  spinWheel,
} from '../utils/roulette'

const CHIPS = [1, 5, 25, 100, 500]

const SPEEDS = {
  slow: { label: 'Slow', duration: 3.4, gap: 500 },
  fast: { label: 'Fast', duration: 1.2, gap: 250 },
  instant: { label: 'Instant', duration: 0, gap: 40 },
}

const RESULT_COLOR = {
  red: 'bg-luck-red text-text-primary',
  black: 'bg-felt-950 text-text-primary',
  green: 'bg-odds-dim text-felt-950',
}

export default function Roulette() {
  const [variant, setVariant] = useState('american')
  const [startingBankroll, setStartingBankroll] = useState(1000)
  const [chip, setChip] = useState(25)
  const [bets, setBets] = useState({})
  const [lastBets, setLastBets] = useState(null)
  const [history, setHistory] = useState([])
  const [spinning, setSpinning] = useState(false)
  const [pending, setPending] = useState(null)
  const [auto, setAuto] = useState({ on: false, speed: 'fast' })

  // Bankroll is derived rather than stored — with auto-play firing spins back to
  // back, a separate counter and the history could drift out of step.
  const bankroll = useMemo(
    () => history.reduce((sum, h) => sum + h.net, startingBankroll),
    [history, startingBankroll],
  )

  const totalWager = useMemo(
    () => Object.values(bets).reduce((sum, a) => sum + a, 0),
    [bets],
  )

  const stats = useMemo(() => {
    const spins = history.length
    let wins = 0
    let totalWagered = 0
    let netPL = 0
    let longestWin = 0
    let longestLoss = 0
    let runType = null
    let runLength = 0

    for (const h of history) {
      totalWagered += h.wagered
      netPL += h.net
      const type = h.net > 0 ? 'win' : 'loss'
      if (h.net > 0) wins++

      if (type === runType) runLength++
      else {
        runType = type
        runLength = 1
      }
      if (type === 'win') longestWin = Math.max(longestWin, runLength)
      else longestLoss = Math.max(longestLoss, runLength)
    }

    return {
      spins,
      wins,
      winRate: spins ? wins / spins : 0,
      totalWagered,
      netPL,
      roi: totalWagered ? netPL / totalWagered : 0,
      avgWager: spins ? totalWagered / spins : 0,
      currentStreak: { type: runType, length: runLength },
      longestWin,
      longestLoss,
    }
  }, [history])

  const bankrollCurve = useMemo(() => {
    const curve = [startingBankroll]
    let running = startingBankroll
    for (const h of history) {
      running += h.net
      curve.push(running)
    }
    return curve
  }, [history, startingBankroll])

  const counts = useMemo(() => {
    const tally = {}
    for (const h of history) tally[h.pocket] = (tally[h.pocket] || 0) + 1
    return tally
  }, [history])

  const results = useMemo(() => history.map((h) => h.pocket), [history])

  const canSpin = totalWager > 0 && totalWager <= bankroll && !spinning

  const resolve = useCallback(
    (pocket) => {
      const { wagered, returned, net } = settle(bets, pocket)
      setHistory((h) => [...h, { pocket, wagered, returned, net }])
      setLastBets(bets)
      setSpinning(false)
    },
    [bets],
  )

  // The auto-play timer reads these through refs so it always sees the current
  // spin function and bankroll without re-arming on every bet change.
  const latest = useRef({})

  const doSpin = useCallback(() => {
    if (!canSpin) return
    const pocket = spinWheel(variant)

    if (SPEEDS[auto.speed].duration === 0 && auto.on) {
      setPending(pocket)
      resolve(pocket)
      return
    }

    setPending(pocket)
    setSpinning(true)
  }, [canSpin, variant, auto.speed, auto.on, resolve])

  useEffect(() => {
    latest.current = { doSpin, totalWager, bankroll }
  })

  useEffect(() => {
    if (!auto.on || spinning) return

    const timer = setTimeout(() => {
      const { doSpin: spin, totalWager: wager, bankroll: stack } = latest.current
      // Re-check affordability at fire time rather than when the timer was set —
      // the previous spin may have taken the stack below the wager.
      if (wager <= 0 || wager > stack) {
        setAuto((a) => ({ ...a, on: false }))
        return
      }
      spin?.()
    }, SPEEDS[auto.speed].gap)

    return () => clearTimeout(timer)
  }, [auto, spinning, history.length])

  const placeBet = (id) => {
    if (spinning) return
    if (totalWager + chip > bankroll) return
    setBets((b) => ({ ...b, [id]: (b[id] || 0) + chip }))
  }

  const removeBet = (id) => {
    if (spinning) return
    setBets((b) => {
      const next = { ...b }
      const remaining = (next[id] || 0) - chip
      if (remaining > 0) next[id] = remaining
      else delete next[id]
      return next
    })
  }

  const clearBets = () => !spinning && setBets({})

  const repeatBets = () => {
    if (spinning || !lastBets) return
    const total = Object.values(lastBets).reduce((s, a) => s + a, 0)
    if (total <= bankroll) setBets(lastBets)
  }

  const resetSession = () => {
    setAuto((a) => ({ ...a, on: false }))
    setHistory([])
    setBets({})
    setLastBets(null)
    setPending(null)
    setSpinning(false)
  }

  const changeVariant = (next) => {
    if (spinning) return
    setVariant(next)
    resetSession()
  }

  const boardEv = totalWager ? blendedEv(bets, variant) : 0
  const activeBets = Object.entries(bets)

  const lastResult = history.length ? history[history.length - 1] : null
  const busted = bankroll <= 0

  return (
    <div className="section-container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-10"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">
          — Run the Numbers —
        </motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">
          Roulette Simulator
        </motion.h2>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
        <motion.p
          variants={fadeSlideUp}
          className="text-text-secondary max-w-2xl mx-auto mt-4 text-sm"
        >
          A full American and European wheel with live expected-value tracking. Play it as long as you
          like — the interesting part is what the charts do to your bankroll over a few hundred spins.
        </motion.p>
      </motion.div>

      {/* Session setup */}
      <div className="card-panel mb-6">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <span className="block text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1.5">
              Wheel
            </span>
            <div className="flex gap-2">
              {[
                { id: 'american', label: 'American 0/00' },
                { id: 'european', label: 'European 0' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => changeVariant(id)}
                  disabled={spinning}
                  className={`flex-1 px-3 py-2 rounded-card font-mono text-xs border transition-colors
                    disabled:opacity-50 disabled:pointer-events-none
                    ${
                      variant === id
                        ? 'border-luck-gold bg-luck-gold text-felt-950 font-bold'
                        : 'border-luck-goldMuted/50 text-text-secondary hover:border-luck-gold'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[0.6rem] font-mono text-text-muted mt-1.5">
              house edge {formatPct(houseEdge(variant))}
            </p>
          </div>

          <label className="block">
            <span className="block text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1.5">
              Starting bankroll
            </span>
            <input
              type="number"
              min="1"
              step="100"
              value={startingBankroll}
              disabled={spinning || history.length > 0}
              onChange={(e) => setStartingBankroll(Math.max(1, Number(e.target.value) || 1))}
              className="w-full bg-felt-950 border border-luck-goldMuted/50 rounded-card px-3 py-2
                font-mono text-sm text-text-primary focus:outline-none focus:border-luck-gold
                disabled:opacity-60"
            />
            <p className="text-[0.6rem] font-mono text-text-muted mt-1.5">
              {history.length > 0 ? 'reset the session to change' : 'set your own stack'}
            </p>
          </label>

          <div className="flex gap-2">
            <button className="btn-outline !py-2 !px-4 !text-sm flex-1" onClick={resetSession}>
              Reset session
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Wheel + controls */}
        <div className="card-panel space-y-4">
          <Wheel
            variant={variant}
            result={pending}
            spinning={spinning}
            duration={SPEEDS[auto.on ? auto.speed : 'slow'].duration || 1.2}
            onSettled={() => resolve(pending)}
          />

          <div className="text-center">
            <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted">Bankroll</p>
            <p
              className={`font-display text-3xl font-bold tabular-nums ${
                bankroll > startingBankroll
                  ? 'text-odds'
                  : bankroll < startingBankroll
                    ? 'text-luck-redLight'
                    : 'text-luck-gold'
              }`}
            >
              {formatMoney(bankroll)}
            </p>
            {lastResult && !spinning && (
              <p className="font-mono text-xs text-text-secondary mt-1">
                last spin{' '}
                <span className={lastResult.net >= 0 ? 'text-odds' : 'text-luck-redLight'}>
                  {lastResult.net >= 0 ? '+' : ''}
                  {formatMoney(lastResult.net)}
                </span>
              </p>
            )}
          </div>

          {/* Chip selector */}
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1.5">
              Chip size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  className={`w-11 h-11 rounded-full font-mono text-xs font-bold border-2 transition-all
                    ${
                      chip === c
                        ? 'border-luck-gold bg-luck-gold text-felt-950 shadow-neon-gold scale-105'
                        : 'border-luck-goldMuted/60 text-luck-gold hover:border-luck-gold'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn-primary flex-1 !py-2.5 !text-sm disabled:opacity-40 disabled:pointer-events-none"
              onClick={doSpin}
              disabled={!canSpin}
            >
              {spinning ? 'Spinning…' : 'Spin'}
            </button>
            <button
              className="btn-outline !py-2.5 !px-3 !text-sm disabled:opacity-40 disabled:pointer-events-none"
              onClick={clearBets}
              disabled={spinning || !totalWager}
            >
              Clear
            </button>
            <button
              className="btn-outline !py-2.5 !px-3 !text-sm disabled:opacity-40 disabled:pointer-events-none"
              onClick={repeatBets}
              disabled={spinning || !lastBets}
              title="Repeat the last set of bets"
            >
              Repeat
            </button>
          </div>

          {/* Auto-play */}
          <div className="border-t border-luck-goldMuted/25 pt-3">
            <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-1.5">
              Auto-play
            </p>
            <div className="flex gap-1.5 mb-2">
              {Object.entries(SPEEDS).map(([id, { label }]) => (
                <button
                  key={id}
                  onClick={() => setAuto((a) => ({ ...a, speed: id }))}
                  className={`flex-1 px-2 py-1.5 rounded-card font-mono text-[0.65rem] border transition-colors
                    ${
                      auto.speed === id
                        ? 'border-luck-gold text-luck-gold'
                        : 'border-luck-goldMuted/40 text-text-muted hover:border-luck-gold/60'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className={`w-full py-2 rounded-card font-mono text-xs font-bold transition-colors
                disabled:opacity-40 disabled:pointer-events-none
                ${
                  auto.on
                    ? 'bg-luck-red text-text-primary hover:bg-luck-redLight'
                    : 'border border-luck-goldMuted/60 text-luck-gold hover:border-luck-gold'
                }`}
              onClick={() => setAuto((a) => ({ ...a, on: !a.on }))}
              disabled={!auto.on && (!totalWager || totalWager > bankroll)}
            >
              {auto.on ? 'Stop auto-play' : 'Start auto-play'}
            </button>
          </div>

          {busted && (
            <p className="text-center font-mono text-xs text-luck-redLight border border-luck-red/50 rounded-card py-2">
              Bankroll gone. Reset to sit back down.
            </p>
          )}
        </div>

        {/* Board + live EV */}
        <div className="space-y-6">
          <div className="card-panel">
            <BetBoard
              variant={variant}
              bets={bets}
              onPlace={placeBet}
              onRemove={removeBet}
              disabled={spinning}
            />
          </div>

          {/* Live EV readout */}
          <div className="card-panel border-l-4 border-l-luck-gold">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h3 className="font-display text-lg text-text-primary">Expected value, this board</h3>
              <span className="font-mono text-sm">
                <span className="text-text-muted">EV </span>
                <span className={totalWager ? 'text-luck-redLight font-bold' : 'text-text-muted'}>
                  {totalWager ? formatPct(boardEv) : '—'}
                </span>
                {totalWager > 0 && (
                  <span className="text-text-muted">
                    {' '}· {formatMoney(totalWager * boardEv)} per spin
                  </span>
                )}
              </span>
            </div>

            {activeBets.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono min-w-[380px]">
                  <thead>
                    <tr className="text-text-muted uppercase tracking-widest text-[0.6rem]">
                      <th className="text-left pb-2">Bet</th>
                      <th className="text-right pb-2">Stake</th>
                      <th className="text-right pb-2">Pays</th>
                      <th className="text-right pb-2">Win prob</th>
                      <th className="text-right pb-2">EV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBets.map(([id, amount]) => {
                      const { label, kind } = decodeBet(id)
                      const s = betStats(id, variant)
                      return (
                        <tr key={id} className="border-t border-luck-goldMuted/20">
                          <td className="py-1.5 text-text-primary">
                            <span className="text-text-muted capitalize">{kind}</span> {label}
                          </td>
                          <td className="py-1.5 text-right text-luck-gold">{formatMoney(amount)}</td>
                          <td className="py-1.5 text-right text-text-secondary">{s.payout}:1</td>
                          <td className="py-1.5 text-right text-text-secondary">
                            {formatPct(s.probability, 1)}
                          </td>
                          <td className="py-1.5 text-right text-luck-redLight">
                            {formatMoney(amount * s.ev)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-muted text-sm font-mono">
                Place chips on the felt to see the edge on each one.
              </p>
            )}
          </div>

          {/* Recent results */}
          {results.length > 0 && (
            <div className="card-panel">
              <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted mb-2">
                Recent spins
              </p>
              <div className="flex flex-wrap gap-1.5">
                {results.slice(-24).reverse().map((pocket, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-xs
                      font-bold border border-luck-goldMuted/40 ${RESULT_COLOR[colorOf(pocket)]}`}
                  >
                    {pocket}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session statistics */}
      <div className="mt-10 space-y-6">
        <StatsDashboard stats={stats} />

        <div className="card-panel">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="font-display text-lg text-text-primary">Bankroll over time</h3>
            <span className="font-mono text-xs text-text-muted">
              {stats.spins} spins · {formatMoney(startingBankroll)} start
            </span>
          </div>
          <LineChart
            points={bankrollCurve}
            baseline={startingBankroll}
            baselineLabel="starting bankroll"
            formatValue={(v) => formatMoney(Math.round(v))}
            emptyMessage="Spin to start plotting"
          />
        </div>

        <div className="card-panel">
          <h3 className="font-display text-lg text-text-primary mb-3">Hot &amp; cold numbers</h3>
          <HotCold counts={counts} spins={stats.spins} variant={variant} />
        </div>

        <TruthPanel variant={variant} bets={bets} results={results} avgWager={stats.avgWager} />

        <StrategyLab variant={variant} bankroll={startingBankroll} />
      </div>
    </div>
  )
}

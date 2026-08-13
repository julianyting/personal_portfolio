import { formatMoney, formatPct } from '../../utils/roulette'

function StatTile({ label, value, tone = 'neutral', sub }) {
  const toneClass = {
    neutral: 'text-text-primary',
    good: 'text-odds',
    bad: 'text-luck-redLight',
    gold: 'text-luck-gold',
  }[tone]

  return (
    <div className="card-panel !p-4">
      <p className="text-[0.65rem] uppercase tracking-widest font-mono text-text-muted mb-1">
        {label}
      </p>
      <p className={`font-mono text-xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      {sub && <p className="text-[0.65rem] font-mono text-text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default function StatsDashboard({ stats }) {
  const { spins, wins, winRate, netPL, roi, totalWagered, currentStreak, longestWin, longestLoss } = stats

  const plTone = netPL > 0 ? 'good' : netPL < 0 ? 'bad' : 'neutral'
  const streakTone = currentStreak.type === 'win' ? 'good' : currentStreak.type === 'loss' ? 'bad' : 'neutral'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatTile label="Spins" value={spins} sub={`${wins} winning`} tone="gold" />
      <StatTile
        label="Win %"
        value={spins ? formatPct(winRate) : '—'}
        sub="spins with a net gain"
      />
      <StatTile label="Net P&L" value={formatMoney(netPL)} tone={plTone} />
      <StatTile
        label="ROI"
        value={totalWagered ? formatPct(roi) : '—'}
        tone={plTone}
        sub="net ÷ total wagered"
      />
      <StatTile label="Total wagered" value={formatMoney(totalWagered)} />
      <StatTile
        label="Streak"
        value={
          currentStreak.length
            ? `${currentStreak.length} ${currentStreak.type === 'win' ? 'W' : 'L'}`
            : '—'
        }
        tone={streakTone}
        sub={`best ${longestWin}W · worst ${longestLoss}L`}
      />
    </div>
  )
}

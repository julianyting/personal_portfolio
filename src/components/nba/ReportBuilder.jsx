import { useEffect, useMemo, useState } from 'react'
import * as api from '../../utils/nbaApi'
import { Button, DataTable, Field, Panel, Select } from './controls'
import { formatStat } from '../../utils/nbaFormat'

// Values are the SQL column names the API validates against.
const STATS = [
  { value: 'Points', label: 'Points' },
  { value: 'Rebounds', label: 'Rebounds' },
  { value: 'Assists', label: 'Assists' },
  { value: 'Blocks', label: 'Blocks' },
  { value: 'Steals', label: 'Steals' },
  { value: 'Turnovers', label: 'Turnovers' },
  { value: 'MinutesPlayed', label: 'Minutes' },
  { value: 'Fouls', label: 'Fouls' },
]

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']
const LIMITS = ['5', '10', '15', '25', '50']

const POSITION_NAMES = {
  PG: 'point guards',
  SG: 'shooting guards',
  SF: 'small forwards',
  PF: 'power forwards',
  C: 'centers',
}

// The example questions from the project brief, as one-click starting points.
const PRESETS = [
  { label: 'Top 10 by points', query: { stat: 'Points', limit: '10' } },
  {
    label: 'Top 10 point guards by assists',
    query: { stat: 'Assists', position: 'PG', limit: '10' },
  },
  { label: 'Best rim protectors', query: { stat: 'Blocks', position: 'C', limit: '10' } },
  { label: 'West leading scorers', query: { stat: 'Points', conference: 'West', limit: '10' } },
  {
    label: 'Most turnover-prone',
    query: { stat: 'Turnovers', limit: '10', order: 'desc' },
  },
]

const BLANK = {
  stat: 'Points',
  position: '',
  team: '',
  conference: '',
  limit: '10',
  order: 'desc',
}

/** Reads the current filters back as the question they answer. */
function describe({ stat, position, team, conference, limit, order }) {
  const statLabel = STATS.find((s) => s.value === stat)?.label.toLowerCase() ?? stat
  const who = position ? POSITION_NAMES[position] : 'players'
  const where = team ? ` on the ${team}` : conference ? ` in the ${conference}` : ''
  const rank = order === 'asc' ? 'fewest' : 'most'
  return `The ${limit} ${who}${where} with the ${rank} ${statLabel} per game.`
}

/** The query the Flask API runs for these filters, shown for the curious. */
function buildSql({ stat, position, team, conference, limit, order }) {
  const filters = []
  if (team) filters.push(`Team.Name = '${team}'`)
  if (position) filters.push(`Player.Position = '${position}'`)
  if (conference) filters.push(`Team.Conference = '${conference}'`)

  return [
    'SELECT Player.Name, Player.Position, Team.Name AS Team,',
    `       COUNT(*) AS GamesPlayed, AVG(PlayerGameStatistics.${stat}) AS StatValue`,
    'FROM Player',
    'INNER JOIN PlayerGameStatistics',
    '    ON Player.PlayerID = PlayerGameStatistics.PlayerID',
    'LEFT JOIN Team ON Player.TeamID = Team.TeamID',
    filters.length ? `WHERE ${filters.join('\n  AND ')}` : null,
    'GROUP BY Player.PlayerID, Player.Name, Player.Position, Team.Name',
    `ORDER BY StatValue ${order.toUpperCase()}`,
    `LIMIT ${limit};`,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function ReportBuilder({ teams, dataVersion, onSelectPlayer }) {
  const [filters, setFilters] = useState(BLANK)
  const [showSql, setShowSql] = useState(false)

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const queryKey = `${JSON.stringify(filters)}|${dataVersion}`
  const [result, setResult] = useState({ key: null, rows: [], error: null })
  const loading = result.key !== queryKey
  const { rows, error } = result

  useEffect(() => {
    let cancelled = false
    api
      .reportLeaders(filters)
      .then((data) => !cancelled && setResult({ key: queryKey, rows: data, error: null }))
      .catch(
        (err) =>
          !cancelled && setResult({ key: queryKey, rows: [], error: err.message }),
      )
    return () => {
      cancelled = true
    }
  }, [filters, queryKey])

  const columns = useMemo(() => {
    const statLabel = STATS.find((s) => s.value === filters.stat)?.label ?? filters.stat
    return [
      {
        key: 'rank',
        label: '#',
        render: (row) => (
          <span className="font-mono text-text-muted">{rows.indexOf(row) + 1}</span>
        ),
      },
      { key: 'name', label: 'Player' },
      { key: 'position', label: 'Pos' },
      { key: 'team', label: 'Team', render: (r) => r.team ?? '—' },
      { key: 'games_played', label: 'GP', numeric: true },
      {
        key: 'value',
        label: `${statLabel}/G`,
        numeric: true,
        render: (r) => (
          <span className="text-luck-gold font-bold">{formatStat(r.value)}</span>
        ),
      },
    ]
  }, [filters.stat, rows])

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Report builder"
        description="Group every box score by player, average any stat, and filter down to the exact slice you want to see."
      >
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setFilters({ ...BLANK, ...preset.query })}
              className="text-xs font-mono px-3 py-1.5 rounded-full border border-felt-600
                text-text-secondary hover:border-luck-gold hover:text-luck-gold
                transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Rank by">
            <Select value={filters.stat} onChange={set('stat')} options={STATS} />
          </Field>
          <Field label="Position">
            <Select
              value={filters.position}
              onChange={set('position')}
              options={POSITIONS}
              placeholder="All positions"
            />
          </Field>
          <Field label="Team">
            <Select
              value={filters.team}
              onChange={set('team')}
              options={teams.map((t) => t.name)}
              placeholder="All teams"
            />
          </Field>
          <Field label="Conference">
            <Select
              value={filters.conference}
              onChange={set('conference')}
              options={['East', 'West']}
              placeholder="Both conferences"
            />
          </Field>
          <Field label="Show">
            <Select
              value={filters.limit}
              onChange={set('limit')}
              options={LIMITS.map((n) => ({ value: n, label: `Top ${n}` }))}
            />
          </Field>
          <Field label="Order">
            <Select
              value={filters.order}
              onChange={set('order')}
              options={[
                { value: 'desc', label: 'Highest first' },
                { value: 'asc', label: 'Lowest first' },
              ]}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary italic">{describe(filters)}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSql((v) => !v)}>
              {showSql ? 'Hide SQL' : 'Show SQL'}
            </Button>
            <Button variant="outline" onClick={() => setFilters(BLANK)}>
              Reset
            </Button>
          </div>
        </div>

        {showSql && (
          <pre
            className="overflow-x-auto text-xs font-mono bg-felt-950 border border-felt-600
              rounded-card p-4 text-odds leading-relaxed"
          >
            {buildSql(filters)}
          </pre>
        )}
      </Panel>

      <Panel title="Results">
        {error && <p className="text-luck-redLight text-sm font-mono">{error}</p>}
        {loading ? (
          <p className="text-text-muted text-sm font-mono py-6 text-center">Running query…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.player_id}
            onRowClick={(r) => onSelectPlayer(r.player_id)}
            empty="No players match those filters. Only players with a logged box score can appear in a report."
          />
        )}
      </Panel>
    </div>
  )
}

import { useEffect, useState } from 'react'
import * as api from '../../utils/nbaApi'
import { DataTable, Field, Panel, Select, TextInput } from './controls'
import { formatHeight } from '../../utils/nbaFormat'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const COLUMNS = [
  { key: 'name', label: 'Player' },
  { key: 'position', label: 'Pos' },
  { key: 'team', label: 'Team', render: (r) => r.team ?? 'Free agent' },
  { key: 'age', label: 'Age', numeric: true },
  { key: 'height', label: 'Height', numeric: true, render: (r) => formatHeight(r.height) },
  { key: 'weight', label: 'Weight', numeric: true, render: (r) => `${r.weight} lb` },
]

export default function PlayerSearch({ teams, dataVersion, onSelectPlayer }) {
  const [filters, setFilters] = useState({ name: '', position: '', team: '' })

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const queryKey = `${JSON.stringify(filters)}|${dataVersion}`
  const [result, setResult] = useState({ key: null, rows: [], error: null })
  const loading = result.key !== queryKey
  const { rows, error } = result

  // Debounced so typing a name doesn't fire a request per keystroke.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      api
        .searchPlayers(filters)
        .then((data) => !cancelled && setResult({ key: queryKey, rows: data, error: null }))
        .catch(
          (err) =>
            !cancelled && setResult({ key: queryKey, rows: [], error: err.message }),
        )
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters, queryKey])

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Player search"
        description="Search the league by name and narrow by position or team. Select any result to open their game log."
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Name">
            <TextInput
              value={filters.name}
              onChange={set('name')}
              placeholder="e.g. Curry"
              aria-label="Search players by name"
            />
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
        </div>
      </Panel>

      <Panel title={loading ? 'Searching…' : `${rows.length} ${rows.length === 1 ? 'player' : 'players'}`}>
        {error && <p className="text-luck-redLight text-sm font-mono">{error}</p>}
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey={(r) => r.player_id}
          onRowClick={(r) => onSelectPlayer(r.player_id)}
          empty="No players match that search."
        />
      </Panel>
    </div>
  )
}

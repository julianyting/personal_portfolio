import { useEffect, useMemo, useState } from 'react'
import * as api from '../../utils/nbaApi'
import { DataTable, Field, Panel, Select } from './controls'
import { formatHeight, formatMoney } from '../../utils/nbaFormat'

const ROSTER_COLUMNS = [
  { key: 'name', label: 'Player' },
  { key: 'position', label: 'Pos' },
  { key: 'age', label: 'Age', numeric: true },
  { key: 'height', label: 'Height', numeric: true, render: (r) => formatHeight(r.height) },
  { key: 'weight', label: 'Weight', numeric: true, render: (r) => `${r.weight} lb` },
]

/**
 * "What team do you want to display?" — pick one and get its record card, its
 * coach, and the full roster, the three-table join the backend does for /roster.
 */
export default function TeamBrowser({ teams, coaches, dataVersion, onSelectPlayer }) {
  const [picked, setPicked] = useState('Warriors')
  // Contracting a team shouldn't leave the picker pointing at a dead name, so
  // the shown team is derived rather than corrected after the fact.
  const teamName =
    !teams.length || teams.some((t) => t.name === picked) ? picked : teams[0].name

  // The result carries the query that produced it, so "still loading" is a
  // comparison rather than a second state update.
  const queryKey = `${teamName}|${dataVersion}`
  const [result, setResult] = useState({ key: null, rows: [], error: null })
  const loading = result.key !== queryKey

  useEffect(() => {
    let cancelled = false
    api
      .teamRoster(teamName)
      .then((rows) => !cancelled && setResult({ key: queryKey, rows, error: null }))
      .catch(
        (err) =>
          !cancelled && setResult({ key: queryKey, rows: [], error: err.message }),
      )
    return () => {
      cancelled = true
    }
  }, [teamName, queryKey])

  const { rows: roster, error } = result

  const team = useMemo(() => teams.find((t) => t.name === teamName), [teams, teamName])
  const coach = useMemo(
    () => coaches.find((c) => c.team === teamName),
    [coaches, teamName],
  )

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Team rosters"
        description="Pick a franchise to pull its roster, coach, and divisional record card straight out of the database."
      >
        <div className="sm:max-w-xs">
          <Field label="Display team">
            <Select
              value={teamName}
              onChange={(e) => setPicked(e.target.value)}
              options={teams.map((t) => ({
                value: t.name,
                label: `${t.city} ${t.name}`,
              }))}
            />
          </Field>
        </div>

        {team && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['City', team.city],
              ['Division', team.division],
              ['Conference', team.conference],
              ['Roster size', loading ? '…' : roster.length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-felt-900 border border-felt-600 rounded-card px-3 py-2"
              >
                <p className="text-[0.6rem] uppercase tracking-widest font-mono text-text-muted">
                  {label}
                </p>
                <p className="font-mono text-sm text-text-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}

        {coach && (
          <p className="text-sm text-text-secondary">
            <span className="text-[0.65rem] uppercase tracking-widest font-mono text-text-muted mr-2">
              Head coach
            </span>
            <span className="text-luck-gold font-medium">{coach.name}</span>
            <span className="text-text-muted font-mono text-xs ml-2">
              {formatMoney(coach.salary)}
            </span>
          </p>
        )}
      </Panel>

      <Panel
        title={`${teamName} roster`}
        description="Select a player to open their game log and season averages."
      >
        {error && <p className="text-luck-redLight text-sm font-mono">{error}</p>}
        {loading ? (
          <p className="text-text-muted text-sm font-mono py-6 text-center">Loading…</p>
        ) : (
          <DataTable
            columns={ROSTER_COLUMNS}
            rows={roster}
            rowKey={(r) => r.player_id}
            onRowClick={(r) => onSelectPlayer(r.player_id)}
            empty="No players on this roster yet."
          />
        )}
      </Panel>
    </div>
  )
}

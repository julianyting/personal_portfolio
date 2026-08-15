import { useEffect, useState } from 'react'
import * as api from '../../utils/nbaApi'
import useWriter from './useWriter'
import {
  Button,
  DangerButton,
  DataTable,
  DateInput,
  Field,
  NumberInput,
  Notice,
  Panel,
  Select,
  TextInput,
} from './controls'

const GAME_EDIT_COLUMNS = [
  { value: 'HomeScore', label: 'Home score' },
  { value: 'AwayScore', label: 'Away score' },
  { value: 'Location', label: 'Venue' },
  { value: 'Date', label: 'Date' },
]

const STAT_EDIT_COLUMNS = [
  { value: 'Points', label: 'Points' },
  { value: 'Rebounds', label: 'Rebounds' },
  { value: 'Assists', label: 'Assists' },
  { value: 'Blocks', label: 'Blocks' },
  { value: 'Steals', label: 'Steals' },
  { value: 'Turnovers', label: 'Turnovers' },
  { value: 'MinutesPlayed', label: 'Minutes' },
  { value: 'Fouls', label: 'Fouls' },
]

const BLANK_GAME = {
  date: '',
  location: '',
  home_team_id: '',
  away_team_id: '',
  home_score: '',
  away_score: '',
}

const BLANK_LINE = {
  game_id: '',
  player_id: '',
  points: '',
  rebounds: '',
  assists: '',
  blocks: '',
  steals: '',
  turnovers: '',
  minutes_played: '',
  fouls: '',
}

const SCHEDULE_COLUMNS = [
  { key: 'date', label: 'Date' },
  {
    key: 'matchup',
    label: 'Matchup',
    render: (g) => `${g.away_team ?? '?'} @ ${g.home_team ?? '?'}`,
  },
  { key: 'location', label: 'Venue' },
  {
    key: 'score',
    label: 'Final',
    numeric: true,
    render: (g) => `${g.away_score}–${g.home_score}`,
  },
]

/** Results and box scores — the Game and PlayerGameStatistics tables. */
export default function ManageGames({ teams, dataVersion, onMutate }) {
  const [games, setGames] = useState([])
  const [players, setPlayers] = useState([])
  const [newGame, setNewGame] = useState(BLANK_GAME)
  const [gameEdit, setGameEdit] = useState({ game_id: '', column: 'HomeScore', new_value: '' })
  const [removeId, setRemoveId] = useState('')
  const [line, setLine] = useState(BLANK_LINE)
  const [lineEdit, setLineEdit] = useState({
    game_id: '',
    player_id: '',
    column: 'Points',
    new_value: '',
  })

  const addGame = useWriter(onMutate)
  const editGame = useWriter(onMutate)
  const removeGame = useWriter(onMutate)
  const logLine = useWriter(onMutate)
  const editLine = useWriter(onMutate)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.listGames(), api.searchPlayers({})])
      .then(([g, p]) => {
        if (!cancelled) {
          setGames(g)
          setPlayers(p)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [dataVersion])

  const teamOptions = teams.map((t) => ({
    value: String(t.team_id),
    label: `${t.city} ${t.name}`,
  }))
  const gameOptions = games.map((g) => ({
    value: String(g.game_id),
    label: `${g.date} · ${g.away_team ?? '?'} @ ${g.home_team ?? '?'}`,
  }))
  const playerOptions = players.map((p) => ({
    value: String(p.player_id),
    label: `${p.name} — ${p.team ?? 'Free agent'}`,
  }))

  const gameLabel = (id) =>
    gameOptions.find((g) => g.value === String(id))?.label ?? 'that game'

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Schedule" description="Every game currently on record.">
        <DataTable
          columns={SCHEDULE_COLUMNS}
          rows={games}
          rowKey={(g) => g.game_id}
          empty="No games on the schedule."
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel
          title="Record a game result"
          description="Log a completed game between two teams."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date">
              <DateInput
                value={newGame.date}
                onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
              />
            </Field>
            <Field label="Venue">
              <TextInput
                value={newGame.location}
                onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
                placeholder="e.g. Chase Center"
              />
            </Field>
            <Field label="Home team">
              <Select
                value={newGame.home_team_id}
                onChange={(e) => setNewGame({ ...newGame, home_team_id: e.target.value })}
                options={teamOptions}
                placeholder="Select a team"
              />
            </Field>
            <Field label="Away team">
              <Select
                value={newGame.away_team_id}
                onChange={(e) => setNewGame({ ...newGame, away_team_id: e.target.value })}
                options={teamOptions}
                placeholder="Select a team"
              />
            </Field>
            <Field label="Home score">
              <NumberInput
                value={newGame.home_score}
                onChange={(e) => setNewGame({ ...newGame, home_score: e.target.value })}
                min="0"
              />
            </Field>
            <Field label="Away score">
              <NumberInput
                value={newGame.away_score}
                onChange={(e) => setNewGame({ ...newGame, away_score: e.target.value })}
                min="0"
              />
            </Field>
          </div>
          <Notice notice={addGame.notice} />
          <div>
            <Button
              disabled={addGame.busy}
              onClick={() =>
                addGame.run(() => api.addGame(newGame), 'Game recorded.', () =>
                  setNewGame(BLANK_GAME),
                )
              }
            >
              {addGame.busy ? 'Recording…' : 'Record game'}
            </Button>
          </div>
        </Panel>

        <Panel
          title="Correct or remove a result"
          description="Fix a score that was entered wrong, or drop the game entirely along with its box scores."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Game">
              <Select
                value={gameEdit.game_id}
                onChange={(e) => setGameEdit({ ...gameEdit, game_id: e.target.value })}
                options={gameOptions}
                placeholder="Select a game"
              />
            </Field>
            <Field label="Column">
              <Select
                value={gameEdit.column}
                onChange={(e) =>
                  setGameEdit({ ...gameEdit, column: e.target.value, new_value: '' })
                }
                options={GAME_EDIT_COLUMNS}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="New value">
                {gameEdit.column === 'Date' ? (
                  <DateInput
                    value={gameEdit.new_value}
                    onChange={(e) => setGameEdit({ ...gameEdit, new_value: e.target.value })}
                  />
                ) : gameEdit.column === 'Location' ? (
                  <TextInput
                    value={gameEdit.new_value}
                    onChange={(e) => setGameEdit({ ...gameEdit, new_value: e.target.value })}
                  />
                ) : (
                  <NumberInput
                    value={gameEdit.new_value}
                    onChange={(e) => setGameEdit({ ...gameEdit, new_value: e.target.value })}
                    min="0"
                  />
                )}
              </Field>
            </div>
          </div>
          <Notice notice={editGame.notice} />
          <div>
            <Button
              disabled={editGame.busy}
              onClick={() =>
                editGame.run(
                  () => api.updateGame(gameEdit),
                  `Updated ${gameEdit.column}.`,
                  () => setGameEdit({ ...gameEdit, new_value: '' }),
                )
              }
            >
              {editGame.busy ? 'Saving…' : 'Save change'}
            </Button>
          </div>

          <div className="border-t border-felt-600 pt-4 flex flex-col gap-3">
            <Field label="Delete a game">
              <Select
                value={removeId}
                onChange={(e) => setRemoveId(e.target.value)}
                options={gameOptions}
                placeholder="Select a game"
              />
            </Field>
            <Notice notice={removeGame.notice} />
            <div>
              <DangerButton
                disabled={removeGame.busy || !removeId}
                onClick={() => {
                  const label = gameLabel(removeId)
                  removeGame.run(
                    () => api.deleteGame(removeId),
                    `Deleted ${label}.`,
                    () => setRemoveId(''),
                  )
                }}
              >
                {removeGame.busy ? 'Deleting…' : 'Delete game'}
              </DangerButton>
            </div>
          </div>
        </Panel>

        <Panel
          title="Log a box score"
          description="Record one player's line for one game. (GameID, PlayerID) is the primary key, so a player can only have one line per game."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Game">
              <Select
                value={line.game_id}
                onChange={(e) => setLine({ ...line, game_id: e.target.value })}
                options={gameOptions}
                placeholder="Select a game"
              />
            </Field>
            <Field label="Player">
              <Select
                value={line.player_id}
                onChange={(e) => setLine({ ...line, player_id: e.target.value })}
                options={playerOptions}
                placeholder="Select a player"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['points', 'PTS'],
              ['rebounds', 'REB'],
              ['assists', 'AST'],
              ['blocks', 'BLK'],
              ['steals', 'STL'],
              ['turnovers', 'TO'],
              ['minutes_played', 'MIN'],
              ['fouls', 'PF'],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <NumberInput
                  value={line[key]}
                  onChange={(e) => setLine({ ...line, [key]: e.target.value })}
                  min="0"
                  placeholder="0"
                />
              </Field>
            ))}
          </div>
          <Notice notice={logLine.notice} />
          <div>
            <Button
              disabled={logLine.busy}
              onClick={() =>
                logLine.run(() => api.logPlayerGame(line), 'Box score logged.', () =>
                  setLine(BLANK_LINE),
                )
              }
            >
              {logLine.busy ? 'Logging…' : 'Log box score'}
            </Button>
          </div>
        </Panel>

        <Panel
          title="Correct a box score"
          description="Change a single stat on a line that's already recorded — the averages in every report recompute from it."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Game">
              <Select
                value={lineEdit.game_id}
                onChange={(e) => setLineEdit({ ...lineEdit, game_id: e.target.value })}
                options={gameOptions}
                placeholder="Select a game"
              />
            </Field>
            <Field label="Player">
              <Select
                value={lineEdit.player_id}
                onChange={(e) => setLineEdit({ ...lineEdit, player_id: e.target.value })}
                options={playerOptions}
                placeholder="Select a player"
              />
            </Field>
            <Field label="Stat">
              <Select
                value={lineEdit.column}
                onChange={(e) => setLineEdit({ ...lineEdit, column: e.target.value })}
                options={STAT_EDIT_COLUMNS}
              />
            </Field>
            <Field label="New value">
              <NumberInput
                value={lineEdit.new_value}
                onChange={(e) => setLineEdit({ ...lineEdit, new_value: e.target.value })}
                min="0"
              />
            </Field>
          </div>
          <Notice notice={editLine.notice} />
          <div>
            <Button
              disabled={editLine.busy}
              onClick={() =>
                editLine.run(
                  () => api.updatePlayerGame(lineEdit),
                  `Updated ${lineEdit.column}.`,
                  () => setLineEdit({ ...lineEdit, new_value: '' }),
                )
              }
            >
              {editLine.busy ? 'Saving…' : 'Save change'}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}

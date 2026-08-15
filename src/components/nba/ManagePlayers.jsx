import { useEffect, useState } from 'react'
import * as api from '../../utils/nbaApi'
import useWriter from './useWriter'
import {
  Button,
  DangerButton,
  Field,
  NumberInput,
  Notice,
  Panel,
  Select,
  TextInput,
} from './controls'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

// Label / SQL column pairs the API's allowlist accepts for Player.
const EDITABLE = [
  { value: 'Name', label: 'Name' },
  { value: 'Position', label: 'Position' },
  { value: 'Age', label: 'Age' },
  { value: 'Height', label: 'Height (inches)' },
  { value: 'Weight', label: 'Weight (lb)' },
]

const BLANK_PLAYER = {
  name: '',
  position: 'PG',
  age: '',
  height: '',
  weight: '',
  team_id: '',
}

/** Draft, edit, trade, and cut players — the Player half of the CRUD. */
export default function ManagePlayers({ teams, dataVersion, onMutate }) {
  const [players, setPlayers] = useState([])
  const [draft, setDraft] = useState(BLANK_PLAYER)
  const [edit, setEdit] = useState({ player_id: '', column: 'Name', new_value: '' })
  const [trade, setTrade] = useState({ player_id: '', team_id: '' })
  const [cutId, setCutId] = useState('')

  const add = useWriter(onMutate)
  const update = useWriter(onMutate)
  const move = useWriter(onMutate)
  const cut = useWriter(onMutate)

  useEffect(() => {
    let cancelled = false
    api
      .searchPlayers({})
      .then((rows) => !cancelled && setPlayers(rows))
      .catch(() => !cancelled && setPlayers([]))
    return () => {
      cancelled = true
    }
  }, [dataVersion])

  // The full league is 150+ names, so these pickers list everyone the search
  // returned rather than making the user remember an ID.
  const playerOptions = players.map((p) => ({
    value: String(p.player_id),
    label: `${p.name} — ${p.team ?? 'Free agent'}`,
  }))
  const teamOptions = teams.map((t) => ({
    value: String(t.team_id),
    label: `${t.city} ${t.name}`,
  }))

  const selectedName = (id) =>
    players.find((p) => String(p.player_id) === String(id))?.name ?? 'that player'

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel
        title="Sign a player"
        description="Add a new player to a roster — a draft pick or a free-agent signing."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <TextInput
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Cooper Flagg"
            />
          </Field>
          <Field label="Team">
            <Select
              value={draft.team_id}
              onChange={(e) => setDraft({ ...draft, team_id: e.target.value })}
              options={teamOptions}
              placeholder="Select a team"
            />
          </Field>
          <Field label="Position">
            <Select
              value={draft.position}
              onChange={(e) => setDraft({ ...draft, position: e.target.value })}
              options={POSITIONS}
            />
          </Field>
          <Field label="Age">
            <NumberInput
              value={draft.age}
              onChange={(e) => setDraft({ ...draft, age: e.target.value })}
              min="16"
              max="50"
            />
          </Field>
          <Field label="Height" hint="in inches — 79 is 6'7&quot;">
            <NumberInput
              value={draft.height}
              onChange={(e) => setDraft({ ...draft, height: e.target.value })}
              min="60"
              max="96"
            />
          </Field>
          <Field label="Weight" hint="in pounds">
            <NumberInput
              value={draft.weight}
              onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
              min="100"
              max="400"
            />
          </Field>
        </div>
        <Notice notice={add.notice} />
        <div>
          <Button
            disabled={add.busy}
            onClick={() =>
              add.run(
                () => api.addPlayer(draft),
                `Signed ${draft.name || 'the player'}.`,
                () => setDraft(BLANK_PLAYER),
              )
            }
          >
            {add.busy ? 'Signing…' : 'Sign player'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Update a player"
        description="Change one attribute — a listed height, an age, or a name, the way Ron Artest became Metta World Peace."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Player">
            <Select
              value={edit.player_id}
              onChange={(e) => setEdit({ ...edit, player_id: e.target.value })}
              options={playerOptions}
              placeholder="Select a player"
            />
          </Field>
          <Field label="Column">
            <Select
              value={edit.column}
              onChange={(e) => setEdit({ ...edit, column: e.target.value })}
              options={EDITABLE}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="New value">
              {edit.column === 'Position' ? (
                <Select
                  value={edit.new_value}
                  onChange={(e) => setEdit({ ...edit, new_value: e.target.value })}
                  options={POSITIONS}
                  placeholder="Select a position"
                />
              ) : edit.column === 'Name' ? (
                <TextInput
                  value={edit.new_value}
                  onChange={(e) => setEdit({ ...edit, new_value: e.target.value })}
                />
              ) : (
                <NumberInput
                  value={edit.new_value}
                  onChange={(e) => setEdit({ ...edit, new_value: e.target.value })}
                />
              )}
            </Field>
          </div>
        </div>
        <Notice notice={update.notice} />
        <div>
          <Button
            disabled={update.busy}
            onClick={() =>
              update.run(
                () => api.updatePlayer(edit),
                `Updated ${edit.column} for ${selectedName(edit.player_id)}.`,
                () => setEdit({ ...edit, new_value: '' }),
              )
            }
          >
            {update.busy ? 'Saving…' : 'Save change'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Trade a player"
        description="Move a player to another franchise. One UPDATE against the foreign key that links a player to their team."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Player">
            <Select
              value={trade.player_id}
              onChange={(e) => setTrade({ ...trade, player_id: e.target.value })}
              options={playerOptions}
              placeholder="Select a player"
            />
          </Field>
          <Field label="New team">
            <Select
              value={trade.team_id}
              onChange={(e) => setTrade({ ...trade, team_id: e.target.value })}
              options={teamOptions}
              placeholder="Select a team"
            />
          </Field>
        </div>
        <Notice notice={move.notice} />
        <div>
          <Button
            disabled={move.busy}
            onClick={() =>
              move.run(
                () => api.tradePlayer(trade),
                `Traded ${selectedName(trade.player_id)}.`,
                () => setTrade({ player_id: '', team_id: '' }),
              )
            }
          >
            {move.busy ? 'Processing…' : 'Complete trade'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Cut a player"
        description="Release a player from the league. Their box scores are deleted first, or the foreign key would block the removal."
      >
        <Field label="Player">
          <Select
            value={cutId}
            onChange={(e) => setCutId(e.target.value)}
            options={playerOptions}
            placeholder="Select a player"
          />
        </Field>
        <Notice notice={cut.notice} />
        <div>
          <DangerButton
            disabled={cut.busy || !cutId}
            onClick={() => {
              const name = selectedName(cutId)
              cut.run(() => api.deletePlayer(cutId), `Released ${name}.`, () => setCutId(''))
            }}
          >
            {cut.busy ? 'Releasing…' : 'Release player'}
          </DangerButton>
        </div>
      </Panel>
    </div>
  )
}

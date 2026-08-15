import { useState } from 'react'
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
import { formatMoney } from '../../utils/nbaFormat'

const DIVISIONS = {
  East: ['Atlantic', 'Central', 'Southeast'],
  West: ['Northwest', 'Pacific', 'Southwest'],
}

const TEAM_COLUMNS = [
  { value: 'Name', label: 'Name' },
  { value: 'City', label: 'City' },
  { value: 'Division', label: 'Division' },
  { value: 'Conference', label: 'Conference' },
]

const COACH_COLUMNS = [
  { value: 'Name', label: 'Name' },
  { value: 'Salary', label: 'Salary' },
]

const BLANK_TEAM = { name: '', city: '', conference: 'East', division: 'Atlantic' }
const BLANK_COACH = { name: '', salary: '', team_id: '' }

/** Expansion, relocation, contraction — plus hiring and firing the head coach. */
export default function ManageFranchise({ teams, coaches, onMutate }) {
  const [newTeam, setNewTeam] = useState(BLANK_TEAM)
  const [teamEdit, setTeamEdit] = useState({ team_id: '', column: 'Name', new_value: '' })
  const [foldId, setFoldId] = useState('')
  const [newCoach, setNewCoach] = useState(BLANK_COACH)
  const [coachEdit, setCoachEdit] = useState({ coach_id: '', column: 'Salary', new_value: '' })
  const [fireId, setFireId] = useState('')

  const addTeam = useWriter(onMutate)
  const editTeam = useWriter(onMutate)
  const fold = useWriter(onMutate)
  const hire = useWriter(onMutate)
  const editCoach = useWriter(onMutate)
  const fire = useWriter(onMutate)

  // Conference and division have to stay consistent, so switching conference
  // falls back to that conference's first division rather than keeping an
  // impossible pairing until an effect corrects it.
  const divisions = DIVISIONS[newTeam.conference]
  const division = divisions.includes(newTeam.division) ? newTeam.division : divisions[0]

  const teamOptions = teams.map((t) => ({
    value: String(t.team_id),
    label: `${t.city} ${t.name}`,
  }))
  const coachOptions = coaches.map((c) => ({
    value: String(c.coach_id),
    label: `${c.name} — ${c.team ?? 'Unassigned'}`,
  }))

  const teamName = (id) => {
    const team = teams.find((t) => String(t.team_id) === String(id))
    return team ? `${team.city} ${team.name}` : 'that team'
  }
  const coachName = (id) =>
    coaches.find((c) => String(c.coach_id) === String(id))?.name ?? 'that coach'

  // Which field the team-edit form should show depends on the chosen column.
  const teamEditControl = () => {
    if (teamEdit.column === 'Conference') {
      return (
        <Select
          value={teamEdit.new_value}
          onChange={(e) => setTeamEdit({ ...teamEdit, new_value: e.target.value })}
          options={['East', 'West']}
          placeholder="Select a conference"
        />
      )
    }
    if (teamEdit.column === 'Division') {
      return (
        <Select
          value={teamEdit.new_value}
          onChange={(e) => setTeamEdit({ ...teamEdit, new_value: e.target.value })}
          options={[...DIVISIONS.East, ...DIVISIONS.West]}
          placeholder="Select a division"
        />
      )
    }
    return (
      <TextInput
        value={teamEdit.new_value}
        onChange={(e) => setTeamEdit({ ...teamEdit, new_value: e.target.value })}
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel
        title="Add an expansion team"
        description="Grow the league with a new franchise, the way Seattle keeps almost getting one back."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Team name">
            <TextInput
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="e.g. Sonics"
            />
          </Field>
          <Field label="City">
            <TextInput
              value={newTeam.city}
              onChange={(e) => setNewTeam({ ...newTeam, city: e.target.value })}
              placeholder="e.g. Seattle"
            />
          </Field>
          <Field label="Conference">
            <Select
              value={newTeam.conference}
              onChange={(e) => setNewTeam({ ...newTeam, conference: e.target.value })}
              options={['East', 'West']}
            />
          </Field>
          <Field label="Division">
            <Select
              value={division}
              onChange={(e) => setNewTeam({ ...newTeam, division: e.target.value })}
              options={divisions}
            />
          </Field>
        </div>
        <Notice notice={addTeam.notice} />
        <div>
          <Button
            disabled={addTeam.busy}
            onClick={() =>
              addTeam.run(
                () => api.addTeam({ ...newTeam, division }),
                `Added the ${newTeam.city} ${newTeam.name}.`,
                () => setNewTeam(BLANK_TEAM),
              )
            }
          >
            {addTeam.busy ? 'Adding…' : 'Add team'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Update a team"
        description="Rename or relocate a franchise, or move it between divisions."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Team">
            <Select
              value={teamEdit.team_id}
              onChange={(e) => setTeamEdit({ ...teamEdit, team_id: e.target.value })}
              options={teamOptions}
              placeholder="Select a team"
            />
          </Field>
          <Field label="Column">
            <Select
              value={teamEdit.column}
              onChange={(e) =>
                setTeamEdit({ ...teamEdit, column: e.target.value, new_value: '' })
              }
              options={TEAM_COLUMNS}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="New value">{teamEditControl()}</Field>
          </div>
        </div>
        <Notice notice={editTeam.notice} />
        <div>
          <Button
            disabled={editTeam.busy}
            onClick={() =>
              editTeam.run(
                () => api.updateTeam(teamEdit),
                `Updated ${teamEdit.column} for ${teamName(teamEdit.team_id)}.`,
                () => setTeamEdit({ ...teamEdit, new_value: '' }),
              )
            }
          >
            {editTeam.busy ? 'Saving…' : 'Save change'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Hire a coach"
        description="Assign a head coach to a franchise."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Coach name">
            <TextInput
              value={newCoach.name}
              onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })}
              placeholder="e.g. Sam Cassell"
            />
          </Field>
          <Field label="Team">
            <Select
              value={newCoach.team_id}
              onChange={(e) => setNewCoach({ ...newCoach, team_id: e.target.value })}
              options={teamOptions}
              placeholder="Select a team"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Salary"
              hint={newCoach.salary ? formatMoney(Number(newCoach.salary)) : 'per year, in dollars'}
            >
              <NumberInput
                value={newCoach.salary}
                onChange={(e) => setNewCoach({ ...newCoach, salary: e.target.value })}
                min="0"
                step="100000"
              />
            </Field>
          </div>
        </div>
        <Notice notice={hire.notice} />
        <div>
          <Button
            disabled={hire.busy}
            onClick={() =>
              hire.run(
                () => api.addCoach(newCoach),
                `Hired ${newCoach.name || 'the coach'}.`,
                () => setNewCoach(BLANK_COACH),
              )
            }
          >
            {hire.busy ? 'Hiring…' : 'Hire coach'}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Give a coach a raise — or fire them"
        description="Nothing in the NBA turns over faster than the head coaching seat."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Coach">
            <Select
              value={coachEdit.coach_id}
              onChange={(e) => setCoachEdit({ ...coachEdit, coach_id: e.target.value })}
              options={coachOptions}
              placeholder="Select a coach"
            />
          </Field>
          <Field label="Column">
            <Select
              value={coachEdit.column}
              onChange={(e) =>
                setCoachEdit({ ...coachEdit, column: e.target.value, new_value: '' })
              }
              options={COACH_COLUMNS}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="New value">
              {coachEdit.column === 'Salary' ? (
                <NumberInput
                  value={coachEdit.new_value}
                  onChange={(e) => setCoachEdit({ ...coachEdit, new_value: e.target.value })}
                  min="0"
                  step="100000"
                />
              ) : (
                <TextInput
                  value={coachEdit.new_value}
                  onChange={(e) => setCoachEdit({ ...coachEdit, new_value: e.target.value })}
                />
              )}
            </Field>
          </div>
        </div>
        <Notice notice={editCoach.notice} />
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={editCoach.busy}
            onClick={() =>
              editCoach.run(
                () => api.updateCoach(coachEdit),
                `Updated ${coachName(coachEdit.coach_id)}.`,
                () => setCoachEdit({ ...coachEdit, new_value: '' }),
              )
            }
          >
            {editCoach.busy ? 'Saving…' : 'Save change'}
          </Button>
        </div>

        <div className="border-t border-felt-600 pt-4 flex flex-col gap-3">
          <Field label="Fire a coach">
            <Select
              value={fireId}
              onChange={(e) => setFireId(e.target.value)}
              options={coachOptions}
              placeholder="Select a coach"
            />
          </Field>
          <Notice notice={fire.notice} />
          <div>
            <DangerButton
              disabled={fire.busy || !fireId}
              onClick={() => {
                const name = coachName(fireId)
                fire.run(() => api.deleteCoach(fireId), `Fired ${name}.`, () => setFireId(''))
              }}
            >
              {fire.busy ? 'Firing…' : 'Fire coach'}
            </DangerButton>
          </div>
        </div>
      </Panel>

      <Panel
        title="Contract a team"
        description="Remove a franchise from the league. The database refuses while players, a coach, or games still reference it — a foreign key doing its job."
      >
        <Field label="Team">
          <Select
            value={foldId}
            onChange={(e) => setFoldId(e.target.value)}
            options={teamOptions}
            placeholder="Select a team"
          />
        </Field>
        <Notice notice={fold.notice} />
        <div>
          <DangerButton
            disabled={fold.busy || !foldId}
            onClick={() => {
              const name = teamName(foldId)
              fold.run(() => api.deleteTeam(foldId), `Removed the ${name}.`, () => setFoldId(''))
            }}
          >
            {fold.busy ? 'Removing…' : 'Remove team'}
          </DangerButton>
        </div>
      </Panel>
    </div>
  )
}

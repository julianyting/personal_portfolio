// An in-browser stand-in for the Flask + MySQL backend.
//
// Every function here mirrors one endpoint in NBA_web_app_backend/app.py and
// returns the same shape, so nbaApi.js can swap between the two without the UI
// knowing which one answered. Joins, GROUP BY averages and foreign-key refusals
// are all reproduced by hand — the point is that the offline site behaves like
// the real database, including the errors.
//
// Mutations live in module state: they persist while the tab is open and reset
// on reload, which is the honest behaviour for a demo nobody should be able to
// vandalise permanently.

import {
  teams as seedTeams,
  coaches as seedCoaches,
  players as seedPlayers,
  games as seedGames,
  playerGameStatistics as seedStats,
} from './nbaData'

// ---------- session state ----------

const clone = (rows) => rows.map((row) => ({ ...row }))

let teams = clone(seedTeams)
let coaches = clone(seedCoaches)
let players = clone(seedPlayers)
let games = clone(seedGames)
let stats = clone(seedStats)

// Auto-increment counters start past the highest seeded id, like the dump's
// AUTO_INCREMENT values do.
const nextId = (rows, key) => rows.reduce((max, row) => Math.max(max, row[key]), 0) + 1

export function resetDatabase() {
  teams = clone(seedTeams)
  coaches = clone(seedCoaches)
  players = clone(seedPlayers)
  games = clone(seedGames)
  stats = clone(seedStats)
}

// ---------- shared helpers ----------

// The API speaks SQL column names ("Points"); the local rows use JS keys.
const STAT_KEY = {
  Points: 'points',
  Rebounds: 'rebounds',
  Assists: 'assists',
  Blocks: 'blocks',
  Steals: 'steals',
  Turnovers: 'turnovers',
  MinutesPlayed: 'minutesPlayed',
  Fouls: 'fouls',
}

const PLAYER_KEY = {
  Name: 'name',
  Height: 'height',
  Weight: 'weight',
  Age: 'age',
  Position: 'position',
  TeamID: 'teamId',
}

const TEAM_KEY = {
  Name: 'name',
  City: 'city',
  Division: 'division',
  Conference: 'conference',
}

const COACH_KEY = {
  Name: 'name',
  Salary: 'salary',
  TeamID: 'teamId',
}

const GAME_KEY = {
  Date: 'date',
  Location: 'location',
  HomeTeamID: 'homeTeamId',
  AwayTeamID: 'awayTeamId',
  HomeScore: 'homeScore',
  AwayScore: 'awayScore',
}

// Columns that hold integers, so string form values get coerced on write.
const NUMERIC_KEYS = new Set([
  'height', 'weight', 'age', 'teamId', 'salary',
  'homeTeamId', 'awayTeamId', 'homeScore', 'awayScore',
])

/** Mirrors the API's 4xx responses — the UI shows `message` either way. */
export class LocalDbError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'LocalDbError'
    this.status = status
  }
}

const teamById = (id) => teams.find((t) => t.teamId === id)
const playerById = (id) => players.find((p) => p.playerId === id)

const mean = (values) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0

function requireFields(data, fields) {
  const missing = fields.filter((f) => data[f] === undefined || data[f] === '')
  if (missing.length) {
    throw new LocalDbError(`Missing fields: ${missing.join(', ')}`)
  }
}

function resolveColumn(column, map, entity) {
  const key = map[column]
  if (!key) throw new LocalDbError(`Invalid column '${column}' for ${entity}`)
  return key
}

function coerce(key, value) {
  if (!NUMERIC_KEYS.has(key)) return value
  const n = Number(value)
  if (Number.isNaN(n)) throw new LocalDbError(`${key} must be a number`)
  return n
}

// ---------- reads ----------

export function listTeams() {
  return [...teams]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      team_id: t.teamId,
      name: t.name,
      city: t.city,
      division: t.division,
      conference: t.conference,
    }))
}

export function listCoaches() {
  return [...coaches]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      coach_id: c.coachId,
      name: c.name,
      salary: c.salary,
      team_id: c.teamId,
      team: teamById(c.teamId)?.name ?? null,
    }))
}

export function listGames() {
  return [...games]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((g) => ({
      game_id: g.gameId,
      date: g.date,
      location: g.location,
      home_team_id: g.homeTeamId,
      home_team: teamById(g.homeTeamId)?.name ?? null,
      away_team_id: g.awayTeamId,
      away_team: teamById(g.awayTeamId)?.name ?? null,
      home_score: g.homeScore,
      away_score: g.awayScore,
    }))
}

export function teamRoster(teamName) {
  if (!teamName) throw new LocalDbError('team_name is required')
  const team = teams.find((t) => t.name === teamName)
  if (!team) return []
  return players
    .filter((p) => p.teamId === team.teamId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      player_id: p.playerId,
      name: p.name,
      position: p.position,
      age: p.age,
      height: p.height,
      weight: p.weight,
    }))
}

export function searchPlayers({ name = '', position, team } = {}) {
  const needle = name.toLowerCase()
  return players
    .filter((p) => p.name.toLowerCase().includes(needle))
    .filter((p) => !position || p.position === position)
    .filter((p) => !team || teamById(p.teamId)?.name === team)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 100)
    .map((p) => ({
      player_id: p.playerId,
      name: p.name,
      height: p.height,
      weight: p.weight,
      age: p.age,
      position: p.position,
      team_id: p.teamId,
      team: teamById(p.teamId)?.name ?? null,
    }))
}

export function playerDetail(playerId) {
  const player = playerById(Number(playerId))
  if (!player) throw new LocalDbError('Player not found', 404)

  const rows = stats.filter((s) => s.playerId === player.playerId)

  const gameLog = rows
    .map((s) => {
      const game = games.find((g) => g.gameId === s.gameId)
      return {
        game_id: s.gameId,
        date: game?.date ?? null,
        location: game?.location ?? null,
        points: s.points,
        rebounds: s.rebounds,
        assists: s.assists,
        blocks: s.blocks,
        steals: s.steals,
        turnovers: s.turnovers,
        minutes_played: s.minutesPlayed,
        fouls: s.fouls,
      }
    })
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

  return {
    profile: {
      player_id: player.playerId,
      name: player.name,
      height: player.height,
      weight: player.weight,
      age: player.age,
      position: player.position,
      team_id: player.teamId,
      team: teamById(player.teamId)?.name ?? null,
    },
    game_log: gameLog,
    averages: {
      games_played: rows.length,
      points: mean(rows.map((s) => s.points)),
      rebounds: mean(rows.map((s) => s.rebounds)),
      assists: mean(rows.map((s) => s.assists)),
      blocks: mean(rows.map((s) => s.blocks)),
      steals: mean(rows.map((s) => s.steals)),
      turnovers: mean(rows.map((s) => s.turnovers)),
      minutes_played: mean(rows.map((s) => s.minutesPlayed)),
      fouls: mean(rows.map((s) => s.fouls)),
    },
  }
}

/**
 * The report builder: the GROUP BY / AVG / ORDER BY / LIMIT pipeline that
 * answers "top 10 point guards by assists" in one pass.
 */
export function reportLeaders({
  stat = 'Points',
  position,
  team,
  conference,
  division,
  limit = 10,
  order = 'desc',
} = {}) {
  const key = STAT_KEY[stat]
  if (!key) throw new LocalDbError(`Invalid column '${stat}'`)

  const capped = Math.max(1, Math.min(Number(limit) || 10, 100))
  const direction = order === 'asc' ? 1 : -1

  // INNER JOIN Player <-> PlayerGameStatistics: only players with box scores.
  const byPlayer = new Map()
  for (const row of stats) {
    const player = playerById(row.playerId)
    if (!player) continue
    if (!byPlayer.has(player.playerId)) byPlayer.set(player.playerId, [])
    byPlayer.get(player.playerId).push(row)
  }

  return [...byPlayer.entries()]
    .map(([playerId, rows]) => {
      const player = playerById(playerId)
      const playerTeam = teamById(player.teamId)
      return {
        player_id: playerId,
        name: player.name,
        position: player.position,
        team: playerTeam?.name ?? null,
        conference: playerTeam?.conference ?? null,
        division: playerTeam?.division ?? null,
        games_played: rows.length,
        value: mean(rows.map((r) => r[key])),
        stat,
      }
    })
    .filter((r) => !position || r.position === position)
    .filter((r) => !team || r.team === team)
    .filter((r) => !conference || r.conference === conference)
    .filter((r) => !division || r.division === division)
    .sort((a, b) => (a.value - b.value) * direction)
    .slice(0, capped)
    // `division` was only carried this far to filter on; the API doesn't return it.
    .map((row) => ({
      player_id: row.player_id,
      name: row.name,
      position: row.position,
      team: row.team,
      conference: row.conference,
      games_played: row.games_played,
      value: row.value,
      stat: row.stat,
    }))
}

export function conferenceLeaders() {
  return reportLeaders({ stat: 'Points', limit: 100 })
    .filter((r) => r.conference)
    .map((r) => ({ conference: r.conference, name: r.name, avg_points: r.value }))
    .sort(
      (a, b) =>
        a.conference.localeCompare(b.conference) || b.avg_points - a.avg_points,
    )
}

// The three fixed leaderboards the original API shipped with.
export const topPoints = () =>
  reportLeaders({ stat: 'Points' }).map((r) => ({
    player_id: r.player_id, name: r.name, avg_points: r.value,
  }))

export const topAssists = () =>
  reportLeaders({ stat: 'Assists' }).map((r) => ({
    player_id: r.player_id, name: r.name, avg_assists: r.value,
  }))

export const topRebounds = () =>
  reportLeaders({ stat: 'Rebounds' }).map((r) => ({
    player_id: r.player_id, name: r.name, avg_rebounds: r.value,
  }))

// ---------- writes ----------

export function addTeam(data) {
  requireFields(data, ['name', 'city', 'division', 'conference'])
  const team = {
    teamId: nextId(teams, 'teamId'),
    name: data.name,
    city: data.city,
    division: data.division,
    conference: data.conference,
  }
  teams = [...teams, team]
  return { status: 'ok' }
}

export function updateTeam({ team_id, column, new_value }) {
  requireFields({ team_id, column, new_value }, ['team_id', 'column', 'new_value'])
  const key = resolveColumn(column, TEAM_KEY, 'Team')
  const team = teamById(Number(team_id))
  if (!team) throw new LocalDbError('Team not found', 404)
  team[key] = coerce(key, new_value)
  return { status: 'ok' }
}

export function deleteTeam(teamId) {
  const id = Number(teamId)
  // Mirrors the FK constraints that stop MySQL deleting a team in use.
  if (players.some((p) => p.teamId === id)) {
    throw new LocalDbError(
      'Cannot delete a team while players are still on its roster — trade them away first.',
      409,
    )
  }
  if (coaches.some((c) => c.teamId === id)) {
    throw new LocalDbError('Cannot delete a team that still has a coach.', 409)
  }
  if (games.some((g) => g.homeTeamId === id || g.awayTeamId === id)) {
    throw new LocalDbError('Cannot delete a team that has games on record.', 409)
  }
  teams = teams.filter((t) => t.teamId !== id)
  return { status: 'ok' }
}

export function addPlayer(data) {
  requireFields(data, ['name', 'height', 'weight', 'age', 'position', 'team_id'])
  if (!teamById(Number(data.team_id))) {
    throw new LocalDbError('That team does not exist.', 409)
  }
  players = [...players, {
    playerId: nextId(players, 'playerId'),
    name: data.name,
    height: Number(data.height),
    weight: Number(data.weight),
    age: Number(data.age),
    position: data.position,
    teamId: Number(data.team_id),
  }]
  return { status: 'ok' }
}

export function updatePlayer({ player_id, column, new_value }) {
  requireFields({ player_id, column, new_value }, ['player_id', 'column', 'new_value'])
  const key = resolveColumn(column, PLAYER_KEY, 'Player')
  const player = playerById(Number(player_id))
  if (!player) throw new LocalDbError('Player not found', 404)
  if (key === 'teamId' && !teamById(Number(new_value))) {
    throw new LocalDbError('That team does not exist.', 409)
  }
  player[key] = coerce(key, new_value)
  return { status: 'ok' }
}

export function deletePlayer(playerId) {
  const id = Number(playerId)
  // Box scores go first, exactly as the endpoint does it.
  stats = stats.filter((s) => s.playerId !== id)
  players = players.filter((p) => p.playerId !== id)
  return { status: 'ok' }
}

export function tradePlayer({ player_id, team_id }) {
  requireFields({ player_id, team_id }, ['player_id', 'team_id'])
  const player = playerById(Number(player_id))
  if (!player) throw new LocalDbError('Player not found', 404)
  if (!teamById(Number(team_id))) throw new LocalDbError('That team does not exist.', 409)
  player.teamId = Number(team_id)
  return { status: 'ok' }
}

export function addCoach(data) {
  requireFields(data, ['name', 'salary', 'team_id'])
  if (!teamById(Number(data.team_id))) {
    throw new LocalDbError('That team does not exist.', 409)
  }
  coaches = [...coaches, {
    coachId: nextId(coaches, 'coachId'),
    name: data.name,
    salary: Number(data.salary),
    teamId: Number(data.team_id),
  }]
  return { status: 'ok' }
}

export function updateCoach({ coach_id, column, new_value }) {
  requireFields({ coach_id, column, new_value }, ['coach_id', 'column', 'new_value'])
  const key = resolveColumn(column, COACH_KEY, 'Coach')
  const coach = coaches.find((c) => c.coachId === Number(coach_id))
  if (!coach) throw new LocalDbError('Coach not found', 404)
  coach[key] = coerce(key, new_value)
  return { status: 'ok' }
}

export function deleteCoach(coachId) {
  coaches = coaches.filter((c) => c.coachId !== Number(coachId))
  return { status: 'ok' }
}

export function addGame(data) {
  requireFields(data, [
    'date', 'location', 'home_team_id', 'away_team_id', 'home_score', 'away_score',
  ])
  for (const id of [data.home_team_id, data.away_team_id]) {
    if (!teamById(Number(id))) throw new LocalDbError('That team does not exist.', 409)
  }
  games = [...games, {
    gameId: nextId(games, 'gameId'),
    date: data.date,
    location: data.location,
    homeTeamId: Number(data.home_team_id),
    awayTeamId: Number(data.away_team_id),
    homeScore: Number(data.home_score),
    awayScore: Number(data.away_score),
  }]
  return { status: 'ok' }
}

export function updateGame({ game_id, column, new_value }) {
  requireFields({ game_id, column, new_value }, ['game_id', 'column', 'new_value'])
  const key = resolveColumn(column, GAME_KEY, 'Game')
  const game = games.find((g) => g.gameId === Number(game_id))
  if (!game) throw new LocalDbError('Game not found', 404)
  game[key] = coerce(key, new_value)
  return { status: 'ok' }
}

export function deleteGame(gameId) {
  const id = Number(gameId)
  stats = stats.filter((s) => s.gameId !== id)
  games = games.filter((g) => g.gameId !== id)
  return { status: 'ok' }
}

export function logPlayerGame(data) {
  requireFields(data, ['game_id', 'player_id', 'points', 'rebounds', 'assists'])
  const gameId = Number(data.game_id)
  const playerId = Number(data.player_id)

  if (!games.some((g) => g.gameId === gameId)) {
    throw new LocalDbError('That game does not exist.', 409)
  }
  if (!playerById(playerId)) throw new LocalDbError('That player does not exist.', 409)
  // (GameID, PlayerID) is the composite primary key.
  if (stats.some((s) => s.gameId === gameId && s.playerId === playerId)) {
    throw new LocalDbError('That player already has a box score for this game.', 409)
  }

  stats = [...stats, {
    gameId,
    playerId,
    points: Number(data.points),
    rebounds: Number(data.rebounds),
    assists: Number(data.assists),
    blocks: Number(data.blocks ?? 0),
    steals: Number(data.steals ?? 0),
    turnovers: Number(data.turnovers ?? 0),
    minutesPlayed: Number(data.minutes_played ?? 0),
    fouls: Number(data.fouls ?? 0),
  }]
  return { status: 'ok' }
}

export function updatePlayerGame({ game_id, player_id, column, new_value }) {
  requireFields(
    { game_id, player_id, column, new_value },
    ['game_id', 'player_id', 'column', 'new_value'],
  )
  const key = resolveColumn(column, STAT_KEY, 'PlayerGameStatistics')
  const row = stats.find(
    (s) => s.gameId === Number(game_id) && s.playerId === Number(player_id),
  )
  if (!row) throw new LocalDbError('No box score for that player in that game.', 404)
  const value = Number(new_value)
  if (Number.isNaN(value)) throw new LocalDbError(`${column} must be a number`)
  row[key] = value
  return { status: 'ok' }
}

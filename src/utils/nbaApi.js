// The single data layer the NBA UI talks to.
//
// Set VITE_API_URL and every call goes to the real Flask backend over HTTP:
//
//   VITE_API_URL=http://localhost:5000 npm run dev
//
// Leave it unset — as the deployed portfolio does — and the identical calls are
// served by nbaLocalDb.js from the seed data. Both paths return the same shapes
// and throw errors with the same messages, so no component knows the difference.

import * as local from './nbaLocalDb'

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

/** True when this session is wired to the Flask API rather than seed data. */
export const isLive = Boolean(BASE)

export { LocalDbError } from './nbaLocalDb'
export { resetDatabase } from './nbaLocalDb'

/** Errors carry `status` whichever backend produced them. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function http(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
    })
  } catch {
    throw new ApiError(
      `Could not reach the API at ${BASE}. Is the Flask server running?`,
      0,
    )
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Request failed (${response.status})`, response.status)
  }
  return payload
}

/** Drop empty params so the backend treats them as "no filter". */
function query(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

// Run the local engine but keep the async contract, and normalise its errors
// so callers only ever catch ApiError.
async function offline(fn) {
  try {
    return fn()
  } catch (err) {
    throw new ApiError(err.message, err.status ?? 400)
  }
}

const json = (body) => ({ body: JSON.stringify(body) })

// ---------- reads ----------

export const listTeams = () =>
  BASE ? http('/api/teams') : offline(() => local.listTeams())

export const listCoaches = () =>
  BASE ? http('/api/coaches') : offline(() => local.listCoaches())

export const listGames = () =>
  BASE ? http('/api/games') : offline(() => local.listGames())

export const teamRoster = (teamName) =>
  BASE
    ? http(`/api/team/roster${query({ team_name: teamName })}`)
    : offline(() => local.teamRoster(teamName))

export const searchPlayers = (filters = {}) =>
  BASE
    ? http(`/api/player/search${query(filters)}`)
    : offline(() => local.searchPlayers(filters))

export const playerDetail = (playerId) =>
  BASE
    ? http(`/api/player/${playerId}`)
    : offline(() => local.playerDetail(playerId))

export const reportLeaders = (options = {}) =>
  BASE
    ? http(`/api/reports/leaders${query(options)}`)
    : offline(() => local.reportLeaders(options))

export const conferenceLeaders = () =>
  BASE
    ? http('/api/reports/conference-leaders')
    : offline(() => local.conferenceLeaders())

// ---------- writes ----------

export const addTeam = (data) =>
  BASE
    ? http('/api/team', { method: 'POST', ...json(data) })
    : offline(() => local.addTeam(data))

export const updateTeam = (data) =>
  BASE
    ? http('/api/team', { method: 'PUT', ...json(data) })
    : offline(() => local.updateTeam(data))

export const deleteTeam = (teamId) =>
  BASE
    ? http(`/api/team${query({ team_id: teamId })}`, { method: 'DELETE' })
    : offline(() => local.deleteTeam(teamId))

export const addPlayer = (data) =>
  BASE
    ? http('/api/player', { method: 'POST', ...json(data) })
    : offline(() => local.addPlayer(data))

export const updatePlayer = (data) =>
  BASE
    ? http('/api/player', { method: 'PUT', ...json(data) })
    : offline(() => local.updatePlayer(data))

export const deletePlayer = (playerId) =>
  BASE
    ? http(`/api/player${query({ player_id: playerId })}`, { method: 'DELETE' })
    : offline(() => local.deletePlayer(playerId))

export const tradePlayer = (data) =>
  BASE
    ? http('/api/player/trade', { method: 'POST', ...json(data) })
    : offline(() => local.tradePlayer(data))

export const addCoach = (data) =>
  BASE
    ? http('/api/coach', { method: 'POST', ...json(data) })
    : offline(() => local.addCoach(data))

export const updateCoach = (data) =>
  BASE
    ? http('/api/coach', { method: 'PUT', ...json(data) })
    : offline(() => local.updateCoach(data))

export const deleteCoach = (coachId) =>
  BASE
    ? http(`/api/coach${query({ coach_id: coachId })}`, { method: 'DELETE' })
    : offline(() => local.deleteCoach(coachId))

export const addGame = (data) =>
  BASE
    ? http('/api/game', { method: 'POST', ...json(data) })
    : offline(() => local.addGame(data))

export const updateGame = (data) =>
  BASE
    ? http('/api/game', { method: 'PUT', ...json(data) })
    : offline(() => local.updateGame(data))

export const deleteGame = (gameId) =>
  BASE
    ? http(`/api/game${query({ game_id: gameId })}`, { method: 'DELETE' })
    : offline(() => local.deleteGame(gameId))

export const logPlayerGame = (data) =>
  BASE
    ? http('/api/player/log-game', { method: 'POST', ...json(data) })
    : offline(() => local.logPlayerGame(data))

export const updatePlayerGame = (data) =>
  BASE
    ? http('/api/player/log-game', { method: 'PUT', ...json(data) })
    : offline(() => local.updatePlayerGame(data))

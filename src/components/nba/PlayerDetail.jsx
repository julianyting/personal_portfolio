import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import * as api from '../../utils/nbaApi'
import { DataTable, StatTile } from './controls'
import { formatHeight, formatStat } from '../../utils/nbaFormat'

const GAME_COLUMNS = [
  { key: 'date', label: 'Date', render: (r) => r.date ?? '—' },
  { key: 'location', label: 'Venue', render: (r) => r.location ?? '—' },
  { key: 'points', label: 'PTS', numeric: true },
  { key: 'rebounds', label: 'REB', numeric: true },
  { key: 'assists', label: 'AST', numeric: true },
  { key: 'blocks', label: 'BLK', numeric: true },
  { key: 'steals', label: 'STL', numeric: true },
  { key: 'turnovers', label: 'TO', numeric: true },
  { key: 'minutes_played', label: 'MIN', numeric: true },
  { key: 'fouls', label: 'PF', numeric: true },
]

/**
 * Overlay for one player: profile, season averages, and every box score.
 * Opened from the roster, the report table, or search — hence a shared overlay
 * rather than something nested inside any one tab.
 */
export default function PlayerDetail({ playerId, dataVersion, onClose }) {
  // Keyed by the request it answers, so opening a second player clears the
  // first one's numbers without a separate state reset.
  const queryKey = `${playerId}|${dataVersion}`
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const { data, error } = result.key === queryKey ? result : { data: null, error: null }

  useEffect(() => {
    if (!playerId) return undefined
    let cancelled = false
    api
      .playerDetail(playerId)
      .then((detail) => !cancelled && setResult({ key: queryKey, data: detail, error: null }))
      .catch(
        (err) =>
          !cancelled && setResult({ key: queryKey, data: null, error: err.message }),
      )
    return () => {
      cancelled = true
    }
  }, [playerId, queryKey])

  // Escape closes, and the page behind shouldn't scroll while this is up.
  useEffect(() => {
    if (!playerId) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [playerId, onClose])

  return (
    <AnimatePresence>
      {playerId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-felt-950/80 backdrop-blur-sm
            flex items-start sm:items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Player details"
            className="card-panel w-full max-w-4xl my-auto flex flex-col gap-5 relative"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close player details"
              className="absolute top-4 right-4 text-text-muted hover:text-luck-gold
                transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            {error && <p className="text-luck-redLight text-sm font-mono">{error}</p>}
            {!data && !error && (
              <p className="text-text-muted text-sm font-mono py-10 text-center">Loading…</p>
            )}

            {data && (
              <>
                <div className="pr-8">
                  <h3 className="font-display text-2xl text-luck-goldLight font-semibold">
                    {data.profile.name}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1 font-mono">
                    {data.profile.position} · {data.profile.team ?? 'Free agent'} ·{' '}
                    {formatHeight(data.profile.height)} · {data.profile.weight} lb · age{' '}
                    {data.profile.age}
                  </p>
                </div>

                <div>
                  <p className="text-[0.65rem] uppercase tracking-widest font-mono text-text-muted mb-2">
                    Season averages — {data.averages.games_played}{' '}
                    {data.averages.games_played === 1 ? 'game' : 'games'}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    <StatTile label="PTS" value={formatStat(data.averages.points)} tone="gold" />
                    <StatTile label="REB" value={formatStat(data.averages.rebounds)} />
                    <StatTile label="AST" value={formatStat(data.averages.assists)} />
                    <StatTile label="BLK" value={formatStat(data.averages.blocks)} />
                    <StatTile label="STL" value={formatStat(data.averages.steals)} />
                    <StatTile label="TO" value={formatStat(data.averages.turnovers)} />
                    <StatTile label="MIN" value={formatStat(data.averages.minutes_played)} />
                    <StatTile label="PF" value={formatStat(data.averages.fouls)} />
                  </div>
                </div>

                <div>
                  <p className="text-[0.65rem] uppercase tracking-widest font-mono text-text-muted mb-2">
                    Game log
                  </p>
                  <DataTable
                    columns={GAME_COLUMNS}
                    rows={data.game_log}
                    rowKey={(r) => r.game_id}
                    empty="No box scores logged for this player yet."
                  />
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

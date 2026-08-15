import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDatabase, FiRefreshCw } from 'react-icons/fi'
import { staggerContainer, fadeSlideUp } from '../utils/motionVariants'
import * as api from '../utils/nbaApi'
import TeamBrowser from './nba/TeamBrowser'
import ReportBuilder from './nba/ReportBuilder'
import PlayerSearch from './nba/PlayerSearch'
import PlayerDetail from './nba/PlayerDetail'
import ManagePlayers from './nba/ManagePlayers'
import ManageFranchise from './nba/ManageFranchise'
import ManageGames from './nba/ManageGames'
import { Button } from './nba/controls'

const TABS = [
  { id: 'rosters', label: 'Rosters' },
  { id: 'reports', label: 'Reports' },
  { id: 'search', label: 'Player search' },
  { id: 'manage', label: 'Manage data' },
]

const MANAGE_TABS = [
  { id: 'players', label: 'Players' },
  { id: 'franchise', label: 'Teams & coaches' },
  { id: 'games', label: 'Games & box scores' },
]

function TabButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium rounded-card transition-colors cursor-pointer
        border ${
          active
            ? 'bg-luck-gold text-felt-950 border-luck-gold font-semibold'
            : 'border-felt-600 text-text-secondary hover:border-luck-gold hover:text-luck-gold'
        }`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function NBA() {
  const [tab, setTab] = useState('rosters')
  const [manageTab, setManageTab] = useState('players')
  const [teams, setTeams] = useState([])
  const [coaches, setCoaches] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [loadError, setLoadError] = useState(null)

  // Bumped after every write so each tab refetches instead of showing a
  // roster that a trade in another tab already changed.
  const [dataVersion, setDataVersion] = useState(0)
  const onMutate = useCallback(() => setDataVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([api.listTeams(), api.listCoaches()])
      .then(([t, c]) => {
        if (cancelled) return
        setTeams(t)
        setCoaches(c)
        setLoadError(null)
      })
      .catch((err) => !cancelled && setLoadError(err.message))
    return () => {
      cancelled = true
    }
  }, [dataVersion])

  const reset = () => {
    api.resetDatabase()
    onMutate()
  }

  const shared = { teams, coaches, dataVersion, onMutate }

  return (
    <div className="section-container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center mb-10"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">
          — Full Stack · MySQL · Flask —
        </motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">
          NBA Database
        </motion.h2>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4 mb-6" />
        <motion.p
          variants={fadeSlideUp}
          className="text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          A relational database of {teams.length} teams, their coaches, rosters, games, and
          box scores — with the joins, aggregations, and full CRUD that a league office
          would actually need. Browse it, query it, and change it.
        </motion.p>
      </motion.div>

      {/* Which backend answered, stated plainly rather than implied. */}
      <div
        className="card-panel !p-4 mb-8 flex flex-wrap items-center justify-between gap-3
          text-sm"
      >
        <p className="flex items-center gap-2 text-text-secondary">
          <FiDatabase size={15} className="text-luck-gold shrink-0" />
          {api.isLive ? (
            <span>
              Connected to the <span className="text-luck-gold">Flask API</span> — every
              query and write hits MySQL.
            </span>
          ) : (
            <span>
              Running on the <span className="text-luck-gold">seeded dataset</span> in your
              browser. Edits are real for this session and reset on reload.
            </span>
          )}
        </p>
        {!api.isLive && (
          <Button variant="outline" onClick={reset} className="shrink-0">
            <span className="flex items-center gap-2">
              <FiRefreshCw size={14} />
              Reset data
            </span>
          </Button>
        )}
      </div>

      {loadError && (
        <p className="text-luck-redLight text-sm font-mono mb-6 text-center">{loadError}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      {tab === 'rosters' && (
        <TeamBrowser {...shared} onSelectPlayer={setSelectedPlayer} />
      )}
      {tab === 'reports' && (
        <ReportBuilder {...shared} onSelectPlayer={setSelectedPlayer} />
      )}
      {tab === 'search' && <PlayerSearch {...shared} onSelectPlayer={setSelectedPlayer} />}

      {tab === 'manage' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {MANAGE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setManageTab(t.id)}
                className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors
                  cursor-pointer ${
                    manageTab === t.id
                      ? 'border-luck-gold text-luck-gold'
                      : 'border-felt-600 text-text-secondary hover:border-luck-gold hover:text-luck-gold'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {manageTab === 'players' && <ManagePlayers {...shared} />}
          {manageTab === 'franchise' && <ManageFranchise {...shared} />}
          {manageTab === 'games' && <ManageGames {...shared} />}
        </div>
      )}

      <PlayerDetail
        playerId={selectedPlayer}
        dataVersion={dataVersion}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}

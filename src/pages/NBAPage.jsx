import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import NBA from '../components/NBA'
import Footer from '../components/Footer'

export default function NBAPage() {
  const navigate = useNavigate()

  // Arriving from a card halfway down the home page, start at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Returning drops you back at the Projects grid you clicked out of.
  const goBack = () => navigate('/', { state: { scrollTo: 'projects' } })

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-40 bg-felt-950/90 backdrop-blur-md
          border-b border-luck-goldMuted/40"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-text-secondary hover:text-luck-gold
              transition-colors text-sm font-medium group"
          >
            <FiArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to portfolio
          </button>

          <button
            onClick={goBack}
            className="font-display text-2xl font-bold text-luck-gold
              hover:text-luck-goldLight transition-colors"
            aria-label="Back to portfolio"
          >
            JT
          </button>
        </div>
      </header>

      <main className="flex-1">
        <NBA />
      </main>

      <Footer />
    </div>
  )
}

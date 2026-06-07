import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValue, useTransform } from 'framer-motion'
import useScrollSpy from '../hooks/useScrollSpy'

const NAV_LINKS = ['about', 'skills', 'projects', 'experience', 'contact']

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const activeId = useScrollSpy(['hero', ...NAV_LINKS])

  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-felt-950">
        <motion.div
          className="h-full bg-luck-gold"
          style={{ width: progressWidth }}
        />
      </div>

      <nav
        className={`fixed top-0.5 left-0 w-full z-40 transition-shadow duration-300
          bg-felt-950/90 backdrop-blur-md border-b border-luck-goldMuted/40
          ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className="font-display text-2xl font-bold text-luck-gold hover:text-luck-goldLight transition-colors"
          >
            JT
          </button>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((id) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className="relative group text-sm font-medium capitalize transition-colors duration-200
                    text-text-secondary hover:text-luck-gold"
                >
                  <span className={activeId === id ? 'text-luck-gold' : ''}>
                    {id}
                  </span>
                  {/* Active indicator dot */}
                  {activeId === id && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-odds"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-luck-gold transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-luck-gold transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-luck-gold transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-felt-950/95 border-t border-luck-goldMuted/30"
            >
              <ul className="flex flex-col py-4">
                {NAV_LINKS.map((id) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className={`w-full text-left px-6 py-3 capitalize text-sm font-medium transition-colors
                        ${activeId === id ? 'text-luck-gold' : 'text-text-secondary hover:text-luck-gold'}`}
                    >
                      {id}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

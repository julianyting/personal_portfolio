import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp } from '../utils/motionVariants'

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-felt-gradient">
      {/* Mahjong tile cultural texture */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="text-[32rem] opacity-[0.03] leading-none">🀄</span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-20 left-6 w-12 h-12 border-t-2 border-l-2 border-luck-goldMuted/40" aria-hidden="true" />
      <div className="absolute top-20 right-6 w-12 h-12 border-t-2 border-r-2 border-luck-goldMuted/40" aria-hidden="true" />
      <div className="absolute bottom-12 left-6 w-12 h-12 border-b-2 border-l-2 border-luck-goldMuted/40" aria-hidden="true" />
      <div className="absolute bottom-12 right-6 w-12 h-12 border-b-2 border-r-2 border-luck-goldMuted/40" aria-hidden="true" />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-5"
        >
          {/* Eyebrow */}
          <motion.p variants={fadeSlideUp} className="font-mono text-odds text-sm tracking-wider">
            &lt; Data Science Student /&gt;
          </motion.p>

          {/* Name */}
          <motion.h1 variants={fadeSlideUp} className="font-display text-6xl md:text-8xl font-bold leading-tight">
            Julian{' '}
            <span className="text-gold-shimmer">Ting</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeSlideUp} className="text-text-secondary text-lg md:text-xl max-w-xl">
            Chapman University &nbsp;·&nbsp; Poker & Probability &nbsp;·&nbsp; Sports Analytics
          </motion.p>

          {/* Taiwanese heritage line */}
          <motion.p variants={fadeSlideUp} className="text-text-muted text-sm font-mono">
            台灣的心 · 美國的夢 · 資料科學的道路
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeSlideUp} className="flex flex-wrap gap-4 justify-center mt-2">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Projects
            </button>
            <a
              href="#"
              className="btn-outline"
              onClick={(e) => e.preventDefault()}
            >
              Download Resume
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-text-muted text-xs font-mono tracking-widest">SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="w-0.5 h-6 bg-luck-goldMuted/60 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  )
}

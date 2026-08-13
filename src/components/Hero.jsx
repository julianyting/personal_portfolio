import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp } from '../utils/motionVariants'
import shanghaiBund from '../assets/shanghai-bund.jpg'
import nightOut from '../assets/night-out.jpg'
import warriorsGame from '../assets/warriors-game.jpg'
import friendsOut from '../assets/friends-out.jpg'
import themePark from '../assets/theme-park.jpg'
import shengJianBao from '../assets/sheng-jian-bao.jpg'

const gallery = [
  { src: shanghaiBund,   alt: 'Julian on the Bund waterfront in Shanghai at night' },
  { src: warriorsGame,   alt: 'Julian in a Warriors jersey at a Golden State game' },
  { src: shengJianBao,   alt: 'A basket of sheng jian bao' },
  { src: friendsOut,     alt: 'Julian out with friends on a sunny afternoon' },
  { src: themePark,      alt: 'Julian and friends packed into a theme park ride' },
  { src: nightOut,       alt: 'Julian and a friend at a night out' },
]

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-felt-gradient py-28">
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
            
          </motion.p>

          {/* Name */}
          <motion.h1 variants={fadeSlideUp} className="font-display text-6xl md:text-8xl font-bold leading-tight">
            Julian{' '}
            <span className="text-gold-shimmer">Ting</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeSlideUp} className="text-text-secondary text-lg md:text-xl max-w-xl">
            Data Science student at Chapman University
          </motion.p>

          {/* Taiwanese heritage line */}
          <motion.p variants={fadeSlideUp} className="text-text-muted text-sm font-mono">
            Golfer, Sports Fan, K-Pop Fan, Gambler, Foody
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

          {/* Photo gallery — scrolling hand of cards */}
          <motion.div variants={fadeSlideUp} className="w-full mt-8">
            <div
              className="relative overflow-hidden py-3
                [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
            >
              <div
                className="flex w-max gap-4 animate-marquee motion-reduce:animate-none
                  hover:[animation-play-state:paused]"
              >
                {[...gallery, ...gallery].map(({ src, alt }, i) => (
                  <div
                    key={i}
                    aria-hidden={i >= gallery.length}
                    className="shrink-0 w-28 h-36 sm:w-32 sm:h-44 rounded-card overflow-hidden
                      border border-luck-goldMuted/50 shadow-card-lift
                      hover:border-luck-gold hover:scale-105
                      transition-[transform,border-color] duration-200"
                  >
                    <img
                      src={src}
                      alt={i >= gallery.length ? '' : alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="text-text-muted text-xs font-mono tracking-widest">SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          className="w-0.5 h-6 bg-luck-goldMuted/60 rounded-full"
        />
      </motion.div>
    </div>
  )
}

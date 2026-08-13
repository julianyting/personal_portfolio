import { motion } from 'framer-motion'
import {
  FaGraduationCap,
  FaRunning,
  FaMedal,
  FaGolfBall,
  FaFlagCheckered,
  FaCrown,
  FaFootballBall,
  FaMapMarkedAlt,
} from 'react-icons/fa'
import { staggerContainer, fadeSlideUp, tileFlipIn } from '../utils/motionVariants'

// Flip `done: true` on any line once you've cashed it —
// the ticket restyles itself and the counter below updates automatically.
const bucketList = [
  {
    icon: FaGraduationCap,
    title: 'Graduate college',
    note: "Chapman '27, B.S. Data Science.",
    done: false,
  },
  {
    icon: FaRunning,
    title: 'Run a half marathon',
    note: '13.1 miles. Start here.',
    done: false,
  },
  {
    icon: FaMedal,
    title: 'Run a full marathon',
    note: '26.2. The real one.',
    done: false,
  },
  {
    icon: FaGolfBall,
    title: 'Hit a hole in one',
    note: 'One swing. Mostly luck.',
    done: false,
  },
  {
    icon: FaFlagCheckered,
    title: 'Break 90 in golf',
    note: 'Bogey golf or better, all 18.',
    done: false,
  },
  {
    icon: FaCrown,
    title: 'Hit a royal flush in poker',
    note: '10-J-Q-K-A, suited. 1 in 649,740.',
    done: false,
  },
  {
    icon: FaFootballBall,
    title: 'Watch the 49ers win the Super Bowl',
    note: 'Five rings. Time for six.',
    done: false,
  },
  {
    icon: FaMapMarkedAlt,
    title: 'Visit every pro sports stadium',
    note: 'All 30 MLB, all 32 NFL, everything after.',
    done: false,
  },
]

function BucketCard({ item }) {
  const Icon = item.icon

  return (
    <motion.div
      variants={tileFlipIn}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`card-panel group flex items-start gap-4 cursor-default
        transition-colors duration-200
        ${item.done ? 'border-odds hover:border-odds' : 'hover:border-luck-gold'}`}
    >
      <div
        className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center
          border transition-colors duration-200
          ${item.done
            ? 'border-odds text-odds bg-odds-muted/40'
            : 'border-luck-goldMuted text-luck-gold group-hover:border-luck-gold'}`}
      >
        <Icon className="text-lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-semibold leading-snug ${
              item.done ? 'text-text-secondary line-through' : 'text-text-primary'
            }`}
          >
            {item.title}
          </h3>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap mt-1 ${
              item.done ? 'text-odds' : 'text-text-muted'
            }`}
          >
            {item.done ? '✓ Cashed' : 'Open'}
          </span>
        </div>
        <p className="text-text-secondary text-sm mt-1">{item.note}</p>
      </div>
    </motion.div>
  )
}

export default function BucketList() {
  const cashed = bucketList.filter((item) => item.done).length

  return (
    <div className="section-container bg-felt-800/30">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-12"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">— Off the Clock —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">The Bucket List</motion.h2>
        <motion.p variants={fadeSlideUp} className="text-text-secondary max-w-xl mx-auto">
          Things I&apos;m chasing outside of work. Some take training, some take practice,
          and a couple just take a very good day.
        </motion.p>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto"
      >
        {bucketList.map((item) => (
          <BucketCard key={item.title} item={item} />
        ))}
      </motion.div>

      <motion.p
        variants={fadeSlideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center font-mono text-xs text-text-muted mt-10"
      >
        {cashed} / {bucketList.length} cashed — the rest are still live.
      </motion.p>
    </div>
  )
}

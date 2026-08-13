import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp, slideInLeft, slideInRight } from '../utils/motionVariants'
import profilePhoto from '../assets/profile.webp'

const stats = [
  { label: 'Major', value: 'Data Science' },
  { label: 'Year', value: 'CO 2027' },
  { label: 'University', value: 'Chapman' },
  { label: 'Hometown', value: 'San Mateo, CA' },
]

export default function About() {
  return (
    <div className="section-container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.p variants={fadeSlideUp} className="section-subheading text-center">— About Me —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading text-center mb-12">The Player Behind the Data</motion.h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-6"
        >
          <div className="border-l-4 border-luck-red pl-5 space-y-4">
            <p className="text-text-secondary leading-relaxed">
              I&apos;m Julian Ting, I am a student at Chapman University studying Data Science.
              I&apos;m fascinated by the intersection of statistics and strategy — whether
              that&apos;s building predictive models for sports outcomes or analyzing poker
              hand equity at the table.
            </p>
            <p className="text-text-secondary leading-relaxed">
              My grandparents grew up in Taiwan, and I visit often. That connection
              to Taiwanese culture shapes how I think — precision, patience, and reading
              patterns. The same skills that make a great mahjong player make a great
              data scientist.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Outside of code, you&apos;ll find me building sports betting models,
              studying poker probability theory, or exploring night markets in Taipei.
            </p>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3 mt-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-text-muted text-xs font-mono">{label}:</span>
                <span className="odds-badge">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Photo side */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex justify-center"
        >
          <div
            className="relative w-64 h-80 rounded-card border-2 border-luck-goldMuted
              shadow-neon-gold overflow-hidden animate-breatheGold"
          >
            <img
              src={profilePhoto}
              alt="Julian Ting"
              className="w-full h-full object-cover object-top"
            />
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-luck-gold/60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-luck-gold/60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-luck-gold/60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-luck-gold/60" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

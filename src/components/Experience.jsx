import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp, slideInLeft, slideInRight } from '../utils/motionVariants'

const experiences = [
  {
    company: 'PNC Bank',
    role: 'Quantitative Analytics Intern — Enterprise Credit Portfolio Analytics',
    dates: 'Jun 2026 — Aug 2026',
    location: 'Pittsburgh, PA',
    bullets: [
      'Quantitative analytics internship within Enterprise Credit Portfolio Analytics.',
    ],
  },
  {
    company: 'Fowler Engineering Circuit',
    role: 'Student-Led Leadership & Advisory Council',
    dates: 'Jan 2025 — May 2026',
    location: 'Orange, CA',
    bullets: [
      'Selected for the student-led leadership and advisory council; coordinated communication between students, faculty, and administration using Git for meeting minutes and Google Colab for survey data.',
      'Collaborated with the Fowler Senator, faculty representatives, and the Dean to advocate for student needs and improve access to academic and professional resources.',
      'Assisted in developing and organizing school-wide initiatives and events to enhance the student experience.',
    ],
  },
  {
    company: 'Great World',
    role: 'Data & Operations Intern',
    dates: 'May 2024 — Aug 2024',
    location: 'South San Francisco, CA',
    bullets: [
      'Collected and organized PSC (Post Summary Corrections) and protest documentation to support importers in reclaiming customs duties.',
      'Facilitated clerical and data management tasks to address routine and specialized requirements, aligning with a methodical approach to data collection and cleaning.',
      'Managed and maintained files with precision, ensuring accurate documentation and easy retrieval.',
    ],
  },
  {
    company: 'Chapman University',
    role: 'B.S. Data Science — Minor in Information Security',
    dates: 'Aug 2023 — May 2027',
    location: 'Fowler School of Engineering',
    bullets: [
      'Relevant coursework: Machine Learning, AI, Data Structures & Algorithms, Database Management, Statistical Models in Business Analytics, Cyber Security, Data Communications.',
    ],
  },
]

export default function Experience() {
  return (
    <div className="section-container bg-felt-800/30">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-16"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">— Background —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">Table History</motion.h2>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
      </motion.div>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical timeline line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-luck-goldMuted/40 md:-translate-x-px" />

        <div className="space-y-12">
          {experiences.map((exp, i) => {
            const isLeft = i % 2 === 0
            const variants = isLeft ? slideInLeft : slideInRight

            return (
              <motion.div
                key={exp.company + exp.role}
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className={`relative flex items-start gap-6
                  ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
                  pl-12 md:pl-0`}
              >
                {/* Diamond marker */}
                <div className="absolute left-2 md:left-1/2 md:-translate-x-1/2 top-1 flex flex-col items-center gap-1 z-10">
                  <span className="text-luck-gold text-lg leading-none">◆</span>
                  {i < experiences.length - 1 && (
                    <span className="text-luck-red/60 text-xs leading-none mt-1">◇</span>
                  )}
                </div>

                {/* Content card */}
                <div className={`card-panel flex-1 ${isLeft ? 'md:mr-8' : 'md:ml-8'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-text-primary">{exp.company}</h3>
                      <p className="text-luck-gold text-sm">{exp.role}</p>
                      <p className="text-text-muted text-xs mt-0.5">{exp.location}</p>
                    </div>
                    <span className="font-mono text-xs text-text-muted whitespace-nowrap">{exp.dates}</span>
                  </div>
                  <ul className="space-y-1.5 mt-3">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-text-secondary text-sm flex gap-2">
                        <span className="text-luck-goldMuted mt-0.5 shrink-0">▸</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacer for the other side on desktop */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

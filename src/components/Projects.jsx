import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink, FiArrowUpRight } from 'react-icons/fi'
import { staggerContainer, fadeSlideUp, tileFlipIn } from '../utils/motionVariants'

const projects = [
  {
    tag: 'ML / Classification',
    odds: '96.5%',
    title: 'Arbor Loan Prediction',
    description:
      'Logistic regression (96.5% accuracy, AUC = 0.96) and random forest classifiers on a 5,000-record dataset to predict personal loan acceptance. Income, Education, and CD Account ownership emerged as key predictors.',
    stack: ['Python', 'scikit-learn', 'pandas', 'Logistic Regression', 'Random Forest'],
    github: '#',
    demo: null,
  },
  {
    tag: 'Simulation / Probability',
    odds: '-5.26%',
    title: 'Roulette Simulator',
    description:
      'Interactive American and European wheel with the full bet board, live expected-value tracking, and a bankroll chart. Monte Carlo engine runs 10,000-spin convergence tests and Martingale ruin analysis to show why every bet on the felt carries the same negative EV.',
    stack: ['React', 'JavaScript', 'Monte Carlo', 'SVG', 'Probability'],
    github: null,
    demo: null,
    route: '/roulette',
  },
  {
    tag: 'Full Stack',
    odds: 'REST',
    title: 'NBA Web App',
    description:
      'Relational MySQL database modeling NBA entities and relationships. REST API in Flask managing teams, players, games, and player performance data. Parameterized SQL queries to prevent injection and support dynamic filtering.',
    stack: ['Python', 'Flask', 'MySQL', 'REST API', 'SQL'],
    github: '#',
    demo: null,
  },
]

function ProjectCard({ project }) {
  const navigate = useNavigate()

  // Projects with a route of their own turn the whole card into a control that
  // opens that page; the rest stay static.
  const target = project.route
  const open = () => navigate(target)

  const activate = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    open()
  }

  return (
    <motion.div
      variants={tileFlipIn}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={target ? open : undefined}
      onKeyDown={target ? activate : undefined}
      role={target ? 'button' : undefined}
      tabIndex={target ? 0 : undefined}
      aria-label={target ? `${project.title} — open the live simulator page` : undefined}
      className={`card-panel hover:border-luck-gold group flex flex-col gap-4
        transition-colors duration-200 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-luck-gold focus-visible:ring-offset-2
        focus-visible:ring-offset-felt-900
        ${target ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="odds-badge">{project.tag}</span>
        <span className="font-mono text-xs text-luck-goldMuted group-hover:text-luck-gold transition-colors">
          {project.odds}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl text-luck-goldLight font-semibold">{project.title}</h3>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed flex-1">{project.description}</p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="border border-felt-600 text-text-muted text-xs px-2 py-0.5 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-4 pt-1">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-text-muted hover:text-luck-gold transition-colors text-sm"
          >
            <FaGithub size={15} /> GitHub
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-text-muted hover:text-luck-gold transition-colors text-sm"
          >
            <FiExternalLink size={15} /> Live Demo
          </a>
        )}
        {/* Not a link — the card itself is the control, so nesting one here
            would put a button inside a button. */}
        {target && (
          <span className="flex items-center gap-1.5 text-luck-gold text-sm font-medium">
            Play it live
            <FiArrowUpRight
              size={15}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <div className="section-container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-12"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">— Work —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">Personal Projects</motion.h2>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </motion.div>
    </div>
  )
}

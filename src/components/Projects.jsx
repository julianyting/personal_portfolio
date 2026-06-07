import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
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
    tag: 'Deep Learning',
    odds: '90.65%',
    title: 'Waste Classifier',
    description:
      'Custom CNN and MobileNetV2 transfer-learning model for waste image classification (90.65% test accuracy). Built a convolutional autoencoder for latent space analysis via PCA, t-SNE, and K-Means clustering.',
    stack: ['Python', 'TensorFlow', 'MobileNetV2', 'CNN', 'K-Means', 'PCA'],
    github: '#',
    demo: null,
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
  return (
    <motion.div
      variants={tileFlipIn}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="card-panel hover:border-luck-gold group flex flex-col gap-4 transition-colors duration-200 cursor-default"
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
            className="flex items-center gap-1.5 text-text-muted hover:text-luck-gold transition-colors text-sm"
          >
            <FiExternalLink size={15} /> Live Demo
          </a>
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
        <motion.h2 variants={fadeSlideUp} className="section-heading">The Hand I&apos;ve Played</motion.h2>
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

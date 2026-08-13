import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp, tileFlipIn } from '../utils/motionVariants'

const skillGroups = [
  {
    label: 'Languages & Frameworks',
    borderColor: 'border-luck-gold',
    textColor: 'text-luck-gold',
    dotColor: 'bg-luck-gold',
    skills: [
      'Python', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
      'R', 'Java', 'C++', 'C', 'REST APIs',
    ],
  },
  {
    label: 'Data Science & ML',
    borderColor: 'border-odds',
    textColor: 'text-odds',
    dotColor: 'bg-odds',
    skills: [
      'Pandas', 'NumPy', 'Scikit-Learn', 'TensorFlow', 'XGBoost',
      'PCA', 'Neural Networks', 'Clustering', 'Feature Engineering', 'Transfer Learning',
    ],
  },
  {
    label: 'Platforms',
    borderColor: 'border-luck-red',
    textColor: 'text-luck-redLight',
    dotColor: 'bg-luck-redLight',
    skills: [
      'Git', 'GitHub', 'Docker', 'Excel', 'DataGrip',
      'Tableau', 'Power BI', 'Linux', 'Alteryx',
    ],
  },
]

function SkillChip({ name, borderColor, textColor, dotColor }) {
  return (
    <motion.div
      variants={tileFlipIn}
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`card-panel border-l-4 ${borderColor} !py-3 !px-4
        flex items-center gap-2.5 cursor-default
        hover:border-luck-gold transition-colors duration-200`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className={`font-mono text-sm font-medium ${textColor}`}>{name}</span>
    </motion.div>
  )
}

export default function Skills() {
  return (
    <div className="section-container bg-felt-800/30">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-12"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">— Stack &amp; Tools —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">Reading the Board</motion.h2>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
      </motion.div>

      <div className="space-y-10">
        {skillGroups.map((group) => (
          <div key={group.label}>
            <p className={`text-xs uppercase tracking-widest font-mono mb-4 ${group.textColor}`}>
              {group.label}
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            >
              {group.skills.map((name) => (
                <SkillChip
                  key={name}
                  name={name}
                  borderColor={group.borderColor}
                  textColor={group.textColor}
                  dotColor={group.dotColor}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}

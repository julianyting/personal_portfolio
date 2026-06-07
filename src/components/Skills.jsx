import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp, tileFlipIn } from '../utils/motionVariants'

const skillGroups = [
  {
    label: 'Programming & Data',
    color: 'border-luck-gold',
    textColor: 'text-luck-gold',
    skills: [
      { name: 'Python',      level: 92 },
      { name: 'SQL',         level: 88 },
      { name: 'R',           level: 80 },
      { name: 'Java',        level: 68 },
      { name: 'C++',         level: 60 },
      { name: 'C',           level: 55 },
      { name: 'pandas',      level: 90 },
      { name: 'NumPy',       level: 88 },
    ],
  },
  {
    label: 'Machine Learning',
    color: 'border-odds',
    textColor: 'text-odds',
    skills: [
      { name: 'scikit-learn',       level: 88 },
      { name: 'TensorFlow',         level: 72 },
      { name: 'XGBoost',            level: 78 },
      { name: 'Random Forests',     level: 85 },
      { name: 'Neural Networks',    level: 70 },
      { name: 'Transfer Learning',  level: 72 },
      { name: 'Feature Engineering',level: 80 },
      { name: 'tidyverse / ggplot2',level: 75 },
    ],
  },
  {
    label: 'Platforms & Tools',
    color: 'border-luck-red',
    textColor: 'text-luck-redLight',
    skills: [
      { name: 'Git / GitHub',  level: 88 },
      { name: 'MySQL',         level: 85 },
      { name: 'MongoDB',       level: 72 },
      { name: 'Docker',        level: 65 },
      { name: 'Tableau',       level: 80 },
      { name: 'Power BI',      level: 72 },
      { name: 'Alteryx',       level: 60 },
      { name: 'Google Colab',  level: 90 },
    ],
  },
  {
    label: 'Analysis & Research',
    color: 'border-taiwan-blue',
    textColor: 'text-blue-400',
    skills: [
      { name: 'Data Visualization', level: 88 },
      { name: 'A/B Testing',        level: 75 },
      { name: 'Hypothesis Testing', level: 78 },
      { name: 'Data Storytelling',  level: 82 },
      { name: 'REST APIs',          level: 78 },
      { name: 'Excel / Sheets',     level: 85 },
      { name: 'Technical Writing',  level: 80 },
      { name: 'Linux',              level: 65 },
    ],
  },
]

function SkillCard({ skill, borderColor, textColor }) {
  return (
    <motion.div
      variants={tileFlipIn}
      className={`card-panel border-l-4 ${borderColor} space-y-2`}
    >
      <span className={`font-mono text-sm font-medium ${textColor}`}>{skill.name}</span>
      <div className="h-0.5 w-full bg-felt-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-luck-gold rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
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
        <motion.p variants={fadeSlideUp} className="section-subheading">— Stack & Tools —</motion.p>
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
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {group.skills.map((skill) => (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  borderColor={group.color}
                  textColor={group.textColor}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}

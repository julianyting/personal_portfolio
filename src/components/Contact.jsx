import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { staggerContainer, fadeSlideUp } from '../utils/motionVariants'

const socials = [
  { icon: FaGithub,   label: 'GitHub',   href: 'https://github.com/julianyting' },
  { icon: FaLinkedin, label: 'LinkedIn',  href: 'https://linkedin.com/in/julianyting' },
  { icon: MdEmail,    label: 'Email',     href: 'mailto:julianyting@gmail.com' },
]

export default function Contact() {
  return (
    <div className="section-container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-12"
      >
        <motion.p variants={fadeSlideUp} className="section-subheading">— Say Hi —</motion.p>
        <motion.h2 variants={fadeSlideUp} className="section-heading">Place Your Bet</motion.h2>
        <motion.p variants={fadeSlideUp} className="text-text-secondary max-w-md mx-auto mt-3">
          Got a project, an opportunity, or just want to talk data and poker? I&apos;m all in.
        </motion.p>
        <motion.div variants={fadeSlideUp} className="section-divider mt-4" />
      </motion.div>

      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="max-w-lg mx-auto"
      >
        {/* Form container with mahjong corner marks */}
        <div className="relative card-panel">
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-luck-red/60" aria-hidden="true" />
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-luck-red/60" aria-hidden="true" />
          <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-luck-gold/60" aria-hidden="true" />
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-luck-gold/60" aria-hidden="true" />

          <form
            action="mailto:julianyting@gmail.com"
            method="POST"
            encType="text/plain"
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="bg-felt-800 border border-felt-600 focus:border-luck-gold focus:ring-1 focus:ring-luck-gold
                    rounded-card px-4 py-2.5 text-text-primary text-sm outline-none transition-all placeholder:text-text-muted"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-muted font-mono uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="bg-felt-800 border border-felt-600 focus:border-luck-gold focus:ring-1 focus:ring-luck-gold
                    rounded-card px-4 py-2.5 text-text-primary text-sm outline-none transition-all placeholder:text-text-muted"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-muted font-mono uppercase tracking-wider">Message</label>
              <textarea
                name="message"
                rows={5}
                placeholder="What's on your mind?"
                className="bg-felt-800 border border-felt-600 focus:border-luck-gold focus:ring-1 focus:ring-luck-gold
                  rounded-card px-4 py-2.5 text-text-primary text-sm outline-none transition-all resize-none
                  placeholder:text-text-muted"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <MdEmail size={18} /> Send Message
            </button>
          </form>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-6 mt-8">
          {socials.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              aria-label={label}
              className="text-text-muted hover:text-luck-gold hover:shadow-neon-gold transition-all duration-200 p-2"
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

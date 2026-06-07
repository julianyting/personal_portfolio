export const fadeSlideUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const tileFlipIn = {
  hidden:  { opacity: 0, rotateX: 90 },
  visible: { opacity: 1, rotateX: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const cardHover = {
  rest:  { scale: 1,    y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
}

export const slideInLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const slideInRight = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

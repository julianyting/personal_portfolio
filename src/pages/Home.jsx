import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import BucketList from '../components/BucketList'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  const { state } = useLocation()

  // Coming back from a sub-page, land on the section that sent you there
  // rather than at the top of the site.
  useEffect(() => {
    if (!state?.scrollTo) return
    const target = document.getElementById(state.scrollTo)
    if (!target) return

    // Wait a frame so the section has laid out before measuring it.
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [state])

  return (
    <>
      <Navbar />
      <main>
        <section id="hero"><Hero /></section>
        <section id="about"><About /></section>
        <section id="skills"><Skills /></section>
        <section id="projects"><Projects /></section>
        <section id="bucketlist"><BucketList /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
    </>
  )
}

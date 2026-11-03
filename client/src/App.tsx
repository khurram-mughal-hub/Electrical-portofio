import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Navbar from './components/Navbar'
import Projects from './components/Projects'
import ScrollLine, { pageSections } from './components/ScrollLine'
import Skills from './components/Skills'
import { useScrollProgress } from './hooks/useScrollProgress'

const Scene = lazy(() => import('./three/Scene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ failed: true })
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function SceneBackdrop({ progress, supported, reducedMotion }: { progress: number; supported: boolean; reducedMotion: boolean }) {
  if (!supported) {
    return <div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>
  }
  return (
    <SceneBoundary fallback={<div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>}>
      <Suspense fallback={<div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>}>
        <Scene progress={progress} reducedMotion={reducedMotion} />
      </Suspense>
    </SceneBoundary>
  )
}

export default function App() {
  const progress = useScrollProgress()
  const [sceneSupported, setSceneSupported] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches)
    updateMotionPreference()
    motionPreference.addEventListener('change', updateMotionPreference)
    setSceneSupported(supportsWebGL())
    return () => motionPreference.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, autoRaf: false })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const animations = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.content-section .section-heading').forEach((heading) => {
        gsap.fromTo(heading, { autoAlpha: 0.76, y: 14 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('.skill-grid, .project-grid').forEach((grid) => {
        const cards = grid.querySelectorAll<HTMLElement>('.skill-card, .project-card')
        gsap.fromTo(cards, { autoAlpha: 0, clipPath: 'inset(0 0 14% 0)' }, {
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.65,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: grid, start: 'top 86%', once: true },
          onComplete: () => gsap.set(cards, { clearProps: 'opacity,visibility' }),
        })
      })
    })

    return () => {
      animations.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const sections = pageSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(() => {
      const marker = window.innerHeight * 0.42
      const current = sections.find((section) => {
        const bounds = section.getBoundingClientRect()
        return bounds.top <= marker && bounds.bottom > marker
      })
      if (current) setActiveSection(current.id)
    }, { rootMargin: '-42% 0px -57% 0px' })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const navigateToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (!section) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(section, { offset: 0, duration: 1.05 })
      return
    }
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <ScrollLine activeSection={activeSection} onNavigate={navigateToSection} />
      <SceneBackdrop progress={progress} supported={sceneSupported} reducedMotion={reducedMotion} />
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

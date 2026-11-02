import { Component, lazy, Suspense, useEffect, useState } from 'react'
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

function SceneBackdrop({ progress, supported }: { progress: number; supported: boolean }) {
  if (!supported) {
    return <div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>
  }
  return (
    <SceneBoundary fallback={<div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>}>
      <Suspense fallback={<div className="scene-fallback" aria-hidden="true"><span className="fallback-ring" /></div>}>
        <Scene progress={progress} />
      </Suspense>
    </SceneBoundary>
  )
}

export default function App() {
  const progress = useScrollProgress()
  const [sceneSupported, setSceneSupported] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setSceneSupported(!reducedMotion && supportsWebGL())
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const headingTweens = gsap.utils.toArray<HTMLElement>('.content-section .section-heading')
      .map((heading) => gsap.fromTo(heading, { autoAlpha: 0.76, y: 14 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
      }))

    return () => {
      headingTweens.forEach((tween) => tween.scrollTrigger?.kill())
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <SceneBackdrop progress={progress} supported={sceneSupported} />
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

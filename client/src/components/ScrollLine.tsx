import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const pageSections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
]

interface ScrollLineProps {
  activeSection: string
  onNavigate: (sectionId: string) => void
}

export default function ScrollLine({ activeSection, onNavigate }: ScrollLineProps) {
  const fill = useRef<HTMLSpanElement>(null)
  const nodes = useRef(new Map<string, HTMLAnchorElement>())
  const activeIndex = pageSections.findIndex(({ id }) => id === activeSection)

  useLayoutEffect(() => {
    const fillElement = fill.current
    if (!fillElement) return

    gsap.registerPlugin(ScrollTrigger)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fillTween = gsap.fromTo(fillElement, { scaleY: 0 }, {
      scaleY: 1,
      duration: reducedMotion ? 0 : 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reducedMotion ? false : true,
        invalidateOnRefresh: true,
      },
    })

    const updateNodePositions = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      pageSections.forEach(({ id }) => {
        const section = document.getElementById(id)
        const node = nodes.current.get(id)
        if (!section || !node) return
        const sectionCenter = section.getBoundingClientRect().top + window.scrollY + section.offsetHeight / 2
        const position = Math.min(1, Math.max(0, sectionCenter / maxScroll))
        node.style.top = `${position * 100}%`
      })
    }

    updateNodePositions()
    const resizeObserver = new ResizeObserver(() => {
      updateNodePositions()
      ScrollTrigger.refresh()
    })
    resizeObserver.observe(document.body)
    window.addEventListener('resize', updateNodePositions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateNodePositions)
      fillTween.scrollTrigger?.kill()
      fillTween.kill()
    }
  }, [])

  return (
    <nav className="scroll-line" aria-label="Page sections">
      <span className="scroll-line-track" aria-hidden="true">
        <span className="scroll-line-fill" ref={fill} />
      </span>
      {pageSections.map(({ id, label }, index) => {
        const isCurrent = activeSection === id
        const isLit = activeIndex >= index
        return (
          <a
            className={`scroll-line-node${isLit ? ' is-lit' : ''}${isCurrent ? ' is-current' : ''}`}
            href={`#${id}`}
            aria-label={`Go to ${label}`}
            aria-current={isCurrent ? 'location' : undefined}
            key={id}
            ref={(node) => {
              if (node) nodes.current.set(id, node)
              else nodes.current.delete(id)
            }}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(id)
            }}
          >
            <span className="scroll-line-dot" aria-hidden="true" />
            <span className="scroll-line-label" aria-hidden="true">{label}</span>
          </a>
        )
      })}
    </nav>
  )
}

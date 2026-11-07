import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { projects } from '../data/content'
import ProjectCard from './ProjectCard'
import { useWheelRotation } from '../hooks/useWheelRotation'

export default function ProjectsWheel() {
  const {
    activeIndex,
    stageRef,
    rotateTo,
    setHovered,
    setFocused,
    previous,
    next,
    onKeyDown,
    onClickCard,
    step,
  } = useWheelRotation(projects.length)
  const [cardWidth, setCardWidth] = useState(340)
  const worldRef = useRef<HTMLDivElement>(null)
  const touchDevice = useRef(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const updateSize = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      const width = Math.min(isMobile ? 360 : 340, stage.clientWidth * (isMobile ? 0.78 : 0.8))
      const radius = Math.max((width / 2) / Math.tan(Math.PI / projects.length) + 24, isMobile ? 300 : 520)
      setCardWidth(width)
      stage.style.setProperty('--wheel-radius', `${radius}px`)
      const cameraScale = (isMobile ? 1000 : 1400) / ((isMobile ? 1000 : 1400) + radius)
      stage.style.setProperty('--camera-scale', `${cameraScale}`)
      stage.style.setProperty('--side-camera-scale', `${cameraScale * 0.82}`)
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [stageRef])

  useEffect(() => {
    touchDevice.current = window.matchMedia('(pointer: coarse)').matches
  }, [])

  const steerWheel = (event: PointerEvent<HTMLDivElement>) => {
    if (touchDevice.current || event.pointerType !== 'mouse' || !worldRef.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    worldRef.current.style.setProperty('--steer-x', `${-y * 16}deg`)
    worldRef.current.style.setProperty('--steer-y', `${x * 16}deg`)
    worldRef.current.style.setProperty('--depth-parallax', `${Math.hypot(x, y) * 8}px`)
  }

  const resetSteer = () => {
    if (!worldRef.current) return
    worldRef.current.style.setProperty('--steer-x', '0deg')
    worldRef.current.style.setProperty('--steer-y', '0deg')
    worldRef.current.style.setProperty('--depth-parallax', '0px')
  }

  const wheelStyle = { '--card-width': `${cardWidth}px` } as CSSProperties

  return (
    <div
      className="projects-wheel"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false)
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div className="wheel-controls" aria-label="Project carousel controls">
        <button className="wheel-button" type="button" onClick={previous} aria-label="Previous project">←</button>
        <button className="wheel-button" type="button" onClick={next} aria-label="Next project">→</button>
      </div>
      <div
        ref={stageRef}
        className="project-wheel-stage"
        style={wheelStyle}
        role="region"
        aria-roledescription="carousel"
        aria-label="Selected projects"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerMove={steerWheel}
        onPointerLeave={resetSteer}
      >
        <div className="wheel-glow" aria-hidden="true" />
        <div className="wheel-track" aria-hidden="true" />
        <div ref={worldRef} className="project-wheel-world">
          <div className="project-wheel-rotator">
            {projects.map((project, index) => {
              const distance = Math.min(
                (index - activeIndex + projects.length) % projects.length,
                (activeIndex - index + projects.length) % projects.length,
              )
              return (
                <div
                  className={`project-wheel-slot${distance === 0 ? ' is-front' : distance === 1 ? ' is-near' : ' is-back'}`}
                  key={project.title}
                  style={{ '--card-angle': `${index * step}deg` } as CSSProperties}
                >
                  <ProjectCard
                    project={project}
                    index={index}
                    count={projects.length}
                    active={index === activeIndex}
                    onSelect={(selectedIndex) => {
                      onClickCard(selectedIndex)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="wheel-dots" role="group" aria-label="Choose a project">
        {projects.map((project, index) => (
          <button
            className={`wheel-dot${index === activeIndex ? ' is-active' : ''}`}
            type="button"
            key={project.title}
            aria-label={`Show project ${index + 1}: ${project.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => rotateTo(index)}
          />
        ))}
      </div>
      <p className="wheel-live-status" aria-live="polite" aria-atomic="true">
        Project {activeIndex + 1} of {projects.length}: {projects[activeIndex]?.title}
      </p>
    </div>
  )
}

import type { FocusEvent, MouseEvent, PointerEvent } from 'react'

export interface Project {
  title: string
  description: string
  tags: string[]
  link: string
  image: string
}

interface ProjectCardProps {
  project: Project
  index: number
  count: number
  active: boolean
  onSelect: (index: number) => void
}

const glyphs = ['⌁', '∿', '⌘', '⌖']

export default function ProjectCard({ project, index, count, active, onSelect }: ProjectCardProps) {
  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!active || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    window.dispatchEvent(new CustomEvent('portfolio:coil-pulse'))
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!active || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 10}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`)
  }

  const resetTilt = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <article
      className={`project-card${active ? ' is-active' : ''}`}
      tabIndex={0}
      aria-label={`Project ${index + 1} of ${count}: ${project.title}`}
      aria-current={active ? 'true' : undefined}
      onFocus={() => onSelect(index)}
      onClick={() => onSelect(index)}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
    >
      <div className="project-card-face">
        <span className="project-arrow" aria-hidden="true">↗</span>
        <div className="project-visual" aria-hidden="true">
          {project.image
            ? <img className="project-image" src={project.image} alt="" loading="lazy" />
            : <span className={`project-glyph glyph-${index + 1}`}>{glyphs[index % glyphs.length]}</span>}
          <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="project-content">
          <div className="tag-row">
            {project.tags.map((tag, tagIndex) => (
              <span className="tag" key={tag} style={{ transitionDelay: active ? `${tagIndex * 60}ms` : '0ms' }}>{tag}</span>
            ))}
          </div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          {project.link && active
            ? <a className="text-link" href={project.link} target="_blank" rel="noreferrer">View project <span aria-hidden="true">↗</span></a>
            : <span className="project-placeholder">Project link can be added in content.ts</span>}
        </div>
      </div>
    </article>
  )
}

import { projects } from '../data/content'

export default function Projects() {
  return (
    <section className="content-section section-shell" id="projects" aria-labelledby="projects-title">
      <div className="section-index">03 / Selected work</div>
      <div className="section-body">
        <div className="section-heading projects-heading">
          <div>
            <p className="eyebrow">Experiments & applications</p>
            <h2 id="projects-title">Built to understand<br /><em>what makes things work.</em></h2>
          </div>
          <span className="mono-note">PROJECT INDEX / 04</span>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article
              className="project-card"
              key={project.title}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  window.dispatchEvent(new CustomEvent('portfolio:coil-pulse'))
                }
              }}
              onPointerMove={(event) => {
                if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
                const bounds = event.currentTarget.getBoundingClientRect()
                const x = (event.clientX - bounds.left) / bounds.width
                const y = (event.clientY - bounds.top) / bounds.height
                event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 16}deg`)
                event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 16}deg`)
              }}
              onPointerDown={(event) => {
                if (event.pointerType === 'touch') window.dispatchEvent(new CustomEvent('portfolio:coil-pulse'))
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty('--tilt-x', '0deg')
                event.currentTarget.style.setProperty('--tilt-y', '0deg')
              }}
            >
              <span className="project-arrow" aria-hidden="true">↗</span>
              <div className="project-visual" aria-hidden="true">
                <span className={`project-glyph glyph-${index + 1}`}>{['⌁', '∿', '⌘', '⌖'][index]}</span>
                <span className="project-number">0{index + 1}</span>
              </div>
              <div className="project-content">
                <div className="tag-row">{project.tags.map((tag, tagIndex) => <span className="tag" key={tag} style={{ transitionDelay: `${tagIndex * 40}ms` }}>{tag}</span>)}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.link
                  ? <a className="text-link" href={project.link} target="_blank" rel="noreferrer">View project <span aria-hidden="true">↗</span></a>
                  : <span className="project-placeholder">Project link can be added in content.ts</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

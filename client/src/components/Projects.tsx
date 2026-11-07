import { projects } from '../data/content'
import ProjectsWheel from './ProjectsWheel'

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
          <span className="mono-note">PROJECT INDEX / {String(projects.length).padStart(2, '0')}</span>
        </div>
        <ProjectsWheel />
      </div>
    </section>
  )
}

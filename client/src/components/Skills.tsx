import { skills } from '../data/content'

export default function Skills() {
  return (
    <section className="content-section section-shell" id="skills" aria-labelledby="skills-title">
      <div className="section-index">02 / Capabilities</div>
      <div className="section-body">
        <div className="section-heading">
          <p className="eyebrow">Tools of the trade</p>
          <h2 id="skills-title">From first principles<br /><em>to working prototypes.</em></h2>
        </div>
        <div className="skill-grid">
          {skills.map((category, index) => (
            <article className="skill-card" key={category.group}>
              <span className="card-index">0{index + 1}</span>
              <h3>{category.group}</h3>
              <ul>
                {category.items.map((skill) => (
                  <li className="skill-item" key={skill}>
                    <span className="skill-item-label">
                      <svg className="skill-icon" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M9.3 1.5 3.8 8h3.5l-.6 6.5 5.5-7H8.8z" />
                      </svg>
                      <span>{skill}</span>
                    </span>
                    <span className="skill-power" aria-hidden="true"><span className="skill-power-fill" /></span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

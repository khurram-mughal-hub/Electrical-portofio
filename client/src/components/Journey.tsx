import { journey } from '../data/content'

export default function Journey() {
  return (
    <section className="content-section section-shell" id="journey" aria-labelledby="journey-title">
      <div className="section-index">04 / The journey</div>
      <div className="section-body journey-layout">
        <div className="section-heading">
          <p className="eyebrow">Learning in motion</p>
          <h2 id="journey-title">A practice built<br /><em>one question at a time.</em></h2>
        </div>
        <ol className="timeline">
          {journey.map((item, index) => (
            <li className="timeline-item" key={`${item.type}-${index}`}>
              <span className="timeline-marker" aria-hidden="true">0{index + 1}</span>
              <div>
                <span className="eyebrow">{item.type}</span>
                <h3>{item.title}</h3>
                <p className="timeline-org">{item.organization}</p>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

import { profile } from '../data/content'

export default function Hero() {
  return (
    <section className="hero section-shell" id="home" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> Electrical engineering / Portfolio</p>
        <h1 id="hero-title">Ideas into<br /><em>living systems.</em></h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-intro">{profile.introduction}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#projects">Explore projects <span aria-hidden="true">↘</span></a>
          <a className="button button-quiet" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="hero-aside" aria-hidden="true">
        <span className="hero-orbit orbit-one" />
        <span className="hero-orbit orbit-two" />
        <span className="hero-core" />
        <span className="hero-aside-label">DESIGN / BUILD / MEASURE</span>
      </div>
      <a className="scroll-cue" href="#about"><span /> Scroll to explore</a>
    </section>
  )
}

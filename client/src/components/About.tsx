import { profile } from '../data/content'

export default function About() {
  return (
    <section className="content-section section-shell" id="about" aria-labelledby="about-title">
      <div className="section-index">01 / Profile</div>
      <div className="section-body about-layout">
        <div
          className="profile-portrait"
          onPointerMove={(event) => {
            if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
            const bounds = event.currentTarget.getBoundingClientRect()
            const x = (event.clientX - bounds.left) / bounds.width
            const y = (event.clientY - bounds.top) / bounds.height
            event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`)
            event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`)
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--tilt-x', '0deg')
            event.currentTarget.style.setProperty('--tilt-y', '0deg')
          }}
        >
          <img
            className="profile-photo"
            src={profile.photoPath}
            alt={`Portrait of ${profile.name}`}
            width={477}
            height={523}
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="about-copy">
          <div className="about-intro">
            <p className="eyebrow">Curiosity, made tangible</p>
            <h2 id="about-title">Engineering is how<br /><em>I ask better questions.</em></h2>
          </div>
          <p>{profile.biography}</p>
          <div className="profile-facts">
            <div><span>University</span><strong>{profile.university}</strong></div>
            <div><span>Degree</span><strong>{profile.degree}</strong></div>
            <div><span>Academic record</span><strong>{profile.cgpa}</strong></div>
            <div><span>Current interests</span><strong>{profile.interests.join(' · ')}</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { profile } from '../data/content'

export default function About() {
  return (
    <section className="content-section section-shell" id="about" aria-labelledby="about-title">
      <div className="section-index">01 / Profile</div>
      <div className="section-body about-layout">
        <div>
          <p className="eyebrow">Curiosity, made tangible</p>
          <h2 id="about-title">Engineering is how<br /><em>I ask better questions.</em></h2>
        </div>
        <div className="about-copy">
          <p>{profile.biography}</p>
          <div className="profile-facts">
            <div><span>University</span><strong>{profile.university}</strong></div>
            <div><span>Academic record</span><strong>{profile.cgpa}</strong></div>
            <div><span>Current interests</span><strong>{profile.interests.join(' · ')}</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}

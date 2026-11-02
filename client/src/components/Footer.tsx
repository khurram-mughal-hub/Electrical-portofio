import { profile } from '../data/content'

export default function Footer() {
  return (
    <footer className="site-footer section-shell">
      <a className="brand footer-brand" href="#home">
        <img className="brand-mark" src={profile.photoPath} alt="" aria-hidden="true" loading="lazy" />
        <span>{profile.name}</span>
      </a>
      <span className="footer-note">Designed with intent. Built to keep learning.</span>
      <a className="back-top" href="#home">Back to top ↑</a>
    </footer>
  )
}

import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/content'

const links = [
  ['About', '#about'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Journey', '#journey'],
  ['Contact', '#contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const scrollY = window.scrollY
    const bodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    const navigation = document.getElementById('primary-navigation')
    const focusable = navigation?.querySelectorAll<HTMLElement>('a, button')
    focusable?.[0]?.focus()

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = bodyStyles.overflow
      document.body.style.position = bodyStyles.position
      document.body.style.top = bodyStyles.top
      document.body.style.width = bodyStyles.width
      window.removeEventListener('keydown', trapFocus)
      window.scrollTo(0, scrollY)
    }
  }, [open])

  return (
    <header className={`site-header${open ? ' is-menu-open' : ''}`}>
      <a className="brand" href="#home" aria-label={`${profile.name} — home`}>
        <img className="brand-mark" src={profile.photoPath} alt="" aria-hidden="true" />
        <span>{profile.name}</span>
      </a>
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="primary-navigation" className={`primary-nav${open ? ' is-open' : ''}`} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
      </nav>
    </header>
  )
}

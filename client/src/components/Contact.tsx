import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { FocusEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { profile } from '../data/content'
import { sendContactMessage } from '../lib/api'

const formSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80, 'Keep your name under 80 characters.'),
  email: z.email('Enter a valid email address.'),
  subject: z.string().trim().min(3, 'Enter a subject.').max(120, 'Keep your subject under 120 characters.'),
  message: z.string().trim().min(10, 'Please include at least 10 characters.').max(2000, 'Keep your message under 2,000 characters.'),
  website: z.string().max(200),
})

type FormValues = z.infer<typeof formSchema>

const socialLinks = [
  { label: 'LinkedIn', value: profile.linkedin },
  { label: 'GitHub', value: profile.github },
]

function keepFieldVisible(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  if (!window.matchMedia('(max-width: 767px)').matches) return

  const field = event.currentTarget
  window.setTimeout(() => {
    field.scrollIntoView({
      block: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, 250)
}

export default function Contact() {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
  })

  const submit = handleSubmit(async (values) => {
    setStatus(null)
    try {
      const message = await sendContactMessage(values)
      setStatus({ kind: 'success', message })
      reset()
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    }
  })

  return (
    <section className="content-section section-shell contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-index">05 / Contact</div>
      <div className="section-body">
        <div className="section-heading contact-heading">
          <p className="eyebrow">Have a question or an idea?</p>
          <h2 id="contact-title">Let’s make something<br /><em>meaningful together.</em></h2>
        </div>
        <div className="contact-layout">
          <form className="contact-form glass-panel" onSubmit={submit} noValidate>
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>
                <input autoComplete="name" inputMode="text" onFocus={keepFieldVisible} {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
                {errors.name && <span className="field-error" id="name-error">{errors.name.message}</span>}
              </label>
              <label className="form-field">
                <span>Email</span>
                <input type="email" inputMode="email" autoComplete="email" onFocus={keepFieldVisible} {...register('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                {errors.email && <span className="field-error" id="email-error">{errors.email.message}</span>}
              </label>
            </div>
            <label className="form-field">
              <span>Subject</span>
              <input inputMode="text" autoComplete="off" onFocus={keepFieldVisible} {...register('subject')} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'subject-error' : undefined} />
              {errors.subject && <span className="field-error" id="subject-error">{errors.subject.message}</span>}
            </label>
            <label className="form-field">
              <span>Message</span>
              <textarea rows={5} onFocus={keepFieldVisible} {...register('message')} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} />
              {errors.message && <span className="field-error" id="message-error">{errors.message.message}</span>}
            </label>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
            </div>
            <div className="form-submit-row">
              <button className="button button-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span>
              </button>
              <span className="form-note">Your details are only used to reply.</span>
            </div>
            <p className={`form-status${status ? ` ${status.kind}` : ''}`} role="status" aria-live="polite">
              {status?.message ?? ''}
            </p>
          </form>

          <aside className="contact-details" aria-label="Other ways to connect">
            <p className="eyebrow">Elsewhere</p>
            <div className="contact-link-list">
              <div className="contact-link-item">
                <span>Email</span>
                {profile.email
                  ? <a href={`mailto:${profile.email}`}>{profile.email} <span aria-hidden="true">↗</span></a>
                  : <span className="placeholder-value">Add your email in content.ts</span>}
              </div>
              {socialLinks.map((item) => (
                <div className="contact-link-item" key={item.label}>
                  <span>{item.label}</span>
                  {item.value
                    ? <a href={item.value} target="_blank" rel="noreferrer">Open profile <span aria-hidden="true">↗</span></a>
                    : <span className="placeholder-value">Add your profile link in content.ts</span>}
                </div>
              ))}
              <div className="contact-link-item">
                <span>Curriculum vitae</span>
                {profile.cvPath
                  ? <a href={profile.cvPath} download>Download CV <span aria-hidden="true">↓</span></a>
                  : <button className="unavailable-link" type="button" disabled aria-describedby="cv-unavailable">CV not available</button>}
              </div>
            </div>
            {!profile.cvPath && <p className="cv-note" id="cv-unavailable">Add a real CV file and set its path in content.ts to enable downloads.</p>}
            <div className="contact-coordinate" aria-hidden="true">SIGNAL OPEN <span>●</span></div>
          </aside>
        </div>
      </div>
    </section>
  )
}

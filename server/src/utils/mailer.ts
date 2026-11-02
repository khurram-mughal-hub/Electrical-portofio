import nodemailer from 'nodemailer'
import type { AppConfig } from '../config/env.js'
import type { ContactMessage } from '../models/Message.js'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export async function sendContactNotifications(config: AppConfig, contact: ContactMessage): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
  })

  const safeName = escapeHtml(contact.name)
  const safeEmail = escapeHtml(contact.email)
  const safeSubject = escapeHtml(contact.subject)
  const safeMessage = escapeHtml(contact.message).replace(/\r?\n/g, '<br>')

  await Promise.all([
    transporter.sendMail({
      from: config.MAIL_FROM,
      to: config.MAIL_TO,
      replyTo: contact.email,
      subject: `Portfolio contact: ${contact.subject}`,
      text: `From: ${contact.name} <${contact.email}>\n\n${contact.message}`,
      html: `<h2>${safeSubject}</h2><p>From: ${safeName} &lt;${safeEmail}&gt;</p><p>${safeMessage}</p>`,
    }),
    transporter.sendMail({
      from: config.MAIL_FROM,
      to: contact.email,
      subject: 'Your message was received',
      text: `Hello ${contact.name},\n\nThank you for reaching out. Your message has been received.`,
      html: `<p>Hello ${safeName},</p><p>Thank you for reaching out. Your message has been received.</p>`,
    }),
  ])
}

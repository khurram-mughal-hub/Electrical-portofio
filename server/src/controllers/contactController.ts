import { z } from 'zod'
import type { Request, Response } from 'express'
import type { ContactMessage } from '../models/Message.js'

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  subject: z.string().trim().min(3).max(120).refine((value) => !/[\r\n]/.test(value), 'Subject cannot contain line breaks.'),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(200).optional().default(''),
}).strict()

export interface ContactServices {
  saveMessage: (contact: ContactMessage) => Promise<void>
  sendNotifications: (contact: ContactMessage) => Promise<void>
}

export function createContactController(services: ContactServices) {
  return async (request: Request, response: Response): Promise<void> => {
    const parsed = contactSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({
        ok: false,
        error: 'Please check the contact form fields.',
        fields: parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? ''), message: issue.message })),
      })
      return
    }

    if (parsed.data.website.trim().length > 0) {
      response.status(400).json({ ok: false, error: 'Unable to accept this submission.' })
      return
    }

    const { website: _website, ...contact } = parsed.data
    try {
      await services.saveMessage(contact)
      await services.sendNotifications(contact)
      response.status(201).json({ ok: true, message: 'Your message has been sent.' })
    } catch {
      response.status(500).json({ ok: false, error: 'We could not deliver your message. Please try again later.' })
    }
  }
}

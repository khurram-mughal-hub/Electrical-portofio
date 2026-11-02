import { z } from 'zod'

const contactPayloadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(200),
})

const responseSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
})

export type ContactPayload = z.infer<typeof contactPayloadSchema>

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

export async function sendContactMessage(payload: ContactPayload): Promise<string> {
  const parsed = contactPayloadSchema.safeParse(payload)
  if (!parsed.success) throw new Error('Please review the form fields and try again.')

  let response: Response
  try {
    response = await fetch(`${apiBase}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })
  } catch {
    throw new Error('The contact service is unavailable. Please try again later.')
  }

  const body: unknown = await response.json().catch(() => null)
  const result = responseSchema.safeParse(body)
  if (!response.ok || !result.success || !result.data.ok) {
    throw new Error(result.success ? result.data.error ?? 'Your message could not be sent.' : 'Unexpected response from the contact service.')
  }
  return result.data.message ?? 'Your message has been sent.'
}

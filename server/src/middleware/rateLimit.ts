import { rateLimit } from 'express-rate-limit'

export function createContactRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, error: 'Too many contact attempts. Please try again later.' },
  })
}

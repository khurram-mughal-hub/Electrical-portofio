import { Router } from 'express'
import type { ContactServices } from '../controllers/contactController.js'
import { createContactController } from '../controllers/contactController.js'
import { createContactRateLimit } from '../middleware/rateLimit.js'

export function createContactRouter(services: ContactServices): Router {
  const router = Router()
  router.post('/', createContactRateLimit(), createContactController(services))
  return router
}

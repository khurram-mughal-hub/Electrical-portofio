import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pino from 'pino'
import type { Logger } from 'pino'
import type { ContactServices } from './controllers/contactController.js'
import { createContactRouter } from './routes/contact.js'
import { createErrorHandler } from './middleware/errorHandler.js'

export interface AppDependencies extends ContactServices {
  clientUrl: string
  trustProxy?: number | false
  logger?: Logger
}

export function createApp(dependencies: AppDependencies) {
  const logger = dependencies.logger ?? pino({ level: 'silent' })
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', dependencies.trustProxy ?? false)
  app.use(helmet())
  app.use(cors({
    origin: (origin, callback) => callback(null, origin === dependencies.clientUrl),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  }))
  app.use(express.json({ limit: '16kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true })
  })
  app.use('/api/contact', createContactRouter(dependencies))
  app.use((_request, response) => {
    response.status(404).json({ ok: false, error: 'Route not found.' })
  })
  app.use(createErrorHandler(logger))
  return app
}

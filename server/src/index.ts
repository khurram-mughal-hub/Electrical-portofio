import 'dotenv/config'
import pino from 'pino'
import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { readConfig } from './config/env.js'
import { Message } from './models/Message.js'
import { sendContactNotifications } from './utils/mailer.js'

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' })

async function start(): Promise<void> {
  const config = readConfig()
  await connectDatabase(config)
  const app = createApp({
    clientUrl: config.CLIENT_URL,
    trustProxy: config.NODE_ENV === 'production' ? 1 : false,
    logger,
    saveMessage: async (contact) => {
      await Message.create(contact)
    },
    sendNotifications: (contact) => sendContactNotifications(config, contact),
  })

  app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'Portfolio API listening')
  })
}

start().catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : 'Unknown startup error'
  logger.error({ error: reason }, 'API startup failed')
  process.exitCode = 1
})

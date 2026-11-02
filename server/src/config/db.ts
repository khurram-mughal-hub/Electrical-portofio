import mongoose from 'mongoose'
import type { AppConfig } from './env.js'

export async function connectDatabase(config: AppConfig): Promise<void> {
  await mongoose.connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  })
}

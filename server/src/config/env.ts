import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  CLIENT_URL: z.string().url(),
  MONGODB_URI: z.string().min(1).refine((value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'), 'Must be a MongoDB connection URL'),
  SMTP_HOST: z.string().min(1).refine((value) => !value.startsWith('replace-with'), 'Replace the SMTP placeholder'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
  SMTP_USER: z.string().min(1).refine((value) => !value.startsWith('replace-with'), 'Replace the SMTP placeholder'),
  SMTP_PASS: z.string().min(1).refine((value) => !value.startsWith('replace-with'), 'Replace the SMTP placeholder'),
  MAIL_TO: z.email().refine((value) => !value.includes('.invalid'), 'Replace the example inbox'),
  MAIL_FROM: z.string().min(3).refine((value) => !value.includes('replace-with'), 'Replace the sender placeholder'),
})

export type AppConfig = z.infer<typeof configSchema>

export function readConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = configSchema.safeParse(source)
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    throw new Error(`Invalid server configuration: ${details}`)
  }
  return parsed.data
}

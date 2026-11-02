import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import request from 'supertest'
import { createApp } from '../dist/app.js'
import { readConfig } from '../dist/config/env.js'

const apps = []
const validContact = {
  name: 'Test Student',
  email: 'student@example.com',
  subject: 'Portfolio question',
  message: 'I would like to know more about this project.',
  website: '',
}

function makeApp(overrides = {}) {
  const calls = { saved: [], notified: [] }
  const app = createApp({
    clientUrl: 'http://localhost:5173',
    saveMessage: async (message) => calls.saved.push(message),
    sendNotifications: async (message) => calls.notified.push(message),
    ...overrides,
  })
  apps.push(app)
  return { app, calls }
}

afterEach(() => {
  apps.length = 0
})

test('health endpoint returns the expected status', async () => {
  const { app } = makeApp()
  await request(app).get('/api/health').expect(200, { ok: true })
})

test('CORS only grants the configured client origin', async () => {
  const { app } = makeApp()
  await request(app).get('/api/health').set('Origin', 'http://localhost:5173').expect('access-control-allow-origin', 'http://localhost:5173').expect(200)
  const denied = await request(app).get('/api/health').set('Origin', 'https://untrusted.example')
  assert.equal(denied.headers['access-control-allow-origin'], undefined)
})

test('valid contact is persisted and notifications are sent', async () => {
  const { app, calls } = makeApp()
  await request(app).post('/api/contact').send(validContact).expect(201)
  assert.equal(calls.saved.length, 1)
  assert.equal(calls.notified.length, 1)
  assert.equal(calls.saved[0].email, 'student@example.com')
  assert.equal('website' in calls.saved[0], false)
})

test('invalid fields return 400 without persistence', async () => {
  const { app, calls } = makeApp()
  await request(app).post('/api/contact').send({ ...validContact, email: 'bad', message: 'short' }).expect(400)
  assert.equal(calls.saved.length, 0)
  assert.equal(calls.notified.length, 0)
})

test('subject line breaks are rejected', async () => {
  const { app, calls } = makeApp()
  await request(app).post('/api/contact').send({ ...validContact, subject: 'hello\r\nBcc: other@example.com' }).expect(400)
  assert.equal(calls.saved.length, 0)
})

test('honeypot submissions are rejected without persistence or email', async () => {
  const { app, calls } = makeApp()
  await request(app).post('/api/contact').send({ ...validContact, website: 'bot content' }).expect(400)
  assert.equal(calls.saved.length, 0)
  assert.equal(calls.notified.length, 0)
})

test('notification failure is not reported as success', async () => {
  const { app, calls } = makeApp({ sendNotifications: async () => { throw new Error('SMTP down') } })
  await request(app).post('/api/contact').send(validContact).expect(500)
  assert.equal(calls.saved.length, 1)
})

test('sixth request from one IP is rate limited', async () => {
  const { app } = makeApp()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app).post('/api/contact').send({ ...validContact, email: `student${attempt}@example.com` }).expect(201)
  }
  await request(app).post('/api/contact').send({ ...validContact, email: 'sixth@example.com' }).expect(429)
})

test('production proxy configuration rate limits forwarded client IPs independently', async () => {
  const { app } = makeApp({ trustProxy: 1 })
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app)
      .post('/api/contact')
      .set('X-Forwarded-For', '198.51.100.10')
      .send({ ...validContact, email: `forwarded${attempt}@example.com` })
      .expect(201)
  }
  await request(app)
    .post('/api/contact')
    .set('X-Forwarded-For', '198.51.100.11')
    .send({ ...validContact, email: 'different-ip@example.com' })
    .expect(201)
  await request(app)
    .post('/api/contact')
    .set('X-Forwarded-For', '198.51.100.10')
    .send({ ...validContact, email: 'sixth-forwarded@example.com' })
    .expect(429)
})

test('configuration parsing refuses missing or placeholder SMTP credentials', () => {
  assert.throws(() => readConfig({}), /Invalid server configuration/)
  assert.throws(() => readConfig({
    CLIENT_URL: 'http://localhost:5173',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/portfolio',
    SMTP_HOST: 'replace-with-smtp-host',
    SMTP_PORT: '465',
    SMTP_USER: 'replace-with-smtp-username',
    SMTP_PASS: 'replace-with-smtp-password',
    MAIL_TO: 'owner@example.com',
    MAIL_FROM: 'Portfolio <owner@example.com>',
  }), /Replace the SMTP placeholder/)
})

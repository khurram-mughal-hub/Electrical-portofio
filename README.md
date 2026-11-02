# Electrical Engineering Portfolio

A responsive React portfolio with a fixed, scroll-reactive electrical scene, a personalized profile portrait, animated project/skill cards, a glowing section progress line, and an Express API for validated, persisted contact messages. Edit `client/src/data/content.ts` to update profile, skills, projects, and journey details.

## Requirements

- Node.js 22 or newer and npm
- MongoDB Community Server locally or a MongoDB-compatible hosted database
- SMTP access for contact notifications

## Install and run locally

From the repository root:

```sh
npm install
```

Create local environment files by copying the examples, then replace the server SMTP placeholders. Example commands:

```sh
cp client/.env.example client/.env
cp server/.env.example server/.env
```

On Windows PowerShell, use `Copy-Item client/.env.example client/.env` and `Copy-Item server/.env.example server/.env`.

Start MongoDB, then run:

```sh
npm run dev
```

The client uses Vite (normally `http://localhost:5173`) and the API listens on `http://localhost:5000`. The root `dev` script starts both. The API validates required settings at startup and intentionally refuses to start while SMTP values remain placeholders.

## Environment variables

### Client (`client/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API origin, e.g. `http://localhost:5000`; no path suffix |
| `VITE_SITE_NAME` | Optional site-name setting; profile display content is in `content.ts` |

Only `VITE_` variables are client-bundle settings. Never put secrets in this file.

### API (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API listener port |
| `CLIENT_URL` | Exact allowed frontend origin, without a trailing path |
| `MONGODB_URI` | MongoDB connection URL |
| `SMTP_HOST`, `SMTP_PORT` | SMTP server and port; port 465 uses TLS |
| `SMTP_USER`, `SMTP_PASS` | SMTP account credentials |
| `MAIL_TO` | Owner inbox that receives contact messages |
| `MAIL_FROM` | Sender identity accepted by the SMTP provider |

`server/.env.example` contains local MongoDB settings and conspicuous SMTP placeholders, not credentials. Obtain SMTP credentials from your mail provider. Do not commit `.env` files.

## Editable portfolio content

Update `client/src/data/content.ts` with accurate, user-approved profile, academic, work, skill, project, and link information. The initial text is explicitly placeholder content and does not invent a person's name, university, grades, internships, projects, social accounts, email, or CV. Add a real CV asset under `client/public/` and set `profile.cvPath` to its public path to enable the download control.

The page honors `prefers-reduced-motion`. When reduced motion is enabled or WebGL is not available, it avoids the 3D canvas and shows a CSS scene fallback. The canvas is lazy-loaded, pixel ratio is capped, and scene objects are intentionally limited. Keyboard focus, skip navigation, form errors, and submission status are exposed accessibly.

The About portrait is served from `client/public/profile-nobg.png`. Project cards respond to pointer position and pulse the background coil; skill items and the section progress line use maroon interaction states. Touch and reduced-motion preferences are supported.

## API

- `GET /api/health` → `{ "ok": true }`
- `POST /api/contact` → validates the contact form and honeypot, rate-limits to five requests per IP per 15 minutes, saves to MongoDB, then sends owner and visitor emails.

Both persistence and notifications are required for a successful response. If SMTP fails after persistence, the endpoint responds with an error rather than claiming delivery. Server logs omit message bodies and secrets.

## Validate

```sh
npm run typecheck
npm run build
npm test
```

`npm test` builds the API and runs endpoint tests for health, validation, honeypot, persistence, notification failure, and rate limiting. These tests use injected services and do not require live MongoDB or SMTP. Browser/WebGL performance and real SMTP delivery need manual validation with configured services.

## Deployment

### Client on Vercel

1. Import the repository and keep the project root at the repository root so npm can resolve the workspace.
2. Set the build command to `npm run build -w client` and output directory to `client/dist`.
3. Configure `VITE_API_URL` with the deployed API origin.
4. Add any required Vite SPA rewrite if the hosting preset does not already route paths to `index.html`.

### API on Render or Railway

1. Use the repository root as the service root so npm workspaces can install dependencies.
2. Build with `npm run build -w server`; start with `npm run start -w server`.
3. Configure all API variables from the table above in the hosting provider's secret/environment settings. Use a hosted MongoDB URI and provider-issued SMTP credentials.
4. Set `CLIENT_URL` to the exact deployed Vercel origin. Set `VITE_API_URL` in the client to the API's public origin and redeploy the client.
5. Verify `GET /api/health`, then submit a real contact message only after confirming SMTP and database access.

In production the API trusts one reverse-proxy hop so rate limiting uses the forwarded visitor IP on Render/Railway. If you deploy behind a different proxy topology, adjust `trustProxy` in `server/src/index.ts` to match that provider.

Review environment settings, mail-provider restrictions, database network access, and deployment logs before making the site public. Do not add credentials to source control.

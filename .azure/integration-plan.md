# Integration hand-off

## Backend
- Project: `server/`
- Run: `npm run dev -w server` (requires server `.env`, MongoDB and SMTP)
- Port: `PORT` (local default `5000`)
- Build: `npm run build -w server`
- Health: `GET /api/health`

## Frontend
- Project: `client/`
- Dev: `npm run dev -w client`
- Build: `npm run build -w client`
- API seam: `client/src/lib/api.ts` (`sendContactMessage`); current form: `client/src/components/Contact.tsx`
- Mock files to remove: none; content placeholders are editable copy, not fake API data

## API route inventory
- `GET /api/health` — health status
- `POST /api/contact` — validated contact submission, honeypot filtered, IP limit 5 per 15 minutes

## Database
- Type: MongoDB
- Model: `server/src/models/Message.ts`
- Migration tool/directory: not applicable (Mongoose schema; no relational migrations)
- Connection variable: `MONGODB_URI`
- Persist every valid contact before sending SMTP notifications; **do not add seed data**.

## Shared types
- No cross-package shared package. Server contact shape: `server/src/models/Message.ts`; browser request/response types and validation: `client/src/lib/api.ts`.

## Services
- Essential: React/Vite client, Express API, MongoDB persistence, SMTP delivery.
- Enhancement: WebGL / React Three Fiber scene, GSAP ScrollTrigger, Lenis smooth scrolling; the client has a reduced-motion and WebGL-unavailable CSS fallback.

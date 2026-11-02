# Electrical Engineering Student Portfolio

## Status

Approved by the user from the supplied project brief.

## Goal

Build a complete, responsive portfolio for an electrical engineering student. The visual identity is premium and laboratory-inspired, using only the supplied black and maroon palette. Personal profile, projects, journey, and external links remain easy to edit in `client/src/data/content.ts`; unknown personal facts and credentials must remain safe placeholders.

## Architecture

- Root npm workspace with `client` and `server`; one root development command starts both services.
- Frontend: React 19, Vite, TypeScript, Tailwind CSS v4, React Three Fiber/Drei/postprocessing, Three.js, GSAP ScrollTrigger, Lenis, React Hook Form, and Zod.
- Backend: Node.js 22, Express 5, TypeScript, Zod, Mongoose/MongoDB, Nodemailer, Helmet, strict single-origin CORS, express-rate-limit, and pino.
- The browser calls the backend using `VITE_API_URL`. Secrets and server configuration are never placed in the client bundle.

## Frontend requirements

- Use the brief's exact palette: `#0a0708`, `#050304`, `#8c1c2e`, `#c0344a`, `#f3ebe8`, `#a8999a`, `#3a1a21`; no other accent colors. Use Cormorant Garamond, Inter, and JetBrains Mono.
- Responsive, keyboard-accessible layout with reduced-motion support, smooth scrolling, a thin scroll progress indicator, and a simple CSS fallback when WebGL is unavailable.
- A single fixed, lazy-loaded R3F canvas behind the page: right-angle PCB traces/pads/current pulses, drifting low-poly electrical components, mouse-reactive particles, restrained postprocessing, and a copper Living Coil.
- Morph the coil smoothly across four scroll ranges (solenoid, toroid, sine wave, square spiral) using a custom shader/uniform; reverse naturally when scrolling upward. Animate camera/rotation and scroll-speed glow, while capping pixel ratio and controlling scene cost for laptop/mobile performance.
- Sections: hero, about, skills, four project cards with pointer tilt, education/internship/society timeline, contact, and footer. Contact is last before footer.
- Contact form fields: name, email, subject, message, plus a hidden honeypot; client-side Zod validation, loading/success/error feedback, and accessible status announcements. Show email/social links and a CV download control.

## Backend requirements

- `GET /api/health` returns `{ "ok": true }`.
- `POST /api/contact` accepts `name`, `email`, `subject`, `message`, and honeypot; validate name (2-80), email, message (10-2000), and subject with Zod.
- Reject honeypot submissions without delivering email. Apply a limit of five requests per IP per 15 minutes.
- Persist every valid message in MongoDB, notify the owner and send a visitor auto-reply through SMTP, and return meaningful JSON with appropriate 400/429/500 status codes.
- Validate all required environment variables with Zod and fail startup on invalid or missing configuration. Restrict CORS to `CLIENT_URL`, use Helmet, and log with pino without logging secrets or message bodies.
- Surface persistence and email failures as errors; do not return success when a required operation failed.

## Configuration and documentation

- Provide `.env.example` files for both services and keep `.env` files ignored. Examples contain local URLs and conspicuously fake/placeholder SMTP credentials only; never invent real credentials or commit secrets.
- Document prerequisites, install/run/build commands, local MongoDB and SMTP setup, editable content, environment variables, and deployment of the client to Vercel and API to Render or Railway.
- Include a downloadable CV path with an explicit placeholder asset or a graceful, accessible unavailable state; do not fabricate a real CV.

## Verification

- Install workspace dependencies and run the available typecheck/build/lint/test commands.
- Verify client and server builds, API health behavior, request validation, honeypot/rate-limit behavior where practical, and responsive/reduced-motion fallback behavior.
- Report any tests that cannot run because external MongoDB/SMTP credentials or browser/WebGL facilities are unavailable.

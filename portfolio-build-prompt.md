# Prompt: 3D Scrollable Portfolio for an Electrical Engineering Student

You are a senior full-stack engineer and creative developer. Build a complete, production-ready, full-stack portfolio website for an **Electrical Engineering student**. Write the full code of every file. Do not skip files or leave "TODO" comments.

## 1. Look and feel

- Theme: **maroon and black only**. Use these colors:
  - Black `#0a0708`, deep black `#050304`
  - Maroon `#8c1c2e`, bright maroon (glow) `#c0344a`
  - Text `#f3ebe8`, muted text `#a8999a`, border `#3a1a21`
- No other accent colors. Glow, bloom and light must be maroon or soft pink-white.
- Fonts: a refined serif for headlines (Cormorant Garamond), Inter for body, JetBrains Mono for small technical labels.
- Mood: premium, dark, engineered, like looking inside a high-voltage lab. Not a template.
- Fully responsive, keyboard accessible, and respects `prefers-reduced-motion`.

## 2. The 3D background (fixed behind all content)

Build one fixed full-screen React Three Fiber canvas with an electrical world:

1. **Circuit-board floor:** glowing maroon PCB traces with right-angle turns, solder pads, and pulses of light travelling along the traces.
2. **Floating components:** low-poly resistors, capacitors, ICs, diodes and small transformers drifting slowly with depth fog.
3. **Energy particles:** thousands of tiny points flowing like current, reacting softly to the mouse.
4. **Post-processing:** subtle bloom, vignette and a little film grain.

## 3. The hero 3D element: "The Living Coil"

Choose one electrical component and make it the star: a **copper inductor coil** with glowing current flowing through it. It sits in the background and **changes shape as the user scrolls**, using one mesh with a custom shader and a scroll-progress uniform so the vertices morph smoothly between four forms:

| Scroll section | Shape | Meaning |
|---|---|---|
| Hero | Tight solenoid coil | Inductor |
| About / Skills | Closed toroid | Toroidal transformer |
| Projects | Flowing sine wave | AC signal |
| Experience / Contact | Flat square spiral | PCB trace antenna |

Also: the coil rotates slowly, glow brightness rises on scroll speed, and the camera travels along a smooth curve through the scene. Keep 60 fps on a normal laptop (instanced meshes, capped pixel ratio, lazy-loaded canvas, a simple CSS fallback if WebGL fails).

## 4. Sections (content is placeholder, easy to edit in `src/data/content.ts`)

1. **Hero:** name, one-line role, two buttons (View projects, Contact me).
2. **About:** short bio, university, CGPA, interests.
3. **Skills:** circuit design, power systems, embedded, control, tools (KiCad, LTspice, MATLAB, Simulink, ETAP, Proteus, STM32, ESP32).
4. **Projects:** 4 project cards with title, description, tech tags, and a link. Cards tilt slightly in 3D on pointer move.
5. **Journey:** a real timeline (education, internship, society roles). Numbering is allowed here because it is a sequence.
6. **Contact (last section):** a glass-style **contact box** with fields Name, Email, Subject, Message, plus a send button. It must work end to end (see backend). Show clear loading, success and error states. Next to it show email, LinkedIn, GitHub and a CV download button.
7. **Footer:** simple, black.

Smooth scrolling with Lenis, scroll-linked animation with GSAP ScrollTrigger, and a thin maroon progress bar at the top. Use motion only where it explains something. No fade-up on every block.

## 5. Tech stack (use latest stable versions)

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, GSAP + ScrollTrigger, Lenis, React Hook Form + Zod.

**Backend:** Node.js 22, Express 5, TypeScript, Zod validation, Nodemailer, MongoDB with Mongoose (store every message), Helmet, CORS (allow only the frontend URL), express-rate-limit, pino logging.

## 6. Backend API

- `GET /api/health` returns `{ ok: true }`.
- `POST /api/contact` body: `name`, `email`, `subject`, `message`.
  - Validate with Zod (name 2–80 chars, valid email, message 10–2000 chars).
  - Add a hidden honeypot field to block bots.
  - Rate limit: 5 requests per 15 minutes per IP.
  - Save to MongoDB, then email the owner and send an auto-reply to the visitor.
  - Return clear JSON errors and correct status codes (400, 429, 500).

## 7. Folder structure to generate

```
portfolio/
├── package.json              (workspaces: client, server)
├── README.md                 (setup, run, deploy steps)
├── .gitignore
├── client/
│   ├── .env                  (real values, git-ignored)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css          (Tailwind + theme tokens)
│       ├── data/content.ts
│       ├── three/
│       │   ├── Scene.tsx
│       │   ├── CircuitFloor.tsx
│       │   ├── FloatingParts.tsx
│       │   ├── Particles.tsx
│       │   ├── LivingCoil.tsx
│       │   ├── coilShader.ts   (vertex + fragment shaders)
│       │   └── CameraRig.tsx
│       ├── hooks/useScrollProgress.ts
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Hero.tsx
│       │   ├── About.tsx
│       │   ├── Skills.tsx
│       │   ├── Projects.tsx
│       │   ├── Journey.tsx
│       │   ├── Contact.tsx     (contact box + form)
│       │   └── Footer.tsx
│       └── lib/api.ts
└── server/
    ├── .env                    (real values, git-ignored)
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── app.ts
        ├── config/env.ts       (validate env with Zod)
        ├── config/db.ts
        ├── models/Message.ts
        ├── routes/contact.ts
        ├── controllers/contactController.ts
        ├── middleware/rateLimit.ts
        ├── middleware/errorHandler.ts
        └── utils/mailer.ts
```

## 8. Environment files (create both `.env` and `.env.example`)

`client/.env`
```
VITE_API_URL=http://localhost:5000
VITE_SITE_NAME=Your Name
VITE_LINKEDIN_URL=https://linkedin.com/in/your-handle
VITE_GITHUB_URL=https://github.com/your-handle
```

`server/.env`
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_TO=your-email@gmail.com
MAIL_FROM="Portfolio <your-email@gmail.com>"
```

The server must refuse to start if a required variable is missing, and never expose secrets to the client.

## 9. Quality checklist (the build must pass all of these)

- `npm install` then `npm run dev` starts both client and server with one command.
- The coil visibly morphs through all four shapes while scrolling, and scrolling back reverses it smoothly.
- The contact form saves to the database and sends both emails.
- Lighthouse accessibility 90+, no console errors, works on mobile.
- Colors stay maroon and black everywhere.
- The README explains how to deploy the client (Vercel) and the server (Render or Railway).

## 10. Output format

First show the final file tree, then give every file in order with its full path as a heading and the complete code in a code block. End with the exact commands to install, run and deploy.

## Environment Setup

Follow the steps below to configure the environment variables required by the MindPath AI Study Planner. These values should live in a `.env` (for Prisma scripts) and `.env.local` (for the Next.js runtime) at the project root (`/home/suhith/Pictures/MPP3`).

### 1. Create the env files

```bash
cd /home/suhith/Pictures/MPP3
cp .env.example .env.local  # if an example file exists
```

If there is no template yet, create both `.env` and `.env.local` files manually—Next.js automatically loads `.env.local`, while Prisma CLI and scripts read `.env`.

### 2. Required variables

| Variable | Required By | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Prisma + API routes | PostgreSQL connection string (Supabase or local Postgres). | `postgresql://user:password@db.host:6543/postgres?schema=public` |
| `GROQ_API_KEY` | `/api/ai/chat`, `/api/ai/document`, `/api/ai/study-plan` | API key for Groq’s hosted Llama 3.3 models. Obtain from [console.groq.com](https://console.groq.com/keys). | `gsk_your_key_here` |
| `BASE_URL` | Email templates | Public URL used in verification/reset links. Should include protocol. | `http://localhost:9002` (dev) or `https://app.mindpath.ai` |
| `JWT_SECRET` | Auth token signing (`src/lib/auth/jwt.js`) | Secret string for JSON Web Tokens used across UI + WebSocket auth. Keep this long and random. | `p9c3...random...x5` |
| `JWT_EXPIRES_IN` | Auth token signing | Human-readable expiration window accepted by `jsonwebtoken`. | `24h` |

### 3. Optional variables

| Variable | Purpose | Notes |
| --- | --- | --- |
| `NODE_ENV` | Next.js / Prisma | Defaults to `development`. Set to `production` in hosted environments. |

### 4. Quick validation checklist

1. Run `npx prisma generate` – succeeds if `DATABASE_URL` is reachable.
2. Run `npm run dev:rt` – ensures both Next.js and the WebSocket server boot with JWT + Groq config.
3. Trigger the AI chatbot and study-plan generator – verifies `GROQ_API_KEY`.
4. Trigger email flows (signup, password reset) via a test account – validates SMTP settings and `BASE_URL`.

Keep secrets out of version control—`.env*` files are already ignored by Git. Rotate credentials immediately if they leak. 


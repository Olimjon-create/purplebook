# PurpleBook 📖

A full-stack Next.js study platform with practice tests, registration, and authentication.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth v4 (credentials + Google OAuth)
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional — for Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
npm run db:setup
```

This runs `prisma db push` (creates the SQLite database and all tables) then seeds it with 6 sample practice tests.

### 4. Start the dev server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed the database with sample tests |
| `npm run db:setup` | Push schema + seed (run once) |

---

## Features

### Auth
- **Email/Password registration** at `/auth/signup`
  - Password strength indicator
  - Real-time match validation
  - Auto sign-in after registration
- **Email/Password login** at `/auth/signin` (fixed: uses JWT strategy)
- **Google OAuth** — works when `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set

### Practice Tests
- Browse and filter by subject, difficulty, search
- Timed test taking with countdown timer
- Multiple choice (A/B/C/D)
- Jump-to-question navigation dots
- Instant results with score, grade, and percentage
- Full answer review with explanations

### Dashboard
- Welcome message with stats
- Recent practice tests
- Quick navigation

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → Credentials
3. Create an OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret into `.env`

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── register/             # POST - create account
│   │   └── practice-tests/       # GET list, POST create
│   │       └── [id]/             # GET test, POST submit
│   ├── auth/
│   │   ├── signin/               # Login page
│   │   ├── signup/               # Registration page (NEW)
│   │   └── error/                # Auth error page
│   ├── dashboard/                # Main dashboard
│   ├── practice-tests/           # Test browser
│   │   └── [id]/                 # Test taking page
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # SessionProvider
├── components/
│   └── Navbar.tsx
└── lib/
    ├── auth.ts                   # NextAuth config (fixed)
    └── prisma.ts                 # Prisma singleton

prisma/
├── schema.prisma                 # DB schema
└── seed.js                      # 6 sample practice tests
```

---

## What Was Fixed

### Gmail/Google Login
The root cause was the NextAuth session strategy. Credentials provider requires **`strategy: 'jwt'`** — using the default database strategy with credentials doesn't work unless additional session handling is implemented. The fix in `src/lib/auth.ts`:
```ts
session: {
  strategy: 'jwt',   // ← this is required for credentials to work
},
callbacks: {
  async jwt({ token, user }) { ... },
  async session({ session, token }) { ... },
}
```

### Google OAuth
Google OAuth now only registers when both env vars are present, preventing startup errors when they're empty. The `OAuthAccountNotLinked` error page shows a helpful message if a user tries Google with an email already registered via password.

---

## Sample Practice Tests Included

| Title | Subject | Difficulty | Questions |
|---|---|---|---|
| Basic Mathematics – Algebra & Equations | Mathematics | Easy | 5 |
| General Science – Physics Fundamentals | Physics | Medium | 6 |
| World History – Ancient Civilizations | History | Medium | 5 |
| Computer Science – Programming Basics | Computer Science | Easy | 5 |
| Chemistry – Periodic Table & Reactions | Chemistry | Hard | 6 |
| English Grammar & Vocabulary | English | Easy | 5 |

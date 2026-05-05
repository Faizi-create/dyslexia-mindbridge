# Dyslexia MindBridge

An adaptive learning companion for Pakistani children aged 6–12 with dyslexia.

The app combines a child-friendly mobile experience, a parent dashboard with
AI-generated insights, and a web admin console — all backed by a single
Express + MongoDB API and Google's Gemini for personalized recommendations.

---

## Table of contents

1. [What it does](#what-it-does)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Repository layout](#repository-layout)
4. [Prerequisites](#prerequisites)
5. [Setup (first time)](#setup-first-time)
6. [Running the project](#running-the-project)
7. [How the mobile app works](#how-the-mobile-app-works)
8. [How the admin panel works](#how-the-admin-panel-works)
9. [How the backend works](#how-the-backend-works)
10. [How the AI engine works](#how-the-ai-engine-works)
11. [Languages and themes](#languages-and-themes)
12. [Offline mode](#offline-mode)
13. [Database structure](#database-structure)
14. [API reference](#api-reference)
15. [Troubleshooting](#troubleshooting)
16. [Security checklist](#security-checklist)
17. [Known gaps](#known-gaps)

---

## What it does

**For the child** — a calm, dyslexia-friendly app that adapts to their pace:

- Bottom tab navbar: **Home / Learn / Rewards**
- Daily goal of 5 activities, tracked with a circular progress ring + streak counter
- Four learning modules: **Phonics, Reading, Vocabulary, Pronunciation**
- Each activity gives **immediate corrective feedback** — not just "wrong" but
  *why*, with the chosen option's specific hint
- **Confetti** + reward modal when goals are hit; per-module progress bars
- Optional **gamified warm-up assessment** that seeds the learner profile
- No timers, no speed-based scoring, no harsh red/green colors
- **Lexend** dyslexia-friendly font (swappable to OpenDyslexic)

**For the parent** — a focused 3-tab dashboard:

- **Overview** — gradient hero with mastery %, time today/week, activities,
  streak, per-module progress bars
- **Insights** — Gemini-generated strengths / things to work on / recommended
  next steps; one-tap progress report
- **Settings** — daily time limit, accessibility toggles (high contrast,
  large text, audio hints), **app language (English/Urdu)**, **theme
  (light/dark)**, switch child, log out

**For the admin** (separate Next.js dashboard on the web):

- Sidebar with **Overview, Users, Children, Exercises, Analytics, Logs**
- Full **CRUD on exercises** with a modal editor (options, hints, language,
  difficulty)
- User role management (parent / child / admin) and account deletion
- Read-only views over students and learning sessions
- System-wide analytics (counts, weekly sessions)

---

## Architecture at a glance

```
┌──────────────────┐    Firebase Auth      ┌──────────────────┐
│  Mobile (Expo)   │ ◄───────────────────► │     Firebase     │
│  React Native    │   Firestore writes    │ (Auth+Firestore) │
└────────┬─────────┘                       └──────────────────┘
         │ REST  /api/ai/*
         │
┌────────▼─────────┐    Mongoose           ┌──────────────────┐
│   Backend API    │ ◄───────────────────► │  MongoDB Atlas   │
│  Express + TS    │                       │   (analytics +   │
│  + Firebase-     │   Gemini API          │   admin source   │
│  Admin + Zod     │ ────────────────────► │   of truth)      │
└────────▲─────────┘                       └──────────────────┘
         │ JWT (admin)
┌────────┴─────────┐
│   Admin Web      │
│  Next.js + Tail  │
└──────────────────┘
```

**Two stores by design:**
- **Firestore** — real-time synced data the mobile app reads/writes directly
  (children, learning sessions). Cheap, low-latency, no extra hop.
- **MongoDB** — backend's own store for admin-side reporting, content management,
  and historical analytics.

---

## Repository layout

```
faizan-fyp/
├── mobile/                # Expo SDK 54 + React Native 0.81 + TypeScript
│   ├── App.tsx
│   ├── src/
│   │   ├── components/    # GradientButton, ProgressRing, Confetti, ChildPicker, etc
│   │   ├── config/        # Firebase init + env loader
│   │   ├── constants/     # Light + dark color palettes, typography, spacing
│   │   ├── context/       # Auth, Theme, Language, Parent contexts
│   │   ├── data/          # Seeded exercises (offline fallback)
│   │   ├── i18n/          # English + Urdu translation tables
│   │   ├── navigation/    # Root + Auth + Select + Child(Tabs) + Parent(Tabs) navigators
│   │   ├── screens/       # auth/, child/, parent/
│   │   ├── services/      # auth, progress, AI client, TTS, haptics, offline queue
│   │   └── types/         # shared TypeScript types
│   ├── .env               # Firebase web config + API base URL
│   └── package.json
│
├── backend/               # Node 20 + Express + Mongoose + Firebase Admin
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts       # entry point
│   │   ├── config/        # env, mongo, firebase admin
│   │   ├── middleware/    # firebaseAuth, adminAuth, errorHandler
│   │   ├── models/        # User, Student, Exercise, LearningSession, …
│   │   ├── routes/        # /api/auth, /api/students, /api/ai, /api/admin, …
│   │   ├── services/      # gemini, adaptive (next-activity engine, insights)
│   │   └── utils/         # seedExercises script
│   ├── .env               # Mongo URI, JWT secret, admin creds, Gemini key
│   ├── firebase-service-account.json
│   └── package.json
│
└── admin-web/             # Next.js 15 App Router + Tailwind
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx       # redirects to /login
    │   ├── login/
    │   └── dashboard/     # nested layout w/ AuthGate, sidebar, 6 pages
    ├── components/        # Sidebar, AuthGate
    ├── lib/api.ts         # admin token + fetch wrapper
    ├── tailwind.config.ts
    └── package.json
```

---

## Prerequisites

- **Node 20+** and **npm 10+**
- **MongoDB Atlas cluster** — connection URI already in `backend/.env`
  - Make sure your current public IP is in **Network Access**, or temporarily
    allow `0.0.0.0/0` for dev
- **Firebase project `dexlexia-c4ca9`**:
  - A **Web App** registered (config already in `mobile/.env`)
  - **Email/Password** sign-in enabled in Authentication
  - **Firestore Database** created (Test mode is fine for dev)
- **Gemini API key** (already in `backend/.env`)
- **Expo Go** on your phone (Play Store / App Store) — must support **SDK 54**;
  if your Expo Go is older, just update it from the store

---

## Setup (first time)

### 1. Install all dependencies

```bash
cd mobile     && npm install
cd ../backend && npm install
cd ../admin-web && npm install
```

### 2. Seed sample data into MongoDB (recommended)

Gives you 24 exercises, 3 parent users, 5 children, and 16 learning sessions
so the admin panel actually shows data:

```bash
cd backend
npm run db:seed
```

You can re-run this anytime — it only clears `seed-uid-*` rows, so any real
users created via the mobile app stay intact.

### 3. (Mobile only) Verify Firebase web config

`mobile/.env` should have all six `EXPO_PUBLIC_FIREBASE_*` filled in. If the
mobile app shows a red `auth/invalid-api-key` screen, the values are missing.

---

## Running the project

You'll want **three terminals** open. Each command starts one service.

### Terminal 1 — backend API (port **4001**)

```bash
cd backend
npm run dev
```

You should see:
```
[firebaseAdmin] initialized for project dexlexia-c4ca9
[db] MongoDB connected
[server] listening on http://localhost:4001
```

Quick health check: `curl http://localhost:4001/health` → `{"status":"ok",...}`

### Terminal 2 — admin web dashboard (port **3001**)

```bash
cd admin-web
npm run dev
```

Open **http://localhost:3001** in your browser. You'll be redirected to
`/login`. Log in with:

- Email: `admin@dyslexiamindbridge.com`
- Password: `Admin@Strong2026`

Both are configurable via `backend/.env`.

### Terminal 3 — mobile app (Metro bundler on **8082**)

```bash
cd mobile
npm run start
```

Scan the QR code with **Expo Go**. If your network blocks Expo's CDN, run:

```bash
EXPO_OFFLINE=1 npm run start
```

---

## How the mobile app works

### Navigation flow

```
Not signed in:
  Login → Register → Forgot password
                  ↘
Signed in (parent):
  Child Selection → either:
    1. Pick a child → Child mode (3-tab navbar)
        ├─ Home    (avatar, ring, streak, big CTAs)
        ├─ Learn   (4 module tiles with progress)
        └─ Rewards (badges, stat cards, module bars)
        plus pushed: Exercise, Assessment

    2. Parent dashboard (3-tab navbar)
        ├─ Overview (mastery, stats, skill bars)
        ├─ Insights (AI-generated report)
        └─ Settings (limits, accessibility, language, theme, account)
```

### Auth model

- **Parent** registers via Firebase Auth (email + password)
- **Child** never types a password — parent picks them from the child-selection
  screen, and a `selectedChildId` is stored in **`expo-secure-store`** so the
  child auto-logs in next launch
- `RootNavigator` decides which stack to render based on `firebaseUser`,
  `profile.role`, `activeMode`, and `activeChild` from `AuthContext`

### Child experience

Each activity flow:

1. Mobile picks the next exercise via **`requestNextActivity`** — calls
   `/api/ai/next-activity`, falls back to in-app rule-based picker if backend
   is unreachable
2. Child taps an answer → **immediate visual feedback** (correct/incorrect),
   plus the option's hint or the exercise's explanation if wrong
3. Confetti burst on correct; haptic feedback both ways
4. **Sticky "Next activity"** button stays pinned at bottom — feedback can
   scroll without hiding the next-step button
5. After 5 activities, the **daily goal modal** appears with a 🏆 animation
6. Every attempt is recorded into Firestore via `progressService.recordAttempt`
   — and queued in AsyncStorage if offline (see [Offline mode](#offline-mode))

### Parent experience

Each parent tab loads stats fresh on focus. The **Insights** tab POSTs to
`/api/ai/insights` and renders Gemini's structured response (mastery score
+ strengths / challenges / recommendations). If Gemini fails, the backend
returns a rule-based fallback.

### Adaptive engine in the mobile fallback

When the backend is unreachable, `aiService.requestNextActivity` runs a
local rule:

- Last 5 attempts ≥90% correct → **level up** (max 5)
- Last 5 attempts <60% correct → **level down** (min 1)
- Otherwise → stay at current level

The same thresholds run server-side in `backend/src/services/adaptive.ts`,
with Gemini optionally re-ranking the candidate exercises.

---

## How the admin panel works

### Login

- Visit `http://localhost:3001` → redirects to `/login`
- Submit email + password → backend `POST /api/auth/admin/login` validates
  against `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, returns a
  signed JWT
- Token stored in `localStorage` under `dmb.adminToken`
- Every dashboard page is wrapped in `<AuthGate>` — if no token (or token
  rejected), user is bounced back to `/login`

### Pages

| Page | What it does |
|---|---|
| **Overview** | 5 metric cards — total users, children, exercises, total sessions, sessions this week |
| **Users** | List of all users with role dropdown (parent / child / admin) and delete button |
| **Children** | Read-only list of all student profiles across all parents — name, age, current level, parent UID, signup date |
| **Exercises** | Filterable table by module type. Modal editor lets you create/edit any exercise: type, language (en/ur), difficulty 1–5, prompt, instruction, options with hints, correct option ID, target word, explanation |
| **Analytics** | Same metrics as Overview but presented as larger feature cards |
| **Logs** | System logs (info/warn/error) — model + endpoint exist; populate by adding `SystemLogModel.create(...)` to backend errors when needed |

### Auth flow under the hood

```
Browser              Admin Web           Backend             MongoDB
  │ /login              │                  │                    │
  ├──────────────────► │                  │                    │
  │                    │ POST /api/auth/  │                    │
  │                    │    admin/login   │                    │
  │                    ├────────────────► │                    │
  │                    │                  │ ✓ env credentials  │
  │                    │ ◄──{ token }─────┤                    │
  │ store in           │                  │                    │
  │ localStorage       │                  │                    │
  │                    │                  │                    │
  │ /dashboard         │                  │                    │
  ├──────────────────► │                  │                    │
  │                    │ GET /api/admin/  │                    │
  │                    │ analytics        │                    │
  │                    │ Authorization:   │                    │
  │                    │   Bearer <token> │                    │
  │                    ├────────────────► │ verify JWT         │
  │                    │                  ├──────────────────► │
  │                    │ ◄──── data ──────┤                    │
```

---

## How the backend works

### Stack

- **Express 4** with **Helmet**, **CORS**, **morgan**, **express-rate-limit**
- **Mongoose** for MongoDB
- **firebase-admin** for verifying mobile-app ID tokens
- **jsonwebtoken** for admin JWTs
- **zod** for request validation on every route
- **@google/generative-ai** for Gemini calls

### Auth layers

| Middleware | Used by | What it does |
|---|---|---|
| `requireFirebaseAuth` | All `/api/auth`, `/api/students`, `/api/sessions`, `/api/exercises`, `/api/reports`, `/api/ai` | Reads `Authorization: Bearer <idToken>`, verifies with Firebase Admin, attaches `req.firebaseUser` |
| `requireAdmin` | All `/api/admin/*` | Reads same header but expects an admin JWT signed by `JWT_SECRET`, attaches `req.admin` |

### Routes

See [API reference](#api-reference) below.

### Startup

```
backend/src/index.ts:
  1. initFirebaseAdmin()   — loads firebase-service-account.json
  2. connectMongo()        — connects to Atlas
  3. createApp()           — wires middleware + routes
  4. app.listen(4001)
```

---

## How the AI engine works

The brief asked for adaptive learning. The implementation is two-tiered so it
**always works** even if Gemini or the backend are unreachable:

### Tier 1 — Rule-based (always runs)

In `backend/src/services/adaptive.ts`:

```
windowOfLast5 ≥ 90% correct  → level += 1
windowOfLast5 <  60% correct  → level -= 1
otherwise                     → stay
```

Picks a candidate pool from MongoDB matching `(type, language, difficulty
within ±1 of the new level)`.

### Tier 2 — Gemini re-ranking (best effort)

If `GEMINI_API_KEY` is set, `services/gemini.ts` sends:

```json
{
  "system": "You pick the most helpful next exercise for a dyslexic child …",
  "user":   "{ learnerProfile, recentAttempts, nextLevel, pool: [...] }"
}
```

Gemini responds with `{ pickIndex, reason }`. Backend uses that index to pick
from the pool. If Gemini errors out, backend just picks randomly from the pool.

The mobile app calls `/api/ai/next-activity`. If the backend itself is down,
the mobile's `aiService.ts` runs the same rule-based logic on the in-app
seeded exercises so learning never blocks.

### Insights endpoint

`POST /api/ai/insights` works the same way — Gemini generates structured
JSON `{ masteryScore, strengths[], challenges[], recommendations[] }`, with
a rule-based fallback if Gemini isn't available.

---

## Languages and themes

### English ↔ Urdu

- Toggle in **Parent → Settings → App language**
- Persisted to AsyncStorage under `dmb.appLanguage`
- Strings live in `mobile/src/i18n/strings.ts` — every key has both `en` and
  `ur` versions
- The `useTranslation()` hook returns `{ lang, setLang, t }`. Use:
  ```tsx
  const { t } = useTranslation();
  <Text>{t('letsLearn')}</Text>
  ```
- Exercise content (prompts, options) also has Urdu seed entries — the AI
  engine respects the child's `learnerProfile.preferredLanguage`

### Light ↔ Dark theme

- Toggle in **Parent → Settings → Appearance**
- Persisted to AsyncStorage under `dmb.themeMode`
- Two palettes in `mobile/src/constants/colors.ts` — `lightColors` (warm
  cream + soft blue) and `darkColors` (soft navy + warm text). Both stay
  dyslexia-friendly (no harsh contrast)
- Use the `useTheme()` hook:
  ```tsx
  const { colors, isDark } = useTheme();
  ```

Translated + theme-aware screens: Child Home, Lesson Menu, Rewards, Parent
Overview, Parent Insights, Parent Settings, both bottom navbars. Auth +
ChildSelection + Exercise + Assessment screens still use the static palette
(known follow-up).

---

## Offline mode

The brief required core learning to keep working without internet.

- **Exercise bank** — `mobile/src/data/exercises.ts` ships with 20+
  exercises bundled in the JS bundle; the AI client falls back to these
  when the backend is unreachable
- **Progress writes** — `progressService.recordAttempt` tries Firestore
  first; on failure it queues into AsyncStorage via
  `services/offlineQueue.ts`
- **Auto-sync** — `App.tsx` runs `startOfflineSync()` on mount, which
  installs a `NetInfo` listener that flushes the queue when connectivity
  returns

---

## Database structure

### MongoDB (admin source of truth)

| Collection | Schema highlights |
|---|---|
| `users` | `firebaseUid`, `email`, `name`, `role` (parent/child/admin) |
| `students` | `parentFirebaseUid`, `name`, `age`, `grade`, `avatarIndex`, `currentLevel`, `dailyTimeLimitMinutes`, `learnerProfile`, `accessibility` |
| `exercises` | `type`, `language`, `difficulty`, `prompt`, `instruction`, `options[{id,label,hint}]`, `correctOptionId`, `targetWord`, `targetSentence`, `explanation` |
| `learningsessions` | `studentId`, `date`, `startedAt`, `endedAt`, `totalTimeMs`, `exercisesCompleted`, `correctCount`, `score`, `attempts[]` |
| `progressreports` | `studentId`, `generatedAt`, `masteryScore`, `moduleScores`, `insights[]`, `recommendations[]` |
| `assessments` | `studentId`, `results[]`, `aiReview`, `recommendedLevel` |
| `systemlogs` | `level`, `message`, `context`, `createdAt` |

### Firestore (mobile real-time store)

- `users/{firebaseUid}` — same shape as MongoDB User but Firestore-keyed
- `students/{autoId}` — child profiles, queried by `parentId`
- `learningSessions/{autoId}` — session docs with `attempts` array

---

## API reference

All `/api/*` paths are relative to `http://localhost:4001`.

### Public

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/auth/admin/login` | `{ email, password }` | Returns `{ token, expiresIn }` |

### Mobile (Bearer = Firebase ID token)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/sync` | Upserts the Firebase user in MongoDB |
| GET | `/api/auth/me` | Current user profile |
| GET / POST / PATCH / DELETE | `/api/students` | List parent's children, create, update, delete |
| GET | `/api/exercises?type=&language=&difficulty=` | Filterable exercise list |
| GET | `/api/exercises/:id` | Single exercise |
| POST | `/api/sessions` | Start a learning session for a student |
| POST | `/api/sessions/:id/attempt` | Append an attempt to a session |
| POST | `/api/sessions/:id/end` | Close a session, compute score |
| GET | `/api/sessions/by-student/:studentId` | Recent sessions for a child |
| POST | `/api/ai/next-activity` | Adaptive engine — returns the next exercise |
| POST | `/api/ai/insights` | Gemini-generated parent insights |
| POST | `/api/reports/generate` | Generate + persist a progress report |
| GET | `/api/reports/by-student/:studentId` | Recent reports for a child |

### Admin (Bearer = admin JWT)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/role` | Change a user's role |
| DELETE | `/api/admin/users/:id` | Remove a user |
| GET | `/api/admin/students` | All children across the platform |
| GET | `/api/admin/exercises?type=&language=` | All exercises (filterable) |
| POST / PATCH / DELETE | `/api/admin/exercises/:id?` | Full CRUD on exercise content |
| GET | `/api/admin/analytics` | System counts |
| GET | `/api/admin/logs?level=` | System logs |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Mobile shows red `auth/invalid-api-key` | Missing Firebase web config in `mobile/.env` | Copy from Firebase Console → Project Settings → Web App |
| Backend startup: `MongoNetworkError: SSL alert number 80` | Your IP isn't in MongoDB Atlas allowlist, or cluster paused | Atlas → Network Access → Add current IP. If cluster paused, click Resume |
| Rewards screen: "query requires an index" | Firestore composite index needed | Already mitigated — we sort client-side. If you re-add `orderBy`, click the link in the error to auto-create the index |
| Expo Go: "this project is incompatible with your version of Expo Go" | Expo Go on phone is older than SDK 54 | Update Expo Go from the Play Store, or run a dev build |
| `Cannot find module 'babel-preset-expo'` on Metro start | Hoisted dep got pruned | Already pinned in `mobile/package.json devDependencies` |
| `npm run start`: `TypeError: fetch failed` from `validateDependenciesVersions` | Network blip — Expo can't reach `api.expo.dev` | `EXPO_OFFLINE=1 npm run start` |
| Admin pages show "Unauthorized" | JWT expired (12h lifetime) | Just log in again |

---

## Security checklist

The Gemini key, MongoDB URL, and Firebase service-account private key were
shared in plain text during initial setup. **Treat them as compromised.**

- [ ] Regenerate the Gemini API key in Google AI Studio
- [ ] Reset the MongoDB Atlas user password
- [ ] Generate a fresh Firebase service-account key and delete the old one
- [ ] Tighten Firestore rules — switch from "test mode" to per-user rules
- [ ] Change `ADMIN_PASSWORD` and `JWT_SECRET` in `backend/.env`
- [ ] Restrict MongoDB Atlas Network Access to known IPs (drop `0.0.0.0/0`)
- [ ] Don't ship `EXPO_PUBLIC_GEMINI_API_KEY` in any production mobile build
      — calls already proxy through the backend

---

## Known gaps

| Item | Why | Workaround / next step |
|---|---|---|
| Real speech-to-text in pronunciation module | Expo Go can't load native STT modules | Self-report "I said it!" UI is wired; swap in `@react-native-voice/voice` with a dev build |
| Push notifications to parents | Not yet wired | Add `expo-notifications` + a backend cron that triggers daily summaries |
| Some screens still light-only / English-only | Refactor follows the same `useTheme + useTranslation` pattern, just hadn't been applied yet | Auth, ChildSelection, CreateChild, Exercise, Assessment screens |
| OpenDyslexic font | Brief asked for OpenDyslexic, currently Lexend | Drop `OpenDyslexic-Regular.otf` into `mobile/src/assets/fonts/` and update `constants/typography.ts` |
| Firestore ↔ MongoDB sync | Mobile writes Firestore directly; backend reads MongoDB. Admin only sees seeded + backend-routed data | Add a Firebase Cloud Function to mirror Firestore writes into MongoDB, or route mobile writes through the backend |
| EAS Build config | No `eas.json` yet | Run `eas build:configure` when you're ready to ship APK/AAB |
| At-rest encryption of child-specific fields | Relying on Firestore's native encryption | Add field-level encryption if compliance requires it |

---

## License

FYP project — not licensed for commercial use without permission.

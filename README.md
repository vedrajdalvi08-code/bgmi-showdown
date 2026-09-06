# BGMI SHOWDOWN — Official Esports Tournament

Battlegrounds Mobile India Esports Tournament Management System with live leaderboards, scoring engine, room match results, and secure admin control.

---

## Features (Detailed)

- Live Leaderboard
  - Real-time leaderboard with per-match breakdown, kills, placement points, and total points.
  - Leaderboard updates automatically (client polls the server every 12 seconds).
  - Supports group-stage and grand finals leaderboards and per-group filtering.

- Reliable Scoring Engine
  - Configurable placement points and kill point value.
  - Tie-breaker ordering selectable via configuration (e.g., total_points, total_kills, placement_points, best_placement, recent_match).
  - Match-level point calculation uses placement + kill points.

- Tournament Structure & Match Management
  - Group stage and Grand Finals stages supported.
  - Match scheduling with maps, match numbers, status (Scheduled, Live, Completed, Locked) and locking.
  - Per-match results recording (placement, kills) and computed match results stored in DB.

- Teams, Players & Rosters
  - Teams have name, tag, logo URL, group assignment and status.
  - Players linked to teams with roles and in-game identifiers.

- Admin Panel (Desktop-only)
  - Secure admin console accessible only from desktop workstations.
  - Admin pages: Dashboard, Teams, Matches, Results, Finals, Rules, Settings.
  - Admin authentication via service-side password and admin sessions (tokens stored server-side).
  - Audit logs for admin actions and login attempt tracking.

- Rules & Rulebook
  - Rulebook and tournament rules displayable from the frontend.
  - Default rules included (eligibility, fair play, room rules, scoring, qualification, anti-cheat, disputes).

- Backend & Data Storage
  - Server uses Express + Vite (dev middleware) and can serve static build in production.
  - Supabase (Postgres) used for persistence via service-role client on the server.
  - Database schema provided at `supabase/schema.sql` (tables include tournament_settings, groups, teams, players, matches, match_results, tournament_rules, admin_auth, admin_sessions, audit_logs, login_attempts).

- Security & Operations
  - Admin-only secret values (SUPABASE_SERVICE_ROLE_KEY) are required server-side and must never be exposed to the frontend.
  - Admin password initialization and PBKDF2 password hashing with salt.
  - Audit logs and login attempt throttling.

- UX & Theming
  - Dark/light theme toggle persisted in localStorage (default: dark).
  - Mobile-first responsive frontend; admin panel intentionally restricted on mobile.

- Deployments & Hosting
  - Ready for Vercel (Vite preset) or Netlify (see `netlify.toml`).
  - Example Netlify configuration provided to publish `dist` and route `/api/*` to Netlify Functions.

- Developer Tools & Utilities
  - API routes mounted under `/api` (server-side router).
  - Health-check endpoint at `/api/health`.
  - Server listens with port fallback (try preferred port, then preferred+1..+4).

---

## Run Locally

Prerequisites: Node.js

1. Install dependencies:
   `npm install`
2. Set environment variables in `.env.local`:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - ADMIN_PASSWORD
   - GEMINI_API_KEY
3. In the Supabase SQL Editor, run `supabase/schema.sql`.
   - The service role key is server-only and must never be exposed to the frontend.
4. Run the app:
   `npm run dev`

---

## Deploy to Vercel

1. Push this project to GitHub and import the repository in Vercel.
2. Keep the default framework preset as **Vite**.
3. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `GEMINI_API_KEY` in Vercel Project Settings.
4. Run the SQL in `supabase/schema.sql` once against the project database.
5. Deploy with the default build command: `npm run build`.

The frontend is served by Vercel and API requests are routed to `api/index.ts` (server build or serverless route depending on deployment).

---

## Deploy to Netlify

- `netlify.toml` is included with a `npm run build:netlify` build command and `dist` publish directory. API routes are redirected to Netlify functions via the redirects configuration.

---

## API Endpoints (Public & Admin)

Notes: Many endpoints require admin session/auth when mutating data. The server exposes the following public-facing endpoints used by the frontend:

- GET /api/health — health check
- GET /api/tournament — public tournament settings, stats, nextMatch, recentMatch
- GET /api/teams — list teams and basic metadata
- GET /api/matches — list matches and their status
- GET /api/groups — groups and roster membership
- GET /api/leaderboard?stage=<group|finals>&groupId=<id> — computed leaderboard and match list

Admin APIs (server-side protected) include endpoints to manage teams, matches, results, rules, and settings. See server routes in `server/routes.js` for full details.

---

## Database (Supabase) Schema Highlights

Primary tables (see `supabase/schema.sql` for full details):

- tournament_settings: key-value configuration for scoring and qualifiers
- groups: grouping & seeding of teams
- teams: team metadata (name, tag, logo_url, group_id, status)
- players: player metadata and roster linkage
- matches: match definitions (match_number, name, stage, group_id, map, status, scheduling)
- match_results: per-match recorded placement + kills, computed points
- tournament_rules: rule entries, categories and display order
- admin_auth, admin_sessions: password hash, salts and admin tokens
- audit_logs, login_attempts: operational logs and throttling

---

## Scoring Configuration

- Placement points and kill point value are stored in `tournament_settings` and parsed by the server. Defaults are:
  - Placement points: {1:10, 2:6, 3:5, 4:4, 5:3, 6:2, 7:1, 8:1}
  - Kill point value: 1
  - Tie-breaker order: ["total_points","total_kills","placement_points","best_placement","recent_match"]

The scoring engine computes placement points + (kills * kill_point_value) for each match.

---

## Admin Panel (Overview)

- Desktop-only access notice and UX restriction on mobile devices.
- Pages available for tournament operators:
  - Admin Dashboard — quick stats and controls
  - Teams — add/edit teams and their metadata
  - Matches — schedule matches, set maps and status, lock matches
  - Results — enter per-match results (placement, kills) and recalculate leaderboard
  - Finals — finals-specific controls and qualification handling
  - Rules — edit tournament rules and order
  - Settings — update scoring, qualifiers per group, and other site-level settings

Admin authentication uses a server-side password (set via ADMIN_PASSWORD) that is hashed and stored in `admin_auth`.

---

## Notes for Developers

- Theme preference is persisted in `localStorage` under `bgmi_theme`.
- Server uses Vite middleware in development for hot reload; in production the `dist` folder is statically served.
- Health-check endpoint: `/api/health`.
- Server port fallback: tries preferred port, then next 4 ports if in-use.

---

## Where to Look in the Code

- Frontend: `src/` (pages, components, context)
- Backend server (dev): `server.ts`, `server/routes.js`, `server/db.ts`, `server/scoring.ts`
- API wrapper (lambda/dev): `api/index.ts`
- Database schema: `supabase/schema.sql`
- Defaults & rules: `src/data/defaults.ts`
- Netlify config: `netlify.toml`

---

If you'd like, I can:
- Expand or reword any feature descriptions,
- Add badges (build/status/license),
- Include screenshots or a demo link (attach images or provide URLs),
- Or open a PR instead of committing to the default branch.



## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `GEMINI_API_KEY` in `.env.local`.
3. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). The service role key is server-only and must never be exposed to the frontend.
4. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push this project to GitHub and import the repository in Vercel.
2. Keep the default framework preset as **Vite**.
3. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `GEMINI_API_KEY` in Vercel Project Settings.
4. Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) once against the project database.
5. Deploy with the default build command: `npm run build`.

The frontend is served by Vercel and API requests are routed to `api/index.ts`.

### Database

The server uses Supabase Postgres through the service-role client. RLS is disabled for the backend tables because the service key is never sent to browsers. Keep the service key only in server/Vercel environment variables.

# TRENDOVA — Free Vercel + Supabase

Live-demo architecture: static frontend on Vercel + Node.js Vercel Function API + Supabase PostgreSQL.

## Local run
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `DATABASE_SSL=true` for PostgreSQL, or omit them for local SQLite.
3. Run `npm start`.
4. Open http://localhost:3000.

## Vercel
- Connect this repository to Vercel.
- No `vercel.json` is required.
- Add `DATABASE_URL` and `DATABASE_SSL=true`.
- Deploy.

The production API entry point is `api/[...path].js`. `local-server.js` is only for local development.

# TRENDOVA — Netlify + Supabase Free Deployment

## Structure
- `public/` — frontend yang dipublish Netlify
- `netlify/functions/api.js` — adapter Netlify untuk backend TRENDOVA
- `api/[...path].js` — core API/business logic
- `schema.sql` — referensi skema PostgreSQL

## Environment Variables
Set di Netlify:
- `DATABASE_URL` — PostgreSQL URI dari Supabase
- `DATABASE_SSL=true`

## Local
`npm start`

## Production
Connect the GitHub repository to Netlify. Build command can be empty; publish directory is `public` and functions directory is `netlify/functions`.


V10 FIX: normalizes Netlify function paths so /api/* requests reach the core router correctly.

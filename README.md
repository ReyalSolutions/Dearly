# Dearly

**Say what you feel, beautifully.** Dearly is a mobile-first digital-letter platform built with Vite, Bootstrap 5, JavaScript modules, and Supabase.

## What is ready

- Polished responsive landing page, navigation, template catalogue, and PWA shell
- Supabase Auth flows for email/password registration, login, password reset, email verification redirects, and optional Google sign-in
- Personal dashboard with real letter statistics, recent letters, loading and empty states
- Letter editor with Quill rich text, themes, fonts, background/text color controls, decorative elements, resize/rotate/layer/duplicate/delete controls, image and audio uploads, debounced autosave, and publish validation
- Public share route with an envelope-opening experience, opt-in private audio playback, reactions, interactive questions, an optional hidden-message reveal, a protected reply flow, private social metadata, and no creator account ID in the recipient payload
- Creator profile/privacy settings and a real notification inbox backed by the Supabase notification table
- A complete initial database migration, RLS policies, storage policies, event notifications, and starter-template seed data

## Requirements

- Node.js 20+
- A Supabase project

## Install

```bash
npm install
cp .env.example .env.local
```

Set these values in `.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The browser only receives the anonymous key. Never add a service-role key to any `VITE_` variable.

## Database setup

1. Create a Supabase project.
2. Run the SQL files in [`supabase/migrations`](supabase/migrations) in numerical order, beginning with `0001_initial_schema.sql` and then `0002_public_letter_audio.sql`.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to add the starter template catalogue.
4. In Authentication settings, add the local and production URLs as redirect URLs.
5. Optionally enable Google in Supabase Auth before showing the Google button to end users.

The migration creates profiles automatically after signup, enables RLS on every user-data table, uses owner policies for creator data, and exposes recipient letters only through the limited `get_public_letter` function. It also keeps uploaded letter images private until their parent letter is public.

## Run locally

```bash
npm run dev
```

Open the URL printed by Vite. The editor can be explored without configuration, but saving, authentication, and public links require Supabase values and the migration.

## Build

```bash
npm run build
npm run preview
```

The Vite scripts use the runner config loader because it is more reliable in permission-restricted Windows environments.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Deploy using the default `npm run build` command.
4. Add the deployed domain to Supabase Auth redirect URLs.

[`vercel.json`](vercel.json) rewrites client routes (including `/l/{share_slug}`) to the app shell, so a refreshed public letter route remains available.

## Next delivery phases

1. Connect the template catalogue and full letter list to the seeded tables.
2. Add a memory gallery, richer envelope options, and scheduled publishing.
3. Build server-side dynamic Open Graph previews and scheduled publishing.
4. Perform Supabase policy, upload, responsive, accessibility, and bundle-size audits before launch.

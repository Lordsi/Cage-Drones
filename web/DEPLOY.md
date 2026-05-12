# CAGE web — deployment and Supabase setup

## Environment variables

Copy `.env.local.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase **Settings → API** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `NEXT_PUBLIC_SITE_URL` | Production site origin, e.g. `https://www.cagemw.com` (used for auth redirects) |

Do **not** expose the service role key in the browser. This app uses RLS and RPCs only.

## Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL migrations in order from `supabase/migrations/` (Supabase SQL Editor or `supabase db push` with the CLI). Includes `announcements`, `profiles_role_guard` (only admins may change `profiles.role` via the API), portal bulletins, and instructor **Gradebook** (`/teacher/courses/[id]/gradebook`).
3. **Authentication → URL configuration**
   - **Site URL**: your production URL (or `http://localhost:3000` for local dev).
   - **Redirect URLs** (optional if you only use password sign-in from the app): include  
     `http://localhost:3000/auth/callback`  
     and  
     `https://<your-production-domain>/auth/callback`
4. **Authentication → Providers → Email**: enable **Email** with **password** sign-in. Disable **magic link / OTP** if you want passwords only.
5. Create storage buckets if the migration did not run end-to-end: `course-resources` and `assignment-submissions` (private).

## Roles and portals

- **Student** (`student`): learning hub at `/portal` (dashboard, exams, assignments, grades, resources).
- **Teacher** (`instructor` in the database, shown as “Teacher” in the UI): course tools at `/teacher` (courses, exams, gradebook, announcements).
- **Admin** (`admin`): **Administration** at `/admin` (user list and role changes) plus access to `/teacher` and `/portal` from the nav.

New sign-ups default to **Student**. Only an admin can assign Teacher or Admin (UI: **Administration → Users**, or SQL below for the first admin).

## First admin user

After the first account exists, promote it once (then use the app to manage other users):

```sql
update public.profiles
set role = 'admin'
where id = '<your-auth-user-uuid>';
```

Then use **Administration → Users** to set roles, and **Teacher portal** to create courses and enroll students by their Auth user UUID.

## Next.js hosting

- **Vercel**: connect the `web` folder repo, set the env vars above, set **Root Directory** to `web` if the repo root is the monorepo parent.
- **Render**: Web service, build `npm install && npm run build`, start `npm start`, same env vars.

Build locally:

```bash
cd web
npm run build
```

## Content paths for resources

Upload files to the `course-resources` bucket with path:

`<course_uuid>/<filename>`

Store that full path in `resources.storage_path` so students get a signed download link.

Assignment uploads use the client; paths are `<assignment_uuid>/<user_uuid>/<filename>`.

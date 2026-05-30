# CAGE web — deployment and Supabase setup

## Environment variables

Copy `.env.local.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase **Settings → API** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `NEXT_PUBLIC_SITE_URL` | Production site origin, e.g. `https://www.cagemw.com` (used for auth redirects) |
| `RESEND_API_KEY` | _(optional)_ Resend API key. If set, transactional emails (booking / quotation / training application notifications) are delivered inline. If not set, messages are queued in `email_outbox` and can be drained by a worker. |
| `CAGE_ADMIN_EMAIL` | _(optional)_ Recipient for admin notifications. Defaults to `info@cagemw.com`. |
| `CAGE_EMAIL_FROM` | _(optional)_ `From:` header used by Resend. Defaults to `CAGE <notifications@cagemw.com>`. |

Do **not** expose the service role key in the browser. This app uses RLS and RPCs only.

## Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL migrations in order from `supabase/migrations/` (Supabase SQL Editor or `supabase db push` with the CLI). Includes:
   - core schema (`profiles`, `courses`, `enrollments`, `exams`, `assignments`, `resources`)
   - `announcements`, `profiles_role_guard` (only admins may change `profiles.role` via the API)
   - **flight operations** (`aircraft`, `flights`, `flight_evaluations`, `pilot_logbook_totals` view) — see `20260530120000_flight_operations.sql`
   - **bookings / quotations / training applications / cohorts / email outbox** — see `20260530121000_bookings_and_notifications.sql`
   - **resource view tracking and certificates of completion** — see `20260530122000_resources_progress_and_certificates.sql`
3. **Authentication → URL configuration**
   - **Site URL**: your production URL (or `http://localhost:3000` for local dev).
   - **Redirect URLs** (optional if you only use password sign-in from the app): include  
     `http://localhost:3000/auth/callback`  
     and  
     `https://<your-production-domain>/auth/callback`
4. **Authentication → Providers → Email**: enable **Email** with **password** sign-in. Disable **magic link / OTP** if you want passwords only.
5. Create storage buckets if the migration did not run end-to-end: `course-resources` and `assignment-submissions` (private).

## Roles and portals

- **Student** (`student`): learning hub at `/portal` (dashboard, exams, assignments, grades, resources, **flight logbook**, **certificates**).
- **Teacher** (`instructor` in the database, shown as “Teacher” in the UI): course tools at `/teacher` (courses, exams, gradebook, announcements, **flight reviews**, **aircraft register**, **cohorts**).
- **Admin** (`admin`): **Administration** at `/admin` (dashboard, users, inquiries, **bookings**, **quotations**, **training applications**, **reports & analytics**, **email outbox**) plus access to `/teacher` and `/portal` from the nav.

New sign-ups default to **Student**. Only an admin can assign Teacher or Admin (UI: **Administration → Users**, or SQL below for the first admin).

## Public verification

Anyone — without an account — can verify a certificate at `/verify` by entering its serial (printed on each issued certificate). The verification page hits the `rpc_verify_certificate(p_serial)` SECURITY DEFINER RPC, which only exposes name, course title, issue date, grade and revocation status.

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

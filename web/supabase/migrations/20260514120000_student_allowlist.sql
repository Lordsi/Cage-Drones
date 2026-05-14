-- Student allow-list: only emails on this list may register, and any signed-in
-- user with role = 'student' must continue to be on the list to access the
-- portal. Teachers and admins bypass this check after promotion.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.student_allowlist (
  email      citext PRIMARY KEY,
  note       text NOT NULL DEFAULT '',
  added_by   uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_allowlist_created_idx
  ON public.student_allowlist (created_at DESC);

ALTER TABLE public.student_allowlist ENABLE ROW LEVEL SECURITY;

-- Only admins may read or write the allowlist directly through PostgREST.
-- Sign-up and runtime checks use SECURITY DEFINER helpers below.
DROP POLICY IF EXISTS student_allowlist_admin_all ON public.student_allowlist;
CREATE POLICY student_allowlist_admin_all ON public.student_allowlist
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Helper: case-insensitive membership check, bypasses RLS so that any
-- signed-in user can verify their own email is still allowed.
CREATE OR REPLACE FUNCTION public.email_is_allowlisted(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_allowlist
    WHERE email = p_email::citext
  );
$$;

GRANT EXECUTE ON FUNCTION public.email_is_allowlisted(text) TO authenticated, anon;

-- RPC: tells the caller whether THEIR current auth email is allowlisted.
-- Returns true for staff (instructor/admin) regardless of the list so the
-- gate only applies to students.
CREATE OR REPLACE FUNCTION public.rpc_my_allowlist_status()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_email text;
  v_role  public.user_role;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT u.email, p.role
    INTO v_email, v_role
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
   WHERE u.id = v_uid;

  IF v_role IS DISTINCT FROM 'student' THEN
    RETURN true;
  END IF;

  RETURN public.email_is_allowlisted(v_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_my_allowlist_status() TO authenticated;

-- Replace the new-user trigger to enforce the allowlist at sign-up time.
-- All self-registrations become students by default, so the gate effectively
-- applies to all new accounts. Admins must add the email first; existing
-- staff can then be promoted via /admin/users as before.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'email_required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.student_allowlist
    WHERE email = NEW.email::citext
  ) THEN
    RAISE EXCEPTION 'email_not_allowlisted'
      USING HINT = 'This email is not on the student allow-list. Ask an administrator to add it before registering.';
  END IF;

  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Seed the allowlist with all existing student accounts so we don't lock
-- out users who registered before the allowlist was introduced. Staff are
-- skipped because they bypass the runtime check.
INSERT INTO public.student_allowlist (email, note)
SELECT u.email::citext, 'seeded from existing student account'
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
 WHERE p.role = 'student'
   AND u.email IS NOT NULL
   AND u.email <> ''
ON CONFLICT (email) DO NOTHING;

-- CAGE: extend resource types, add per-user resource view tracking, and
-- certificates of completion.

-- ============================================================
-- Resource types: add slides, ppt, image
-- ============================================================
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'slides';
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'ppt';
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'image';
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'document';

-- ============================================================
-- Resource views (progress tracking)
-- ============================================================
CREATE TABLE public.resource_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources (id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, resource_id)
);

CREATE INDEX resource_views_user_idx ON public.resource_views (user_id);

ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY resource_views_select ON public.resource_views FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.resources r
    WHERE r.id = resource_views.resource_id
      AND public.user_owns_course(auth.uid(), r.course_id)
  )
);

CREATE POLICY resource_views_upsert ON public.resource_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY resource_views_update ON public.resource_views FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- Certificates of completion
-- ============================================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  serial TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  grade TEXT,
  notes TEXT DEFAULT '',
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  UNIQUE (user_id, course_id)
);

CREATE INDEX certificates_user_idx ON public.certificates (user_id);
CREATE INDEX certificates_course_idx ON public.certificates (course_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY certificates_select ON public.certificates FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), course_id)
);

CREATE POLICY certificates_write ON public.certificates FOR ALL
  USING (public.is_instructor_or_admin(auth.uid()))
  WITH CHECK (public.is_instructor_or_admin(auth.uid()));

-- Public verification endpoint via serial
CREATE OR REPLACE FUNCTION public.rpc_verify_certificate(p_serial text)
RETURNS TABLE (
  serial text,
  issued_at timestamptz,
  revoked boolean,
  student_name text,
  course_title text,
  grade text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.serial,
    c.issued_at,
    c.revoked,
    p.display_name AS student_name,
    co.title AS course_title,
    c.grade
  FROM public.certificates c
  JOIN public.profiles p ON p.id = c.user_id
  JOIN public.courses co ON co.id = c.course_id
  WHERE c.serial = p_serial;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_verify_certificate(text) TO anon, authenticated;

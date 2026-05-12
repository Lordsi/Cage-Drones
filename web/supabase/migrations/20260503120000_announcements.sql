-- Course announcements (portal feed) — openSIS-style communications surface
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX announcements_course_created_idx ON public.announcements (course_id, created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY announcements_select ON public.announcements FOR SELECT USING (
  public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), course_id)
  OR public.user_enrolled_in_course(auth.uid(), course_id)
);

CREATE POLICY announcements_insert ON public.announcements FOR INSERT
  WITH CHECK (
    public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid())
  );

CREATE POLICY announcements_update ON public.announcements FOR UPDATE
  USING (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()));

CREATE POLICY announcements_delete ON public.announcements FOR DELETE
  USING (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()));

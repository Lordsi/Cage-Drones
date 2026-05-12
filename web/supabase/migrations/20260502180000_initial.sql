-- CAGE LMS: core schema, RLS, storage, profile trigger
-- Run via Supabase CLI or SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles
CREATE TYPE public.user_role AS ENUM ('student', 'instructor', 'admin');

-- Profiles (1:1 auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

-- Exams
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  pass_percent INT NOT NULL DEFAULT 70 CHECK (pass_percent BETWEEN 0 AND 100),
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL CHECK (jsonb_typeof(choices) = 'array'),
  correct_index INT NOT NULL CHECK (correct_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX exam_questions_exam_id_idx ON public.exam_questions (exam_id);

CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_percent INT CHECK (score_percent IS NULL OR (score_percent BETWEEN 0 AND 100))
);

CREATE INDEX exam_attempts_user_idx ON public.exam_attempts (user_id);

CREATE OR REPLACE FUNCTION public.exam_attempts_guard()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.submitted_at IS NOT NULL THEN
    RAISE EXCEPTION 'attempt_locked';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    NEW.exam_id IS DISTINCT FROM OLD.exam_id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
    OR NEW.started_at IS DISTINCT FROM OLD.started_at
  ) THEN
    RAISE EXCEPTION 'attempt_immutable_fields';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exam_attempts_guard_trg
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE PROCEDURE public.exam_attempts_guard();

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  due_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TYPE public.submission_status AS ENUM ('pending', 'submitted', 'graded');

CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  file_path TEXT,
  status public.submission_status NOT NULL DEFAULT 'pending',
  grade TEXT,
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  UNIQUE (assignment_id, user_id)
);

-- Resources
CREATE TYPE public.resource_type AS ENUM ('pdf', 'video', 'link');

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type public.resource_type NOT NULL DEFAULT 'pdf',
  storage_path TEXT,
  external_url TEXT,
  meta TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpers
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = uid AND p.role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_instructor_or_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role IN ('instructor', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.user_enrolled_in_course(uid UUID, cid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = uid AND e.course_id = cid
  );
$$;

CREATE OR REPLACE FUNCTION public.user_owns_course(uid UUID, cid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = cid AND c.created_by = uid
  );
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_self ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- Courses: instructors see own; students see enrolled published; admins all
CREATE POLICY courses_select ON public.courses FOR SELECT USING (
  public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), id)
  OR (published AND public.user_enrolled_in_course(auth.uid(), id))
);

CREATE POLICY courses_insert ON public.courses FOR INSERT
  WITH CHECK (public.is_instructor_or_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY courses_update ON public.courses FOR UPDATE
  USING (public.user_owns_course(auth.uid(), id) OR public.is_admin(auth.uid()));

CREATE POLICY courses_delete ON public.courses FOR DELETE
  USING (public.user_owns_course(auth.uid(), id) OR public.is_admin(auth.uid()));

-- Enrollments
CREATE POLICY enrollments_select ON public.enrollments FOR SELECT USING (
  public.is_admin(auth.uid())
  OR user_id = auth.uid()
  OR public.user_owns_course(auth.uid(), course_id)
);

CREATE POLICY enrollments_insert ON public.enrollments FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    OR public.user_owns_course(auth.uid(), course_id)
  );

CREATE POLICY enrollments_delete ON public.enrollments FOR DELETE
  USING (
    public.is_admin(auth.uid())
    OR public.user_owns_course(auth.uid(), course_id)
  );

-- Exams
CREATE POLICY exams_select ON public.exams FOR SELECT USING (
  public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), course_id)
  OR (
    published
    AND public.user_enrolled_in_course(auth.uid(), course_id)
  )
);

CREATE POLICY exams_write ON public.exams FOR ALL
  USING (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()))
  WITH CHECK (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()));

-- Exam questions: students must NOT read correct_index via PostgREST.
-- Only staff (course owner / admin) can SELECT full rows.
CREATE POLICY exam_questions_select_staff ON public.exam_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_questions.exam_id
      AND (
        public.is_admin(auth.uid())
        OR public.user_owns_course(auth.uid(), e.course_id)
      )
  )
);

CREATE POLICY exam_questions_write ON public.exam_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_questions.exam_id
        AND (public.user_owns_course(auth.uid(), e.course_id) OR public.is_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_questions.exam_id
        AND (public.user_owns_course(auth.uid(), e.course_id) OR public.is_admin(auth.uid()))
    )
  );

-- Exam attempts: own rows; instructors read for their course
CREATE POLICY exam_attempts_select ON public.exam_attempts FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_attempts.exam_id
      AND public.user_owns_course(auth.uid(), e.course_id)
  )
);

-- Inserts only via rpc_start_exam_attempt (SECURITY DEFINER); prevents forged ends_at.

-- Updates only via rpc_save_exam_answers / rpc_submit_exam_attempt (SECURITY DEFINER).

-- Assignments
CREATE POLICY assignments_select ON public.assignments FOR SELECT USING (
  public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), course_id)
  OR public.user_enrolled_in_course(auth.uid(), course_id)
);

CREATE POLICY assignments_write ON public.assignments FOR ALL
  USING (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()))
  WITH CHECK (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()));

-- Submissions
CREATE POLICY assignment_submissions_select ON public.assignment_submissions FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = assignment_submissions.assignment_id
      AND public.user_owns_course(auth.uid(), a.course_id)
  )
);

CREATE POLICY assignment_submissions_insert ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_id
        AND public.user_enrolled_in_course(auth.uid(), a.course_id)
    )
  );

CREATE POLICY assignment_submissions_update ON public.assignment_submissions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND public.user_owns_course(auth.uid(), a.course_id)
    )
    OR public.is_admin(auth.uid())
  );

-- Resources
CREATE POLICY resources_select ON public.resources FOR SELECT USING (
  public.is_admin(auth.uid())
  OR public.user_owns_course(auth.uid(), course_id)
  OR public.user_enrolled_in_course(auth.uid(), course_id)
);

CREATE POLICY resources_write ON public.resources FOR ALL
  USING (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()))
  WITH CHECK (public.user_owns_course(auth.uid(), course_id) OR public.is_admin(auth.uid()));

-- Storage buckets (create if not exists pattern)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-resources', 'course-resources', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY course_resources_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id::text = split_part(name, '/', 1)
        AND (
          public.user_enrolled_in_course(auth.uid(), c.id)
          OR public.user_owns_course(auth.uid(), c.id)
          OR public.is_admin(auth.uid())
        )
    )
  );

CREATE POLICY course_resources_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'course-resources'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id::text = split_part(name, '/', 1)
        AND (public.user_owns_course(auth.uid(), c.id) OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY course_resources_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id::text = split_part(name, '/', 1)
        AND (public.user_owns_course(auth.uid(), c.id) OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY assignment_submissions_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id::text = split_part(name, '/', 1)
        AND (
          split_part(name, '/', 2) = auth.uid()::text
          OR public.user_owns_course(auth.uid(), a.course_id)
          OR public.is_admin(auth.uid())
        )
    )
  );

CREATE POLICY assignment_submissions_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND split_part(name, '/', 2) = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id::text = split_part(name, '/', 1)
        AND public.user_enrolled_in_course(auth.uid(), a.course_id)
    )
  );

CREATE POLICY assignment_submissions_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND split_part(name, '/', 2) = auth.uid()::text
  );

CREATE POLICY assignment_submissions_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND (
      split_part(name, '/', 2) = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.assignments a
        WHERE a.id::text = split_part(name, '/', 1)
          AND public.user_owns_course(auth.uid(), a.course_id)
      )
      OR public.is_admin(auth.uid())
    )
  );

-- RPC: start timed attempt (trusted ends_at)
CREATE OR REPLACE FUNCTION public.rpc_start_exam_attempt(p_exam_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_course uuid;
  v_duration int;
  new_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT e.course_id, e.duration_minutes INTO v_course, v_duration
  FROM public.exams e
  WHERE e.id = p_exam_id AND e.published;

  IF NOT FOUND THEN RAISE EXCEPTION 'exam_not_found'; END IF;
  IF NOT public.user_enrolled_in_course(v_user, v_course) THEN RAISE EXCEPTION 'not_enrolled'; END IF;

  INSERT INTO public.exam_attempts (exam_id, user_id, ends_at)
  VALUES (
    p_exam_id,
    v_user,
    now() + make_interval(mins => v_duration)
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_start_exam_attempt(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_save_exam_answers(p_attempt_id uuid, p_answers jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  UPDATE public.exam_attempts
  SET answers = p_answers
  WHERE id = p_attempt_id AND user_id = v_user AND submitted_at IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_save_exam_answers(uuid, jsonb) TO authenticated;

-- RPC: questions without answer key
CREATE OR REPLACE FUNCTION public.rpc_student_exam_questions(p_exam_id uuid)
RETURNS TABLE (id uuid, sort_order int, prompt text, choices jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.sort_order, q.prompt, q.choices
  FROM public.exam_questions q
  JOIN public.exams e ON e.id = q.exam_id
  WHERE q.exam_id = p_exam_id
    AND e.published
    AND public.user_enrolled_in_course(auth.uid(), e.course_id);
$$;

GRANT EXECUTE ON FUNCTION public.rpc_student_exam_questions(uuid) TO authenticated;

-- RPC: submit and score server-side
CREATE OR REPLACE FUNCTION public.rpc_submit_exam_attempt(p_attempt_id uuid, p_answers jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_exam uuid;
  v_course uuid;
  v_submitted timestamptz;
  r record;
  correct int := 0;
  total int := 0;
  score_val int;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT ea.exam_id, ea.submitted_at, e.course_id
  INTO v_exam, v_submitted, v_course
  FROM public.exam_attempts ea
  JOIN public.exams e ON e.id = ea.exam_id
  WHERE ea.id = p_attempt_id AND ea.user_id = v_user
  FOR UPDATE OF ea;

  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF v_submitted IS NOT NULL THEN RAISE EXCEPTION 'already_submitted'; END IF;
  IF NOT public.user_enrolled_in_course(v_user, v_course) THEN RAISE EXCEPTION 'not_enrolled'; END IF;

  FOR r IN SELECT q.id, q.correct_index FROM public.exam_questions q WHERE q.exam_id = v_exam LOOP
    total := total + 1;
    IF (p_answers ->> r.id::text) IS NOT NULL AND (p_answers ->> r.id::text)::int = r.correct_index THEN
      correct := correct + 1;
    END IF;
  END LOOP;

  IF total = 0 THEN score_val := 0;
  ELSE score_val := ROUND((correct::numeric / total) * 100)::int;
  END IF;

  UPDATE public.exam_attempts
  SET answers = p_answers, submitted_at = now(), score_percent = score_val
  WHERE id = p_attempt_id;

  RETURN score_val;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_submit_exam_attempt(uuid, jsonb) TO authenticated;

-- RPC: post-submit review (includes correct answers)
CREATE OR REPLACE FUNCTION public.rpc_student_exam_review(p_attempt_id uuid)
RETURNS TABLE (
  question_id uuid,
  prompt text,
  choices jsonb,
  selected_index int,
  correct_index int,
  is_correct boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_exam uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT ea.exam_id INTO v_exam
  FROM public.exam_attempts ea
  WHERE ea.id = p_attempt_id AND ea.user_id = v_user AND ea.submitted_at IS NOT NULL;

  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    q.id,
    q.prompt,
    q.choices,
    CASE WHEN a.answers ? q.id::text THEN (a.answers ->> q.id::text)::int ELSE NULL END AS selected_index,
    q.correct_index,
    CASE
      WHEN NOT (a.answers ? q.id::text) THEN false
      ELSE ((a.answers ->> q.id::text)::int = q.correct_index)
    END AS is_correct
  FROM public.exam_questions q
  JOIN public.exam_attempts a ON a.exam_id = q.exam_id AND a.id = p_attempt_id
  ORDER BY q.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_student_exam_review(uuid) TO authenticated;

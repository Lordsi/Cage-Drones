-- Instructors can read profiles of students enrolled in courses they own.
CREATE POLICY profiles_select_course_students ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.enrollments en
    INNER JOIN public.courses co ON co.id = en.course_id
    WHERE en.user_id = profiles.id
      AND (co.created_by = auth.uid() OR public.is_admin(auth.uid()))
  )
);

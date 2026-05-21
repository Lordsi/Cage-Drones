CREATE TABLE public.enrollment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service_interest TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollment_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all inquiries"
  ON public.enrollment_inquiries FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inquiries"
  ON public.enrollment_inquiries FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert inquiries"
  ON public.enrollment_inquiries FOR INSERT
  WITH CHECK (true);

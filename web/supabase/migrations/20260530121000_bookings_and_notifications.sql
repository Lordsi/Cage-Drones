-- CAGE: DB-backed training schedule (cohorts), structured booking/quotation
-- flows, training applications, and an email outbox for admin notifications.

-- ============================================================
-- Training cohorts (replaces the hardcoded landing schedule)
-- ============================================================
CREATE TABLE public.training_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses (id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  starts_on DATE NOT NULL,
  ends_on DATE,
  capacity INT NOT NULL DEFAULT 12 CHECK (capacity >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','waitlist','closed','cancelled')),
  price_display TEXT,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER training_cohorts_updated_at
  BEFORE UPDATE ON public.training_cohorts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.training_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_cohorts_select_public ON public.training_cohorts
  FOR SELECT USING (true);

CREATE POLICY training_cohorts_write ON public.training_cohorts FOR ALL
  USING (public.is_instructor_or_admin(auth.uid()))
  WITH CHECK (public.is_instructor_or_admin(auth.uid()));

-- ============================================================
-- Service bookings (date-specific request for drone services)
-- ============================================================
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  organisation TEXT,
  service_type TEXT NOT NULL,
  site_location TEXT,
  preferred_date DATE,
  alt_date DATE,
  area_hectares NUMERIC(10,2),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','contacted','confirmed','completed','declined')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_bookings_insert_public ON public.service_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY service_bookings_admin_select ON public.service_bookings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY service_bookings_admin_update ON public.service_bookings
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- ============================================================
-- Quotation requests
-- ============================================================
CREATE TABLE public.quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  organisation TEXT,
  project_scope TEXT NOT NULL,
  required_deliverables TEXT,
  expected_timeline TEXT,
  budget_range TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','quoted','accepted','declined','expired')),
  quote_amount NUMERIC(12,2),
  quote_currency TEXT DEFAULT 'USD',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY quotation_requests_insert_public ON public.quotation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY quotation_requests_admin_select ON public.quotation_requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY quotation_requests_admin_update ON public.quotation_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- ============================================================
-- Training applications (apply to a specific cohort)
-- ============================================================
CREATE TABLE public.training_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.training_cohorts (id) ON DELETE SET NULL,
  applicant_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organisation TEXT,
  prior_experience TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','reviewing','accepted','waitlisted','declined','enrolled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_applications_insert_public ON public.training_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY training_applications_admin_select ON public.training_applications
  FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_instructor_or_admin(auth.uid()));

CREATE POLICY training_applications_admin_update ON public.training_applications
  FOR UPDATE USING (public.is_instructor_or_admin(auth.uid()));

-- Applicants can read their own application if authenticated
CREATE POLICY training_applications_self_select ON public.training_applications
  FOR SELECT USING (applicant_user_id = auth.uid());

-- ============================================================
-- Email outbox (notifications queue, optionally drained by a worker)
-- ============================================================
CREATE TYPE public.email_outbox_status AS ENUM ('pending','sent','failed','skipped');

CREATE TABLE public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  related_kind TEXT, -- 'service_booking' | 'quotation_request' | 'training_application' | 'enrollment_inquiry' | 'grade_posted'
  related_id UUID,
  status public.email_outbox_status NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX email_outbox_status_idx ON public.email_outbox (status, created_at);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- Server-only — admins can SELECT for inspection; inserts go through service role.
CREATE POLICY email_outbox_admin_select ON public.email_outbox
  FOR SELECT USING (public.is_admin(auth.uid()));

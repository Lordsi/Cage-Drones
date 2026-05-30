-- CAGE Drone Operations & Flight Log module
-- Aircraft register, per-pilot flight logbook, pre/post flight checklists,
-- and instructor evaluation/feedback.

-- ============================================================
-- Aircraft register
-- ============================================================
CREATE TABLE public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  manufacturer TEXT,
  serial_number TEXT,
  max_takeoff_weight_kg NUMERIC(6,2),
  notes TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER aircraft_updated_at
  BEFORE UPDATE ON public.aircraft
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- Flights (pilot logbook entries)
-- ============================================================
CREATE TYPE public.flight_status AS ENUM (
  'planned',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE public.flight_review_status AS ENUM (
  'unreviewed',
  'approved',
  'needs_attention'
);

CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  aircraft_id UUID REFERENCES public.aircraft (id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses (id) ON DELETE SET NULL,

  -- Mission details
  mission_type TEXT NOT NULL DEFAULT 'training',
  location TEXT NOT NULL DEFAULT '',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),

  -- Timing
  departure_at TIMESTAMPTZ,
  arrival_at TIMESTAMPTZ,
  duration_minutes INT CHECK (duration_minutes IS NULL OR duration_minutes >= 0),

  -- Environmental
  weather_summary TEXT DEFAULT '',
  wind_kts INT,
  visibility_km NUMERIC(4,1),

  -- Checklists stored as JSONB arrays of { item, ok, notes }
  preflight_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  postflight_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  preflight_completed_at TIMESTAMPTZ,
  postflight_completed_at TIMESTAMPTZ,

  -- Free-form pilot notes
  pilot_notes TEXT DEFAULT '',

  status public.flight_status NOT NULL DEFAULT 'planned',
  review_status public.flight_review_status NOT NULL DEFAULT 'unreviewed',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (
    preflight_checklist IS NULL OR jsonb_typeof(preflight_checklist) = 'array'
  ),
  CHECK (
    postflight_checklist IS NULL OR jsonb_typeof(postflight_checklist) = 'array'
  )
);

CREATE INDEX flights_pilot_idx ON public.flights (pilot_id);
CREATE INDEX flights_aircraft_idx ON public.flights (aircraft_id);
CREATE INDEX flights_course_idx ON public.flights (course_id);
CREATE INDEX flights_departure_idx ON public.flights (departure_at DESC);

CREATE TRIGGER flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- Instructor evaluations / feedback per flight
-- ============================================================
CREATE TABLE public.flight_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES public.flights (id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,

  -- 1..5 scoring (NULL = not rated)
  preflight_score INT CHECK (preflight_score IS NULL OR preflight_score BETWEEN 1 AND 5),
  airmanship_score INT CHECK (airmanship_score IS NULL OR airmanship_score BETWEEN 1 AND 5),
  procedures_score INT CHECK (procedures_score IS NULL OR procedures_score BETWEEN 1 AND 5),
  decision_making_score INT CHECK (decision_making_score IS NULL OR decision_making_score BETWEEN 1 AND 5),
  postflight_score INT CHECK (postflight_score IS NULL OR postflight_score BETWEEN 1 AND 5),

  overall_grade TEXT, -- e.g. 'Pass', 'Pass with notes', 'Re-fly'
  strengths TEXT DEFAULT '',
  improvements TEXT DEFAULT '',
  comments TEXT DEFAULT '',

  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (flight_id, instructor_id)
);

CREATE INDEX flight_evaluations_flight_idx ON public.flight_evaluations (flight_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_evaluations ENABLE ROW LEVEL SECURITY;

-- Aircraft: everyone authenticated can SELECT (read register); only staff can write.
CREATE POLICY aircraft_select ON public.aircraft FOR SELECT
  TO authenticated USING (true);

CREATE POLICY aircraft_insert ON public.aircraft FOR INSERT
  WITH CHECK (public.is_instructor_or_admin(auth.uid()));

CREATE POLICY aircraft_update ON public.aircraft FOR UPDATE
  USING (public.is_instructor_or_admin(auth.uid()))
  WITH CHECK (public.is_instructor_or_admin(auth.uid()));

CREATE POLICY aircraft_delete ON public.aircraft FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Flights:
--   * Pilots can read/insert/update their own flights (until reviewed-locked).
--   * Instructors/admins can read all flights and update review_status.
CREATE POLICY flights_select ON public.flights FOR SELECT USING (
  pilot_id = auth.uid()
  OR public.is_instructor_or_admin(auth.uid())
);

CREATE POLICY flights_insert ON public.flights FOR INSERT WITH CHECK (
  pilot_id = auth.uid()
  OR public.is_instructor_or_admin(auth.uid())
);

CREATE POLICY flights_update ON public.flights FOR UPDATE USING (
  pilot_id = auth.uid()
  OR public.is_instructor_or_admin(auth.uid())
);

CREATE POLICY flights_delete ON public.flights FOR DELETE USING (
  pilot_id = auth.uid()
  OR public.is_admin(auth.uid())
);

-- Flight evaluations: pilot can read their own, instructors+admins can manage.
CREATE POLICY flight_evaluations_select ON public.flight_evaluations FOR SELECT USING (
  public.is_instructor_or_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.flights f
    WHERE f.id = flight_evaluations.flight_id
      AND f.pilot_id = auth.uid()
  )
);

CREATE POLICY flight_evaluations_write ON public.flight_evaluations FOR ALL
  USING (public.is_instructor_or_admin(auth.uid()))
  WITH CHECK (public.is_instructor_or_admin(auth.uid()) AND instructor_id = auth.uid());

-- ============================================================
-- Helpful view: pilot logbook totals
-- ============================================================
CREATE OR REPLACE VIEW public.pilot_logbook_totals AS
SELECT
  pilot_id,
  COUNT(*)::int AS total_flights,
  COALESCE(SUM(duration_minutes), 0)::int AS total_minutes,
  COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_flights,
  MAX(departure_at) AS last_flight_at
FROM public.flights
GROUP BY pilot_id;

GRANT SELECT ON public.pilot_logbook_totals TO authenticated;

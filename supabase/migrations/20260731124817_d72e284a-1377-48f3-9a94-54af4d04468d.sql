
-- ENUMS
CREATE TYPE public.team_status AS ENUM ('active','inactive','archived');
CREATE TYPE public.season_status AS ENUM ('upcoming','active','completed','archived');
CREATE TYPE public.coach_status AS ENUM ('active','inactive','on_leave','terminated');
CREATE TYPE public.coach_contract_type AS ENUM ('full_time','part_time','volunteer','freelance');
CREATE TYPE public.facility_type AS ENUM ('training_ground','field','locker_room','equipment_store','gym','medical_room','office');
CREATE TYPE public.facility_status AS ENUM ('available','maintenance','unavailable');
CREATE TYPE public.media_kind AS ENUM ('photo','video');
CREATE TYPE public.academy_event_type AS ENUM ('registration_window','holiday','training_block','tournament','meeting','other');

-- ACADEMY PROFILE
CREATE TABLE public.academy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  license_number text,
  license_authority text,
  license_expiry date,
  registration_number text,
  accreditation text,
  accreditation_level text,
  founded_date date,
  motto text,
  philosophy text,
  primary_color text,
  secondary_color text,
  head_of_academy text,
  capacity integer CHECK (capacity IS NULL OR capacity >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_profiles TO authenticated;
GRANT ALL ON public.academy_profiles TO service_role;
ALTER TABLE public.academy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_profiles_read ON public.academy_profiles FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY academy_profiles_insert ON public.academy_profiles FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_profiles_update ON public.academy_profiles FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_profiles_delete ON public.academy_profiles FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));
CREATE TRIGGER academy_profiles_updated_at BEFORE UPDATE ON public.academy_profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SEASONS
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  academic_year text,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  registration_opens_on date,
  registration_closes_on date,
  status public.season_status NOT NULL DEFAULT 'upcoming',
  is_current boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
CREATE OR REPLACE FUNCTION public.tg_seasons_validate() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ends_on <= NEW.starts_on THEN RAISE EXCEPTION 'Season end date must be after the start date'; END IF;
  IF NEW.registration_opens_on IS NOT NULL AND NEW.registration_closes_on IS NOT NULL
     AND NEW.registration_closes_on < NEW.registration_opens_on THEN
    RAISE EXCEPTION 'Registration window closes before it opens';
  END IF;
  IF NEW.is_current THEN
    UPDATE public.seasons SET is_current = false WHERE org_id = NEW.org_id AND id <> NEW.id AND is_current;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER seasons_validate BEFORE INSERT OR UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.tg_seasons_validate();
CREATE TRIGGER seasons_updated_at BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY seasons_read ON public.seasons FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY seasons_insert ON public.seasons FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY seasons_update ON public.seasons FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY seasons_delete ON public.seasons FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- AGE CATEGORIES
CREATE TABLE public.age_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  max_age integer NOT NULL CHECK (max_age BETWEEN 4 AND 23),
  min_age integer CHECK (min_age IS NULL OR min_age BETWEEN 3 AND 23),
  cutoff_month integer NOT NULL DEFAULT 1 CHECK (cutoff_month BETWEEN 1 AND 12),
  is_custom boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
CREATE OR REPLACE FUNCTION public.tg_age_categories_validate() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.min_age IS NOT NULL AND NEW.min_age > NEW.max_age THEN
    RAISE EXCEPTION 'Minimum age cannot exceed maximum age';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER age_categories_validate BEFORE INSERT OR UPDATE ON public.age_categories FOR EACH ROW EXECUTE FUNCTION public.tg_age_categories_validate();
CREATE TRIGGER age_categories_updated_at BEFORE UPDATE ON public.age_categories FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.age_categories TO authenticated;
GRANT ALL ON public.age_categories TO service_role;
ALTER TABLE public.age_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY age_categories_read ON public.age_categories FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY age_categories_insert ON public.age_categories FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY age_categories_update ON public.age_categories FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY age_categories_delete ON public.age_categories FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- COACHES
CREATE TABLE public.academy_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  photo_url text,
  role_title text NOT NULL DEFAULT 'Head Coach',
  license_level text,
  license_number text,
  license_expiry date,
  certifications text[] NOT NULL DEFAULT '{}',
  contract_type public.coach_contract_type NOT NULL DEFAULT 'part_time',
  contract_start date,
  contract_end date,
  availability jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.coach_status NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER academy_coaches_updated_at BEFORE UPDATE ON public.academy_coaches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_coaches TO authenticated;
GRANT ALL ON public.academy_coaches TO service_role;
ALTER TABLE public.academy_coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_coaches_read ON public.academy_coaches FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY academy_coaches_insert ON public.academy_coaches FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_coaches_update ON public.academy_coaches FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_coaches_delete ON public.academy_coaches FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- FACILITIES
CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type public.facility_type NOT NULL DEFAULT 'field',
  surface text,
  capacity integer CHECK (capacity IS NULL OR capacity >= 0),
  address_line text,
  city text,
  latitude double precision,
  longitude double precision,
  status public.facility_status NOT NULL DEFAULT 'available',
  equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY facilities_read ON public.facilities FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY facilities_insert ON public.facilities FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY facilities_update ON public.facilities FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY facilities_delete ON public.facilities FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- TEAMS
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
  age_category_id uuid REFERENCES public.age_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  short_name text,
  photo_url text,
  head_coach_id uuid REFERENCES public.academy_coaches(id) ON DELETE SET NULL,
  assistant_coach_id uuid REFERENCES public.academy_coaches(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.academy_coaches(id) ON DELETE SET NULL,
  max_squad_size integer NOT NULL DEFAULT 22 CHECK (max_squad_size BETWEEN 1 AND 60),
  status public.team_status NOT NULL DEFAULT 'active',
  description text,
  archived_at timestamptz,
  archived_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name, season_id)
);
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY teams_read ON public.teams FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- TRAINING SESSIONS
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES public.facilities(id) ON DELETE SET NULL,
  season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
  coach_id uuid REFERENCES public.academy_coaches(id) ON DELETE SET NULL,
  title text NOT NULL,
  weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  capacity integer CHECK (capacity IS NULL OR capacity >= 0),
  objectives text[] NOT NULL DEFAULT '{}',
  intensity text,
  weather_note text,
  attendance_note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.tg_training_sessions_validate() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ends_at <= NEW.starts_at THEN RAISE EXCEPTION 'Training session must end after it starts'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER training_sessions_validate BEFORE INSERT OR UPDATE ON public.training_sessions FOR EACH ROW EXECUTE FUNCTION public.tg_training_sessions_validate();
CREATE TRIGGER training_sessions_updated_at BEFORE UPDATE ON public.training_sessions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_sessions_read ON public.training_sessions FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY training_sessions_insert ON public.training_sessions FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY training_sessions_update ON public.training_sessions FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY training_sessions_delete ON public.training_sessions FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- ACADEMY CALENDAR EVENTS
CREATE TABLE public.academy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  type public.academy_event_type NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.tg_academy_events_validate() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ends_on < NEW.starts_on THEN RAISE EXCEPTION 'Event end date cannot be before the start date'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER academy_events_validate BEFORE INSERT OR UPDATE ON public.academy_events FOR EACH ROW EXECUTE FUNCTION public.tg_academy_events_validate();
CREATE TRIGGER academy_events_updated_at BEFORE UPDATE ON public.academy_events FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_events TO authenticated;
GRANT ALL ON public.academy_events TO service_role;
ALTER TABLE public.academy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_events_read ON public.academy_events FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY academy_events_insert ON public.academy_events FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_events_update ON public.academy_events FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY academy_events_delete ON public.academy_events FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- MEDIA
CREATE TABLE public.media_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER media_albums_updated_at BEFORE UPDATE ON public.media_albums FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_albums TO authenticated;
GRANT ALL ON public.media_albums TO service_role;
ALTER TABLE public.media_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_albums_read ON public.media_albums FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY media_albums_insert ON public.media_albums FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY media_albums_update ON public.media_albums FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY media_albums_delete ON public.media_albums FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  album_id uuid REFERENCES public.media_albums(id) ON DELETE CASCADE,
  kind public.media_kind NOT NULL DEFAULT 'photo',
  url text NOT NULL,
  caption text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER media_items_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT ALL ON public.media_items TO service_role;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_items_read ON public.media_items FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY media_items_insert ON public.media_items FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY media_items_update ON public.media_items FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY media_items_delete ON public.media_items FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

-- INDEXES
CREATE INDEX idx_seasons_org ON public.seasons(org_id, starts_on DESC);
CREATE INDEX idx_age_categories_org ON public.age_categories(org_id, sort_order);
CREATE INDEX idx_academy_coaches_org ON public.academy_coaches(org_id, status);
CREATE INDEX idx_facilities_org ON public.facilities(org_id, type);
CREATE INDEX idx_teams_org ON public.teams(org_id, status);
CREATE INDEX idx_teams_season ON public.teams(season_id);
CREATE INDEX idx_training_sessions_org ON public.training_sessions(org_id, weekday);
CREATE INDEX idx_training_sessions_team ON public.training_sessions(team_id);
CREATE INDEX idx_academy_events_org ON public.academy_events(org_id, starts_on);
CREATE INDEX idx_media_items_album ON public.media_items(album_id);

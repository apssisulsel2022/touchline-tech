CREATE TYPE public.player_status AS ENUM ('draft','active','inactive','injured','suspended','transferred','archived');
CREATE TYPE public.player_gender AS ENUM ('male','female','other','undisclosed');
CREATE TYPE public.preferred_foot AS ENUM ('left','right','both');
CREATE TYPE public.player_position AS ENUM ('goalkeeper','defender','midfielder','forward','unassigned');
CREATE TYPE public.registration_status AS ENUM ('draft','pending','approved','rejected','expired','withdrawn');
CREATE TYPE public.guardian_relationship AS ENUM ('mother','father','legal_guardian','sibling','other');
CREATE TYPE public.document_verification AS ENUM ('pending','verified','rejected','expired');

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  registry_no text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  known_as text,
  date_of_birth date NOT NULL,
  gender public.player_gender NOT NULL DEFAULT 'undisclosed',
  nationality text,
  national_id text,
  photo_url text,
  preferred_foot public.preferred_foot NOT NULL DEFAULT 'right',
  primary_position public.player_position NOT NULL DEFAULT 'unassigned',
  secondary_position public.player_position,
  height_cm integer,
  weight_kg integer,
  email text,
  phone text,
  address_line text,
  city text,
  school_name text,
  medical_notes text,
  notes text,
  status public.player_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT players_registry_no_unique UNIQUE (org_id, registry_no),
  CONSTRAINT players_height_check CHECK (height_cm IS NULL OR (height_cm BETWEEN 80 AND 250)),
  CONSTRAINT players_weight_check CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 15 AND 200))
);
CREATE INDEX players_org_status_idx ON public.players (org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX players_org_name_idx ON public.players (org_id, last_name, first_name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY players_read ON public.players FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY players_insert ON public.players FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY players_update ON public.players FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY players_delete ON public.players FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

CREATE TABLE public.player_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship public.guardian_relationship NOT NULL DEFAULT 'other',
  email text,
  phone text,
  address_line text,
  occupation text,
  is_primary boolean NOT NULL DEFAULT false,
  consent_given_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX player_guardians_player_idx ON public.player_guardians (player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_guardians TO authenticated;
GRANT ALL ON public.player_guardians TO service_role;
ALTER TABLE public.player_guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY player_guardians_read ON public.player_guardians FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY player_guardians_insert ON public.player_guardians FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_guardians_update ON public.player_guardians FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_guardians_delete ON public.player_guardians FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

CREATE TABLE public.player_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  age_category_id uuid REFERENCES public.age_categories(id) ON DELETE SET NULL,
  jersey_number integer,
  status public.registration_status NOT NULL DEFAULT 'draft',
  registered_on date NOT NULL DEFAULT current_date,
  expires_on date,
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  fee_note text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_registrations_jersey_check CHECK (jersey_number IS NULL OR (jersey_number BETWEEN 1 AND 99))
);
CREATE UNIQUE INDEX player_registrations_season_unique ON public.player_registrations (org_id, player_id, season_id)
  WHERE season_id IS NOT NULL AND status <> 'withdrawn' AND status <> 'rejected';
CREATE UNIQUE INDEX player_registrations_jersey_unique ON public.player_registrations (team_id, season_id, jersey_number)
  WHERE team_id IS NOT NULL AND season_id IS NOT NULL AND jersey_number IS NOT NULL AND status IN ('pending','approved');
CREATE INDEX player_registrations_player_idx ON public.player_registrations (player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_registrations TO authenticated;
GRANT ALL ON public.player_registrations TO service_role;
ALTER TABLE public.player_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY player_registrations_read ON public.player_registrations FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY player_registrations_insert ON public.player_registrations FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_registrations_update ON public.player_registrations FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_registrations_delete ON public.player_registrations FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

CREATE TABLE public.player_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'identity',
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  issued_on date,
  expires_on date,
  verification public.document_verification NOT NULL DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX player_documents_player_idx ON public.player_documents (player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_documents TO authenticated;
GRANT ALL ON public.player_documents TO service_role;
ALTER TABLE public.player_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY player_documents_read ON public.player_documents FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY player_documents_insert ON public.player_documents FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_documents_update ON public.player_documents FOR UPDATE TO authenticated USING (private.can_admin_org(auth.uid(), org_id)) WITH CHECK (private.can_admin_org(auth.uid(), org_id));
CREATE POLICY player_documents_delete ON public.player_documents FOR DELETE TO authenticated USING (private.can_admin_org(auth.uid(), org_id));

CREATE TABLE public.player_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  from_status public.player_status,
  to_status public.player_status NOT NULL,
  reason text,
  source text NOT NULL DEFAULT 'app',
  actor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX player_status_events_player_idx ON public.player_status_events (player_id, created_at DESC);
GRANT SELECT, INSERT ON public.player_status_events TO authenticated;
GRANT ALL ON public.player_status_events TO service_role;
ALTER TABLE public.player_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY player_status_events_read ON public.player_status_events FOR SELECT TO authenticated USING (private.can_view_org(auth.uid(), org_id));
CREATE POLICY player_status_events_insert ON public.player_status_events FOR INSERT TO authenticated WITH CHECK (private.can_admin_org(auth.uid(), org_id));

CREATE OR REPLACE FUNCTION public.tg_players_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE seq integer;
BEGIN
  IF NEW.date_of_birth > current_date THEN
    RAISE EXCEPTION 'Date of birth cannot be in the future';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.registry_no IS NULL OR btrim(NEW.registry_no) = '' THEN
      SELECT count(*) + 1 INTO seq FROM public.players WHERE org_id = NEW.org_id;
      NEW.registry_no := 'TL-' || to_char(now(), 'YYYY') || '-' || lpad(seq::text, 6, '0');
    END IF;
    NEW.version := 1;
  ELSE
    NEW.version := OLD.version + 1;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER tg_players_validate BEFORE INSERT OR UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.tg_players_validate();

CREATE OR REPLACE FUNCTION public.tg_players_status_event()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.player_status_events (org_id, player_id, from_status, to_status, reason, actor_user_id)
    VALUES (NEW.org_id, NEW.id, NULL, NEW.status, 'Player record created', auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.player_status_events (org_id, player_id, from_status, to_status, actor_user_id)
    VALUES (NEW.org_id, NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER tg_players_status_event AFTER INSERT OR UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.tg_players_status_event();

CREATE TRIGGER tg_player_guardians_updated_at BEFORE UPDATE ON public.player_guardians
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_player_registrations_updated_at BEFORE UPDATE ON public.player_registrations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_player_documents_updated_at BEFORE UPDATE ON public.player_documents
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
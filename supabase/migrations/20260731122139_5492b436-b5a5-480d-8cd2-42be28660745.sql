-- 1. New organisation types
ALTER TYPE public.org_type ADD VALUE IF NOT EXISTS 'district_association';
ALTER TYPE public.org_type ADD VALUE IF NOT EXISTS 'football_school';
ALTER TYPE public.org_type ADD VALUE IF NOT EXISTS 'competition_organizer';
ALTER TYPE public.org_type ADD VALUE IF NOT EXISTS 'partner';

-- 2. Organisation status enum
DO $$ BEGIN
  CREATE TYPE public.org_status AS ENUM ('active','inactive','suspended','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Extend organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status public.org_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_key ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS organizations_parent_id_idx ON public.organizations (parent_id);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON public.organizations (status);

DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. Hierarchy helpers
CREATE OR REPLACE FUNCTION public.org_ancestor_ids(_org_id uuid)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH RECURSIVE chain AS (
    SELECT o.id, o.parent_id, 1 AS depth FROM public.organizations o WHERE o.id = _org_id
    UNION ALL
    SELECT p.id, p.parent_id, c.depth + 1
    FROM public.organizations p JOIN chain c ON p.id = c.parent_id
    WHERE c.depth < 20
  )
  SELECT chain.id FROM chain;
$$;

CREATE OR REPLACE FUNCTION public.can_view_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_platform_owner(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = _user_id
        AND m.org_id IN (SELECT id FROM public.org_ancestor_ids(_org_id))
    );
$$;

CREATE OR REPLACE FUNCTION public.can_admin_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_platform_owner(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = _user_id
        AND m.role IN ('federation','association','academy','club')
        AND m.org_id IN (SELECT id FROM public.org_ancestor_ids(_org_id))
    );
$$;

-- 5. Broaden organisation read/update to hierarchy
DROP POLICY IF EXISTS orgs_member_read ON public.organizations;
CREATE POLICY orgs_member_read ON public.organizations
  FOR SELECT TO authenticated
  USING (public.can_view_org(auth.uid(), id));

DROP POLICY IF EXISTS orgs_admin_update ON public.organizations;
CREATE POLICY orgs_admin_update ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.can_admin_org(auth.uid(), id))
  WITH CHECK (public.can_admin_org(auth.uid(), id));

-- 6. Organisation documents
CREATE TABLE IF NOT EXISTS public.org_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_documents TO authenticated;
GRANT ALL ON public.org_documents TO service_role;

ALTER TABLE public.org_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_documents_read ON public.org_documents;
CREATE POLICY org_documents_read ON public.org_documents
  FOR SELECT TO authenticated USING (public.can_view_org(auth.uid(), org_id));

DROP POLICY IF EXISTS org_documents_insert ON public.org_documents;
CREATE POLICY org_documents_insert ON public.org_documents
  FOR INSERT TO authenticated
  WITH CHECK (public.can_admin_org(auth.uid(), org_id) AND uploaded_by = auth.uid());

DROP POLICY IF EXISTS org_documents_update ON public.org_documents;
CREATE POLICY org_documents_update ON public.org_documents
  FOR UPDATE TO authenticated
  USING (public.can_admin_org(auth.uid(), org_id))
  WITH CHECK (public.can_admin_org(auth.uid(), org_id));

DROP POLICY IF EXISTS org_documents_delete ON public.org_documents;
CREATE POLICY org_documents_delete ON public.org_documents
  FOR DELETE TO authenticated USING (public.can_admin_org(auth.uid(), org_id));

DROP TRIGGER IF EXISTS set_org_documents_updated_at ON public.org_documents;
CREATE TRIGGER set_org_documents_updated_at
  BEFORE UPDATE ON public.org_documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX IF NOT EXISTS org_documents_org_id_idx ON public.org_documents (org_id);
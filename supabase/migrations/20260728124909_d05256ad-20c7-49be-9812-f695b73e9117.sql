
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM (
  'platform_owner','federation','association','academy','club',
  'coach','parent','player','referee','scout'
);

CREATE TYPE public.org_type AS ENUM (
  'platform','federation','association','academy','club'
);

CREATE TYPE public.invitation_status AS ENUM (
  'pending','accepted','rejected','revoked','expired'
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  theme TEXT NOT NULL DEFAULT 'system',
  notification_prefs JSONB NOT NULL DEFAULT '{"email":true,"push":false,"digest":"weekly"}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type public.org_type NOT NULL DEFAULT 'club',
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORG MEMBERSHIPS (role per organization)
-- ============================================================
CREATE TABLE public.org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX idx_memberships_user ON public.org_memberships(user_id);
CREATE INDEX idx_memberships_org ON public.org_memberships(org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_memberships TO authenticated;
GRANT ALL ON public.org_memberships TO service_role;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER GLOBAL ROLES (platform_owner etc.)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INVITATIONS
-- ============================================================
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_org ON public.invitations(org_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_org ON public.audit_logs(org_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'platform_owner');
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships WHERE user_id = _user_id AND org_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  );
$$;

-- Org admin = federation | association | academy | club (an owning role)
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships
    WHERE user_id = _user_id AND org_id = _org_id
      AND role IN ('federation','association','academy','club')
  ) OR public.is_platform_owner(_user_id);
$$;

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES: users read+update self; org members can read other members' profiles; platform_owner all
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_platform_owner(auth.uid())
         OR EXISTS (
           SELECT 1 FROM public.org_memberships m1
           JOIN public.org_memberships m2 ON m1.org_id = m2.org_id
           WHERE m1.user_id = auth.uid() AND m2.user_id = public.profiles.id
         ));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_platform_owner(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_platform_owner(auth.uid()));

-- ORGANIZATIONS
CREATE POLICY "orgs_member_read" ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id) OR public.is_platform_owner(auth.uid()));
CREATE POLICY "orgs_insert_authenticated" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() OR public.is_platform_owner(auth.uid()));
CREATE POLICY "orgs_admin_update" ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), id))
  WITH CHECK (public.is_org_admin(auth.uid(), id));
CREATE POLICY "orgs_admin_delete" ON public.organizations FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), id));

-- ORG MEMBERSHIPS
CREATE POLICY "memberships_read_self_or_org" ON public.org_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR public.is_org_member(auth.uid(), org_id)
         OR public.is_platform_owner(auth.uid()));
CREATE POLICY "memberships_admin_insert" ON public.org_memberships FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));
CREATE POLICY "memberships_admin_update" ON public.org_memberships FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id) OR user_id = auth.uid())
  WITH CHECK (public.is_org_admin(auth.uid(), org_id) OR user_id = auth.uid());
CREATE POLICY "memberships_admin_delete" ON public.org_memberships FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));

-- USER ROLES: read own; only service_role manages (no user policies for write)
CREATE POLICY "user_roles_read_self" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_owner(auth.uid()));

-- INVITATIONS
CREATE POLICY "invitations_org_admin_read" ON public.invitations FOR SELECT TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id)
         OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "invitations_admin_insert" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(auth.uid(), org_id) AND invited_by = auth.uid());
CREATE POLICY "invitations_admin_update" ON public.invitations FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id)
         OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (public.is_org_admin(auth.uid(), org_id)
         OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "invitations_admin_delete" ON public.invitations FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));

-- AUDIT LOGS: org members can read their org's logs; users can read their own actions; platform_owner all
CREATE POLICY "audit_read_org_or_self" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_platform_owner(auth.uid())
         OR actor_user_id = auth.uid()
         OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id)));
CREATE POLICY "audit_insert_self" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_user_id = auth.uid());

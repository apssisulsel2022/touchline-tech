-- 1. Move SECURITY DEFINER helpers out of the exposed API schema
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
ALTER FUNCTION public.is_platform_owner(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_org_member(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.is_org_admin(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.has_org_role(uuid, uuid, app_role) SET SCHEMA private;
ALTER FUNCTION public.can_view_org(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.can_admin_org(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.org_ancestor_ids(uuid) SET SCHEMA private;
ALTER FUNCTION public.handle_new_user() SET SCHEMA private;

-- keep internal cross-references resolvable
ALTER FUNCTION private.has_role(uuid, app_role) SET search_path = private, public;
ALTER FUNCTION private.is_platform_owner(uuid) SET search_path = private, public;
ALTER FUNCTION private.is_org_member(uuid, uuid) SET search_path = private, public;
ALTER FUNCTION private.is_org_admin(uuid, uuid) SET search_path = private, public;
ALTER FUNCTION private.has_org_role(uuid, uuid, app_role) SET search_path = private, public;
ALTER FUNCTION private.can_view_org(uuid, uuid) SET search_path = private, public;
ALTER FUNCTION private.can_admin_org(uuid, uuid) SET search_path = private, public;
ALTER FUNCTION private.org_ancestor_ids(uuid) SET search_path = private, public;
ALTER FUNCTION private.handle_new_user() SET search_path = private, public;

REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_platform_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_org_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_org_admin(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_org_role(uuid, uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_view_org(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_admin_org(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.org_ancestor_ids(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.is_platform_owner(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.is_org_admin(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.has_org_role(uuid, uuid, app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.can_view_org(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.can_admin_org(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.org_ancestor_ids(uuid) TO authenticated, anon, service_role;

-- 2. Invitations: invitees may only accept/reject, admins keep full control
DROP POLICY IF EXISTS invitations_admin_update ON public.invitations;

CREATE POLICY invitations_admin_update ON public.invitations
FOR UPDATE TO authenticated
USING (private.is_org_admin(auth.uid(), org_id))
WITH CHECK (private.is_org_admin(auth.uid(), org_id));

CREATE POLICY invitations_invitee_respond ON public.invitations
FOR UPDATE TO authenticated
USING (
  email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())::text
  AND status = 'pending'::invitation_status
)
WITH CHECK (
  email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())::text
  AND status IN ('accepted'::invitation_status, 'rejected'::invitation_status)
);

CREATE OR REPLACE FUNCTION private.tg_invitations_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  IF private.is_org_admin(auth.uid(), OLD.org_id) THEN
    RETURN NEW;
  END IF;
  -- non-admin invitees may only change status/responded_at
  NEW.id := OLD.id;
  NEW.org_id := OLD.org_id;
  NEW.email := OLD.email;
  NEW.role := OLD.role;
  NEW.invited_by := OLD.invited_by;
  NEW.token := OLD.token;
  NEW.expires_at := OLD.expires_at;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS invitations_guard ON public.invitations;
CREATE TRIGGER invitations_guard
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION private.tg_invitations_guard();

-- 3. Profiles: controlled self-deletion
CREATE POLICY profiles_self_delete ON public.profiles
FOR DELETE TO authenticated
USING (id = auth.uid() OR private.is_platform_owner(auth.uid()));

GRANT DELETE ON public.profiles TO authenticated;
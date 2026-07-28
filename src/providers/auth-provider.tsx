import * as React from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  readActiveOrgId,
  writeActiveOrgId,
  type Membership,
  type Session,
} from "@/lib/session";
import { permissionsForRole, type Permission, type Role } from "@/lib/rbac";

interface AuthContextValue {
  session: Session | null;
  supabaseSession: SupabaseSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  permissions: Permission[];
  memberships: Membership[];
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function hydrate(supabaseSession: SupabaseSession | null): Promise<Session | null> {
  if (!supabaseSession?.user) return null;
  const userId = supabaseSession.user.id;

  const [profileRes, membershipsRes, rolesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name,avatar_url,language,timezone,theme")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("org_memberships")
      .select("org_id,role,is_default,organizations(id,name)")
      .eq("user_id", userId),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  const profile = profileRes.data;
  const rawMembers = membershipsRes.data ?? [];
  const globalRoles = (rolesRes.data ?? []).map((r) => r.role as Role);
  const isPlatformOwner = globalRoles.includes("platform_owner");

  const memberships: Membership[] = rawMembers.map((row) => ({
    orgId: row.org_id as string,
    orgName: (row.organizations as { name?: string } | null)?.name ?? "Organisation",
    role: row.role as Role,
    isDefault: Boolean(row.is_default),
  }));

  const preferredId = readActiveOrgId();
  const active =
    memberships.find((m) => m.orgId === preferredId) ??
    memberships.find((m) => m.isDefault) ??
    memberships[0];

  const role: Role = active?.role ?? (isPlatformOwner ? "platform_owner" : "player");

  return {
    userId,
    email: profile?.email ?? supabaseSession.user.email ?? "",
    displayName:
      profile?.display_name ||
      (supabaseSession.user.email?.split("@")[0] ?? "Member"),
    avatarUrl: profile?.avatar_url ?? null,
    language: profile?.language ?? "en",
    timezone: profile?.timezone ?? "UTC",
    theme: profile?.theme ?? "system",
    role,
    organizationId: active?.orgId ?? null,
    organizationName: active?.orgName ?? "Touchline",
    memberships,
    isPlatformOwner,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseSession, setSupabaseSession] = React.useState<SupabaseSession | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const reload = React.useCallback(async (sbs: SupabaseSession | null) => {
    const next = await hydrate(sbs);
    setSession(next);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, sbs) => {
      if (cancelled) return;
      setSupabaseSession(sbs);
      if (event === "SIGNED_OUT") {
        setSession(null);
        writeActiveOrgId(null);
        return;
      }
      // Defer to avoid deadlock inside the auth callback
      setTimeout(() => {
        if (!cancelled) void reload(sbs);
      }, 0);
    });

    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        setSupabaseSession(data.session);
        await reload(data.session);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [reload]);

  const permissions = React.useMemo(
    () => (session ? permissionsForRole(session.role) : []),
    [session],
  );

  const value = React.useMemo<AuthContextValue>(() => {
    const permissionSet = new Set(permissions);
    return {
      session,
      supabaseSession,
      isAuthenticated: Boolean(supabaseSession?.user),
      isLoading,
      role: session?.role ?? null,
      permissions,
      memberships: session?.memberships ?? [],
      hasRole: (role) => session?.role === role,
      hasAnyRole: (roles) => Boolean(session && roles.includes(session.role)),
      hasPermission: (p) => permissionSet.has(p),
      hasAnyPermission: (list) => list.some((p) => permissionSet.has(p)),
      switchOrganization: async (orgId) => {
        writeActiveOrgId(orgId);
        await reload(supabaseSession);
      },
      refresh: () => reload(supabaseSession),
      signOut: async () => {
        await supabase.auth.signOut();
        writeActiveOrgId(null);
        setSession(null);
        setSupabaseSession(null);
      },
    };
  }, [session, supabaseSession, isLoading, permissions, reload]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Renders children only when the permission is held. */
export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  return <>{hasPermission(permission) ? children : fallback}</>;
}

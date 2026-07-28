import * as React from "react";
import {
  onSessionChange,
  readSession,
  signIn as signInLocal,
  signOut as signOutLocal,
  type Session,
} from "@/lib/session";
import { permissionsForRole, type Permission, type Role } from "@/lib/rbac";

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  permissions: Permission[];
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  signIn: (input: { email: string; role: Role }) => void;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Session + Role + Permission provider.
 *
 * Composes three concerns behind one context so consumers never read storage
 * directly: session identity, the active role, and the derived permission set.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setSession(readSession());
    setIsLoading(false);
    return onSessionChange(setSession);
  }, []);

  const permissions = React.useMemo(
    () => (session ? permissionsForRole(session.role) : []),
    [session],
  );

  const value = React.useMemo<AuthContextValue>(() => {
    const permissionSet = new Set(permissions);
    return {
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      role: session?.role ?? null,
      permissions,
      hasRole: (role) => session?.role === role,
      hasAnyRole: (roles) => Boolean(session && roles.includes(session.role)),
      hasPermission: (permission) => permissionSet.has(permission),
      hasAnyPermission: (list) => list.some((p) => permissionSet.has(p)),
      signIn: (input) => setSession(signInLocal(input)),
      signOut: () => {
        signOutLocal();
        setSession(null);
      },
    };
  }, [session, isLoading, permissions]);

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

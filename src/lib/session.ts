import type { Role } from "./rbac";

/**
 * Session shape used across the app shell.
 * Composed from Supabase auth user + `public.profiles` + `public.org_memberships`.
 */
export interface Membership {
  orgId: string;
  orgName: string;
  role: Role;
  isDefault: boolean;
}

export interface Session {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  theme: string;
  role: Role;
  organizationId: string | null;
  organizationName: string;
  memberships: Membership[];
  isPlatformOwner: boolean;
}

export const ACTIVE_ORG_STORAGE_KEY = "touchline.activeOrgId";

export function readActiveOrgId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeActiveOrgId(orgId: string | null) {
  if (typeof window === "undefined") return;
  if (orgId) window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId);
  else window.localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
}

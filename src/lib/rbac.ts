/**
 * RBAC model for the Touchline shell.
 *
 * Frontend foundation only: roles and permissions are declarative metadata used
 * to shape navigation and guards. Authoritative enforcement lives server-side.
 */

export const ROLES = [
  "platform_owner",
  "federation",
  "association",
  "academy",
  "club",
  "coach",
  "parent",
  "player",
  "referee",
  "scout",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  platform_owner: "Platform Owner",
  federation: "Federation",
  association: "Association",
  academy: "Academy / SSB",
  club: "Club",
  coach: "Coach",
  parent: "Parent / Guardian",
  player: "Player",
  referee: "Referee",
  scout: "Scout",
};

export type Permission =
  | "dashboard:view"
  | "tenants:manage"
  | "governance:manage"
  | "org:manage"
  | "people:view"
  | "competitions:view"
  | "matches:view"
  | "finance:view"
  | "medical:view"
  | "analytics:view"
  | "settings:manage";

const BASE: Permission[] = ["dashboard:view", "settings:manage"];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  platform_owner: [
    ...BASE,
    "tenants:manage",
    "governance:manage",
    "org:manage",
    "people:view",
    "competitions:view",
    "matches:view",
    "finance:view",
    "analytics:view",
  ],
  federation: [
    ...BASE,
    "governance:manage",
    "org:manage",
    "people:view",
    "competitions:view",
    "matches:view",
    "analytics:view",
  ],
  association: [...BASE, "org:manage", "people:view", "competitions:view", "matches:view"],
  academy: [
    ...BASE,
    "org:manage",
    "people:view",
    "competitions:view",
    "matches:view",
    "finance:view",
    "medical:view",
    "analytics:view",
  ],
  club: [...BASE, "org:manage", "people:view", "competitions:view", "matches:view", "finance:view"],
  coach: [...BASE, "people:view", "matches:view", "medical:view"],
  parent: [...BASE, "people:view", "finance:view"],
  player: [...BASE, "matches:view"],
  referee: [...BASE, "matches:view"],
  scout: [...BASE, "people:view", "analytics:view"],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? BASE;
}

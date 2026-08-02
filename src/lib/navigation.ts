import {
  Activity,
  Building2,
  CalendarDays,
  ClipboardList,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  Settings,
  Shield,
  Trophy,
  UserSquare2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Permission, Role } from "./rbac";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Placeholder destinations are shell-only until their module ships. */
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const OVERVIEW: NavGroup = {
  label: "Overview",
  items: [
    { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
    { title: "Activity", to: "/activity", icon: Activity, comingSoon: true },
  ],
};

const WORKSPACE: NavGroup = {
  label: "Workspace",
  items: [
    { title: "Members", to: "/members", icon: Users, permission: "org:manage" },
    { title: "Roles", to: "/roles", icon: Shield, permission: "org:manage" },
    { title: "Profile", to: "/profile", icon: Users },
    { title: "Settings", to: "/settings", icon: Settings, permission: "settings:manage" },
  ],
};
const SETTINGS = WORKSPACE;

const CATALOG: Record<string, NavItem> = {
  tenants: { title: "Tenants", to: "/tenants", icon: Building2, permission: "tenants:manage", comingSoon: true },
  governance: { title: "Governance", to: "/governance", icon: Shield, permission: "governance:manage", comingSoon: true },
  organisations: { title: "Organisations", to: "/organisations", icon: Building2, permission: "org:manage" },
  people: { title: "People", to: "/people", icon: Users, permission: "people:view", comingSoon: true },
  players: { title: "Players", to: "/players", icon: UserSquare2, permission: "people:view" },
  competitions: { title: "Competitions", to: "/competitions", icon: Trophy, permission: "competitions:view", comingSoon: true },
  matches: { title: "Matches", to: "/matches", icon: CalendarDays, permission: "matches:view", comingSoon: true },
  training: { title: "Training", to: "/training", icon: ClipboardList, comingSoon: true },
  medical: { title: "Medical", to: "/medical", icon: HeartPulse, permission: "medical:view", comingSoon: true },
  finance: { title: "Finance", to: "/finance", icon: Wallet, permission: "finance:view", comingSoon: true },
  analytics: { title: "Analytics", to: "/analytics", icon: LineChart, permission: "analytics:view", comingSoon: true },
  performance: { title: "Performance", to: "/performance", icon: Gauge, comingSoon: true },
};

function group(label: string, keys: (keyof typeof CATALOG)[]): NavGroup {
  return { label, items: keys.map((key) => CATALOG[key]) };
}

/** Navigation is role-shaped: items a role cannot access are never rendered. */
export const ROLE_NAVIGATION: Record<Role, NavGroup[]> = {
  platform_owner: [OVERVIEW, group("Platform", ["tenants", "governance", "organisations", "players"]), group("Insights", ["analytics", "finance"]), SETTINGS],
  federation: [OVERVIEW, group("Governance", ["governance", "organisations", "people", "players"]), group("Competition", ["competitions", "matches"]), group("Insights", ["analytics"]), SETTINGS],
  association: [OVERVIEW, group("Region", ["organisations", "people", "players"]), group("Competition", ["competitions", "matches"]), SETTINGS],
  academy: [OVERVIEW, group("Academy", ["people", "players", "training", "medical"]), group("Competition", ["competitions", "matches"]), group("Business", ["finance", "analytics"]), SETTINGS],
  club: [OVERVIEW, group("Club", ["people", "players", "training"]), group("Competition", ["competitions", "matches"]), group("Business", ["finance"]), SETTINGS],
  coach: [OVERVIEW, group("Squad", ["people", "players", "training", "medical"]), group("Fixtures", ["matches"]), SETTINGS],
  parent: [OVERVIEW, group("Family", ["people", "matches"]), group("Payments", ["finance"]), SETTINGS],
  player: [OVERVIEW, group("Me", ["matches", "training", "performance"]), SETTINGS],
  referee: [OVERVIEW, group("Assignments", ["matches"]), SETTINGS],
  scout: [OVERVIEW, group("Scouting", ["people", "players", "analytics"]), SETTINGS],
};

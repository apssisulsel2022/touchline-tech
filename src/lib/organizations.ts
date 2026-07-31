import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { OrgStatus, OrgType } from "@/lib/validation/org";

export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrgDocumentRow = Database["public"]["Tables"]["org_documents"]["Row"];

export interface OrgSocials {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
}

export interface OrgSettings {
  allowPublicDirectory?: boolean;
  requireMfaForAdmins?: boolean;
  defaultMemberRole?: string;
  accentColor?: string;
  notifications?: {
    memberInvites?: boolean;
    roleChanges?: boolean;
    weeklyDigest?: boolean;
  };
}

export const ORG_LIST_PAGE_SIZE = 12;

export interface OrgListFilters {
  search?: string;
  type?: OrgType | "all";
  status?: OrgStatus | "all";
  tag?: string | null;
  parentId?: string | null;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface OrgListResult {
  rows: OrganizationRow[];
  total: number;
}

/** Paginated, filtered organisation directory scoped by RLS to what the user may view. */
export async function fetchOrganizations(filters: OrgListFilters = {}): Promise<OrgListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? ORG_LIST_PAGE_SIZE;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("organizations")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, from + pageSize - 1);

  if (!filters.includeDeleted) query = query.is("deleted_at", null);
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term},city.ilike.${term}`);
  }
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.tag) query = query.contains("tags", [filters.tag]);
  if (filters.parentId !== undefined) {
    query = filters.parentId === null ? query.is("parent_id", null) : query.eq("parent_id", filters.parentId);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export const organizationsQuery = (filters: OrgListFilters) =>
  queryOptions({
    queryKey: ["organizations", filters],
    queryFn: () => fetchOrganizations(filters),
    staleTime: 30_000,
  });

export async function fetchOrganization(orgId: string): Promise<OrganizationRow | null> {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", orgId).maybeSingle();
  if (error) throw error;
  return data;
}

export const organizationQuery = (orgId: string) =>
  queryOptions({
    queryKey: ["organization", orgId],
    queryFn: () => fetchOrganization(orgId),
    staleTime: 30_000,
  });

/** Every organisation visible to the user, used for hierarchy trees and parent pickers. */
export async function fetchOrganizationTreeSource(): Promise<OrganizationRow[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const organizationTreeQuery = () =>
  queryOptions({
    queryKey: ["organizations", "tree"],
    queryFn: fetchOrganizationTreeSource,
    staleTime: 60_000,
  });

export interface OrgTreeNode {
  org: OrganizationRow;
  children: OrgTreeNode[];
  depth: number;
}

/** Builds a forest from a flat list; orphans (parent not visible) become roots. */
export function buildOrgTree(rows: OrganizationRow[]): OrgTreeNode[] {
  const byId = new Map(rows.map((o) => [o.id, o]));
  const nodes = new Map<string, OrgTreeNode>(
    rows.map((o) => [o.id, { org: o, children: [], depth: 0 }]),
  );
  const roots: OrgTreeNode[] = [];

  for (const row of rows) {
    const node = nodes.get(row.id)!;
    const parent = row.parent_id ? nodes.get(row.parent_id) : undefined;
    if (parent && byId.has(row.parent_id!)) parent.children.push(node);
    else roots.push(node);
  }

  const applyDepth = (list: OrgTreeNode[], depth: number) => {
    for (const n of list) {
      n.depth = depth;
      applyDepth(n.children, depth + 1);
    }
  };
  applyDepth(roots, 0);
  return roots;
}

/** Materialised breadcrumb path (root → org) computed client-side from the visible set. */
export function orgPath(rows: OrganizationRow[], orgId: string): OrganizationRow[] {
  const byId = new Map(rows.map((o) => [o.id, o]));
  const path: OrganizationRow[] = [];
  let current = byId.get(orgId);
  let guard = 0;
  while (current && guard++ < 20) {
    path.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return path;
}

/** Descendant ids of an org, used to prevent cyclic re-parenting. */
export function descendantIds(rows: OrganizationRow[], orgId: string): Set<string> {
  const result = new Set<string>();
  const stack = [orgId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const row of rows) {
      if (row.parent_id === current && !result.has(row.id)) {
        result.add(row.id);
        stack.push(row.id);
      }
    }
  }
  return result;
}

export interface OrgMemberRow {
  id: string;
  userId: string;
  role: Database["public"]["Enums"]["app_role"];
  isDefault: boolean;
  createdAt: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export async function fetchOrgMembers(orgId: string): Promise<OrgMemberRow[]> {
  const { data, error } = await supabase
    .from("org_memberships")
    .select("id,user_id,role,is_default,created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,display_name,email,avatar_url,is_active")
    .in("id", rows.map((r) => r.user_id));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((r) => {
    const p = profileById.get(r.user_id);
    return {
      id: r.id,
      userId: r.user_id,
      role: r.role,
      isDefault: r.is_default,
      createdAt: r.created_at,
      displayName: p?.display_name || p?.email || "Member",
      email: p?.email ?? "",
      avatarUrl: p?.avatar_url ?? null,
      isActive: p?.is_active ?? true,
    };
  });
}

export const orgMembersQuery = (orgId: string) =>
  queryOptions({
    queryKey: ["organization", orgId, "members"],
    queryFn: () => fetchOrgMembers(orgId),
    staleTime: 15_000,
  });

export async function fetchOrgDocuments(orgId: string): Promise<OrgDocumentRow[]> {
  const { data, error } = await supabase
    .from("org_documents")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const orgDocumentsQuery = (orgId: string) =>
  queryOptions({
    queryKey: ["organization", orgId, "documents"],
    queryFn: () => fetchOrgDocuments(orgId),
    staleTime: 30_000,
  });

export interface OrgActivityRow {
  id: string;
  action: string;
  entity: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export async function fetchOrgActivity(orgId: string, limit = 20): Promise<OrgActivityRow[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,action,entity,created_at,metadata")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    action: r.action,
    entity: r.entity,
    createdAt: r.created_at,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
  }));
}

export const orgActivityQuery = (orgId: string) =>
  queryOptions({
    queryKey: ["organization", orgId, "activity"],
    queryFn: () => fetchOrgActivity(orgId),
    staleTime: 15_000,
  });

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { assertTenantScope } from "@/lib/tenant";
import { ageInYears } from "@/lib/validation/players";

/**
 * Player Registry data access layer.
 *
 * Every table is org-scoped and protected by RLS (`private.can_view_org` for
 * reads, `private.can_admin_org` for writes), so the client never derives
 * authority from local state — `orgId` is only used for cache keys and to make
 * the intent of each query explicit.
 */

type Tables = Database["public"]["Tables"];
export type PlayerRow = Tables["players"]["Row"];
export type GuardianRow = Tables["player_guardians"]["Row"];
export type RegistrationRow = Tables["player_registrations"]["Row"];
export type PlayerDocumentRow = Tables["player_documents"]["Row"];
export type PlayerStatusEventRow = Tables["player_status_events"]["Row"];

export const playerKeys = {
  all: (orgId: string) => ["players", orgId] as const,
  list: (orgId: string) => ["players", orgId, "list"] as const,
  detail: (orgId: string, playerId: string) => ["players", orgId, "detail", playerId] as const,
  section: (orgId: string, playerId: string, section: string) =>
    ["players", orgId, "detail", playerId, section] as const,
};

/* --------------------------------- reads --------------------------------- */

export const playersQuery = (orgId: string) =>
  queryOptions({
    queryKey: playerKeys.list(orgId),
    queryFn: async (): Promise<PlayerRow[]> => {
      const tenantId = assertTenantScope(orgId);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("org_id", tenantId)
        .is("deleted_at", null)
        .order("last_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const playerQuery = (orgId: string, playerId: string) =>
  queryOptions({
    queryKey: playerKeys.detail(orgId, playerId),
    queryFn: async (): Promise<PlayerRow | null> => {
      const tenantId = assertTenantScope(orgId);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .eq("org_id", tenantId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 15_000,
  });

export const guardiansQuery = (orgId: string, playerId: string) =>
  queryOptions({
    queryKey: playerKeys.section(orgId, playerId, "guardians"),
    queryFn: async (): Promise<GuardianRow[]> => {
      const { data, error } = await supabase
        .from("player_guardians")
        .select("*")
        .eq("player_id", playerId)
        .order("is_primary", { ascending: false })
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const registrationsQuery = (orgId: string, playerId: string) =>
  queryOptions({
    queryKey: playerKeys.section(orgId, playerId, "registrations"),
    queryFn: async (): Promise<RegistrationRow[]> => {
      const tenantId = assertTenantScope(orgId);
      const { data, error } = await supabase
        .from("player_registrations")
        .select("*")
        .eq("player_id", playerId)
        .eq("org_id", tenantId)
        .order("registered_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const orgRegistrationsQuery = (orgId: string) =>
  queryOptions({
    queryKey: [...playerKeys.all(orgId), "registrations"] as const,
    queryFn: async (): Promise<RegistrationRow[]> => {
      const tenantId = assertTenantScope(orgId);
      const { data, error } = await supabase
        .from("player_registrations")
        .select("*")
        .eq("org_id", tenantId)
        .order("registered_on", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const playerDocumentsQuery = (orgId: string, playerId: string) =>
  queryOptions({
    queryKey: playerKeys.section(orgId, playerId, "documents"),
    queryFn: async (): Promise<PlayerDocumentRow[]> => {
      const { data, error } = await supabase
        .from("player_documents")
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const playerTimelineQuery = (orgId: string, playerId: string) =>
  queryOptions({
    queryKey: playerKeys.section(orgId, playerId, "timeline"),
    queryFn: async (): Promise<PlayerStatusEventRow[]> => {
      const { data, error } = await supabase
        .from("player_status_events")
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });

/* ------------------------------- mutations -------------------------------- */

export class ConcurrencyError extends Error {
  constructor() {
    super("This player was changed by someone else. Reload the record and try again.");
    this.name = "ConcurrencyError";
  }
}

/**
 * Optimistic-concurrency update: the write only lands when the row is still at
 * the version the editor loaded. The database trigger bumps `version`.
 */
export async function updatePlayerRecord(
  orgId: string,
  playerId: string,
  expectedVersion: number,
  values: Record<string, unknown>,
): Promise<PlayerRow> {
  const tenantId = assertTenantScope(orgId);
  const { data, error } = await supabase
    .from("players")
    .update(values as never)
    .eq("id", playerId)
    .eq("org_id", tenantId)
    .eq("version", expectedVersion)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ConcurrencyError();
  return data;
}

/** Soft delete keeps the historical record and its timeline intact. */
export async function softDeletePlayer(orgId: string, playerId: string, actorId: string | null) {
  const tenantId = assertTenantScope(orgId);
  const { error } = await supabase
    .from("players")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: actorId,
      status: "archived",
    })
    .eq("id", playerId)
    .eq("org_id", tenantId);
  if (error) throw error;
}

/* -------------------------------- helpers --------------------------------- */

export function playerFullName(player: Pick<PlayerRow, "first_name" | "last_name" | "known_as">) {
  return player.known_as?.trim()
    ? `${player.first_name} ${player.last_name} (${player.known_as})`
    : `${player.first_name} ${player.last_name}`;
}

export function playerInitials(player: Pick<PlayerRow, "first_name" | "last_name">) {
  return `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`.toUpperCase();
}

export function playerAge(player: Pick<PlayerRow, "date_of_birth">) {
  return ageInYears(player.date_of_birth);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Documents inside 60 days of expiry (or already expired) need attention. */
export function isDocumentExpiring(expiresOn?: string | null) {
  if (!expiresOn) return false;
  const days = (new Date(expiresOn).getTime() - Date.now()) / 86_400_000;
  return days <= 60;
}

/* ---------------------------- registration lookups ------------------------ */

export interface RegistrationOptions {
  seasons: { id: string; name: string; is_current: boolean }[];
  teams: { id: string; name: string; age_category_id: string | null }[];
  ageCategories: { id: string; label: string; min_age: number | null; max_age: number }[];
}

/**
 * Season / squad / age-category lookups needed to register a player. Read-only
 * projections so the Player domain never depends on Academy internals.
 */
export const registrationOptionsQuery = (orgId: string) =>
  queryOptions({
    queryKey: [...playerKeys.all(orgId), "registration-options"] as const,
    queryFn: async (): Promise<RegistrationOptions> => {
      const [seasons, teams, categories] = await Promise.all([
        supabase
          .from("seasons")
          .select("id, name, is_current")
          .eq("org_id", orgId)
          .order("starts_on", { ascending: false }),
        supabase
          .from("teams")
          .select("id, name, age_category_id")
          .eq("org_id", orgId)
          .order("name", { ascending: true }),
        supabase
          .from("age_categories")
          .select("id, label, min_age, max_age")
          .eq("org_id", orgId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);
      if (seasons.error) throw seasons.error;
      if (teams.error) throw teams.error;
      if (categories.error) throw categories.error;
      return {
        seasons: seasons.data ?? [],
        teams: teams.data ?? [],
        ageCategories: categories.data ?? [],
      };
    },
    staleTime: 60_000,
  });

/** True when the player's age at registration fits the selected age category. */
export function fitsAgeCategory(
  age: number,
  category?: { min_age: number | null; max_age: number },
): boolean {
  if (!category) return true;
  if (age > category.max_age) return false;
  if (category.min_age !== null && age < category.min_age) return false;
  return true;
}

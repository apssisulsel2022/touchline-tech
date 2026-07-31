import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Academy / Football School (SSB) data access layer.
 *
 * Every read is scoped by RLS (`private.can_view_org`) and every write requires
 * organisation admin rights (`private.can_admin_org`), so the client never has
 * to filter by tenant beyond passing the active `orgId` for query cache keys.
 */

type Tables = Database["public"]["Tables"];
export type AcademyProfileRow = Tables["academy_profiles"]["Row"];
export type SeasonRow = Tables["seasons"]["Row"];
export type AgeCategoryRow = Tables["age_categories"]["Row"];
export type TeamRow = Tables["teams"]["Row"];
export type CoachRow = Tables["academy_coaches"]["Row"];
export type FacilityRow = Tables["facilities"]["Row"];
export type TrainingSessionRow = Tables["training_sessions"]["Row"];
export type AcademyEventRow = Tables["academy_events"]["Row"];
export type MediaAlbumRow = Tables["media_albums"]["Row"];
export type MediaItemRow = Tables["media_items"]["Row"];

export const academyKeys = {
  all: (orgId: string) => ["academy", orgId] as const,
  section: (orgId: string, section: string) => ["academy", orgId, section] as const,
};

async function list<T>(table: string, orgId: string, order: string, ascending = true): Promise<T[]> {
  const { data, error } = await supabase
    .from(table as never)
    .select("*")
    .eq("org_id", orgId)
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

/* ------------------------------- profile -------------------------------- */

export const academyProfileQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "profile"),
    queryFn: async (): Promise<AcademyProfileRow | null> => {
      const { data, error } = await supabase
        .from("academy_profiles")
        .select("*")
        .eq("org_id", orgId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

/* ------------------------------- seasons -------------------------------- */

export const seasonsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "seasons"),
    queryFn: () => list<SeasonRow>("seasons", orgId, "starts_on", false),
    staleTime: 30_000,
  });

/* ---------------------------- age categories ---------------------------- */

export const ageCategoriesQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "age-categories"),
    queryFn: () => list<AgeCategoryRow>("age_categories", orgId, "sort_order"),
    staleTime: 30_000,
  });

/* -------------------------------- teams --------------------------------- */

export const teamsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "teams"),
    queryFn: () => list<TeamRow>("teams", orgId, "name"),
    staleTime: 30_000,
  });

/* ------------------------------- coaches -------------------------------- */

export const coachesQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "coaches"),
    queryFn: () => list<CoachRow>("academy_coaches", orgId, "full_name"),
    staleTime: 30_000,
  });

/* ------------------------------ facilities ------------------------------ */

export const facilitiesQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "facilities"),
    queryFn: () => list<FacilityRow>("facilities", orgId, "name"),
    staleTime: 30_000,
  });

/* ------------------------------- training ------------------------------- */

export const trainingSessionsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "training"),
    queryFn: () => list<TrainingSessionRow>("training_sessions", orgId, "weekday"),
    staleTime: 30_000,
  });

/* ------------------------------- calendar ------------------------------- */

export const academyEventsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "events"),
    queryFn: () => list<AcademyEventRow>("academy_events", orgId, "starts_on"),
    staleTime: 30_000,
  });

/* --------------------------------- media -------------------------------- */

export const mediaAlbumsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "albums"),
    queryFn: () => list<MediaAlbumRow>("media_albums", orgId, "created_at", false),
    staleTime: 30_000,
  });

export const mediaItemsQuery = (orgId: string) =>
  queryOptions({
    queryKey: academyKeys.section(orgId, "media"),
    queryFn: () => list<MediaItemRow>("media_items", orgId, "created_at", false),
    staleTime: 30_000,
  });

/* ------------------------------- helpers -------------------------------- */

export function currentSeason(seasons: SeasonRow[]): SeasonRow | null {
  return seasons.find((s) => s.is_current) ?? seasons.find((s) => s.status === "active") ?? null;
}

export function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatTime(value: string) {
  return value.slice(0, 5);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Licence/contract expiry inside the next 60 days is surfaced as a risk. */
export function isExpiringSoon(date?: string | null, withinDays = 60) {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff > 0 && diff < withinDays * 86_400_000;
}

export function isExpired(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

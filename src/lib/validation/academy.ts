import { z } from "zod";

/**
 * Validation contracts for the Academy / Football School (SSB) module.
 * Mirrors the database constraints so the UI fails fast before hitting RLS.
 */

/* -------------------------------------------------------------------------- */
/* Enums + labels                                                             */
/* -------------------------------------------------------------------------- */

export const SEASON_STATUSES = ["upcoming", "active", "completed", "archived"] as const;
export type SeasonStatus = (typeof SEASON_STATUSES)[number];
export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const TEAM_STATUSES = ["active", "inactive", "archived"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];
export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const COACH_STATUSES = ["active", "inactive", "on_leave", "terminated"] as const;
export type CoachStatus = (typeof COACH_STATUSES)[number];
export const COACH_STATUS_LABELS: Record<CoachStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
  terminated: "Contract ended",
};

export const CONTRACT_TYPES = ["full_time", "part_time", "volunteer", "freelance"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  full_time: "Full time",
  part_time: "Part time",
  volunteer: "Volunteer",
  freelance: "Freelance",
};

export const FACILITY_TYPES = [
  "training_ground",
  "field",
  "locker_room",
  "equipment_store",
  "gym",
  "medical_room",
  "office",
] as const;
export type FacilityType = (typeof FACILITY_TYPES)[number];
export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  training_ground: "Training ground",
  field: "Field / pitch",
  locker_room: "Locker room",
  equipment_store: "Equipment store",
  gym: "Gym",
  medical_room: "Medical room",
  office: "Office",
};

export const FACILITY_STATUSES = ["available", "maintenance", "unavailable"] as const;
export type FacilityStatus = (typeof FACILITY_STATUSES)[number];
export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  available: "Available",
  maintenance: "Under maintenance",
  unavailable: "Unavailable",
};

export const ACADEMY_EVENT_TYPES = [
  "registration_window",
  "holiday",
  "training_block",
  "tournament",
  "meeting",
  "other",
] as const;
export type AcademyEventType = (typeof ACADEMY_EVENT_TYPES)[number];
export const ACADEMY_EVENT_TYPE_LABELS: Record<AcademyEventType, string> = {
  registration_window: "Registration window",
  holiday: "Holiday",
  training_block: "Training block",
  tournament: "Tournament",
  meeting: "Meeting",
  other: "Other",
};

export const MEDIA_KINDS = ["photo", "video"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Cannot exceed ${max} characters`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const optionalUrl = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const optionalUuid = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v !== "none" ? v : undefined));

/* -------------------------------------------------------------------------- */
/* Academy profile                                                            */
/* -------------------------------------------------------------------------- */

export const academyProfileSchema = z.object({
  license_number: optionalText(80),
  license_authority: optionalText(120),
  license_expiry: optionalDate,
  registration_number: optionalText(80),
  accreditation: optionalText(160),
  accreditation_level: optionalText(80),
  founded_date: optionalDate,
  head_of_academy: optionalText(120),
  motto: optionalText(160),
  philosophy: optionalText(2000),
  primary_color: optionalText(24),
  secondary_color: optionalText(24),
  capacity: z.coerce.number().int().min(0).max(100000).optional(),
});
export type AcademyProfileInput = z.infer<typeof academyProfileSchema>;

/* -------------------------------------------------------------------------- */
/* Season                                                                     */
/* -------------------------------------------------------------------------- */

export const seasonSchema = z
  .object({
    name: z.string().trim().min(2, "Season name is required").max(80),
    academic_year: optionalText(20),
    starts_on: z.string().min(1, "Start date is required"),
    ends_on: z.string().min(1, "End date is required"),
    registration_opens_on: optionalDate,
    registration_closes_on: optionalDate,
    status: z.enum(SEASON_STATUSES),
    is_current: z.boolean(),
    notes: optionalText(1000),
  })
  .refine((v) => new Date(v.ends_on) > new Date(v.starts_on), {
    message: "End date must be after the start date",
    path: ["ends_on"],
  })
  .refine(
    (v) =>
      !v.registration_opens_on ||
      !v.registration_closes_on ||
      new Date(v.registration_closes_on) >= new Date(v.registration_opens_on),
    { message: "Registration must close after it opens", path: ["registration_closes_on"] },
  );
export type SeasonInput = z.infer<typeof seasonSchema>;

/* -------------------------------------------------------------------------- */
/* Age category                                                               */
/* -------------------------------------------------------------------------- */

export const ageCategorySchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Code is required")
      .max(16)
      .regex(/^[A-Za-z0-9-]+$/, "Letters, digits and hyphens only"),
    label: z.string().trim().min(2, "Label is required").max(60),
    max_age: z.coerce.number().int().min(4, "Minimum 4").max(23, "Maximum 23"),
    min_age: z.coerce.number().int().min(3).max(23).optional(),
    cutoff_month: z.coerce.number().int().min(1).max(12),
    is_active: z.boolean(),
    sort_order: z.coerce.number().int().min(0).max(999),
    description: optionalText(400),
  })
  .refine((v) => v.min_age === undefined || v.min_age <= v.max_age, {
    message: "Minimum age cannot exceed maximum age",
    path: ["min_age"],
  });
export type AgeCategoryInput = z.infer<typeof ageCategorySchema>;

/** Default FIFA-style ladder seeded for a new academy. */
export const DEFAULT_AGE_CATEGORIES = Array.from({ length: 11 }, (_, i) => {
  const age = 8 + i;
  return {
    code: `U-${age}`,
    label: `Under ${age}`,
    max_age: age,
    min_age: age - 1,
    cutoff_month: 1,
    is_custom: false,
    is_active: true,
    sort_order: i,
  };
});

/**
 * Automatic age validation: a player born on `birthDate` is eligible for the
 * category when their age at the season cut-off does not exceed `max_age`
 * (and is at least `min_age` when a floor is configured).
 */
export function ageAtCutoff(birthDate: string | Date, cutoffMonth: number, referenceYear?: number) {
  const dob = new Date(birthDate);
  const year = referenceYear ?? new Date().getFullYear();
  const cutoff = new Date(Date.UTC(year, cutoffMonth - 1, 1));
  let age = cutoff.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    cutoff.getUTCMonth() < dob.getUTCMonth() ||
    (cutoff.getUTCMonth() === dob.getUTCMonth() && cutoff.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function isEligibleForCategory(
  birthDate: string | Date,
  category: { max_age: number; min_age?: number | null; cutoff_month: number },
  referenceYear?: number,
) {
  const age = ageAtCutoff(birthDate, category.cutoff_month, referenceYear);
  if (age > category.max_age) return false;
  if (category.min_age != null && age < category.min_age) return false;
  return true;
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

export const teamSchema = z
  .object({
    name: z.string().trim().min(2, "Team name is required").max(80),
    short_name: optionalText(20),
    photo_url: optionalUrl,
    season_id: optionalUuid,
    age_category_id: optionalUuid,
    head_coach_id: optionalUuid,
    assistant_coach_id: optionalUuid,
    manager_id: optionalUuid,
    max_squad_size: z.coerce.number().int().min(1, "At least 1").max(60, "Maximum 60"),
    status: z.enum(TEAM_STATUSES),
    description: optionalText(600),
  })
  .refine((v) => !v.head_coach_id || v.head_coach_id !== v.assistant_coach_id, {
    message: "Assistant coach must differ from the head coach",
    path: ["assistant_coach_id"],
  });
export type TeamInput = z.infer<typeof teamSchema>;

/* -------------------------------------------------------------------------- */
/* Coach                                                                      */
/* -------------------------------------------------------------------------- */

export const coachSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name is required").max(120),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .max(255)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    phone: optionalText(32),
    photo_url: optionalUrl,
    role_title: z.string().trim().min(2, "Role is required").max(60),
    license_level: optionalText(40),
    license_number: optionalText(60),
    license_expiry: optionalDate,
    certifications: z.array(z.string().trim().max(80)).max(20),
    contract_type: z.enum(CONTRACT_TYPES),
    contract_start: optionalDate,
    contract_end: optionalDate,
    status: z.enum(COACH_STATUSES),
    availability: z.array(z.coerce.number().int().min(0).max(6)).max(7),
    notes: optionalText(1000),
  })
  .refine(
    (v) => !v.contract_start || !v.contract_end || new Date(v.contract_end) >= new Date(v.contract_start),
    { message: "Contract end must be after the start", path: ["contract_end"] },
  );
export type CoachInput = z.infer<typeof coachSchema>;

/* -------------------------------------------------------------------------- */
/* Facility                                                                   */
/* -------------------------------------------------------------------------- */

export const facilitySchema = z.object({
  name: z.string().trim().min(2, "Facility name is required").max(100),
  type: z.enum(FACILITY_TYPES),
  surface: optionalText(60),
  capacity: z.coerce.number().int().min(0).max(200000).optional(),
  address_line: optionalText(200),
  city: optionalText(80),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  status: z.enum(FACILITY_STATUSES),
  notes: optionalText(600),
});
export type FacilityInput = z.infer<typeof facilitySchema>;

/* -------------------------------------------------------------------------- */
/* Training session                                                           */
/* -------------------------------------------------------------------------- */

export const trainingSessionSchema = z
  .object({
    title: z.string().trim().min(2, "Session title is required").max(100),
    team_id: optionalUuid,
    facility_id: optionalUuid,
    coach_id: optionalUuid,
    season_id: optionalUuid,
    weekday: z.coerce.number().int().min(0).max(6),
    starts_at: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    ends_at: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    capacity: z.coerce.number().int().min(0).max(500).optional(),
    objectives: z.array(z.string().trim().max(120)).max(10),
    intensity: optionalText(40),
    is_active: z.boolean(),
  })
  .refine((v) => v.ends_at > v.starts_at, {
    message: "Session must end after it starts",
    path: ["ends_at"],
  });
export type TrainingSessionInput = z.infer<typeof trainingSessionSchema>;

/* -------------------------------------------------------------------------- */
/* Calendar event                                                             */
/* -------------------------------------------------------------------------- */

export const academyEventSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(120),
    type: z.enum(ACADEMY_EVENT_TYPES),
    season_id: optionalUuid,
    starts_on: z.string().min(1, "Start date is required"),
    ends_on: z.string().min(1, "End date is required"),
    description: optionalText(600),
  })
  .refine((v) => new Date(v.ends_on) >= new Date(v.starts_on), {
    message: "End date cannot be before the start date",
    path: ["ends_on"],
  });
export type AcademyEventInput = z.infer<typeof academyEventSchema>;

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export const mediaAlbumSchema = z.object({
  title: z.string().trim().min(2, "Album title is required").max(100),
  description: optionalText(400),
  cover_url: optionalUrl,
});
export type MediaAlbumInput = z.infer<typeof mediaAlbumSchema>;

export const mediaItemSchema = z.object({
  album_id: optionalUuid,
  kind: z.enum(MEDIA_KINDS),
  url: z.string().trim().url("Enter a valid URL").max(2048),
  caption: optionalText(200),
});
export type MediaItemInput = z.infer<typeof mediaItemSchema>;

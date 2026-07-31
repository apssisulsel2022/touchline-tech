import { z } from "zod";

/**
 * Validation contracts for the Player Registry domain.
 *
 * Mirrors the database constraints (`players`, `player_guardians`,
 * `player_registrations`, `player_documents`) so the UI fails fast before a
 * write is rejected by a CHECK constraint, a unique index or RLS.
 */

/* -------------------------------------------------------------------------- */
/* Enums + labels                                                             */
/* -------------------------------------------------------------------------- */

export const PLAYER_STATUSES = [
  "draft",
  "active",
  "inactive",
  "injured",
  "suspended",
  "transferred",
  "archived",
] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];
export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  injured: "Injured",
  suspended: "Suspended",
  transferred: "Transferred",
  archived: "Archived",
};

export const PLAYER_GENDERS = ["male", "female", "other", "undisclosed"] as const;
export type PlayerGender = (typeof PLAYER_GENDERS)[number];
export const PLAYER_GENDER_LABELS: Record<PlayerGender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  undisclosed: "Prefer not to say",
};

export const PREFERRED_FEET = ["left", "right", "both"] as const;
export type PreferredFoot = (typeof PREFERRED_FEET)[number];
export const PREFERRED_FOOT_LABELS: Record<PreferredFoot, string> = {
  left: "Left",
  right: "Right",
  both: "Both",
};

export const PLAYER_POSITIONS = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
  "unassigned",
] as const;
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];
export const PLAYER_POSITION_LABELS: Record<PlayerPosition, string> = {
  goalkeeper: "Goalkeeper",
  defender: "Defender",
  midfielder: "Midfielder",
  forward: "Forward",
  unassigned: "Unassigned",
};

export const REGISTRATION_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "expired",
  "withdrawn",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];
export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  draft: "Draft",
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
  withdrawn: "Withdrawn",
};

export const GUARDIAN_RELATIONSHIPS = [
  "mother",
  "father",
  "legal_guardian",
  "sibling",
  "other",
] as const;
export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];
export const GUARDIAN_RELATIONSHIP_LABELS: Record<GuardianRelationship, string> = {
  mother: "Mother",
  father: "Father",
  legal_guardian: "Legal guardian",
  sibling: "Sibling",
  other: "Other",
};

export const DOCUMENT_VERIFICATIONS = ["pending", "verified", "rejected", "expired"] as const;
export type DocumentVerification = (typeof DOCUMENT_VERIFICATIONS)[number];
export const DOCUMENT_VERIFICATION_LABELS: Record<DocumentVerification, string> = {
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
  expired: "Expired",
};

export const PLAYER_DOCUMENT_CATEGORIES = [
  "identity",
  "birth_certificate",
  "photo",
  "medical",
  "parental_consent",
  "transfer",
  "insurance",
  "other",
] as const;
export type PlayerDocumentCategory = (typeof PLAYER_DOCUMENT_CATEGORIES)[number];
export const PLAYER_DOCUMENT_CATEGORY_LABELS: Record<PlayerDocumentCategory, string> = {
  identity: "Identity document",
  birth_certificate: "Birth certificate",
  photo: "Photograph",
  medical: "Medical clearance",
  parental_consent: "Parental consent",
  transfer: "Transfer paperwork",
  insurance: "Insurance",
  other: "Other",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const optionalText = z
  .string()
  .trim()
  .max(300)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  });

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

/** Age in whole years at a given reference date. */
export function ageInYears(dateOfBirth: string, at: Date = new Date()): number {
  const dob = new Date(dateOfBirth);
  let age = at.getFullYear() - dob.getFullYear();
  const monthDelta = at.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && at.getDate() < dob.getDate())) age -= 1;
  return age;
}

/** Anyone under 18 is treated as a minor and requires guardian consent. */
export function isMinor(dateOfBirth: string, at: Date = new Date()): boolean {
  return ageInYears(dateOfBirth, at) < 18;
}

/* -------------------------------------------------------------------------- */
/* Schemas                                                                    */
/* -------------------------------------------------------------------------- */

export const playerSchema = z.object({
  first_name: z.string().trim().min(2, "First name is required").max(80),
  last_name: z.string().trim().min(2, "Last name is required").max(80),
  known_as: optionalText,
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future")
    .refine((value) => ageInYears(value) <= 60, "Check the date of birth — the age looks wrong"),
  gender: z.enum(PLAYER_GENDERS),
  nationality: optionalText,
  national_id: optionalText,
  photo_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  preferred_foot: z.enum(PREFERRED_FEET),
  primary_position: z.enum(PLAYER_POSITIONS),
  secondary_position: z.enum(PLAYER_POSITIONS).optional(),
  height_cm: optionalNumber.refine(
    (value) => value === undefined || (value >= 80 && value <= 250),
    "Height must be between 80 and 250 cm",
  ),
  weight_kg: optionalNumber.refine(
    (value) => value === undefined || (value >= 15 && value <= 200),
    "Weight must be between 15 and 200 kg",
  ),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  phone: optionalText,
  address_line: optionalText,
  city: optionalText,
  school_name: optionalText,
  medical_notes: z.string().trim().max(2000).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  notes: z.string().trim().max(2000).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  status: z.enum(PLAYER_STATUSES),
});
export type PlayerInput = z.input<typeof playerSchema>;
export type PlayerValues = z.output<typeof playerSchema>;

export const guardianSchema = z.object({
  full_name: z.string().trim().min(2, "Guardian name is required").max(120),
  relationship: z.enum(GUARDIAN_RELATIONSHIPS),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  phone: optionalText,
  address_line: optionalText,
  occupation: optionalText,
  is_primary: z.boolean(),
  consent_given: z.boolean(),
  notes: optionalText,
});
export type GuardianInput = z.input<typeof guardianSchema>;

export const registrationSchema = z
  .object({
    season_id: z.string().uuid("Select a season"),
    team_id: optionalText,
    age_category_id: optionalText,
    jersey_number: optionalNumber.refine(
      (value) => value === undefined || (value >= 1 && value <= 99),
      "Shirt numbers run from 1 to 99",
    ),
    status: z.enum(REGISTRATION_STATUSES),
    registered_on: z.string().min(1, "Registration date is required"),
    expires_on: optionalDate,
    rejection_reason: optionalText,
    fee_note: optionalText,
    notes: optionalText,
  })
  .refine(
    (value) => !value.expires_on || value.expires_on >= value.registered_on,
    { message: "Expiry cannot be before the registration date", path: ["expires_on"] },
  )
  .refine((value) => value.status !== "rejected" || Boolean(value.rejection_reason), {
    message: "A rejection reason is required",
    path: ["rejection_reason"],
  });
export type RegistrationInput = z.input<typeof registrationSchema>;

export const playerDocumentSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  category: z.enum(PLAYER_DOCUMENT_CATEGORIES),
  file_url: z.string().trim().url("Enter a valid file URL"),
  file_type: optionalText,
  issued_on: optionalDate,
  expires_on: optionalDate,
  verification: z.enum(DOCUMENT_VERIFICATIONS),
});
export type PlayerDocumentInput = z.input<typeof playerDocumentSchema>;

import { z } from "zod";
import { ROLES } from "@/lib/rbac";

export const ORG_TYPES = [
  "platform",
  "federation",
  "association",
  "district_association",
  "academy",
  "football_school",
  "club",
  "competition_organizer",
  "partner",
] as const;

export type OrgType = (typeof ORG_TYPES)[number];

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  platform: "Platform Owner",
  federation: "National Federation",
  association: "Provincial Association",
  district_association: "District Association",
  academy: "Academy",
  football_school: "Football School (SSB)",
  club: "Club",
  competition_organizer: "Competition Organizer",
  partner: "Partner Organization",
};

export const ORG_STATUSES = ["active", "inactive", "suspended", "archived"] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];

export const ORG_STATUS_LABELS: Record<OrgStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  archived: "Archived",
};

export const orgSlugRegex = /^[a-z0-9-]+$/;

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Organisation name must be at least 2 characters").max(120, "Name cannot exceed 120 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug cannot exceed 64 characters")
    .regex(orgSlugRegex, "Lowercase letters, digits and hyphens only"),
  type: z.enum(ORG_TYPES, {
    errorMap: () => ({ message: "Select a valid organisation type" }),
  }),
  parentId: z.string().uuid("Invalid parent ID").nullable().optional(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  timezone: z.string().min(1).default("UTC"),
  language: z.string().min(1).default("en"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
  addressLine: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  region: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").max(512).nullable().optional(),
  coverUrl: z.string().url("Invalid cover URL").max(512).nullable().optional(),
});

export type UpdateOrganizationProfileInput = z.infer<typeof updateOrganizationProfileSchema>;

export const organizationSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string().trim().min(1).max(32)).max(20, "At most 20 tags"),
  socials: z.object({
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
    facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
  settings: z.object({
    allowPublicDirectory: z.boolean().default(true),
    requireMfaForAdmins: z.boolean().default(false),
    defaultMemberRole: z.enum(ROLES).default("player"),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#10b981"),
    notifications: z.object({
      memberInvites: z.boolean().default(true),
      roleChanges: z.boolean().default(true),
      weeklyDigest: z.boolean().default(true),
    }),
  }),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;

export const orgDocumentSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  category: z.enum(["general", "governance", "legal", "financial", "medical", "affiliate"]).default("general"),
  fileUrl: z.string().url("Valid file URL required"),
  fileType: z.string().max(50).optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

export type OrgDocumentInput = z.infer<typeof orgDocumentSchema>;

export const moveOrgSchema = z.object({
  newParentId: z.string().uuid().nullable(),
});

export const transferOwnershipSchema = z.object({
  newOwnerUserId: z.string().uuid("Invalid user ID"),
  confirmationName: z.string().trim().min(1, "Confirmation name required"),
});

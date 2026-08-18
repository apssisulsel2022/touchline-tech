import { z } from "zod";

export const registryIdentityStatusEnum = ["draft", "active", "review", "suspended", "archived"] as const;
export const registryDefinitionEnum = ["player", "coach", "club", "academy", "official"] as const;
export const verificationLevelEnum = ["unverified", "pending", "verified", "restricted"] as const;
export const registryScopeEnum = ["global", "regional", "local"] as const;

export const createRegistryIdentitySchema = z.object({
  displayName: z.string().trim().min(2, "Display name is required"),
  registryDefinition: z.enum(registryDefinitionEnum, {
    errorMap: () => ({ message: "Select a registry definition" }),
  }),
  verificationLevel: z.enum(verificationLevelEnum, {
    errorMap: () => ({ message: "Select a verification level" }),
  }),
  status: z.enum(registryIdentityStatusEnum, {
    errorMap: () => ({ message: "Select a status" }),
  }),
  scope: z.enum(registryScopeEnum, {
    errorMap: () => ({ message: "Select a scope" }),
  }),
  countryCode: z.string().trim().length(2, "Country code must be 2 letters").optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateRegistryIdentityInput = z.infer<typeof createRegistryIdentitySchema>;

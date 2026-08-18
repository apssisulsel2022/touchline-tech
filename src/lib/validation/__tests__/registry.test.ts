import { describe, expect, it } from "vitest";

import { createRegistryIdentitySchema } from "../registry";

describe("createRegistryIdentitySchema", () => {
  it("accepts a valid registry identity payload", () => {
    const result = createRegistryIdentitySchema.safeParse({
      displayName: "Amina Yusuf",
      registryDefinition: "player",
      verificationLevel: "verified",
      status: "active",
      scope: "global",
      countryCode: "NG",
      notes: "Ready for review",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty display name", () => {
    const result = createRegistryIdentitySchema.safeParse({
      displayName: "   ",
      registryDefinition: "player",
      verificationLevel: "verified",
      status: "active",
      scope: "global",
      countryCode: "NG",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.displayName).toContain("Display name is required");
    }
  });
});

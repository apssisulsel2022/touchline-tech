import { describe, expect, it } from "vitest";

import { sanitizeAuditMetadata } from "@/lib/audit";
import { assertTenantScope } from "@/lib/tenant";
import { playerSchema, registrationSchema } from "@/lib/validation/players";

describe("assertTenantScope", () => {
  it("rejects non-UUID tenant identifiers", () => {
    expect(() => assertTenantScope("not-a-tenant-id")).toThrow("Invalid organization identifier");
  });

  it("accepts a valid UUID and returns it unchanged", () => {
    const tenantId = "11111111-1111-1111-1111-111111111111";
    expect(assertTenantScope(tenantId)).toBe(tenantId);
  });
});

describe("player validation schemas", () => {
  it("rejects future birth dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = playerSchema.safeParse({
      first_name: "Ada",
      last_name: "Lovelace",
      date_of_birth: tomorrow.toISOString().slice(0, 10),
      gender: "female",
      preferred_foot: "right",
      primary_position: "midfielder",
      status: "draft",
    });

    expect(result.success).toBe(false);
  });

  it("requires a rejection reason when a registration is rejected", () => {
    const result = registrationSchema.safeParse({
      season_id: "11111111-1111-1111-1111-111111111111",
      status: "rejected",
      registered_on: "2026-07-31",
      rejection_reason: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("sanitizeAuditMetadata", () => {
  it("removes sensitive values before logging", () => {
    const sanitized = sanitizeAuditMetadata({
      note: "created",
      password: "secret",
      token: "abc",
      nested: { authorization: "Bearer x", ok: true },
    });

    expect(sanitized).toEqual({
      note: "created",
      nested: { ok: true },
    });
  });
});

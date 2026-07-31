export function assertTenantScope(orgId: string | null | undefined): string {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("Organization identifier is required");
  }

  const trimmed = orgId.trim();
  if (
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      trimmed,
    )
  ) {
    throw new Error("Invalid organization identifier");
  }

  return trimmed;
}

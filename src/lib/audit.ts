import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.password_reset_requested"
  | "auth.password_changed"
  | "auth.magic_link_requested"
  | "auth.email_verified"
  | "profile.updated"
  | "org.switched"
  | "org.created"
  | "org.updated"
  | "org.archived"
  | "org.restored"
  | "org.deleted"
  | "org.moved"
  | "org.settings_updated"
  | "org.ownership_transferred"
  | "org.document_added"
  | "org.document_removed"
  | "member.added"
  | "member.role_changed"
  | "member.removed"
  | "invitation.sent"
  | "invitation.accepted"
  | "invitation.rejected"
  | "invitation.revoked";


/**
 * Fire-and-forget audit log write. Failures are swallowed so audit issues never
 * block the user flow — the write is best-effort from the client and mirrored
 * server-side in future modules.
 */
export async function audit(
  action: AuditAction,
  input: {
    orgId?: string | null;
    entity?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  } = {},
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase.from("audit_logs").insert({
      actor_user_id: userData.user.id,
      org_id: input.orgId ?? null,
      action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch {
    /* audit is best-effort */
  }
}

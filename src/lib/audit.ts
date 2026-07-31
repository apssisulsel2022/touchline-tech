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
  | "invitation.revoked"
  // Academy / Football School (SSB) module
  | "academy.profile_updated"
  | "academy.season_created"
  | "academy.season_updated"
  | "academy.season_deleted"
  | "academy.age_category_created"
  | "academy.age_category_updated"
  | "academy.age_category_deleted"
  | "academy.team_created"
  | "academy.team_updated"
  | "academy.team_archived"
  | "academy.team_restored"
  | "academy.team_deleted"
  | "academy.coach_created"
  | "academy.coach_updated"
  | "academy.coach_deleted"
  | "academy.coach_assigned"
  | "academy.facility_created"
  | "academy.facility_updated"
  | "academy.facility_deleted"
  | "academy.training_created"
  | "academy.training_updated"
  | "academy.training_deleted"
  | "academy.event_created"
  | "academy.event_updated"
  | "academy.event_deleted"
  | "academy.album_created"
  | "academy.album_deleted"
  | "academy.media_added"
  | "academy.media_removed"
  // Player registry domain
  | "player.created"
  | "player.updated"
  | "player.status_changed"
  | "player.archived"
  | "player.guardian_added"
  | "player.guardian_updated"
  | "player.guardian_removed"
  | "player.registration_created"
  | "player.registration_updated"
  | "player.registration_status_changed"
  | "player.registration_deleted"
  | "player.document_added"
  | "player.document_verified"
  | "player.document_removed";


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

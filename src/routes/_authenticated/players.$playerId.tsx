import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Archive,
  ClipboardList,
  FileText,
  History,
  Pencil,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { SectionState, ReadOnlyNotice } from "@/components/common/section-state";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  DocumentVerificationBadge,
  PlayerStatusBadge,
  RegistrationStatusBadge,
} from "@/components/players/player-badges";
import { PlayerFormDialog } from "@/components/players/player-form-dialog";
import { PlayerGuardiansCard } from "@/components/players/player-guardians-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { audit } from "@/lib/audit";
import {
  formatDate,
  formatDateTime,
  isDocumentExpiring,
  playerAge,
  playerDocumentsQuery,
  playerFullName,
  playerInitials,
  playerKeys,
  playerQuery,
  playerTimelineQuery,
  registrationsQuery,
  softDeletePlayer,
} from "@/lib/players";
import {
  PLAYER_DOCUMENT_CATEGORY_LABELS,
  PLAYER_GENDER_LABELS,
  PLAYER_POSITION_LABELS,
  PLAYER_STATUS_LABELS,
  PREFERRED_FOOT_LABELS,
  isMinor,
  type PlayerDocumentCategory,
} from "@/lib/validation/players";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/players/$playerId")({
  head: () => ({
    meta: [
      { title: "Player Profile — Touchline" },
      {
        name: "description",
        content:
          "Full registry profile: identity, guardians, registrations, documents and lifecycle history.",
      },
      { property: "og:title", content: "Player Profile — Touchline" },
      {
        property: "og:description",
        content: "Identity, guardians, registrations, documents and lifecycle history.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlayerProfilePage,
  errorComponent: ({ error }) => (
    <div className="p-6" role="alert">
      {error instanceof Error ? error.message : "This player profile failed to load."}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-6">
      <EmptyState
        icon={Users}
        title="Player not found"
        description="This player does not exist in the current organisation."
      />
    </div>
  ),
});

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function PlayerProfilePage() {
  const { playerId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, hasPermission } = useAuth();
  const orgId = session?.organizationId ?? null;
  const canManage = hasPermission("org:manage");
  const { confirm, dialog } = useConfirmDialog();
  const [editOpen, setEditOpen] = React.useState(false);

  const player = useQuery({
    ...playerQuery(orgId ?? "", playerId),
    enabled: Boolean(orgId),
  });
  const registrations = useQuery({
    ...registrationsQuery(orgId ?? "", playerId),
    enabled: Boolean(orgId),
  });
  const documents = useQuery({
    ...playerDocumentsQuery(orgId ?? "", playerId),
    enabled: Boolean(orgId),
  });
  const timeline = useQuery({
    ...playerTimelineQuery(orgId ?? "", playerId),
    enabled: Boolean(orgId),
  });

  const archive = useMutation({
    mutationFn: async () => {
      await softDeletePlayer(orgId!, playerId, session?.userId ?? null);
      await audit("player.archived", {
        orgId,
        entity: "players",
        entityId: playerId,
      });
    },
    onSuccess: async () => {
      toast.success("Player archived");
      await queryClient.invalidateQueries({ queryKey: playerKeys.all(orgId!) });
      void navigate({ to: "/players" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not archive this player"),
  });

  if (!orgId) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <EmptyState
          icon={Users}
          title="Select an organisation"
          description="Player profiles are scoped to a single organisation."
        />
      </main>
    );
  }

  if (player.isPending) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6" aria-busy="true">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    );
  }

  if (player.error || !player.data) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <EmptyState
          icon={Users}
          title="Player not found"
          description="This player does not exist in the current organisation, or you don't have access to it."
          action={
            <Button asChild variant="outline">
              <Link to="/players">Back to registry</Link>
            </Button>
          }
        />
      </main>
    );
  }

  const row = player.data;
  const minor = isMinor(row.date_of_birth);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2">
        <Link to="/players">
          <ArrowLeft className="size-4" aria-hidden />
          Back to registry
        </Link>
      </Button>

      <PageHeader
        title={playerFullName(row)}
        description={`Registry ${row.registry_no} · ${playerAge(row)} years old${minor ? " · Minor" : ""}`}
        actions={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-destructive"
                disabled={archive.isPending}
                onClick={async () => {
                  const ok = await confirm({
                    title: "Archive this player?",
                    description:
                      "The record is soft-deleted: history and documents are retained, but the player leaves the active registry.",
                    confirmLabel: "Archive player",
                    destructive: true,
                  });
                  if (ok) archive.mutate();
                }}
              >
                <Archive className="size-4" aria-hidden />
                Archive
              </Button>
            </div>
          ) : null
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Avatar className="size-16">
            {row.photo_url ? <AvatarImage src={row.photo_url} alt="" /> : null}
            <AvatarFallback className="text-lg">{playerInitials(row)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{playerFullName(row)}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <PlayerStatusBadge status={row.status} />
              <span>{PLAYER_POSITION_LABELS[row.primary_position]}</span>
              <span aria-hidden>·</span>
              <span>{PREFERRED_FOOT_LABELS[row.preferred_foot]} footed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReadOnlyNotice canManage={canManage} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Registry number" value={row.registry_no} />
                <Detail label="Date of birth" value={formatDate(row.date_of_birth)} />
                <Detail label="Gender" value={PLAYER_GENDER_LABELS[row.gender]} />
                <Detail label="Nationality" value={row.nationality} />
                <Detail label="National ID" value={row.national_id} />
                <Detail label="Status" value={PLAYER_STATUS_LABELS[row.status]} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Football profile</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail
                  label="Primary position"
                  value={PLAYER_POSITION_LABELS[row.primary_position]}
                />
                <Detail
                  label="Secondary position"
                  value={
                    row.secondary_position
                      ? PLAYER_POSITION_LABELS[row.secondary_position]
                      : null
                  }
                />
                <Detail label="Preferred foot" value={PREFERRED_FOOT_LABELS[row.preferred_foot]} />
                <Detail label="Height" value={row.height_cm ? `${row.height_cm} cm` : null} />
                <Detail label="Weight" value={row.weight_kg ? `${row.weight_kg} kg` : null} />
                <Detail label="School" value={row.school_name} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Email" value={row.email} />
                <Detail label="Phone" value={row.phone} />
                <Detail label="Address" value={row.address_line} />
                <Detail label="City" value={row.city} />
                <Detail label="Notes" value={row.notes} />
                <Detail label="Last updated" value={formatDateTime(row.updated_at)} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardians" className="mt-6">
          <PlayerGuardiansCard
            orgId={orgId}
            playerId={playerId}
            canManage={canManage}
            requiresGuardian={minor}
          />
        </TabsContent>

        <TabsContent value="registrations" className="mt-6">
          <SectionState
            isLoading={registrations.isPending}
            error={registrations.error}
            isEmpty={(registrations.data ?? []).length === 0}
            emptyIcon={ClipboardList}
            emptyTitle="No registrations"
            emptyDescription="This player has not been registered to a season or squad yet."
            onRetry={() => void registrations.refetch()}
          >
            <div className="space-y-3">
              {(registrations.data ?? []).map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Registered {formatDate(registration.registered_on)}
                        {registration.jersey_number ? ` · #${registration.jersey_number}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {registration.expires_on
                          ? `Expires ${formatDate(registration.expires_on)}`
                          : "No expiry recorded"}
                        {registration.notes ? ` · ${registration.notes}` : ""}
                      </p>
                    </div>
                    <RegistrationStatusBadge status={registration.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionState>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <SectionState
            isLoading={documents.isPending}
            error={documents.error}
            isEmpty={(documents.data ?? []).length === 0}
            emptyIcon={FileText}
            emptyTitle="No documents"
            emptyDescription="Identity, medical and consent documents will appear here once uploaded."
            onRetry={() => void documents.refetch()}
          >
            <div className="space-y-3">
              {(documents.data ?? []).map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                    <div className="space-y-1">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm font-medium hover:underline"
                      >
                        {doc.title}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {PLAYER_DOCUMENT_CATEGORY_LABELS[
                          doc.category as PlayerDocumentCategory
                        ] ?? doc.category}
                        {doc.expires_on ? ` · Expires ${formatDate(doc.expires_on)}` : ""}
                        {isDocumentExpiring(doc.expires_on) ? " · Needs attention" : ""}
                      </p>
                    </div>
                    <DocumentVerificationBadge verification={doc.verification} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionState>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <SectionState
            isLoading={timeline.isPending}
            error={timeline.error}
            isEmpty={(timeline.data ?? []).length === 0}
            emptyIcon={History}
            emptyTitle="No lifecycle history"
            emptyDescription="Status changes are recorded here automatically."
            onRetry={() => void timeline.refetch()}
          >
            <Card>
              <CardContent className="pt-6">
                <ol className="space-y-4">
                  {(timeline.data ?? []).map((event) => (
                    <li key={event.id} className="border-l-2 border-border pl-4">
                      <p className="text-sm font-medium">
                        {event.from_status
                          ? `${PLAYER_STATUS_LABELS[event.from_status]} → ${PLAYER_STATUS_LABELS[event.to_status]}`
                          : PLAYER_STATUS_LABELS[event.to_status]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(event.created_at)}
                        {event.reason ? ` · ${event.reason}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </SectionState>
        </TabsContent>
      </Tabs>

      {canManage ? (
        <PlayerFormDialog
          orgId={orgId}
          player={row}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      {dialog}
    </main>
  );
}

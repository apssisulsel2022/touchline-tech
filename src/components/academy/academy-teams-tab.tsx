import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Loader2, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyNotice, SectionState, useAcademyCrud } from "@/components/academy/academy-section";
import { audit } from "@/lib/audit";
import {
  ageCategoriesQuery,
  coachesQuery,
  seasonsQuery,
  teamsQuery,
  type TeamRow,
} from "@/lib/academy";
import {
  TEAM_STATUS_LABELS,
  TEAM_STATUSES,
  teamSchema,
  type TeamInput,
  type TeamStatus,
} from "@/lib/validation/academy";

const NONE = "none";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Squad management: create, edit and archive teams per season and age group. */
export function AcademyTeamsTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const teams = useQuery(teamsQuery(orgId));
  const seasons = useQuery(seasonsQuery(orgId));
  const categories = useQuery(ageCategoriesQuery(orgId));
  const coaches = useQuery(coachesQuery(orgId));

  const crud = useAcademyCrud({
    orgId,
    table: "teams",
    section: "teams",
    entity: "Team",
    actions: {
      create: "academy.team_created",
      update: "academy.team_updated",
      remove: "academy.team_deleted",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamRow | null>(null);
  const [seasonFilter, setSeasonFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("active");

  const form = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", max_squad_size: 22, status: "active" },
  });

  const openDialog = (row?: TeamRow) => {
    setEditing(row ?? null);
    form.reset(
      row
        ? ({
            name: row.name,
            short_name: row.short_name ?? "",
            photo_url: row.photo_url ?? "",
            season_id: row.season_id ?? NONE,
            age_category_id: row.age_category_id ?? NONE,
            head_coach_id: row.head_coach_id ?? NONE,
            assistant_coach_id: row.assistant_coach_id ?? NONE,
            manager_id: row.manager_id ?? NONE,
            max_squad_size: row.max_squad_size,
            status: row.status as TeamStatus,
            description: row.description ?? "",
          } as TeamInput)
        : ({
            name: "",
            short_name: "",
            photo_url: "",
            season_id: NONE,
            age_category_id: NONE,
            head_coach_id: NONE,
            assistant_coach_id: NONE,
            manager_id: NONE,
            max_squad_size: 22,
            status: "active",
            description: "",
          } as TeamInput),
    );
    setOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      season_id: values.season_id ?? null,
      age_category_id: values.age_category_id ?? null,
      head_coach_id: values.head_coach_id ?? null,
      assistant_coach_id: values.assistant_coach_id ?? null,
      manager_id: values.manager_id ?? null,
    };
    if (editing) {
      await crud.update.mutateAsync({ id: editing.id, values: payload });
      if (payload.head_coach_id && payload.head_coach_id !== editing.head_coach_id) {
        void audit("academy.coach_assigned", {
          orgId,
          entity: "team",
          entityId: editing.id,
          metadata: { coachId: payload.head_coach_id, role: "head_coach" },
        });
      }
    } else {
      await crud.create.mutateAsync(payload);
    }
    setOpen(false);
  });

  const toggleArchive = async (team: TeamRow) => {
    const archiving = team.status !== "archived";
    await crud.update.mutateAsync({
      id: team.id,
      values: {
        status: archiving ? "archived" : "active",
        archived_at: archiving ? new Date().toISOString() : null,
      },
    });
    void audit(archiving ? "academy.team_archived" : "academy.team_restored", {
      orgId,
      entity: "team",
      entityId: team.id,
      metadata: { name: team.name },
    });
  };

  const rows = React.useMemo(() => {
    return (teams.data ?? []).filter((team) => {
      if (seasonFilter !== "all" && team.season_id !== seasonFilter) return false;
      if (statusFilter !== "all" && team.status !== statusFilter) return false;
      return true;
    });
  }, [teams.data, seasonFilter, statusFilter]);

  const coachName = (id: string | null) =>
    coaches.data?.find((c) => c.id === id)?.full_name ?? "Unassigned";
  const categoryLabel = (id: string | null) =>
    categories.data?.find((c) => c.id === id)?.code ?? "No age group";
  const seasonLabel = (id: string | null) =>
    seasons.data?.find((s) => s.id === id)?.name ?? "No season";

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label htmlFor="team-season-filter" className="text-xs">
              Season
            </Label>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger id="team-season-filter" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All seasons</SelectItem>
                {(seasons.data ?? []).map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="team-status-filter" className="text-xs">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="team-status-filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {TEAM_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {TEAM_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 size-4" aria-hidden />
            New team
          </Button>
        )}
      </div>

      <SectionState
        isLoading={teams.isLoading}
        error={teams.error}
        isEmpty={rows.length === 0}
        emptyIcon={Users}
        emptyTitle="No teams match these filters"
        emptyDescription="Create a team, assign it to a season and age category, then attach coaching staff."
        emptyAction={canManage ? <Button onClick={() => openDialog()}>Create team</Button> : undefined}
        onRetry={() => void teams.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((team) => (
            <Card key={team.id} className="flex flex-col">
              {team.photo_url && (
                <img
                  src={team.photo_url}
                  alt={`${team.name} squad photo`}
                  loading="lazy"
                  className="h-32 w-full rounded-t-xl object-cover"
                />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{team.name}</CardTitle>
                    <CardDescription>
                      {categoryLabel(team.age_category_id)} · {seasonLabel(team.season_id)}
                    </CardDescription>
                  </div>
                  <Badge variant={team.status === "active" ? "default" : "outline"}>
                    {TEAM_STATUS_LABELS[team.status as TeamStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="size-4" aria-hidden />
                  {coachName(team.head_coach_id)}
                </p>
                <p className="text-muted-foreground">
                  Assistant: {coachName(team.assistant_coach_id)} · Manager: {coachName(team.manager_id)}
                </p>
                <p className="text-muted-foreground">Max squad size: {team.max_squad_size}</p>
                {canManage && (
                  <div className="mt-auto flex justify-end gap-1 pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${team.name}`}
                      onClick={() => openDialog(team)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={
                        team.status === "archived" ? `Restore ${team.name}` : `Archive ${team.name}`
                      }
                      onClick={() => void toggleArchive(team)}
                    >
                      {team.status === "archived" ? (
                        <ArchiveRestore className="size-4" aria-hidden />
                      ) : (
                        <Archive className="size-4" aria-hidden />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${team.name}`}
                      onClick={() => crud.remove.mutate(team.id)}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit team" : "New team"}</DialogTitle>
            <DialogDescription>
              Teams belong to a season and an age category; coaching staff are drawn from the academy coach
              register.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input id="team-name" {...form.register("name")} />
              <ErrorText message={form.formState.errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_name">Short name</Label>
              <Input id="short_name" {...form.register("short_name")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="photo_url">Team photo URL</Label>
              <Input id="photo_url" placeholder="https://…" {...form.register("photo_url")} />
              <ErrorText message={form.formState.errors.photo_url?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-season">Season</Label>
              <Select
                value={form.watch("season_id") ?? NONE}
                onValueChange={(value) => form.setValue("season_id", value)}
              >
                <SelectTrigger id="team-season">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No season</SelectItem>
                  {(seasons.data ?? []).map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-category">Age category</Label>
              <Select
                value={form.watch("age_category_id") ?? NONE}
                onValueChange={(value) => form.setValue("age_category_id", value)}
              >
                <SelectTrigger id="team-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No age group</SelectItem>
                  {(categories.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.code} — {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(
              [
                ["head_coach_id", "Head coach"],
                ["assistant_coach_id", "Assistant coach"],
                ["manager_id", "Team manager"],
              ] as const
            ).map(([field, label]) => (
              <div className="space-y-2" key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Select
                  value={form.watch(field) ?? NONE}
                  onValueChange={(value) => form.setValue(field, value)}
                >
                  <SelectTrigger id={field}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Unassigned</SelectItem>
                    {(coaches.data ?? []).map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.full_name} — {coach.role_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field === "assistant_coach_id" && (
                  <ErrorText message={form.formState.errors.assistant_coach_id?.message} />
                )}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="max_squad_size">Maximum squad size</Label>
              <Input id="max_squad_size" type="number" min={1} max={60} {...form.register("max_squad_size")} />
              <ErrorText message={form.formState.errors.max_squad_size?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as TeamStatus)}
              >
                <SelectTrigger id="team-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {TEAM_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea id="team-description" rows={3} {...form.register("description")} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={crud.create.isPending || crud.update.isPending}>
                {(crud.create.isPending || crud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editing ? "Save team" : "Create team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

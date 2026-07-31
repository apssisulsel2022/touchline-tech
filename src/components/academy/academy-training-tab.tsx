import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CloudSun, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { ReadOnlyNotice, SectionState, useAcademyCrud } from "@/components/academy/academy-section";
import {
  coachesQuery,
  facilitiesQuery,
  formatTime,
  minutesBetween,
  seasonsQuery,
  teamsQuery,
  trainingSessionsQuery,
  type TrainingSessionRow,
} from "@/lib/academy";
import {
  trainingSessionSchema,
  WEEKDAYS,
  type TrainingSessionInput,
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

/** Weekly training schedule with grounds, objectives and capacity. */
export function AcademyTrainingTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const sessions = useQuery(trainingSessionsQuery(orgId));
  const teams = useQuery(teamsQuery(orgId));
  const facilities = useQuery(facilitiesQuery(orgId));
  const coaches = useQuery(coachesQuery(orgId));
  const seasons = useQuery(seasonsQuery(orgId));

  const crud = useAcademyCrud({
    orgId,
    table: "training_sessions",
    section: "training",
    entity: "Training session",
    actions: {
      create: "academy.training_created",
      update: "academy.training_updated",
      remove: "academy.training_deleted",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TrainingSessionRow | null>(null);
  const [objectiveInput, setObjectiveInput] = React.useState("");

  const form = useForm<TrainingSessionInput>({
    resolver: zodResolver(trainingSessionSchema),
    defaultValues: {
      title: "",
      weekday: 1,
      starts_at: "17:00",
      ends_at: "18:30",
      objectives: [],
      is_active: true,
    },
  });

  const openDialog = (row?: TrainingSessionRow) => {
    setEditing(row ?? null);
    setObjectiveInput("");
    form.reset(
      row
        ? ({
            title: row.title,
            team_id: row.team_id ?? NONE,
            facility_id: row.facility_id ?? NONE,
            coach_id: row.coach_id ?? NONE,
            season_id: row.season_id ?? NONE,
            weekday: row.weekday,
            starts_at: formatTime(row.starts_at),
            ends_at: formatTime(row.ends_at),
            capacity: row.capacity ?? undefined,
            objectives: row.objectives ?? [],
            intensity: row.intensity ?? "",
            is_active: row.is_active,
          } as TrainingSessionInput)
        : ({
            title: "",
            team_id: NONE,
            facility_id: NONE,
            coach_id: NONE,
            season_id: NONE,
            weekday: 1,
            starts_at: "17:00",
            ends_at: "18:30",
            objectives: [],
            intensity: "",
            is_active: true,
          } as TrainingSessionInput),
    );
    setOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      team_id: values.team_id ?? null,
      facility_id: values.facility_id ?? null,
      coach_id: values.coach_id ?? null,
      season_id: values.season_id ?? null,
    };
    if (editing) await crud.update.mutateAsync({ id: editing.id, values: payload });
    else await crud.create.mutateAsync(payload);
    setOpen(false);
  });

  const byDay = React.useMemo(() => {
    const map = new Map<number, TrainingSessionRow[]>();
    for (const session of sessions.data ?? []) {
      map.set(session.weekday, [...(map.get(session.weekday) ?? []), session]);
    }
    for (const list of map.values()) list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return map;
  }, [sessions.data]);

  const teamName = (id: string | null) => teams.data?.find((t) => t.id === id)?.name ?? "All squads";
  const facilityName = (id: string | null) =>
    facilities.data?.find((f) => f.id === id)?.name ?? "Venue TBC";
  const coachName = (id: string | null) =>
    coaches.data?.find((c) => c.id === id)?.full_name ?? "Unassigned";

  const addObjective = () => {
    const value = objectiveInput.trim();
    if (!value) return;
    const current = form.getValues("objectives") ?? [];
    form.setValue("objectives", [...current, value]);
    setObjectiveInput("");
  };

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Weekly training schedule</h2>
          <p className="text-sm text-muted-foreground">
            Recurring sessions per squad. Attendance and weather integrations arrive with the Player and
            Match modules.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 size-4" aria-hidden />
            New session
          </Button>
        )}
      </div>

      <SectionState
        isLoading={sessions.isLoading}
        error={sessions.error}
        isEmpty={(sessions.data ?? []).length === 0}
        emptyIcon={CalendarClock}
        emptyTitle="No training sessions scheduled"
        emptyDescription="Build the weekly grid by adding sessions for each squad, ground and time slot."
        emptyAction={canManage ? <Button onClick={() => openDialog()}>Add session</Button> : undefined}
        onRetry={() => void sessions.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {WEEKDAYS.map((day, index) => {
            const list = byDay.get(index) ?? [];
            return (
              <Card key={day} className={list.length ? "" : "opacity-70"}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide">{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {list.length === 0 && <p className="text-xs text-muted-foreground">Rest day</p>}
                  {list.map((session) => (
                    <div key={session.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{session.title}</p>
                        {!session.is_active && <Badge variant="outline">Paused</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(session.starts_at)}–{formatTime(session.ends_at)} (
                        {minutesBetween(session.starts_at, session.ends_at)} min)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {teamName(session.team_id)} · {facilityName(session.facility_id)}
                      </p>
                      <p className="text-xs text-muted-foreground">Coach: {coachName(session.coach_id)}</p>
                      {(session.objectives ?? []).length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1">
                          {session.objectives.map((objective) => (
                            <li key={objective}>
                              <Badge variant="secondary" className="text-[10px]">
                                {objective}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Users className="size-3" aria-hidden />
                        Capacity {session.capacity ?? "—"}
                        <CloudSun className="size-3" aria-hidden />
                        Weather: pending
                      </p>
                      {canManage && (
                        <div className="mt-2 flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${session.title}`}
                            onClick={() => openDialog(session)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${session.title}`}
                            onClick={() => crud.remove.mutate(session.id)}
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit training session" : "New training session"}</DialogTitle>
            <DialogDescription>
              Sessions repeat weekly on the selected day for the duration of the season.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="session-title">Title</Label>
              <Input id="session-title" placeholder="U-13 technical session" {...form.register("title")} />
              <ErrorText message={form.formState.errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-team">Squad</Label>
              <Select
                value={form.watch("team_id") ?? NONE}
                onValueChange={(value) => form.setValue("team_id", value)}
              >
                <SelectTrigger id="session-team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>All squads</SelectItem>
                  {(teams.data ?? []).map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-facility">Training ground / field</Label>
              <Select
                value={form.watch("facility_id") ?? NONE}
                onValueChange={(value) => form.setValue("facility_id", value)}
              >
                <SelectTrigger id="session-facility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Venue TBC</SelectItem>
                  {(facilities.data ?? []).map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-coach">Lead coach</Label>
              <Select
                value={form.watch("coach_id") ?? NONE}
                onValueChange={(value) => form.setValue("coach_id", value)}
              >
                <SelectTrigger id="session-coach">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {(coaches.data ?? []).map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-season">Season</Label>
              <Select
                value={form.watch("season_id") ?? NONE}
                onValueChange={(value) => form.setValue("season_id", value)}
              >
                <SelectTrigger id="session-season">
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
              <Label htmlFor="session-weekday">Day of week</Label>
              <Select
                value={String(form.watch("weekday"))}
                onValueChange={(value) => form.setValue("weekday", Number(value))}
              >
                <SelectTrigger id="session-weekday">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day, index) => (
                    <SelectItem key={day} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-capacity">Capacity</Label>
              <Input id="session-capacity" type="number" min={0} {...form.register("capacity")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input id="starts_at" type="time" {...form.register("starts_at")} />
              <ErrorText message={form.formState.errors.starts_at?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input id="ends_at" type="time" {...form.register("ends_at")} />
              <ErrorText message={form.formState.errors.ends_at?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Input id="intensity" placeholder="Moderate" {...form.register("intensity")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="objective">Training objectives</Label>
              <div className="flex gap-2">
                <Input
                  id="objective"
                  value={objectiveInput}
                  placeholder="Pressing triggers"
                  onChange={(event) => setObjectiveInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addObjective}>
                  Add
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {(form.watch("objectives") ?? []).map((objective) => (
                  <li key={objective}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        form.setValue(
                          "objectives",
                          (form.getValues("objectives") ?? []).filter((o) => o !== objective),
                        )
                      }
                    >
                      {objective} ✕
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="session-active">Session is active</Label>
              <Switch
                id="session-active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) => form.setValue("is_active", checked)}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={crud.create.isPending || crud.update.isPending}>
                {(crud.create.isPending || crud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editing ? "Save session" : "Create session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

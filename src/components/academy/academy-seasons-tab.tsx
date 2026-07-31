import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarRange, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyNotice, SectionState, useAcademyCrud } from "@/components/academy/academy-section";
import {
  academyEventsQuery,
  formatDate,
  seasonsQuery,
  type AcademyEventRow,
  type SeasonRow,
} from "@/lib/academy";
import {
  ACADEMY_EVENT_TYPES,
  ACADEMY_EVENT_TYPE_LABELS,
  academyEventSchema,
  SEASON_STATUS_LABELS,
  SEASON_STATUSES,
  seasonSchema,
  type AcademyEventInput,
  type AcademyEventType,
  type SeasonInput,
  type SeasonStatus,
} from "@/lib/validation/academy";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Seasons (academic year + registration window) and the academy calendar. */
export function AcademySeasonsTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const seasons = useQuery(seasonsQuery(orgId));
  const events = useQuery(academyEventsQuery(orgId));

  const seasonCrud = useAcademyCrud({
    orgId,
    table: "seasons",
    section: "seasons",
    entity: "Season",
    actions: {
      create: "academy.season_created",
      update: "academy.season_updated",
      remove: "academy.season_deleted",
    },
  });
  const eventCrud = useAcademyCrud({
    orgId,
    table: "academy_events",
    section: "events",
    entity: "Calendar event",
    actions: {
      create: "academy.event_created",
      update: "academy.event_updated",
      remove: "academy.event_deleted",
    },
  });

  const [seasonOpen, setSeasonOpen] = React.useState(false);
  const [editingSeason, setEditingSeason] = React.useState<SeasonRow | null>(null);
  const [eventOpen, setEventOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<AcademyEventRow | null>(null);

  const seasonForm = useForm<SeasonInput>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { name: "", starts_on: "", ends_on: "", status: "upcoming", is_current: false },
  });
  const eventForm = useForm<AcademyEventInput>({
    resolver: zodResolver(academyEventSchema),
    defaultValues: { title: "", type: "holiday", starts_on: "", ends_on: "" },
  });

  const openSeason = (row?: SeasonRow) => {
    setEditingSeason(row ?? null);
    seasonForm.reset(
      row
        ? ({
            name: row.name,
            academic_year: row.academic_year ?? "",
            starts_on: row.starts_on,
            ends_on: row.ends_on,
            registration_opens_on: row.registration_opens_on ?? "",
            registration_closes_on: row.registration_closes_on ?? "",
            status: row.status as SeasonStatus,
            is_current: row.is_current,
            notes: row.notes ?? "",
          } as SeasonInput)
        : ({
            name: "",
            academic_year: "",
            starts_on: "",
            ends_on: "",
            registration_opens_on: "",
            registration_closes_on: "",
            status: "upcoming",
            is_current: false,
            notes: "",
          } as SeasonInput),
    );
    setSeasonOpen(true);
  };

  const openEvent = (row?: AcademyEventRow) => {
    setEditingEvent(row ?? null);
    eventForm.reset(
      row
        ? ({
            title: row.title,
            type: row.type as AcademyEventType,
            season_id: row.season_id ?? "none",
            starts_on: row.starts_on,
            ends_on: row.ends_on,
            description: row.description ?? "",
          } as AcademyEventInput)
        : ({
            title: "",
            type: "holiday",
            season_id: "none",
            starts_on: "",
            ends_on: "",
            description: "",
          } as AcademyEventInput),
    );
    setEventOpen(true);
  };

  const submitSeason = seasonForm.handleSubmit(async (values) => {
    if (editingSeason) await seasonCrud.update.mutateAsync({ id: editingSeason.id, values });
    else await seasonCrud.create.mutateAsync(values);
    setSeasonOpen(false);
  });

  const submitEvent = eventForm.handleSubmit(async (values) => {
    const payload = { ...values, season_id: values.season_id ?? null };
    if (editingEvent) await eventCrud.update.mutateAsync({ id: editingEvent.id, values: payload });
    else await eventCrud.create.mutateAsync(payload);
    setEventOpen(false);
  });

  const seasonName = (id: string | null) =>
    seasons.data?.find((s) => s.id === id)?.name ?? "All seasons";

  return (
    <div className="space-y-8">
      <ReadOnlyNotice canManage={canManage} />

      <section className="space-y-4" aria-labelledby="seasons-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="seasons-heading" className="text-lg font-semibold">
              Seasons
            </h2>
            <p className="text-sm text-muted-foreground">
              Academic year, competition season dates and the player registration window.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => openSeason()}>
              <Plus className="mr-2 size-4" aria-hidden />
              New season
            </Button>
          )}
        </div>

        <SectionState
          isLoading={seasons.isLoading}
          error={seasons.error}
          isEmpty={(seasons.data ?? []).length === 0}
          emptyIcon={CalendarRange}
          emptyTitle="No seasons yet"
          emptyDescription="Create your first season to anchor teams, training schedules and registration windows."
          emptyAction={canManage ? <Button onClick={() => openSeason()}>Create season</Button> : undefined}
          onRetry={() => void seasons.refetch()}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(seasons.data ?? []).map((season) => (
              <Card key={season.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{season.name}</CardTitle>
                      <CardDescription>{season.academic_year ?? "No academic year set"}</CardDescription>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={season.status === "active" ? "default" : "outline"}>
                        {SEASON_STATUS_LABELS[season.status as SeasonStatus]}
                      </Badge>
                      {season.is_current && <Badge variant="secondary">Current</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {formatDate(season.starts_on)} → {formatDate(season.ends_on)}
                  </p>
                  <p className="text-muted-foreground">
                    Registration: {formatDate(season.registration_opens_on)} →{" "}
                    {formatDate(season.registration_closes_on)}
                  </p>
                  {canManage && (
                    <div className="flex justify-end gap-1 pt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${season.name}`}
                        onClick={() => openSeason(season)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${season.name}`}
                        onClick={() => seasonCrud.remove.mutate(season.id)}
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
      </section>

      <section className="space-y-4" aria-labelledby="calendar-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="calendar-heading" className="text-lg font-semibold">
              Academy calendar
            </h2>
            <p className="text-sm text-muted-foreground">
              Registration windows, holiday breaks, training blocks and academy events.
            </p>
          </div>
          {canManage && (
            <Button variant="outline" onClick={() => openEvent()}>
              <Plus className="mr-2 size-4" aria-hidden />
              Add calendar entry
            </Button>
          )}
        </div>

        <SectionState
          isLoading={events.isLoading}
          error={events.error}
          isEmpty={(events.data ?? []).length === 0}
          emptyIcon={CalendarDays}
          emptyTitle="Calendar is empty"
          emptyDescription="Add holidays, registration windows and training blocks so families know what is coming."
          onRetry={() => void events.refetch()}
        >
          <Card>
            <CardContent className="divide-y p-0">
              {(events.data ?? []).map((event) => (
                <div key={event.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.starts_on)} → {formatDate(event.ends_on)} ·{" "}
                      {seasonName(event.season_id)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {ACADEMY_EVENT_TYPE_LABELS[event.type as AcademyEventType]}
                  </Badge>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${event.title}`}
                        onClick={() => openEvent(event)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${event.title}`}
                        onClick={() => eventCrud.remove.mutate(event.id)}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </SectionState>
      </section>

      <Dialog open={seasonOpen} onOpenChange={setSeasonOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSeason ? "Edit season" : "New season"}</DialogTitle>
            <DialogDescription>
              Only one season can be marked as current — setting a new one clears the previous flag.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitSeason} noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="season-name">Season name</Label>
              <Input id="season-name" placeholder="2026/2027" {...seasonForm.register("name")} />
              <ErrorText message={seasonForm.formState.errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic year</Label>
              <Input id="academic_year" placeholder="2026/2027" {...seasonForm.register("academic_year")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season-status">Status</Label>
              <Select
                value={seasonForm.watch("status")}
                onValueChange={(value) => seasonForm.setValue("status", value as SeasonStatus)}
              >
                <SelectTrigger id="season-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASON_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {SEASON_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts_on">Starts on</Label>
              <Input id="starts_on" type="date" {...seasonForm.register("starts_on")} />
              <ErrorText message={seasonForm.formState.errors.starts_on?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_on">Ends on</Label>
              <Input id="ends_on" type="date" {...seasonForm.register("ends_on")} />
              <ErrorText message={seasonForm.formState.errors.ends_on?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_opens_on">Registration opens</Label>
              <Input
                id="registration_opens_on"
                type="date"
                {...seasonForm.register("registration_opens_on")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_closes_on">Registration closes</Label>
              <Input
                id="registration_closes_on"
                type="date"
                {...seasonForm.register("registration_closes_on")}
              />
              <ErrorText message={seasonForm.formState.errors.registration_closes_on?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="season-notes">Notes</Label>
              <Textarea id="season-notes" rows={2} {...seasonForm.register("notes")} />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="is_current">Mark as current season</Label>
              <Switch
                id="is_current"
                checked={seasonForm.watch("is_current")}
                onCheckedChange={(checked) => seasonForm.setValue("is_current", checked)}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setSeasonOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={seasonCrud.create.isPending || seasonCrud.update.isPending}>
                {(seasonCrud.create.isPending || seasonCrud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editingSeason ? "Save season" : "Create season"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit calendar entry" : "New calendar entry"}</DialogTitle>
            <DialogDescription>Holidays, registration windows and academy events.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitEvent} noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event-title">Title</Label>
              <Input id="event-title" {...eventForm.register("title")} />
              <ErrorText message={eventForm.formState.errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Type</Label>
              <Select
                value={eventForm.watch("type")}
                onValueChange={(value) => eventForm.setValue("type", value as AcademyEventType)}
              >
                <SelectTrigger id="event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMY_EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACADEMY_EVENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-season">Season</Label>
              <Select
                value={eventForm.watch("season_id") ?? "none"}
                onValueChange={(value) => eventForm.setValue("season_id", value)}
              >
                <SelectTrigger id="event-season">
                  <SelectValue placeholder="All seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All seasons</SelectItem>
                  {(seasons.data ?? []).map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-start">Starts on</Label>
              <Input id="event-start" type="date" {...eventForm.register("starts_on")} />
              <ErrorText message={eventForm.formState.errors.starts_on?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">Ends on</Label>
              <Input id="event-end" type="date" {...eventForm.register("ends_on")} />
              <ErrorText message={eventForm.formState.errors.ends_on?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea id="event-description" rows={2} {...eventForm.register("description")} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={eventCrud.create.isPending || eventCrud.update.isPending}>
                {(eventCrud.create.isPending || eventCrud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editingEvent ? "Save entry" : "Add entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

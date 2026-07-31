import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Loader2, Pencil, Plus, Trash2, ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  coachesQuery,
  formatDate,
  isExpired,
  isExpiringSoon,
  teamsQuery,
  type CoachRow,
} from "@/lib/academy";
import {
  COACH_STATUS_LABELS,
  COACH_STATUSES,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPES,
  coachSchema,
  WEEKDAYS,
  type CoachInput,
  type CoachStatus,
  type ContractType,
} from "@/lib/validation/academy";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Coach register: licences, certifications, contracts, availability and team load. */
export function AcademyCoachesTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const coaches = useQuery(coachesQuery(orgId));
  const teams = useQuery(teamsQuery(orgId));

  const crud = useAcademyCrud({
    orgId,
    table: "academy_coaches",
    section: "coaches",
    entity: "Coach",
    actions: {
      create: "academy.coach_created",
      update: "academy.coach_updated",
      remove: "academy.coach_deleted",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CoachRow | null>(null);
  const [certInput, setCertInput] = React.useState("");

  const form = useForm<CoachInput>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      full_name: "",
      role_title: "Head Coach",
      contract_type: "part_time",
      status: "active",
      certifications: [],
      availability: [],
    },
  });

  const openDialog = (row?: CoachRow) => {
    setEditing(row ?? null);
    setCertInput("");
    form.reset(
      row
        ? ({
            full_name: row.full_name,
            email: row.email ?? "",
            phone: row.phone ?? "",
            photo_url: row.photo_url ?? "",
            role_title: row.role_title,
            license_level: row.license_level ?? "",
            license_number: row.license_number ?? "",
            license_expiry: row.license_expiry ?? "",
            certifications: row.certifications ?? [],
            contract_type: row.contract_type as ContractType,
            contract_start: row.contract_start ?? "",
            contract_end: row.contract_end ?? "",
            status: row.status as CoachStatus,
            availability: ((row.availability as { days?: number[] } | null)?.days ?? []) as number[],
            notes: row.notes ?? "",
          } as CoachInput)
        : ({
            full_name: "",
            email: "",
            phone: "",
            photo_url: "",
            role_title: "Head Coach",
            license_level: "",
            license_number: "",
            license_expiry: "",
            certifications: [],
            contract_type: "part_time",
            contract_start: "",
            contract_end: "",
            status: "active",
            availability: [],
            notes: "",
          } as CoachInput),
    );
    setOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    const { availability, ...rest } = values;
    const payload = { ...rest, availability: { days: availability } };
    if (editing) await crud.update.mutateAsync({ id: editing.id, values: payload });
    else await crud.create.mutateAsync(payload);
    setOpen(false);
  });

  const teamsForCoach = (coachId: string) =>
    (teams.data ?? []).filter(
      (team) =>
        team.head_coach_id === coachId ||
        team.assistant_coach_id === coachId ||
        team.manager_id === coachId,
    );

  const addCertification = () => {
    const value = certInput.trim();
    if (!value) return;
    const current = form.getValues("certifications") ?? [];
    if (current.includes(value)) return;
    form.setValue("certifications", [...current, value]);
    setCertInput("");
  };

  const availability = form.watch("availability") ?? [];

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Coaching staff</h2>
          <p className="text-sm text-muted-foreground">
            Licences and contracts expiring within 60 days are highlighted automatically.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 size-4" aria-hidden />
            Add coach
          </Button>
        )}
      </div>

      <SectionState
        isLoading={coaches.isLoading}
        error={coaches.error}
        isEmpty={(coaches.data ?? []).length === 0}
        emptyIcon={ClipboardCheck}
        emptyTitle="No coaches registered"
        emptyDescription="Add coaching staff with their licence details so they can be assigned to teams and sessions."
        emptyAction={canManage ? <Button onClick={() => openDialog()}>Add coach</Button> : undefined}
        onRetry={() => void coaches.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(coaches.data ?? []).map((coach) => {
            const expired = isExpired(coach.license_expiry);
            const expiring = isExpiringSoon(coach.license_expiry);
            const assigned = teamsForCoach(coach.id);
            return (
              <Card key={coach.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{coach.full_name}</CardTitle>
                      <CardDescription>{coach.role_title}</CardDescription>
                    </div>
                    <Badge variant={coach.status === "active" ? "default" : "outline"}>
                      {COACH_STATUS_LABELS[coach.status as CoachStatus]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 text-sm">
                  <p className="text-muted-foreground">{coach.email ?? "No email"} · {coach.phone ?? "No phone"}</p>
                  <p className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      <BadgeCheck className="mr-1 size-3" aria-hidden />
                      {coach.license_level ?? "No licence"}
                    </Badge>
                    <Badge variant={expired ? "destructive" : expiring ? "secondary" : "outline"}>
                      Expires {formatDate(coach.license_expiry)}
                    </Badge>
                  </p>
                  <p className="text-muted-foreground">
                    {CONTRACT_TYPE_LABELS[coach.contract_type as ContractType]} ·{" "}
                    {formatDate(coach.contract_start)} → {formatDate(coach.contract_end)}
                  </p>
                  {(coach.certifications ?? []).length > 0 && (
                    <ul className="flex flex-wrap gap-1">
                      {coach.certifications.map((cert) => (
                        <li key={cert}>
                          <Badge variant="secondary">{cert}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {assigned.length
                      ? `Assigned to ${assigned.map((t) => t.name).join(", ")}`
                      : "No team assignments"}
                  </p>
                  {canManage && (
                    <div className="mt-auto flex justify-end gap-1 pt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${coach.full_name}`}
                        onClick={() => openDialog(coach)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${coach.full_name}`}
                        onClick={() => crud.remove.mutate(coach.id)}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coach" : "Add coach"}</DialogTitle>
            <DialogDescription>
              Licence and contract details feed compliance checks across the academy.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...form.register("full_name")} />
              <ErrorText message={form.formState.errors.full_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_title">Role</Label>
              <Input id="role_title" {...form.register("role_title")} />
              <ErrorText message={form.formState.errors.role_title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach-email">Email</Label>
              <Input id="coach-email" type="email" {...form.register("email")} />
              <ErrorText message={form.formState.errors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach-phone">Phone</Label>
              <Input id="coach-phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_level">Licence level</Label>
              <Input id="license_level" placeholder="UEFA B" {...form.register("license_level")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">Licence number</Label>
              <Input id="license_number" {...form.register("license_number")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_expiry">Licence expiry</Label>
              <Input id="license_expiry" type="date" {...form.register("license_expiry")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_type">Contract type</Label>
              <Select
                value={form.watch("contract_type")}
                onValueChange={(value) => form.setValue("contract_type", value as ContractType)}
              >
                <SelectTrigger id="contract_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CONTRACT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_start">Contract start</Label>
              <Input id="contract_start" type="date" {...form.register("contract_start")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_end">Contract end</Label>
              <Input id="contract_end" type="date" {...form.register("contract_end")} />
              <ErrorText message={form.formState.errors.contract_end?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach-status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as CoachStatus)}
              >
                <SelectTrigger id="coach-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COACH_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {COACH_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo URL</Label>
              <Input id="photo_url" placeholder="https://…" {...form.register("photo_url")} />
              <ErrorText message={form.formState.errors.photo_url?.message} />
            </div>

            <fieldset className="space-y-2 sm:col-span-2">
              <legend className="text-sm font-medium">Weekly availability</legend>
              <div className="flex flex-wrap gap-3">
                {WEEKDAYS.map((day, index) => (
                  <label key={day} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={availability.includes(index)}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          "availability",
                          checked
                            ? [...availability, index]
                            : availability.filter((d) => d !== index),
                        )
                      }
                      aria-label={day}
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certification">Certifications</Label>
              <div className="flex gap-2">
                <Input
                  id="certification"
                  value={certInput}
                  placeholder="Goalkeeping Level 2"
                  onChange={(event) => setCertInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCertification();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCertification}>
                  Add
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {(form.watch("certifications") ?? []).map((cert) => (
                  <li key={cert}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        form.setValue(
                          "certifications",
                          (form.getValues("certifications") ?? []).filter((c) => c !== cert),
                        )
                      }
                    >
                      {cert} ✕
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="coach-notes">Notes</Label>
              <Textarea id="coach-notes" rows={3} {...form.register("notes")} />
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={crud.create.isPending || crud.update.isPending}>
                {(crud.create.isPending || crud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editing ? "Save coach" : "Add coach"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

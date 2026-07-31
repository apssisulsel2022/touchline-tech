import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Building, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

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
import { facilitiesQuery, type FacilityRow } from "@/lib/academy";
import {
  FACILITY_STATUS_LABELS,
  FACILITY_STATUSES,
  FACILITY_TYPE_LABELS,
  FACILITY_TYPES,
  facilitySchema,
  type FacilityInput,
  type FacilityStatus,
  type FacilityType,
} from "@/lib/validation/academy";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Training grounds, pitches, locker rooms and equipment stores. */
export function AcademyFacilitiesTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const facilities = useQuery(facilitiesQuery(orgId));
  const crud = useAcademyCrud({
    orgId,
    table: "facilities",
    section: "facilities",
    entity: "Facility",
    actions: {
      create: "academy.facility_created",
      update: "academy.facility_updated",
      remove: "academy.facility_deleted",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FacilityRow | null>(null);
  const [typeFilter, setTypeFilter] = React.useState("all");

  const form = useForm<FacilityInput>({
    resolver: zodResolver(facilitySchema),
    defaultValues: { name: "", type: "field", status: "available" },
  });

  const openDialog = (row?: FacilityRow) => {
    setEditing(row ?? null);
    form.reset(
      row
        ? ({
            name: row.name,
            type: row.type as FacilityType,
            surface: row.surface ?? "",
            capacity: row.capacity ?? undefined,
            address_line: row.address_line ?? "",
            city: row.city ?? "",
            latitude: row.latitude ?? undefined,
            longitude: row.longitude ?? undefined,
            status: row.status as FacilityStatus,
            notes: row.notes ?? "",
          } as FacilityInput)
        : ({
            name: "",
            type: "field",
            surface: "",
            address_line: "",
            city: "",
            status: "available",
            notes: "",
          } as FacilityInput),
    );
    setOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    if (editing) await crud.update.mutateAsync({ id: editing.id, values });
    else await crud.create.mutateAsync(values);
    setOpen(false);
  });

  const rows = (facilities.data ?? []).filter((f) => typeFilter === "all" || f.type === typeFilter);

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor="facility-type-filter" className="text-xs">
            Facility type
          </Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="facility-type-filter" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All facilities</SelectItem>
              {FACILITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {FACILITY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 size-4" aria-hidden />
            Add facility
          </Button>
        )}
      </div>

      <SectionState
        isLoading={facilities.isLoading}
        error={facilities.error}
        isEmpty={rows.length === 0}
        emptyIcon={Building}
        emptyTitle="No facilities recorded"
        emptyDescription="Add your training grounds, pitches, locker rooms and equipment stores to schedule sessions against them."
        emptyAction={canManage ? <Button onClick={() => openDialog()}>Add facility</Button> : undefined}
        onRetry={() => void facilities.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((facility) => (
            <Card key={facility.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{facility.name}</CardTitle>
                    <CardDescription>
                      {FACILITY_TYPE_LABELS[facility.type as FacilityType]}
                    </CardDescription>
                  </div>
                  <Badge variant={facility.status === "available" ? "default" : "outline"}>
                    {FACILITY_STATUS_LABELS[facility.status as FacilityStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                <p>
                  {facility.surface ?? "Surface not set"} · Capacity {facility.capacity ?? "—"}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {[facility.address_line, facility.city].filter(Boolean).join(", ") || "No address"}
                    {facility.latitude != null && facility.longitude != null && (
                      <>
                        {" "}
                        <a
                          className="underline underline-offset-2"
                          href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          View on map
                        </a>
                      </>
                    )}
                  </span>
                </p>
                {facility.notes && <p className="text-xs">{facility.notes}</p>}
                {canManage && (
                  <div className="mt-auto flex justify-end gap-1 pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${facility.name}`}
                      onClick={() => openDialog(facility)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${facility.name}`}
                      onClick={() => crud.remove.mutate(facility.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit facility" : "Add facility"}</DialogTitle>
            <DialogDescription>
              Coordinates power the map link used by parents and visiting teams.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="facility-name">Name</Label>
              <Input id="facility-name" {...form.register("name")} />
              <ErrorText message={form.formState.errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility-type">Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value as FacilityType)}
              >
                <SelectTrigger id="facility-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {FACILITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility-status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as FacilityStatus)}
              >
                <SelectTrigger id="facility-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {FACILITY_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface">Surface</Label>
              <Input id="surface" placeholder="Natural grass" {...form.register("surface")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility-capacity">Capacity</Label>
              <Input id="facility-capacity" type="number" min={0} {...form.register("capacity")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address_line">Address</Label>
              <Input id="address_line" {...form.register("address_line")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility-city">City</Label>
              <Input id="facility-city" {...form.register("city")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" {...form.register("latitude")} />
                <ErrorText message={form.formState.errors.latitude?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" {...form.register("longitude")} />
                <ErrorText message={form.formState.errors.longitude?.message} />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="facility-notes">Notes</Label>
              <Textarea id="facility-notes" rows={2} {...form.register("notes")} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={crud.create.isPending || crud.update.isPending}>
                {(crud.create.isPending || crud.update.isPending) && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                {editing ? "Save facility" : "Add facility"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { ConcurrencyError, playerKeys, updatePlayerRecord, type PlayerRow } from "@/lib/players";
import {
  PLAYER_GENDERS,
  PLAYER_GENDER_LABELS,
  PLAYER_POSITIONS,
  PLAYER_POSITION_LABELS,
  PLAYER_STATUS_LABELS,
  PLAYER_STATUSES,
  PREFERRED_FEET,
  PREFERRED_FOOT_LABELS,
  isMinor,
  playerSchema,
  type PlayerInput,
} from "@/lib/validation/players";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

function defaults(player?: PlayerRow | null): PlayerInput {
  return {
    first_name: player?.first_name ?? "",
    last_name: player?.last_name ?? "",
    known_as: player?.known_as ?? "",
    date_of_birth: player?.date_of_birth ?? "",
    gender: player?.gender ?? "undisclosed",
    nationality: player?.nationality ?? "",
    national_id: player?.national_id ?? "",
    photo_url: player?.photo_url ?? "",
    preferred_foot: player?.preferred_foot ?? "right",
    primary_position: player?.primary_position ?? "unassigned",
    secondary_position: player?.secondary_position ?? undefined,
    height_cm: player?.height_cm ?? "",
    weight_kg: player?.weight_kg ?? "",
    email: player?.email ?? "",
    phone: player?.phone ?? "",
    address_line: player?.address_line ?? "",
    city: player?.city ?? "",
    school_name: player?.school_name ?? "",
    medical_notes: player?.medical_notes ?? "",
    notes: player?.notes ?? "",
    status: player?.status ?? "draft",
  };
}

/**
 * Create / edit a player record. Updates use optimistic concurrency against
 * the row `version` so two admins editing the same profile cannot silently
 * overwrite each other.
 */
export function PlayerFormDialog({
  orgId,
  player,
  open,
  onOpenChange,
  onCreated,
}: {
  orgId: string;
  player?: PlayerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (playerId: string) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    defaultValues: defaults(player),
  });

  React.useEffect(() => {
    if (open) form.reset(defaults(player));
  }, [open, player, form]);

  const dob = form.watch("date_of_birth");
  const minor = dob && !Number.isNaN(Date.parse(dob)) ? isMinor(dob) : false;

  const save = useMutation({
    mutationFn: async (values: PlayerInput) => {
      const parsed = playerSchema.parse(values);
      const payload = {
        ...parsed,
        secondary_position: parsed.secondary_position ?? null,
        known_as: parsed.known_as ?? null,
        nationality: parsed.nationality ?? null,
        national_id: parsed.national_id ?? null,
        photo_url: parsed.photo_url ?? null,
        height_cm: parsed.height_cm ?? null,
        weight_kg: parsed.weight_kg ?? null,
        email: parsed.email ?? null,
        phone: parsed.phone ?? null,
        address_line: parsed.address_line ?? null,
        city: parsed.city ?? null,
        school_name: parsed.school_name ?? null,
        medical_notes: parsed.medical_notes ?? null,
        notes: parsed.notes ?? null,
      };

      if (player) {
        const updated = await updatePlayerRecord(player.id, player.version, payload);
        return { id: updated.id, created: false, status: updated.status };
      }

      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("players")
        .insert({ ...payload, org_id: orgId, created_by: userData.user?.id ?? null } as never)
        .select("id, status")
        .single();
      if (error) throw error;
      return { id: data.id, created: true, status: data.status };
    },
    onSuccess: (result, values) => {
      void audit(result.created ? "player.created" : "player.updated", {
        orgId,
        entity: "player",
        entityId: result.id,
        metadata: { name: `${values.first_name} ${values.last_name}`, status: result.status },
      });
      queryClient.invalidateQueries({ queryKey: playerKeys.all(orgId) });
      queryClient.invalidateQueries({ queryKey: ["organization", orgId, "activity"] });
      toast.success(result.created ? "Player created" : "Player updated");
      onOpenChange(false);
      if (result.created) onCreated?.(result.id);
    },
    onError: (error: Error) =>
      toast.error(
        error instanceof ConcurrencyError
          ? error.message
          : error.message || "Could not save this player",
      ),
  });

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{player ? "Edit player" : "Register player"}</DialogTitle>
          <DialogDescription>
            Identity and profile details. The registry number is issued automatically.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...form.register("first_name")} aria-invalid={!!errors.first_name} />
              <FieldError message={errors.first_name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...form.register("last_name")} aria-invalid={!!errors.last_name} />
              <FieldError message={errors.last_name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="known_as">Known as</Label>
              <Input id="known_as" {...form.register("known_as")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...form.register("date_of_birth")}
                aria-invalid={!!errors.date_of_birth}
              />
              <FieldError message={errors.date_of_birth?.message} />
              {minor && (
                <p className="text-xs text-muted-foreground">
                  Minor — guardian details and consent are required before approval.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(value) => form.setValue("gender", value as PlayerInput["gender"])}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_GENDERS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PLAYER_GENDER_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as PlayerInput["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PLAYER_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...form.register("nationality")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="national_id">National / registry ID</Label>
              <Input id="national_id" {...form.register("national_id")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primary_position">Primary position</Label>
              <Select
                value={form.watch("primary_position")}
                onValueChange={(value) =>
                  form.setValue("primary_position", value as PlayerInput["primary_position"])
                }
              >
                <SelectTrigger id="primary_position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_POSITIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PLAYER_POSITION_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preferred_foot">Preferred foot</Label>
              <Select
                value={form.watch("preferred_foot")}
                onValueChange={(value) =>
                  form.setValue("preferred_foot", value as PlayerInput["preferred_foot"])
                }
              >
                <SelectTrigger id="preferred_foot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREFERRED_FEET.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PREFERRED_FOOT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input id="height_cm" type="number" inputMode="numeric" {...form.register("height_cm")} />
              <FieldError message={errors.height_cm?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input id="weight_kg" type="number" inputMode="numeric" {...form.register("weight_kg")} />
              <FieldError message={errors.weight_kg?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school_name">School</Label>
              <Input id="school_name" {...form.register("school_name")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address_line">Address</Label>
            <Input id="address_line" {...form.register("address_line")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input id="photo_url" {...form.register("photo_url")} />
            <FieldError message={errors.photo_url?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {player ? "Save changes" : "Register player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

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
import { ReadOnlyNotice, SectionState } from "@/components/common/section-state";
import { useConfirm } from "@/components/common/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { guardiansQuery, playerKeys, type GuardianRow } from "@/lib/players";
import {
  GUARDIAN_RELATIONSHIPS,
  GUARDIAN_RELATIONSHIP_LABELS,
  guardianSchema,
  type GuardianInput,
} from "@/lib/validation/players";

function defaults(guardian?: GuardianRow | null): GuardianInput {
  return {
    full_name: guardian?.full_name ?? "",
    relationship: guardian?.relationship ?? "mother",
    email: guardian?.email ?? "",
    phone: guardian?.phone ?? "",
    address_line: guardian?.address_line ?? "",
    occupation: guardian?.occupation ?? "",
    is_primary: guardian?.is_primary ?? false,
    consent_given: Boolean(guardian?.consent_given_at),
    notes: guardian?.notes ?? "",
  };
}

/** Guardians and parental consent — mandatory for players under 18. */
export function PlayerGuardiansCard({
  orgId,
  playerId,
  canManage,
  requiresGuardian,
}: {
  orgId: string;
  playerId: string;
  canManage: boolean;
  requiresGuardian: boolean;
}) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const guardians = useQuery(guardiansQuery(orgId, playerId));
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GuardianRow | null>(null);

  const form = useForm<GuardianInput>({
    resolver: zodResolver(guardianSchema),
    defaultValues: defaults(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: playerKeys.section(orgId, playerId, "guardians") });
    queryClient.invalidateQueries({ queryKey: ["organization", orgId, "activity"] });
  };

  const save = useMutation({
    mutationFn: async (values: GuardianInput) => {
      const parsed = guardianSchema.parse(values);
      const payload = {
        full_name: parsed.full_name,
        relationship: parsed.relationship,
        email: parsed.email ?? null,
        phone: parsed.phone ?? null,
        address_line: parsed.address_line ?? null,
        occupation: parsed.occupation ?? null,
        is_primary: parsed.is_primary,
        notes: parsed.notes ?? null,
        consent_given_at: parsed.consent_given
          ? (editing?.consent_given_at ?? new Date().toISOString())
          : null,
      };
      if (editing) {
        const { error } = await supabase
          .from("player_guardians")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        return { id: editing.id, created: false };
      }
      const { data, error } = await supabase
        .from("player_guardians")
        .insert({ ...payload, org_id: orgId, player_id: playerId })
        .select("id")
        .single();
      if (error) throw error;
      return { id: data.id, created: true };
    },
    onSuccess: (result, values) => {
      void audit(result.created ? "player.guardian_added" : "player.guardian_updated", {
        orgId,
        entity: "player_guardian",
        entityId: result.id,
        metadata: { playerId, relationship: values.relationship },
      });
      invalidate();
      toast.success(result.created ? "Guardian added" : "Guardian updated");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message || "Could not save guardian"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("player_guardians").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      void audit("player.guardian_removed", {
        orgId,
        entity: "player_guardian",
        entityId: id,
        metadata: { playerId },
      });
      invalidate();
      toast.success("Guardian removed");
    },
    onError: (error: Error) => toast.error(error.message || "Could not remove guardian"),
  });

  function openDialog(guardian: GuardianRow | null) {
    setEditing(guardian);
    form.reset(defaults(guardian));
    setOpen(true);
  }

  const rows = guardians.data ?? [];
  const hasConsent = rows.some((g) => g.consent_given_at);
  const errors = form.formState.errors;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Guardians</CardTitle>
          <CardDescription>
            {requiresGuardian
              ? "This player is a minor — at least one guardian with recorded consent is required."
              : "Emergency and family contacts."}
          </CardDescription>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => openDialog(null)} className="gap-2">
            <Plus className="size-4" aria-hidden />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <ReadOnlyNotice canManage={canManage} />
        {requiresGuardian && rows.length > 0 && !hasConsent && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
            No guardian consent recorded yet — registration cannot be approved.
          </p>
        )}
        <SectionState
          isLoading={guardians.isLoading}
          error={guardians.error}
          isEmpty={rows.length === 0}
          skeletonRows={2}
          emptyIcon={Users}
          emptyTitle="No guardians recorded"
          emptyDescription="Add a parent or legal guardian so consent and contact details are on file."
          onRetry={() => void guardians.refetch()}
          emptyAction={
            canManage ? (
              <Button size="sm" onClick={() => openDialog(null)}>
                Add guardian
              </Button>
            ) : undefined
          }
        >
          <ul className="space-y-3">
            {rows.map((guardian) => (
              <li
                key={guardian.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {guardian.full_name}
                    {guardian.is_primary && <Badge variant="secondary">Primary</Badge>}
                    {guardian.consent_given_at ? (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="size-3" aria-hidden />
                        Consent given
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Consent missing</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {GUARDIAN_RELATIONSHIP_LABELS[guardian.relationship]}
                    {guardian.phone ? ` · ${guardian.phone}` : ""}
                    {guardian.email ? ` · ${guardian.email}` : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${guardian.full_name}`}
                      onClick={() => openDialog(guardian)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${guardian.full_name}`}
                      onClick={() =>
                        void confirm({
                          title: "Remove guardian?",
                          description: `${guardian.full_name} will no longer be linked to this player.`,
                          confirmLabel: "Remove",
                          destructive: true,
                        }).then((ok) => ok && remove.mutate(guardian.id))
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </SectionState>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit guardian" : "Add guardian"}</DialogTitle>
            <DialogDescription>Contact details and parental consent.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="guardian_name">Full name</Label>
              <Input id="guardian_name" {...form.register("full_name")} aria-invalid={!!errors.full_name} />
              {errors.full_name && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={form.watch("relationship")}
                  onValueChange={(value) =>
                    form.setValue("relationship", value as GuardianInput["relationship"])
                  }
                >
                  <SelectTrigger id="relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GUARDIAN_RELATIONSHIPS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {GUARDIAN_RELATIONSHIP_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" {...form.register("occupation")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_email">Email</Label>
                <Input id="guardian_email" type="email" {...form.register("email")} />
                {errors.email && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_phone">Phone</Label>
                <Input id="guardian_phone" {...form.register("phone")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guardian_address">Address</Label>
              <Input id="guardian_address" {...form.register("address_line")} />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_primary"
                checked={form.watch("is_primary")}
                onCheckedChange={(checked) => form.setValue("is_primary", checked === true)}
              />
              <Label htmlFor="is_primary">Primary contact</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="consent_given"
                checked={form.watch("consent_given")}
                onCheckedChange={(checked) => form.setValue("consent_given", checked === true)}
              />
              <Label htmlFor="consent_given">Parental consent given</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Layers, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyNotice, SectionState, useAcademyCrud } from "@/components/academy/academy-section";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { academyKeys, ageCategoriesQuery, type AgeCategoryRow } from "@/lib/academy";
import {
  ageAtCutoff,
  ageCategorySchema,
  DEFAULT_AGE_CATEGORIES,
  isEligibleForCategory,
  type AgeCategoryInput,
} from "@/lib/validation/academy";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** U-8 … U-18 ladder plus custom groups, with automatic age eligibility checks. */
export function AcademyAgeCategoriesTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data = [], isLoading, error, refetch } = useQuery(ageCategoriesQuery(orgId));
  const crud = useAcademyCrud({
    orgId,
    table: "age_categories",
    section: "age-categories",
    entity: "Age category",
    actions: {
      create: "academy.age_category_created",
      update: "academy.age_category_updated",
      remove: "academy.age_category_deleted",
    },
  });

  const [editing, setEditing] = React.useState<AgeCategoryRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [birthDate, setBirthDate] = React.useState("");

  const form = useForm<AgeCategoryInput>({
    resolver: zodResolver(ageCategorySchema),
    defaultValues: {
      code: "",
      label: "",
      max_age: 12,
      cutoff_month: 1,
      is_active: true,
      sort_order: data.length,
      description: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      code: "",
      label: "",
      max_age: 12,
      min_age: undefined,
      cutoff_month: 1,
      is_active: true,
      sort_order: data.length,
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (row: AgeCategoryRow) => {
    setEditing(row);
    form.reset({
      code: row.code,
      label: row.label,
      max_age: row.max_age,
      min_age: row.min_age ?? undefined,
      cutoff_month: row.cutoff_month,
      is_active: row.is_active,
      sort_order: row.sort_order,
      description: row.description ?? "",
    } as AgeCategoryInput);
    setOpen(true);
  };

  const submit = form.handleSubmit(async (values) => {
    const payload = { ...values, is_custom: !/^U-\d{1,2}$/i.test(values.code) };
    if (editing) await crud.update.mutateAsync({ id: editing.id, values: payload });
    else await crud.create.mutateAsync(payload);
    setOpen(false);
  });

  const seed = useMutation({
    mutationFn: async () => {
      const rows = DEFAULT_AGE_CATEGORIES.filter(
        (c) => !data.some((existing) => existing.code.toLowerCase() === c.code.toLowerCase()),
      ).map((c) => ({ ...c, org_id: orgId }));
      if (!rows.length) return 0;
      const { error: insertError } = await supabase.from("age_categories").insert(rows as never);
      if (insertError) throw insertError;
      return rows.length;
    },
    onSuccess: (count) => {
      if (!count) {
        toast.info("Standard categories already exist");
        return;
      }
      void audit("academy.age_category_created", {
        orgId,
        entity: "age_categories",
        metadata: { seeded: count },
      });
      queryClient.invalidateQueries({ queryKey: academyKeys.section(orgId, "age-categories") });
      toast.success(`${count} standard age groups added`);
    },
    onError: (seedError: Error) => toast.error(seedError.message || "Could not seed age groups"),
  });

  const eligible = React.useMemo(() => {
    if (!birthDate) return null;
    return data.filter((c) => c.is_active && isEligibleForCategory(birthDate, c));
  }, [birthDate, data]);

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Age categories</h2>
          <p className="text-sm text-muted-foreground">
            Define the age ladder used to place players into teams. Eligibility is calculated from the
            cut-off month.
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => seed.mutate()} disabled={seed.isPending}>
              {seed.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="mr-2 size-4" aria-hidden />
              )}
              Add U-8 to U-18
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" aria-hidden />
              New category
            </Button>
          </div>
        )}
      </div>

      <SectionState
        isLoading={isLoading}
        error={error}
        isEmpty={data.length === 0}
        emptyIcon={Layers}
        emptyTitle="No age categories yet"
        emptyDescription="Seed the standard U-8 to U-18 ladder or create a custom age group to start building teams."
        emptyAction={
          canManage ? (
            <Button onClick={() => seed.mutate()} disabled={seed.isPending}>
              <Sparkles className="mr-2 size-4" aria-hidden />
              Seed standard ladder
            </Button>
          ) : undefined
        }
        onRetry={() => void refetch()}
      >
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <caption className="sr-only">Academy age categories</caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Code</TableHead>
                  <TableHead scope="col">Label</TableHead>
                  <TableHead scope="col">Age range</TableHead>
                  <TableHead scope="col">Cut-off</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col" className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>
                      {row.min_age != null ? `${row.min_age}–${row.max_age}` : `≤ ${row.max_age}`} yrs
                    </TableCell>
                    <TableCell>{MONTHS[row.cutoff_month - 1]}</TableCell>
                    <TableCell>
                      <Badge variant={row.is_active ? "outline" : "secondary"}>
                        {row.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {row.is_custom && (
                        <Badge variant="secondary" className="ml-2">
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${row.code}`}
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${row.code}`}
                            onClick={() => crud.remove.mutate(row.id)}
                            disabled={crud.remove.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </SectionState>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4" aria-hidden />
            Automatic age validation
          </CardTitle>
          <CardDescription>
            Enter a date of birth to see which categories a player is eligible for this year.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="age-check">Date of birth</Label>
            <Input
              id="age-check"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>
          {eligible && (
            <div aria-live="polite" className="flex flex-wrap gap-2">
              {eligible.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active category matches this date of birth.
                </p>
              ) : (
                eligible.map((c) => (
                  <Badge key={c.id} variant="outline">
                    {c.code} · age {ageAtCutoff(birthDate, c.cutoff_month)}
                  </Badge>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit age category" : "New age category"}</DialogTitle>
            <DialogDescription>
              Codes such as <code>U-13</code> are treated as standard; anything else is flagged as a custom
              group.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="U-13" {...form.register("code")} />
              {form.formState.errors.code && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" placeholder="Under 13" {...form.register("label")} />
              {form.formState.errors.label && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_age">Maximum age</Label>
              <Input id="max_age" type="number" min={4} max={23} {...form.register("max_age")} />
              {form.formState.errors.max_age && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.max_age.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_age">Minimum age (optional)</Label>
              <Input id="min_age" type="number" min={3} max={23} {...form.register("min_age")} />
              {form.formState.errors.min_age && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.min_age.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoff_month">Cut-off month</Label>
              <Input id="cutoff_month" type="number" min={1} max={12} {...form.register("cutoff_month")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Display order</Label>
              <Input id="sort_order" type="number" min={0} {...form.register("sort_order")} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...form.register("description")} />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
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
                {editing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

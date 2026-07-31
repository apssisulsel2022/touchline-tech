import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyNotice } from "@/components/academy/academy-section";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { academyKeys, academyProfileQuery, formatDate, isExpired, isExpiringSoon } from "@/lib/academy";
import { academyProfileSchema, type AcademyProfileInput } from "@/lib/validation/academy";
import type { OrganizationRow } from "@/lib/organizations";
import { ORG_TYPE_LABELS, type OrgType } from "@/lib/validation/org";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Academy identity, licensing and accreditation record (one per organisation). */
export function AcademyProfileTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(academyProfileQuery(org.id));

  const form = useForm<AcademyProfileInput>({
    resolver: zodResolver(academyProfileSchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    form.reset({
      license_number: data?.license_number ?? "",
      license_authority: data?.license_authority ?? "",
      license_expiry: data?.license_expiry ?? "",
      registration_number: data?.registration_number ?? "",
      accreditation: data?.accreditation ?? "",
      accreditation_level: data?.accreditation_level ?? "",
      founded_date: data?.founded_date ?? "",
      head_of_academy: data?.head_of_academy ?? "",
      motto: data?.motto ?? "",
      philosophy: data?.philosophy ?? "",
      primary_color: data?.primary_color ?? "",
      secondary_color: data?.secondary_color ?? "",
      capacity: data?.capacity ?? undefined,
    } as AcademyProfileInput);
  }, [data, form]);

  const save = useMutation({
    mutationFn: async (values: AcademyProfileInput) => {
      const payload = { ...values, org_id: org.id };
      const { error: upsertError } = await supabase
        .from("academy_profiles")
        .upsert(payload as never, { onConflict: "org_id" });
      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      void audit("academy.profile_updated", { orgId: org.id, entity: "academy_profile", entityId: org.id });
      queryClient.invalidateQueries({ queryKey: academyKeys.section(org.id, "profile") });
      toast.success("Academy profile saved");
    },
    onError: (mutationError: Error) =>
      toast.error(mutationError.message || "Could not save the academy profile"),
  });

  const licenceExpiry = data?.license_expiry ?? null;
  const licenceTone = isExpired(licenceExpiry)
    ? "destructive"
    : isExpiringSoon(licenceExpiry)
      ? "secondary"
      : "outline";

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReadOnlyNotice canManage={canManage} />

      <Card>
        <CardHeader>
          <CardTitle>Academy identity</CardTitle>
          <CardDescription>
            Brand, contact and location details are inherited from the organisation record.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={`${org.name} logo`}
                className="size-14 rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-14 place-items-center rounded-xl bg-primary-subtle text-lg font-semibold text-primary"
              >
                {org.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{org.name}</p>
              <p className="text-xs text-muted-foreground">
                {ORG_TYPE_LABELS[org.type as OrgType] ?? org.type}
              </p>
            </div>
          </div>
          <dl className="grid gap-1 text-sm">
            <dt className="text-xs text-muted-foreground">Contact</dt>
            <dd>{org.email ?? "—"}</dd>
            <dd className="text-muted-foreground">{org.phone ?? "—"}</dd>
          </dl>
          <dl className="grid gap-1 text-sm">
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd>{[org.address_line, org.city, org.country].filter(Boolean).join(", ") || "—"}</dd>
            <dd className="text-muted-foreground">
              {org.latitude != null && org.longitude != null
                ? `${org.latitude.toFixed(5)}, ${org.longitude.toFixed(5)}`
                : "No map coordinates"}
            </dd>
          </dl>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
            <Badge variant="outline">Status: {org.status}</Badge>
            <Badge variant={licenceTone as "outline" | "secondary" | "destructive"}>
              <ShieldCheck className="mr-1 size-3" aria-hidden />
              Licence: {licenceExpiry ? formatDate(licenceExpiry) : "not recorded"}
            </Badge>
            <Badge variant="outline">Founded: {formatDate(data?.founded_date)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Licensing & accreditation</CardTitle>
          <CardDescription>
            Federation licence, registration number and accreditation level for this academy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {(error as Error).message}
            </p>
          )}
          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
            noValidate
          >
            <Field id="license_number" label="Licence number" error={form.formState.errors.license_number?.message}>
              <Input id="license_number" disabled={!canManage} {...form.register("license_number")} />
            </Field>
            <Field
              id="license_authority"
              label="Issuing authority"
              error={form.formState.errors.license_authority?.message}
            >
              <Input id="license_authority" disabled={!canManage} {...form.register("license_authority")} />
            </Field>
            <Field id="license_expiry" label="Licence expiry" error={form.formState.errors.license_expiry?.message}>
              <Input id="license_expiry" type="date" disabled={!canManage} {...form.register("license_expiry")} />
            </Field>
            <Field
              id="registration_number"
              label="Registration number"
              error={form.formState.errors.registration_number?.message}
            >
              <Input id="registration_number" disabled={!canManage} {...form.register("registration_number")} />
            </Field>
            <Field id="accreditation" label="Accreditation" error={form.formState.errors.accreditation?.message}>
              <Input id="accreditation" disabled={!canManage} {...form.register("accreditation")} />
            </Field>
            <Field
              id="accreditation_level"
              label="Accreditation level"
              error={form.formState.errors.accreditation_level?.message}
            >
              <Input id="accreditation_level" disabled={!canManage} {...form.register("accreditation_level")} />
            </Field>
            <Field id="founded_date" label="Founded" error={form.formState.errors.founded_date?.message}>
              <Input id="founded_date" type="date" disabled={!canManage} {...form.register("founded_date")} />
            </Field>
            <Field
              id="head_of_academy"
              label="Head of academy"
              error={form.formState.errors.head_of_academy?.message}
            >
              <Input id="head_of_academy" disabled={!canManage} {...form.register("head_of_academy")} />
            </Field>
            <Field
              id="capacity"
              label="Player capacity"
              hint="Maximum number of registered players across all age groups."
              error={form.formState.errors.capacity?.message}
            >
              <Input id="capacity" type="number" min={0} disabled={!canManage} {...form.register("capacity")} />
            </Field>
            <Field id="motto" label="Motto" error={form.formState.errors.motto?.message}>
              <Input id="motto" disabled={!canManage} {...form.register("motto")} />
            </Field>
            <Field id="primary_color" label="Primary brand colour" error={form.formState.errors.primary_color?.message}>
              <Input id="primary_color" placeholder="#0F7B4F" disabled={!canManage} {...form.register("primary_color")} />
            </Field>
            <Field
              id="secondary_color"
              label="Secondary brand colour"
              error={form.formState.errors.secondary_color?.message}
            >
              <Input
                id="secondary_color"
                placeholder="#0B2027"
                disabled={!canManage}
                {...form.register("secondary_color")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="philosophy" label="Playing philosophy" error={form.formState.errors.philosophy?.message}>
                <Textarea id="philosophy" rows={4} disabled={!canManage} {...form.register("philosophy")} />
              </Field>
            </div>
            {canManage && (
              <div className="sm:col-span-2">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                  Save academy profile
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

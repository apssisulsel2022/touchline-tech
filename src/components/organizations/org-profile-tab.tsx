import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import type { OrganizationRow } from "@/lib/organizations";
import {
  updateOrganizationProfileSchema,
  type UpdateOrganizationProfileInput,
} from "@/lib/validation/org";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function OrgProfileTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const form = useForm<UpdateOrganizationProfileInput>({
    resolver: zodResolver(updateOrganizationProfileSchema),
    defaultValues: {
      name: org.name,
      description: org.description ?? "",
      email: org.email ?? "",
      phone: org.phone ?? "",
      website: org.website ?? "",
      addressLine: org.address_line ?? "",
      city: org.city ?? "",
      region: org.region ?? "",
      country: org.country ?? "",
      postalCode: org.postal_code ?? "",
      logoUrl: org.logo_url ?? null,
      coverUrl: org.cover_url ?? null,
    },
  });

  const save = useMutation({
    mutationFn: async (values: UpdateOrganizationProfileInput) => {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: values.name,
          description: values.description || null,
          email: values.email || null,
          phone: values.phone || null,
          website: values.website || null,
          address_line: values.addressLine || null,
          city: values.city || null,
          region: values.region || null,
          country: values.country || null,
          postal_code: values.postalCode || null,
          logo_url: values.logoUrl || null,
          cover_url: values.coverUrl || null,
        })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("org.updated", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
        metadata: { section: "profile" },
      });
      toast.success("Organisation profile updated");
      await queryClient.invalidateQueries({ queryKey: ["organization", org.id] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const errors = form.formState.errors;
  const disabled = !canManage || save.isPending;

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>Public-facing name, story and imagery.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="org-name" label="Name" error={errors.name?.message}>
            <Input id="org-name" disabled={disabled} {...form.register("name")} />
          </Field>
          <Field id="org-logo" label="Logo URL" error={errors.logoUrl?.message}>
            <Input id="org-logo" placeholder="https://…" disabled={disabled} {...form.register("logoUrl")} />
          </Field>
          <Field id="org-cover" label="Cover image URL" error={errors.coverUrl?.message}>
            <Input id="org-cover" placeholder="https://…" disabled={disabled} {...form.register("coverUrl")} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="org-description" label="Description" error={errors.description?.message}>
              <Textarea id="org-description" rows={4} disabled={disabled} {...form.register("description")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>How members and partners can reach this organisation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="org-email" label="Email" error={errors.email?.message}>
            <Input id="org-email" type="email" disabled={disabled} {...form.register("email")} />
          </Field>
          <Field id="org-phone" label="Phone" error={errors.phone?.message}>
            <Input id="org-phone" type="tel" disabled={disabled} {...form.register("phone")} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="org-website" label="Website" error={errors.website?.message}>
              <Input id="org-website" placeholder="https://…" disabled={disabled} {...form.register("website")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Registered address used across competitions and documents.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="org-address" label="Address" error={errors.addressLine?.message}>
              <Input id="org-address" disabled={disabled} {...form.register("addressLine")} />
            </Field>
          </div>
          <Field id="org-city" label="City" error={errors.city?.message}>
            <Input id="org-city" disabled={disabled} {...form.register("city")} />
          </Field>
          <Field id="org-region" label="Region / Province" error={errors.region?.message}>
            <Input id="org-region" disabled={disabled} {...form.register("region")} />
          </Field>
          <Field id="org-country" label="Country" error={errors.country?.message}>
            <Input id="org-country" disabled={disabled} {...form.register("country")} />
          </Field>
          <Field id="org-postal" label="Postal code" error={errors.postalCode?.message}>
            <Input id="org-postal" disabled={disabled} {...form.register("postalCode")} />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={disabled}>
            {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save profile
          </Button>
        </CardFooter>
      </Card>
      {!canManage && (
        <p className="text-sm text-muted-foreground">
          You have read-only access to this organisation profile.
        </p>
      )}
    </form>
  );
}

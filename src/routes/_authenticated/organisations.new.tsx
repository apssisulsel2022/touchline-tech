import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/common/page-header";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { organizationSchema } from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth-provider";
import { audit } from "@/lib/audit";

type FormValues = z.infer<typeof organizationSchema>;

export const Route = createFileRoute("/_authenticated/organisations/new")({
  head: () => ({
    meta: [
      { title: "Create organisation — Touchline" },
      { name: "description", content: "Create a new federation, association, academy or club." },
    ],
  }),
  component: NewOrgPage,
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function NewOrgPage() {
  const navigate = useNavigate();
  const { session, refresh, switchOrganization } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: "", slug: "", type: "club" },
  });

  const name = form.watch("name");
  React.useEffect(() => {
    if (!form.formState.dirtyFields.slug) form.setValue("slug", slugify(name));
  }, [name, form]);

  const create = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name: values.name,
          slug: values.slug,
          type: values.type,
          owner_user_id: session!.userId,
        })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Failed to create organisation");
      // Add creator as admin member based on org type
      const roleByType: Record<FormValues["type"], "federation" | "association" | "academy" | "club" | "platform_owner"> = {
        platform: "platform_owner",
        federation: "federation",
        association: "association",
        academy: "academy",
        club: "club",
      };
      const { error: memErr } = await supabase.from("org_memberships").insert({
        org_id: data.id,
        user_id: session!.userId,
        role: roleByType[values.type],
        is_default: true,
      });
      if (memErr) throw memErr;
      return data.id;
    },
    onSuccess: async (orgId, values) => {
      await audit("org.created", {
        orgId,
        entity: "organizations",
        entityId: orgId,
        metadata: { name: values.name, type: values.type },
      });
      toast.success("Organisation created");
      await switchOrganization(orgId);
      await refresh();
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <PageHeader
        icon={Building2}
        title="Create organisation"
        description="Set up a new federation, association, academy or club workspace."
      />
      <form onSubmit={form.handleSubmit((v) => create.mutate(v))}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>You'll be the owner and default administrator.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input id="org-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as FormValues["type"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="federation">Federation</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                  <SelectItem value="academy">Academy / SSB</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Create organisation
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import type { OrganizationRow, OrgSettings, OrgSocials } from "@/lib/organizations";
import {
  organizationSettingsSchema,
  type OrganizationSettingsInput,
} from "@/lib/validation/org";

const TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "America/New_York",
  "America/Sao_Paulo",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "es", label: "Español" },
  { value: "nl", label: "Nederlands" },
  { value: "pt", label: "Português" },
];

export function OrgSettingsTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const socials = (org.socials ?? {}) as OrgSocials;
  const settings = (org.settings ?? {}) as OrgSettings;

  const form = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      timezone: org.timezone ?? "UTC",
      language: org.language ?? "en",
      tags: org.tags ?? [],
      socials: {
        twitter: socials.twitter ?? "",
        instagram: socials.instagram ?? "",
        facebook: socials.facebook ?? "",
        linkedin: socials.linkedin ?? "",
        youtube: socials.youtube ?? "",
      },
      settings: {
        allowPublicDirectory: settings.allowPublicDirectory ?? true,
        requireMfaForAdmins: settings.requireMfaForAdmins ?? false,
        defaultMemberRole: (settings.defaultMemberRole as Role) ?? "player",
        accentColor: settings.accentColor ?? "#10b981",
        notifications: {
          memberInvites: settings.notifications?.memberInvites ?? true,
          roleChanges: settings.notifications?.roleChanges ?? true,
          weeklyDigest: settings.notifications?.weeklyDigest ?? true,
        },
      },
    },
  });

  const tags = form.watch("tags");
  const [tagDraft, setTagDraft] = React.useState("");

  const addTag = () => {
    const value = tagDraft.trim().toLowerCase();
    if (!value || tags.includes(value) || tags.length >= 20) return;
    form.setValue("tags", [...tags, value], { shouldDirty: true });
    setTagDraft("");
  };

  const save = useMutation({
    mutationFn: async (values: OrganizationSettingsInput) => {
      const { error } = await supabase
        .from("organizations")
        .update({
          timezone: values.timezone,
          language: values.language,
          tags: values.tags,
          socials: values.socials,
          settings: values.settings,
        })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("org.settings_updated", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
      });
      toast.success("Organisation settings saved");
      await queryClient.invalidateQueries({ queryKey: ["organization", org.id] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disabled = !canManage || save.isPending;

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Default timezone and language for this tenant.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org-timezone">Timezone</Label>
            <Select
              value={form.watch("timezone")}
              onValueChange={(v) => form.setValue("timezone", v, { shouldDirty: true })}
              disabled={disabled}
            >
              <SelectTrigger id="org-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-language">Language</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(v) => form.setValue("language", v, { shouldDirty: true })}
              disabled={disabled}
            >
              <SelectTrigger id="org-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Classify organisations for search and reporting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-live="polite">
            {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                {canManage && (
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() =>
                      form.setValue(
                        "tags",
                        tags.filter((t) => t !== tag),
                        { shouldDirty: true },
                      )
                    }
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Input
                aria-label="New tag"
                placeholder="e.g. elite-youth"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social media</CardTitle>
          <CardDescription>Official channels shown on the organisation profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["twitter", "instagram", "facebook", "linkedin", "youtube"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`social-${key}`} className="capitalize">
                {key}
              </Label>
              <Input
                id={`social-${key}`}
                placeholder="https://…"
                disabled={disabled}
                {...form.register(`socials.${key}`)}
              />
              {form.formState.errors.socials?.[key] && (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.socials[key]?.message}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security &amp; branding</CardTitle>
          <CardDescription>Tenant-level policies and default member behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="setting-directory">Public directory listing</Label>
              <p className="text-sm text-muted-foreground">
                Show this organisation in the ecosystem directory.
              </p>
            </div>
            <Switch
              id="setting-directory"
              disabled={disabled}
              checked={form.watch("settings.allowPublicDirectory")}
              onCheckedChange={(v) =>
                form.setValue("settings.allowPublicDirectory", v, { shouldDirty: true })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="setting-mfa">Require MFA for administrators</Label>
              <p className="text-sm text-muted-foreground">
                Enforced at next sign-in for admin roles.
              </p>
            </div>
            <Switch
              id="setting-mfa"
              disabled={disabled}
              checked={form.watch("settings.requireMfaForAdmins")}
              onCheckedChange={(v) =>
                form.setValue("settings.requireMfaForAdmins", v, { shouldDirty: true })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="setting-role">Default member role</Label>
              <Select
                value={form.watch("settings.defaultMemberRole")}
                onValueChange={(v) =>
                  form.setValue("settings.defaultMemberRole", v as Role, { shouldDirty: true })
                }
                disabled={disabled}
              >
                <SelectTrigger id="setting-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-accent">Brand accent colour</Label>
              <Input
                id="setting-accent"
                type="color"
                className="h-10 w-24 p-1"
                disabled={disabled}
                {...form.register("settings.accentColor")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Which organisation events trigger member notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {(
            [
              ["memberInvites", "Member invitations"],
              ["roleChanges", "Role changes"],
              ["weeklyDigest", "Weekly digest"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`notif-${key}`}>{label}</Label>
              <Switch
                id={`notif-${key}`}
                disabled={disabled}
                checked={form.watch(`settings.notifications.${key}`)}
                onCheckedChange={(v) =>
                  form.setValue(`settings.notifications.${key}`, v, { shouldDirty: true })
                }
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={disabled}>
            {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

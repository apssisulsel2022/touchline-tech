import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth-provider";
import { audit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Touchline" },
      { name: "description", content: "Manage your Touchline personal information and preferences." },
      { property: "og:title", content: "Profile — Touchline" },
      { property: "og:description", content: "Update your name, avatar, language and notifications." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, refresh } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", session?.userId],
    enabled: Boolean(session?.userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: profile?.display_name ?? session?.displayName ?? "",
      language: profile?.language ?? "en",
      timezone: profile?.timezone ?? "UTC",
      theme: (profile?.theme as "system" | "light" | "dark") ?? "system",
      avatarUrl: profile?.avatar_url ?? null,
    },
  });

  const notifPrefs = (profile?.notification_prefs as
    | { email?: boolean; push?: boolean; digest?: string }
    | null) ?? { email: true, push: false, digest: "weekly" };

  const [emailNotif, setEmailNotif] = React.useState<boolean>(notifPrefs.email ?? true);
  const [pushNotif, setPushNotif] = React.useState<boolean>(notifPrefs.push ?? false);
  React.useEffect(() => {
    setEmailNotif(notifPrefs.email ?? true);
    setPushNotif(notifPrefs.push ?? false);
  }, [notifPrefs.email, notifPrefs.push]);

  const save = useMutation({
    mutationFn: async (values: ProfileInput) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: values.displayName,
          language: values.language,
          timezone: values.timezone,
          theme: values.theme,
          avatar_url: values.avatarUrl ?? null,
          notification_prefs: {
            email: emailNotif,
            push: pushNotif,
            digest: notifPrefs.digest ?? "weekly",
          },
        })
        .eq("id", session!.userId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("profile.updated");
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = form.handleSubmit((values) => save.mutate(values));
  const initials = (session?.displayName ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
        <PageHeader title="Profile" description="Manage your personal information and preferences." />
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <PageHeader
        title="Your profile"
        description="Personal information and workspace preferences."
        icon={User}
      />

      <form onSubmit={onSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>How you'll appear across Touchline.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-24">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled>
                  <Upload className="size-3.5" /> Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setValue("avatarUrl", null)}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Storage uploads arrive with Media module.</p>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" {...form.register("displayName")} />
                {form.formState.errors.displayName && (
                  <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session?.email ?? ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Language, timezone and theme.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={form.watch("language")}
                onValueChange={(v) => form.setValue("language", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...form.register("timezone")} placeholder="UTC" />
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={form.watch("theme")}
                onValueChange={(v) => form.setValue("theme", v as "system" | "light" | "dark")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose how we contact you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Email notifications</div>
                <div className="text-sm text-muted-foreground">Account activity, invitations, mentions.</div>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </label>
            <label className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Push notifications</div>
                <div className="text-sm text-muted-foreground">Real-time alerts on match day.</div>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_LABELS } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Touchline" },
      {
        name: "description",
        content: "Manage your Touchline profile, appearance preferences and workspace permissions.",
      },
      { property: "og:title", content: "Settings — Touchline" },
      {
        property: "og:description",
        content: "Profile, appearance and permission settings for your Touchline workspace.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, role, permissions } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Profile, appearance and access for this workspace."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
        </TabsList>


        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Identity details come from your sign-in provider once Cloud auth is connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                ["Display name", session?.displayName],
                ["Email", session?.email],
                ["Organisation", session?.organizationName],
                ["Role", role ? ROLE_LABELS[role] : "—"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground">{label}</Label>
                  <p className="truncate text-sm font-medium">{value ?? "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Applies instantly and is remembered on this device.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(["light", "dark", "system"] as const).map((option) => (
                <Button
                  key={option}
                  variant={theme === option ? "default" : "outline"}
                  onClick={() => setTheme(option)}
                  aria-pressed={theme === option}
                  className="capitalize"
                >
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Your permissions</CardTitle>
              <CardDescription>
                Derived from your role. Server-side policies remain the source of truth.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="font-mono text-xs">
                  {permission}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

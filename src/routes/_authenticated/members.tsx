import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MoreHorizontal, Search, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { invitationSchema, type InvitationInput } from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth-provider";
import { audit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Members — Touchline" },
      { name: "description", content: "Manage members, roles and invitations for your organisation." },
      { property: "og:title", content: "Members — Touchline" },
      { property: "og:description", content: "Invite, promote and remove members." },
    ],
  }),
  component: MembersPage,
});

type MemberRow = {
  id: string;
  role: Role;
  is_default: boolean;
  user_id: string;
  profiles: { display_name: string; email: string; avatar_url: string | null } | null;
};

type InvitationRow = {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "accepted" | "rejected" | "revoked" | "expired";
  created_at: string;
  expires_at: string;
};

function MembersPage() {
  const { session } = useAuth();
  const orgId = session?.organizationId ?? null;
  const canManage =
    !!session &&
    (session.isPlatformOwner ||
      ["federation", "association", "academy", "club"].includes(session.role));
  const [query, setQuery] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const members = useQuery({
    queryKey: ["members", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_memberships")
        .select("id,role,is_default,user_id,profiles(display_name,email,avatar_url)")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as MemberRow[];
    },
  });

  const invitations = useQuery({
    queryKey: ["invitations", orgId],
    enabled: !!orgId && canManage,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id,email,role,status,created_at,expires_at")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InvitationRow[];
    },
  });

  const filtered = React.useMemo(() => {
    const list = members.data ?? [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (m) =>
        m.profiles?.display_name?.toLowerCase().includes(q) ||
        m.profiles?.email?.toLowerCase().includes(q),
    );
  }, [members.data, query]);

  if (!orgId) {
    return (
      <main className="p-6">
        <EmptyState
          icon={Users}
          title="No active organisation"
          description="Select or create an organisation to manage members."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <PageHeader
        title="Members"
        description={`People with access to ${session?.organizationName}.`}
        icon={Users}
        actions={
          canManage ? (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="size-4" /> Invite member
                </Button>
              </DialogTrigger>
              <InviteDialog orgId={orgId} onClose={() => setInviteOpen(false)} />
            </Dialog>
          ) : null
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({members.data?.length ?? 0})</TabsTrigger>
          {canManage && (
            <TabsTrigger value="invitations">
              Invitations ({invitations.data?.filter((i) => i.status === "pending").length ?? 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members by name or email…"
                  className="pl-8"
                  aria-label="Search members"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {members.isLoading ? (
                <div className="grid place-items-center p-10 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No members yet"
                  description="Invite people to collaborate."
                />
              ) : (
                <ul className="divide-y">
                  {filtered.map((m) => (
                    <MemberRow key={m.id} orgId={orgId} member={m} canManage={canManage} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="invitations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending invitations</CardTitle>
                <CardDescription>
                  Invitations expire 7 days after being sent.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {invitations.isLoading ? (
                  <div className="grid place-items-center p-10 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (invitations.data ?? []).length === 0 ? (
                  <EmptyState
                    icon={Mail}
                    title="No invitations"
                    description="Invite a new member to see them listed here."
                  />
                ) : (
                  <ul className="divide-y">
                    {invitations.data!.map((inv) => (
                      <InvitationItem key={inv.id} inv={inv} orgId={orgId} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}

function MemberRow({
  orgId,
  member,
  canManage,
}: {
  orgId: string;
  member: MemberRow;
  canManage: boolean;
}) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const isSelf = member.user_id === session?.userId;
  const initials = (member.profiles?.display_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const changeRole = useMutation({
    mutationFn: async (role: Role) => {
      const { error } = await supabase
        .from("org_memberships")
        .update({ role })
        .eq("id", member.id);
      if (error) throw error;
    },
    onSuccess: async (_data, role) => {
      await audit("member.role_changed", {
        orgId,
        entity: "org_memberships",
        entityId: member.id,
        metadata: { user_id: member.user_id, role },
      });
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("org_memberships").delete().eq("id", member.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("member.removed", {
        orgId,
        entity: "org_memberships",
        entityId: member.id,
        metadata: { user_id: member.user_id },
      });
      toast.success("Member removed");
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Avatar className="size-9">
        <AvatarImage src={member.profiles?.avatar_url ?? undefined} alt="" />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {member.profiles?.display_name ?? "Unknown"}
          {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
        </div>
        <div className="truncate text-sm text-muted-foreground">{member.profiles?.email}</div>
      </div>
      {canManage && !isSelf ? (
        <Select
          value={member.role}
          onValueChange={(v) => changeRole.mutate(v as Role)}
          disabled={changeRole.isPending}
        >
          <SelectTrigger className="w-40">
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
      ) : (
        <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
      )}
      {canManage && !isSelf && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Member actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => remove.mutate()}
            >
              <Trash2 className="size-4" /> Remove from organisation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

function InvitationItem({ inv, orgId }: { inv: InvitationRow; orgId: string }) {
  const qc = useQueryClient();
  const revoke = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "revoked", responded_at: new Date().toISOString() })
        .eq("id", inv.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("invitation.revoked", { orgId, entity: "invitations", entityId: inv.id });
      toast.success("Invitation revoked");
      qc.invalidateQueries({ queryKey: ["invitations", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusColor = {
    pending: "secondary",
    accepted: "default",
    rejected: "destructive",
    revoked: "outline",
    expired: "outline",
  } as const;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Mail className="size-4 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{inv.email}</div>
        <div className="truncate text-xs text-muted-foreground">
          {ROLE_LABELS[inv.role]} · expires {new Date(inv.expires_at).toLocaleDateString()}
        </div>
      </div>
      <Badge variant={statusColor[inv.status]}>{inv.status}</Badge>
      {inv.status === "pending" && (
        <Button variant="ghost" size="sm" onClick={() => revoke.mutate()}>
          Revoke
        </Button>
      )}
    </li>
  );
}

function InviteDialog({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const form = useForm<InvitationInput>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: "", role: "coach" },
  });
  const { session } = useAuth();

  const invite = useMutation({
    mutationFn: async (values: InvitationInput) => {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          org_id: orgId,
          email: values.email,
          role: values.role,
          invited_by: session!.userId,
        })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, values) => {
      await audit("invitation.sent", {
        orgId,
        entity: "invitations",
        entityId: data?.id,
        metadata: { email: values.email, role: values.role },
      });
      toast.success(`Invitation sent to ${values.email}`);
      qc.invalidateQueries({ queryKey: ["invitations", orgId] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite a new member</DialogTitle>
        <DialogDescription>
          They will receive an invitation link. Invitations expire in 7 days.
        </DialogDescription>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((v) => invite.mutate(v))}
      >
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={form.watch("role")}
            onValueChange={(v) => form.setValue("role", v as Role)}
          >
            <SelectTrigger>
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
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={invite.isPending}>
            {invite.isPending && <Loader2 className="size-4 animate-spin" />}
            Send invitation
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

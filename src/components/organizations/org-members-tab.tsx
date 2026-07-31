import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Loader2, MoreHorizontal, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { orgMembersQuery, type OrganizationRow } from "@/lib/organizations";
import { invitationSchema, type InvitationInput } from "@/lib/validation/auth";
import { useAuth } from "@/providers/auth-provider";

export function OrgMembersTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const membersQuery = useQuery(orgMembersQuery(org.id));
  const [search, setSearch] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [transferTarget, setTransferTarget] = React.useState<string>("");

  const members = membersQuery.data ?? [];
  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return m.displayName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const inviteForm = useForm<InvitationInput>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: "", role: "coach" },
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["organization", org.id] });
  };

  const invite = useMutation({
    mutationFn: async (values: InvitationInput) => {
      const { error } = await supabase.from("invitations").insert({
        org_id: org.id,
        email: values.email,
        role: values.role,
        invited_by: session!.userId,
      });
      if (error) throw error;
    },
    onSuccess: async (_d, values) => {
      await audit("invitation.sent", {
        orgId: org.id,
        entity: "invitations",
        metadata: { email: values.email, role: values.role },
      });
      toast.success(`Invitation sent to ${values.email}`);
      inviteForm.reset({ email: "", role: "coach" });
      setInviteOpen(false);
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: Role }) => {
      const { error } = await supabase
        .from("org_memberships")
        .update({ role })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: async (_d, vars) => {
      await audit("member.role_changed", {
        orgId: org.id,
        entity: "org_memberships",
        entityId: vars.membershipId,
        metadata: { role: vars.role },
      });
      toast.success("Role updated");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase.from("org_memberships").delete().eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: async (_d, membershipId) => {
      await audit("member.removed", {
        orgId: org.id,
        entity: "org_memberships",
        entityId: membershipId,
      });
      toast.success("Member removed");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const transferOwnership = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("organizations")
        .update({ owner_user_id: userId })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async (_d, userId) => {
      await audit("org.ownership_transferred", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
        metadata: { newOwnerUserId: userId, previousOwnerUserId: org.owner_user_id },
      });
      toast.success("Ownership transferred");
      setTransferOpen(false);
      await invalidate();
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {members.length} {members.length === 1 ? "member" : "members"} in {org.name}
              </CardDescription>
            </div>
            {canManage && (
              <div className="flex flex-wrap gap-2">
                <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Crown className="size-4" aria-hidden />
                      Transfer ownership
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transfer ownership</DialogTitle>
                      <DialogDescription>
                        The selected member becomes the legal owner of {org.name}. You keep your
                        current role.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="transfer-target">New owner</Label>
                      <Select value={transferTarget} onValueChange={setTransferTarget}>
                        <SelectTrigger id="transfer-target">
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members
                            .filter((m) => m.userId !== org.owner_user_id)
                            .map((m) => (
                              <SelectItem key={m.userId} value={m.userId}>
                                {m.displayName} — {ROLE_LABELS[m.role as Role]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" type="button" onClick={() => setTransferOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={!transferTarget || transferOwnership.isPending}
                        onClick={() => transferOwnership.mutate(transferTarget)}
                      >
                        {transferOwnership.isPending && <Loader2 className="size-4 animate-spin" />}
                        Transfer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="size-4" aria-hidden />
                      Invite member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={inviteForm.handleSubmit((v) => invite.mutate(v))}>
                      <DialogHeader>
                        <DialogTitle>Invite a member</DialogTitle>
                        <DialogDescription>
                          They receive access to {org.name} with the selected role once accepted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email</Label>
                          <Input id="invite-email" type="email" {...inviteForm.register("email")} />
                          {inviteForm.formState.errors.email && (
                            <p role="alert" className="text-sm text-destructive">
                              {inviteForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-role">Role</Label>
                          <Select
                            value={inviteForm.watch("role")}
                            onValueChange={(v) => inviteForm.setValue("role", v as Role)}
                          >
                            <SelectTrigger id="invite-role">
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
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" type="button" onClick={() => setInviteOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={invite.isPending}>
                          {invite.isPending && <Loader2 className="size-4 animate-spin" />}
                          Send invitation
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="pl-9"
              placeholder="Search members by name or email"
              aria-label="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {membersQuery.isLoading && (
            <div className="space-y-2" aria-busy>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {membersQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              Could not load members. {(membersQuery.error as Error).message}
            </p>
          )}

          {!membersQuery.isLoading && filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title={search ? "No members match your search" : "No members yet"}
              description={
                search
                  ? "Try a different name or email address."
                  : "Invite coaches, staff and administrators to collaborate in this organisation."
              }
            />
          )}

          {filtered.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {filtered.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 p-3">
                  <Avatar className="size-9">
                    <AvatarImage src={m.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback>{m.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.displayName}
                      {m.userId === org.owner_user_id && (
                        <Badge variant="secondary" className="ml-2 gap-1">
                          <Crown className="size-3" aria-hidden />
                          Owner
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <ShieldCheck className="size-3" aria-hidden />
                    {ROLE_LABELS[m.role as Role]}
                  </Badge>
                  {!m.isActive && <Badge variant="destructive">Deactivated</Badge>}
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${m.displayName}`}>
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Change role</DropdownMenuLabel>
                        {ROLES.map((r) => (
                          <DropdownMenuItem
                            key={r}
                            disabled={r === m.role}
                            onSelect={() => changeRole.mutate({ membershipId: m.id, role: r })}
                          >
                            {ROLE_LABELS[r]}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={m.userId === org.owner_user_id}
                          onSelect={() => removeMember.mutate(m.id)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Remove from organisation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

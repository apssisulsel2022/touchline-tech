import * as React from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MailWarning, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";
import { audit } from "@/lib/audit";

type Invitation = {
  id: string;
  org_id: string;
  email: string;
  role: Role;
  status: string;
  expires_at: string;
  organizations: { name: string } | null;
};

export const Route = createFileRoute("/invitation/$token")({
  head: () => ({
    meta: [
      { title: "Accept invitation — Touchline" },
      { name: "description", content: "Accept or decline your invitation to a Touchline organisation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitationPage,
});

function InvitationPage() {
  const { token } = useParams({ from: "/invitation/$token" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session, isAuthenticated, isLoading, refresh } = useAuth();

  const inv = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id,org_id,email,role,status,expires_at,organizations(name)")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data as Invitation | null;
    },
  });

  const accept = useMutation({
    mutationFn: async () => {
      if (!inv.data || !session) throw new Error("Not ready");
      if (session.email.toLowerCase() !== inv.data.email.toLowerCase()) {
        throw new Error(`Sign in as ${inv.data.email} to accept this invitation.`);
      }
      const { error: memErr } = await supabase.from("org_memberships").insert({
        org_id: inv.data.org_id,
        user_id: session.userId,
        role: inv.data.role,
      });
      if (memErr && !memErr.message.includes("duplicate")) throw memErr;
      const { error: updErr } = await supabase
        .from("invitations")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", inv.data.id);
      if (updErr) throw updErr;
    },
    onSuccess: async () => {
      if (inv.data) {
        await audit("invitation.accepted", {
          orgId: inv.data.org_id,
          entity: "invitations",
          entityId: inv.data.id,
        });
      }
      toast.success("Invitation accepted");
      qc.invalidateQueries({ queryKey: ["invitation", token] });
      await refresh();
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async () => {
      if (!inv.data) return;
      const { error } = await supabase
        .from("invitations")
        .update({ status: "rejected", responded_at: new Date().toISOString() })
        .eq("id", inv.data.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      if (inv.data) {
        await audit("invitation.rejected", {
          orgId: inv.data.org_id,
          entity: "invitations",
          entityId: inv.data.id,
        });
      }
      toast.success("Invitation declined");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (inv.isLoading || isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!inv.data) return <StatusCard icon={XCircle} title="Invitation not found" description="This invitation link is invalid." />;
  if (inv.data.status !== "pending") {
    return <StatusCard icon={MailWarning} title="Invitation unavailable" description={`This invitation is ${inv.data.status}.`} />;
  }
  if (new Date(inv.data.expires_at).getTime() < Date.now()) {
    return <StatusCard icon={MailWarning} title="Invitation expired" description="Ask the sender to send a new one." />;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">You're invited</CardTitle>
          <CardDescription>
            {inv.data.organizations?.name ?? "An organisation"} has invited you to join Touchline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{inv.data.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="secondary">{ROLE_LABELS[inv.data.role]}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires</span>
            <span>{new Date(inv.data.expires_at).toLocaleString()}</span>
          </div>
          {!isAuthenticated && (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              You need to sign in as <span className="font-medium">{inv.data.email}</span> to accept this invitation.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Button className="w-full" onClick={() => accept.mutate()} disabled={accept.isPending}>
                {accept.isPending && <Loader2 className="size-4 animate-spin" />}
                <CheckCircle2 className="size-4" /> Accept invitation
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => reject.mutate()}
                disabled={reject.isPending}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() =>
                navigate({ to: "/auth", search: { redirect: `/invitation/${token}` } })
              }
            >
              Sign in to continue
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

function StatusCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4">
      <Card className="max-w-md text-center">
        <CardHeader className="items-center">
          <Icon className="size-10 text-muted-foreground" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}

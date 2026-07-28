import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CircleDot } from "lucide-react";

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
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Touchline" },
      {
        name: "description",
        content:
          "Sign in to the Touchline football ecosystem workspace for federations, clubs, academies and coaches.",
      },
      { property: "og:title", content: "Sign in — Touchline" },
      {
        property: "og:description",
        content: "Access your Touchline workspace.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("federation");
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    signIn({ email, role });
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"
          >
            <CircleDot className="size-5" />
          </span>
          <div>
            <CardTitle className="font-display text-2xl">Sign in to Touchline</CardTitle>
            <CardDescription>
              Shell preview: choose a role to explore the role-aware workspace. Cloud authentication
              replaces this screen when the identity module ships.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@federation.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-error" : undefined}
              />
              {error && (
                <p id="email-error" role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {ROLE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex-col items-stretch gap-3">
            <Button type="submit" className="w-full">
              Continue to workspace
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
              <Link
                to="/magic-link"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Use a magic link
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

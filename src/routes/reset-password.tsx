import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";

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

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Touchline" },
      { name: "description", content: "Set a new password for your Touchline account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Choose a new password — Touchline" },
      { property: "og:description", content: "Set a new password for your Touchline account." },
    ],
  }),
  component: ResetPasswordPage,
});

function scorePassword(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"][score] ?? "Weak";
  return { score, label };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const strength = scorePassword(password);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setDone(true);
    setTimeout(() => navigate({ to: "/auth", replace: true }), 1600);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"
          >
            {done ? <CheckCircle2 className="size-5" /> : <ShieldCheck className="size-5" />}
          </span>
          <div>
            <CardTitle className="font-display text-2xl">
              {done ? "Password updated" : "Choose a new password"}
            </CardTitle>
            <CardDescription>
              {done
                ? "You'll be redirected to sign in shortly."
                : "Use at least 8 characters. Mix letters, numbers, and symbols for a stronger password."}
            </CardDescription>
          </div>
        </CardHeader>

        {done ? (
          <CardFooter className="flex-col items-stretch gap-2">
            <Button asChild>
              <Link to="/auth">Go to sign in</Link>
            </Button>
          </CardFooter>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby="pw-strength"
                />
                <div
                  id="pw-strength"
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 tabular-nums">{strength.label}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "confirm-error" : undefined}
                />
                {error && (
                  <p id="confirm-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-6">
              <Button type="submit" className="w-full">
                Update password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}

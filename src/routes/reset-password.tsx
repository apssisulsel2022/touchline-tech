import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { supabase } from "@/integrations/supabase/client";
import { changePasswordSchema } from "@/lib/validation/auth";
import { audit } from "@/lib/audit";

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

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"][score] ?? "Weak";
  return { score, label };
}

type FormValues = z.infer<typeof changePasswordSchema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const [done, setDone] = React.useState(false);
  const strength = scorePassword(form.watch("password") ?? "");

  const onSubmit = form.handleSubmit(async ({ password }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    await audit("auth.password_changed");
    setDone(true);
    toast.success("Password updated");
    setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1200);
  });

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
                ? "You'll be redirected to your workspace shortly."
                : "Use at least 8 characters, with upper and lowercase letters and a number."}
            </CardDescription>
          </div>
        </CardHeader>

        {done ? (
          <CardFooter className="flex-col items-stretch gap-2">
            <Button asChild>
              <Link to="/dashboard">Continue</Link>
            </Button>
          </CardFooter>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("password")}
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
                {form.formState.errors.password && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirm")}
                />
                {form.formState.errors.confirm && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.confirm.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-6">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Update password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}

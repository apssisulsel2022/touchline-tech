import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
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
import { forgotSchema } from "@/lib/validation/auth";
import { audit } from "@/lib/audit";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Touchline" },
      { name: "description", content: "Request a password reset link for your Touchline account." },
      { property: "og:title", content: "Reset your password — Touchline" },
      { property: "og:description", content: "We'll email you a secure link to reset your password." },
    ],
  }),
  component: ForgotPasswordPage,
});

type FormValues = z.infer<typeof forgotSchema>;

function ForgotPasswordPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });
  const [sent, setSent] = React.useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Reveal nothing about account existence
    setSent(email);
    if (!error) {
      await audit("auth.password_reset_requested", { metadata: { email } });
    }
    toast.success("If the email exists, a reset link is on the way.");
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"
          >
            {sent ? <MailCheck className="size-5" /> : <KeyRound className="size-5" />}
          </span>
          <div>
            <CardTitle className="font-display text-2xl">
              {sent ? "Check your inbox" : "Reset your password"}
            </CardTitle>
            <CardDescription>
              {sent
                ? `If an account exists for ${sent}, we've sent a secure reset link. It expires in 60 minutes.`
                : "Enter the email associated with your Touchline account and we'll send you a reset link."}
            </CardDescription>
          </div>
        </CardHeader>

        {sent ? (
          <CardFooter className="flex-col items-stretch gap-2">
            <Button asChild variant="outline">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </CardFooter>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@federation.org"
                  {...form.register("email")}
                  aria-invalid={Boolean(form.formState.errors.email)}
                />
                {form.formState.errors.email && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-6 flex-col items-stretch gap-2">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Send reset link
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}

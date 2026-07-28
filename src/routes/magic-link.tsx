import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck, Sparkles } from "lucide-react";
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
import { magicLinkSchema } from "@/lib/validation/auth";
import { audit } from "@/lib/audit";

export const Route = createFileRoute("/magic-link")({
  head: () => ({
    meta: [
      { title: "Sign in with a magic link — Touchline" },
      { name: "description", content: "Get a one-time sign-in link emailed to your Touchline account." },
      { property: "og:title", content: "Sign in with a magic link — Touchline" },
      { property: "og:description", content: "Passwordless sign in for your Touchline workspace." },
    ],
  }),
  component: MagicLinkPage,
});

type FormValues = z.infer<typeof magicLinkSchema>;

function MagicLinkPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });
  const [sent, setSent] = React.useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await audit("auth.magic_link_requested", { metadata: { email } });
    setSent(email);
    toast.success("Magic link sent");
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"
          >
            {sent ? <MailCheck className="size-5" /> : <Sparkles className="size-5" />}
          </span>
          <div>
            <CardTitle className="font-display text-2xl">
              {sent ? "Magic link on the way" : "Sign in with a magic link"}
            </CardTitle>
            <CardDescription>
              {sent
                ? `We've sent a one-time sign-in link to ${sent}. It expires in 15 minutes.`
                : "Skip the password. We'll email you a secure one-time link to sign in."}
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
                Email me a link
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Use password instead</Link>
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}

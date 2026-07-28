import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck, Sparkles } from "lucide-react";

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

function MagicLinkPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSent(true);
  }

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
                ? `We've sent a one-time sign-in link to ${email}. It expires in 15 minutes.`
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
            </CardContent>
            <CardFooter className="mt-6 flex-col items-stretch gap-2">
              <Button type="submit" className="w-full">
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

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, MailCheck } from "lucide-react";

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

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

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
            {sent ? <MailCheck className="size-5" /> : <KeyRound className="size-5" />}
          </span>
          <div>
            <CardTitle className="font-display text-2xl">
              {sent ? "Check your inbox" : "Reset your password"}
            </CardTitle>
            <CardDescription>
              {sent
                ? `If an account exists for ${email}, we've sent a secure reset link. The link expires in 30 minutes.`
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

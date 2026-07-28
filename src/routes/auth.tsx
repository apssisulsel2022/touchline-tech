import * as React from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDot, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validation/auth";
import { audit } from "@/lib/audit";

const authSearchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Touchline" },
      {
        name: "description",
        content:
          "Sign in or create an account for Touchline — the digital operating system for football federations, clubs and academies.",
      },
      { property: "og:title", content: "Sign in — Touchline" },
      { property: "og:description", content: "Access your Touchline workspace." },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(href: string | undefined): string {
  if (!href) return "/dashboard";
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const redirectTo = safeRedirect(search.redirect);
  const [tab, setTab] = React.useState<"signin" | "signup">("signin");

  React.useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo, replace: true });
    });
  }, [navigate, redirectTo]);

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
            <CardTitle className="font-display text-2xl">Welcome to Touchline</CardTitle>
            <CardDescription>
              Sign in or create an account to access your football workspace.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-4">
              <SignInForm redirectTo={redirectTo} />
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <GoogleButton />
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-1 text-sm">
          <div className="flex items-center justify-between">
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
      </Card>
    </main>
  );
}

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const navigate = useNavigate();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      const message = error.message.toLowerCase().includes("invalid")
        ? "Invalid email or password."
        : error.message;
      toast.error(message);
      return;
    }
    await audit("auth.login", { metadata: { method: "password" } });
    toast.success("Signed in");
    navigate({ to: redirectTo, replace: true });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
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
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
          aria-invalid={Boolean(form.formState.errors.password)}
        />
        {form.formState.errors.password && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={form.watch("remember")}
          onCheckedChange={(v) => form.setValue("remember", Boolean(v))}
        />
        <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
          Remember me on this device
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

function SignUpForm() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirm: "",
      acceptTerms: true as unknown as true,
    },
  });
  const [sent, setSent] = React.useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: values.displayName },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("registered")) {
        toast.error("An account with this email already exists.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    setSent(values.email);
    toast.success("Account created — check your email to verify.");
  });

  if (sent) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-muted-foreground">
          We sent a verification link to <span className="font-medium">{sent}</span>. Click it to
          activate your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" autoComplete="name" {...form.register("displayName")} />
        {form.formState.errors.displayName && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.displayName.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
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
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          toast.error("Google sign-in failed. Please try again.");
          setLoading(false);
          return;
        }
        if (!result.redirected) {
          await audit("auth.login", { metadata: { method: "google" } });
        }
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.4z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8C4 20.5 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.9 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.2C1.4 8.6 1 10.3 1 12s.4 3.4 1.2 4.9l3.7-2.8z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3 .5 4.2 1.6l3.1-3.1C17.5 2.2 15 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z"
      />
    </svg>
  );
}

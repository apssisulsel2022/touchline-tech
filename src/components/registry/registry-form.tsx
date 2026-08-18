import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Search, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRegistryIdentitySchema, type CreateRegistryIdentityInput, registryDefinitionEnum, registryIdentityStatusEnum, registryScopeEnum, verificationLevelEnum } from "@/lib/validation/registry";

export function RegistryForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<CreateRegistryIdentityInput>({
    resolver: zodResolver(createRegistryIdentitySchema),
    defaultValues: {
      displayName: "",
      registryDefinition: "player",
      verificationLevel: "pending",
      status: "draft",
      scope: "global",
      countryCode: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    toast.success(`Registry identity ready for ${values.displayName}`);
    onSuccess?.();
  });

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <CardTitle>Create registry identity</CardTitle>
        </div>
        <CardDescription>
          Capture the canonical identity for a person or entity in the Global Registry Foundation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" placeholder="Amina Yusuf" {...form.register("displayName")} />
            {form.formState.errors.displayName ? (
              <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Registry definition</Label>
            <Select value={form.watch("registryDefinition")} onValueChange={(value) => form.setValue("registryDefinition", value as CreateRegistryIdentityInput["registryDefinition"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {registryDefinitionEnum.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Verification level</Label>
            <Select value={form.watch("verificationLevel")} onValueChange={(value) => form.setValue("verificationLevel", value as CreateRegistryIdentityInput["verificationLevel"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {verificationLevelEnum.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as CreateRegistryIdentityInput["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {registryIdentityStatusEnum.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={form.watch("scope")} onValueChange={(value) => form.setValue("scope", value as CreateRegistryIdentityInput["scope"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {registryScopeEnum.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Country code</Label>
            <Input id="countryCode" placeholder="NG" maxLength={2} {...form.register("countryCode")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Capture governance context or review notes" {...form.register("notes")} />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <PlusCircle className="mr-2 size-4" />}
              Create identity
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

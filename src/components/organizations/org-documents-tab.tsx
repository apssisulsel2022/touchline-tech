import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { orgDocumentsQuery, type OrganizationRow } from "@/lib/organizations";
import { orgDocumentSchema, type OrgDocumentInput } from "@/lib/validation/org";
import { useAuth } from "@/providers/auth-provider";

const CATEGORIES = ["general", "governance", "legal", "financial", "medical", "affiliate"] as const;

export function OrgDocumentsTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const documents = useQuery(orgDocumentsQuery(org.id));
  const [open, setOpen] = React.useState(false);

  const form = useForm<OrgDocumentInput>({
    resolver: zodResolver(orgDocumentSchema),
    defaultValues: { title: "", category: "general", fileUrl: "" },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["organization", org.id, "documents"] });

  const add = useMutation({
    mutationFn: async (values: OrgDocumentInput) => {
      const { error } = await supabase.from("org_documents").insert({
        org_id: org.id,
        title: values.title,
        category: values.category,
        file_url: values.fileUrl,
        file_type: values.fileType ?? null,
        uploaded_by: session!.userId,
      });
      if (error) throw error;
    },
    onSuccess: async (_d, values) => {
      await audit("org.document_added", {
        orgId: org.id,
        entity: "org_documents",
        metadata: { title: values.title, category: values.category },
      });
      toast.success("Document linked");
      form.reset({ title: "", category: "general", fileUrl: "" });
      setOpen(false);
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_d, id) => {
      await audit("org.document_removed", { orgId: org.id, entity: "org_documents", entityId: id });
      toast.success("Document removed");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = documents.data ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Statutes, licences and affiliation records for {org.name}.
            </CardDescription>
          </div>
          {canManage && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" aria-hidden />
                  Add document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={form.handleSubmit((v) => add.mutate(v))}>
                  <DialogHeader>
                    <DialogTitle>Link a document</DialogTitle>
                    <DialogDescription>
                      Reference an existing secure file location for this organisation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-title">Title</Label>
                      <Input id="doc-title" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p role="alert" className="text-sm text-destructive">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-category">Category</Label>
                      <Select
                        value={form.watch("category")}
                        onValueChange={(v) =>
                          form.setValue("category", v as OrgDocumentInput["category"])
                        }
                      >
                        <SelectTrigger id="doc-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c} className="capitalize">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-url">File URL</Label>
                      <Input id="doc-url" placeholder="https://…" {...form.register("fileUrl")} />
                      {form.formState.errors.fileUrl && (
                        <p role="alert" className="text-sm text-destructive">
                          {form.formState.errors.fileUrl.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={add.isPending}>
                      {add.isPending && <Loader2 className="size-4 animate-spin" />}
                      Save document
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.isLoading && <Skeleton className="h-20 w-full" />}
        {documents.isError && (
          <p role="alert" className="text-sm text-destructive">
            Could not load documents. {(documents.error as Error).message}
          </p>
        )}
        {!documents.isLoading && rows.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Attach statutes, licences or affiliation letters so administrators can find them fast."
          />
        )}
        {rows.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {rows.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-3 p-3">
                <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {doc.title}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {doc.category}
                </Badge>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${doc.title}`}
                    onClick={() => remove.mutate(doc.id)}
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Images, Loader2, Plus, Trash2, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { ReadOnlyNotice, SectionState, useAcademyCrud } from "@/components/academy/academy-section";
import { mediaAlbumsQuery, mediaItemsQuery } from "@/lib/academy";
import {
  MEDIA_KINDS,
  mediaAlbumSchema,
  mediaItemSchema,
  type MediaAlbumInput,
  type MediaItemInput,
  type MediaKind,
} from "@/lib/validation/academy";

const NONE = "none";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Academy gallery: albums plus photo and video items. */
export function AcademyMediaTab({ orgId, canManage }: { orgId: string; canManage: boolean }) {
  const albums = useQuery(mediaAlbumsQuery(orgId));
  const items = useQuery(mediaItemsQuery(orgId));

  const albumCrud = useAcademyCrud({
    orgId,
    table: "media_albums",
    section: "albums",
    entity: "Album",
    actions: {
      create: "academy.album_created",
      update: "academy.album_created",
      remove: "academy.album_deleted",
    },
  });
  const itemCrud = useAcademyCrud({
    orgId,
    table: "media_items",
    section: "media",
    entity: "Media item",
    actions: {
      create: "academy.media_added",
      update: "academy.media_added",
      remove: "academy.media_removed",
    },
  });

  const [albumOpen, setAlbumOpen] = React.useState(false);
  const [itemOpen, setItemOpen] = React.useState(false);
  const [albumFilter, setAlbumFilter] = React.useState("all");

  const albumForm = useForm<MediaAlbumInput>({
    resolver: zodResolver(mediaAlbumSchema),
    defaultValues: { title: "", description: "", cover_url: "" },
  });
  const itemForm = useForm<MediaItemInput>({
    resolver: zodResolver(mediaItemSchema),
    defaultValues: { kind: "photo", url: "", caption: "", album_id: NONE },
  });

  const submitAlbum = albumForm.handleSubmit(async (values) => {
    await albumCrud.create.mutateAsync(values);
    albumForm.reset({ title: "", description: "", cover_url: "" });
    setAlbumOpen(false);
  });

  const submitItem = itemForm.handleSubmit(async (values) => {
    await itemCrud.create.mutateAsync({ ...values, album_id: values.album_id ?? null });
    itemForm.reset({ kind: "photo", url: "", caption: "", album_id: NONE });
    setItemOpen(false);
  });

  const visibleItems = (items.data ?? []).filter(
    (item) => albumFilter === "all" || item.album_id === albumFilter,
  );

  return (
    <div className="space-y-8">
      <ReadOnlyNotice canManage={canManage} />

      <section className="space-y-4" aria-labelledby="albums-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="albums-heading" className="text-lg font-semibold">
              Albums
            </h2>
            <p className="text-sm text-muted-foreground">
              Group academy photos and videos by event, season or squad.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setAlbumOpen(true)}>
              <Plus className="mr-2 size-4" aria-hidden />
              New album
            </Button>
          )}
        </div>

        <SectionState
          isLoading={albums.isLoading}
          error={albums.error}
          isEmpty={(albums.data ?? []).length === 0}
          emptyIcon={Images}
          emptyTitle="No albums yet"
          emptyDescription="Create an album to organise match-day photos, graduation ceremonies and training highlights."
          emptyAction={canManage ? <Button onClick={() => setAlbumOpen(true)}>Create album</Button> : undefined}
          onRetry={() => void albums.refetch()}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(albums.data ?? []).map((album) => (
              <Card key={album.id} className="overflow-hidden">
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={`${album.title} cover`}
                    loading="lazy"
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div aria-hidden className="grid h-32 w-full place-items-center bg-muted">
                    <Images className="size-6 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="truncate text-base">{album.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {album.description ?? "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="outline">
                    {(items.data ?? []).filter((i) => i.album_id === album.id).length} items
                  </Badge>
                  {canManage && (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${album.title}`}
                      onClick={() => albumCrud.remove.mutate(album.id)}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionState>
      </section>

      <section className="space-y-4" aria-labelledby="gallery-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 id="gallery-heading" className="text-lg font-semibold">
              Gallery
            </h2>
            <Label htmlFor="album-filter" className="text-xs">
              Filter by album
            </Label>
            <Select value={albumFilter} onValueChange={setAlbumFilter}>
              <SelectTrigger id="album-filter" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All media</SelectItem>
                {(albums.data ?? []).map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canManage && (
            <Button variant="outline" onClick={() => setItemOpen(true)}>
              <Plus className="mr-2 size-4" aria-hidden />
              Add media
            </Button>
          )}
        </div>

        <SectionState
          isLoading={items.isLoading}
          error={items.error}
          isEmpty={visibleItems.length === 0}
          emptyIcon={Images}
          emptyTitle="No media in this view"
          emptyDescription="Link photos or videos by URL to build the academy gallery."
          onRetry={() => void items.refetch()}
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <Card className="overflow-hidden">
                  {item.kind === "photo" ? (
                    <img
                      src={item.url}
                      alt={item.caption ?? "Academy photo"}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="grid h-40 w-full place-items-center bg-muted text-sm underline underline-offset-2"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="size-4" aria-hidden />
                        Watch video
                      </span>
                    </a>
                  )}
                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <p className="truncate text-sm">{item.caption ?? "Untitled"}</p>
                    {canManage && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Remove media item"
                        onClick={() => itemCrud.remove.mutate(item.id)}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionState>
      </section>

      <Dialog open={albumOpen} onOpenChange={setAlbumOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New album</DialogTitle>
            <DialogDescription>Albums group related academy media.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitAlbum} noValidate>
            <div className="space-y-2">
              <Label htmlFor="album-title">Title</Label>
              <Input id="album-title" {...albumForm.register("title")} />
              <ErrorText message={albumForm.formState.errors.title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="album-cover">Cover image URL</Label>
              <Input id="album-cover" placeholder="https://…" {...albumForm.register("cover_url")} />
              <ErrorText message={albumForm.formState.errors.cover_url?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="album-description">Description</Label>
              <Textarea id="album-description" rows={3} {...albumForm.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAlbumOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={albumCrud.create.isPending}>
                {albumCrud.create.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Create album
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add media</DialogTitle>
            <DialogDescription>Link a photo or video to the academy gallery.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitItem} noValidate>
            <div className="space-y-2">
              <Label htmlFor="media-kind">Type</Label>
              <Select
                value={itemForm.watch("kind")}
                onValueChange={(value) => itemForm.setValue("kind", value as MediaKind)}
              >
                <SelectTrigger id="media-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kind === "photo" ? "Photo" : "Video"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-album">Album</Label>
              <Select
                value={itemForm.watch("album_id") ?? NONE}
                onValueChange={(value) => itemForm.setValue("album_id", value)}
              >
                <SelectTrigger id="media-album">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unfiled</SelectItem>
                  {(albums.data ?? []).map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-url">URL</Label>
              <Input id="media-url" placeholder="https://…" {...itemForm.register("url")} />
              <ErrorText message={itemForm.formState.errors.url?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-caption">Caption</Label>
              <Input id="media-caption" {...itemForm.register("caption")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setItemOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={itemCrud.create.isPending}>
                {itemCrud.create.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Add media
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

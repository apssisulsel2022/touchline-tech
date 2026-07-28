import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** State the consequence, the scope, and whether it can be undone. */
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className={cn(
              destructive &&
                buttonVariants({ variant: "destructive" }),
            )}
            onClick={async (event) => {
              event.preventDefault();
              setPending(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Imperative helper: `const confirm = useConfirm()` then `await confirm({...})`. */
export function useConfirmDialog() {
  const [state, setState] = React.useState<Omit<ConfirmDialogProps, "open" | "onOpenChange"> | null>(
    null,
  );
  const resolver = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback(
    (options: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setState({ ...options, onConfirm: () => resolve(true) });
      }),
    [],
  );

  const dialog = state ? (
    <ConfirmDialog
      {...state}
      open
      onOpenChange={(open) => {
        if (!open) {
          resolver.current?.(false);
          setState(null);
        }
      }}
    />
  ) : null;

  return { confirm, dialog };
}

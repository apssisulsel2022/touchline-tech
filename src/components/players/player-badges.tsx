import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_VERIFICATION_LABELS,
  PLAYER_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  type DocumentVerification,
  type PlayerStatus,
  type RegistrationStatus,
} from "@/lib/validation/players";

const PLAYER_STATUS_CLASSES: Record<PlayerStatus, string> = {
  draft: "border-transparent bg-muted text-muted-foreground",
  active: "border-transparent bg-primary-subtle text-primary",
  inactive: "border-transparent bg-muted text-muted-foreground",
  injured: "border-transparent bg-destructive/10 text-destructive",
  suspended: "border-transparent bg-destructive/10 text-destructive",
  transferred: "border-transparent bg-accent text-accent-foreground",
  archived: "border-transparent bg-accent text-accent-foreground",
};

export function PlayerStatusBadge({
  status,
  className,
}: {
  status: PlayerStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(PLAYER_STATUS_CLASSES[status], className)}>
      <span className="sr-only">Status: </span>
      {PLAYER_STATUS_LABELS[status]}
    </Badge>
  );
}

const REGISTRATION_STATUS_CLASSES: Record<RegistrationStatus, string> = {
  draft: "border-transparent bg-muted text-muted-foreground",
  pending: "border-transparent bg-accent text-accent-foreground",
  approved: "border-transparent bg-primary-subtle text-primary",
  rejected: "border-transparent bg-destructive/10 text-destructive",
  expired: "border-transparent bg-destructive/10 text-destructive",
  withdrawn: "border-transparent bg-muted text-muted-foreground",
};

export function RegistrationStatusBadge({
  status,
  className,
}: {
  status: RegistrationStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(REGISTRATION_STATUS_CLASSES[status], className)}>
      <span className="sr-only">Registration status: </span>
      {REGISTRATION_STATUS_LABELS[status]}
    </Badge>
  );
}

const VERIFICATION_CLASSES: Record<DocumentVerification, string> = {
  pending: "border-transparent bg-accent text-accent-foreground",
  verified: "border-transparent bg-primary-subtle text-primary",
  rejected: "border-transparent bg-destructive/10 text-destructive",
  expired: "border-transparent bg-destructive/10 text-destructive",
};

export function DocumentVerificationBadge({
  verification,
  className,
}: {
  verification: DocumentVerification;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(VERIFICATION_CLASSES[verification], className)}>
      <span className="sr-only">Verification: </span>
      {DOCUMENT_VERIFICATION_LABELS[verification]}
    </Badge>
  );
}

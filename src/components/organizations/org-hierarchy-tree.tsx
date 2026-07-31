import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrgStatusBadge, OrgTypeBadge } from "@/components/organizations/org-badges";
import type { OrgTreeNode } from "@/lib/organizations";
import type { OrgStatus, OrgType } from "@/lib/validation/org";
import { cn } from "@/lib/utils";

function TreeItem({ node, activeId }: { node: OrgTreeNode; activeId?: string }) {
  const [open, setOpen] = React.useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60",
          node.org.id === activeId && "bg-primary-subtle",
        )}
      >
        {hasChildren ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            aria-expanded={open}
            aria-label={open ? `Collapse ${node.org.name}` : `Expand ${node.org.name}`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}
        <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Link
          to="/organisations/$orgId"
          params={{ orgId: node.org.id }}
          className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
        >
          {node.org.name}
        </Link>
        <OrgTypeBadge type={node.org.type as OrgType} className="hidden sm:inline-flex" />
        <OrgStatusBadge status={node.org.status as OrgStatus} />
      </div>
      {hasChildren && open && (
        <ul className="ml-4 border-l pl-2" role="group">
          {node.children.map((child) => (
            <TreeItem key={child.org.id} node={child} activeId={activeId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function OrgHierarchyTree({
  nodes,
  activeId,
}: {
  nodes: OrgTreeNode[];
  activeId?: string;
}) {
  return (
    <ul role="tree" aria-label="Organisation hierarchy" className="space-y-0.5">
      {nodes.map((node) => (
        <TreeItem key={node.org.id} node={node} activeId={activeId} />
      ))}
    </ul>
  );
}

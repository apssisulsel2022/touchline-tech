import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RegistryRow = {
  id: string;
  displayName: string;
  registryDefinition: string;
  verificationLevel: string;
  status: string;
  scope: string;
};

export function RegistryTable({ rows }: { rows: RegistryRow[] }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Registry identities</CardTitle>
        <CardDescription>Browse the latest registry records and their governance state.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.displayName}</TableCell>
                  <TableCell>{row.registryDefinition}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.verificationLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "default" : "outline"}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm", row.scope === "global" ? "text-primary" : "text-muted-foreground")}>{row.scope}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { moveHistoryApi, type MoveHistoryItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const typeColors: Record<string, string> = {
  IN: "bg-info/20 text-info border-info/30",
  OUT: "bg-destructive/20 text-destructive border-destructive/30",
  TRANSFER: "bg-primary/20 text-primary border-primary/30",
  ADJUSTMENT: "bg-warning/20 text-warning border-warning/30",
};

const typeLabels: Record<string, string> = {
  IN: "Receipt",
  OUT: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};

export default function MoveHistory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["move-history", typeFilter],
    queryFn: () =>
      moveHistoryApi.getAll({
        moveType: typeFilter !== "all" ? typeFilter : undefined,
        limit: 100,
      }),
  });

  const moves: MoveHistoryItem[] = data?.moves || [];

  const filtered = moves.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.product?.name?.toLowerCase().includes(s) ||
      m.reference?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Move History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Complete stock movement ledger</p>
      </div>

      <GlassCard delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product or reference..."
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IN">Receipt</SelectItem>
              <SelectItem value="OUT">Delivery</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard delay={0.1} className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id} className="border-border/20">
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {new Date(m.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{m.product?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] capitalize border", typeColors[m.moveType] || "")}>
                        {typeLabels[m.moveType] || m.moveType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.fromLocation?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.toLocation?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={m.quantity > 0 ? "text-primary" : "text-destructive"}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{m.reference}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
}

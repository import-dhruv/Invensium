import { GlassCard } from "@/components/GlassCard";
import { dashboardApi, moveHistoryApi, type DashboardKPIs, type MoveHistoryItem } from "@/lib/api";
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const chartData = [
  { day: "Mon", moves: 12 }, { day: "Tue", moves: 19 }, { day: "Wed", moves: 8 },
  { day: "Thu", moves: 24 }, { day: "Fri", moves: 15 }, { day: "Sat", moves: 6 }, { day: "Sun", moves: 3 },
];

const typeColors: Record<string, string> = {
  IN: "bg-info/20 text-info border-info/30",
  OUT: "bg-destructive/20 text-destructive border-destructive/30",
  TRANSFER: "bg-primary/20 text-primary border-primary/30",
  ADJUSTMENT: "bg-warning/20 text-warning border-warning/30",
};

const typeLabels: Record<string, string> = {
  IN: "receipt",
  OUT: "delivery",
  TRANSFER: "transfer",
  ADJUSTMENT: "adjustment",
};

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery<DashboardKPIs>({
    queryKey: ["dashboard-kpis"],
    queryFn: dashboardApi.getKPIs,
  });

  const { data: movesData, isLoading: movesLoading } = useQuery({
    queryKey: ["recent-moves"],
    queryFn: () => moveHistoryApi.getAll({ limit: 5 }),
  });

  const kpiCards = kpis
    ? [
        { label: "Total Products", value: kpis.totalProducts, icon: Package, color: "text-primary" },
        { label: "Low Stock Alerts", value: kpis.lowStockItems, icon: AlertTriangle, color: "text-warning" },
        { label: "Pending Receipts", value: kpis.pendingReceipts.total, icon: ArrowDownToLine, color: "text-info" },
        { label: "Pending Deliveries", value: kpis.pendingDeliveries.total, icon: ArrowUpFromLine, color: "text-destructive" },
        { label: "Transfers", value: kpis.scheduledTransfers, icon: ArrowLeftRight, color: "text-secondary-foreground" },
      ]
    : [];

  const moves: MoveHistoryItem[] = movesData?.moves || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Inventory overview & real-time metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpisLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <GlassCard key={i} delay={i * 0.05}>
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </GlassCard>
            ))
          : kpiCards.map((kpi, i) => (
              <GlassCard key={kpi.label} delay={i * 0.05} glow={kpi.label === "Low Stock Alerts" && kpi.value > 0}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                  </div>
                  <kpi.icon className={cn("h-5 w-5 mt-1", kpi.color)} />
                </div>
              </GlassCard>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <GlassCard className="lg:col-span-2" delay={0.25}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Stock Movement Telemetry</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142,71%,45%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="hsl(240,5%,55%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(240,8%,8%)",
                  border: "1px solid hsl(240,6%,18%)",
                  borderRadius: "8px",
                  color: "hsl(0,0%,93%)",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="moves" stroke="hsl(142,71%,45%)" fill="url(#greenGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Low Stock Placeholder */}
        <GlassCard delay={0.3}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Low Stock Alerts</h2>
          </div>
          <div className="space-y-3">
            {kpis && kpis.lowStockItems > 0 ? (
              <p className="text-sm text-warning font-semibold">{kpis.lowStockItems} items below minimum stock</p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">All stock levels are healthy</p>
            )}
            {kpis && kpis.outOfStockItems > 0 && (
              <p className="text-sm text-destructive font-semibold">{kpis.outOfStockItems} items out of stock</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Moves */}
      <GlassCard delay={0.35}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Recent Moves</h2>
        </div>
        {movesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : moves.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No stock movements yet</p>
        ) : (
          <div className="space-y-2">
            {moves.map((move) => (
              <div key={move.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("text-[10px] capitalize border", typeColors[move.moveType] || "")}>
                    {typeLabels[move.moveType] || move.moveType}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{move.product?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {move.fromLocation?.name || "—"} → {move.toLocation?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">
                    {move.quantity > 0 ? "+" : ""}{move.quantity}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(move.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

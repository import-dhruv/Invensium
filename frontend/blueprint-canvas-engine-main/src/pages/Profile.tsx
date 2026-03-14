import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roleLabel = user?.role === "INVENTORY_MANAGER" ? "Inventory Manager" : "Warehouse Staff";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>

      <GlassCard glow>
        <div className="flex items-center gap-5 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: user?.email || "—" },
            { icon: Shield, label: "Role", value: roleLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <Button
        variant="outline"
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}

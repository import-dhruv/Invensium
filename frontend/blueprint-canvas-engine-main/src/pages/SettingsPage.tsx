import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { warehouseApi, locationApi, type Warehouse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon, Plus, MapPin, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const { data: warehouses, isLoading } = useQuery<Warehouse[]>({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.getAll,
  });

  const createWhMutation = useMutation({
    mutationFn: (data: { name: string; address?: string }) => warehouseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created");
      setWhDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const createLocMutation = useMutation({
    mutationFn: (data: { name: string; warehouseId: string }) => locationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Location created");
      setLocDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Warehouse & location management</p>
        </div>
        <Dialog open={whDialogOpen} onOpenChange={setWhDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Warehouse</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 bg-card">
            <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createWhMutation.mutate({
                name: fd.get("name") as string,
                address: (fd.get("address") as string) || undefined,
              });
            }} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Address</Label><Input name="address" placeholder="Optional" /></div>
              <Button type="submit" className="w-full" disabled={createWhMutation.isPending}>
                {createWhMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Warehouse
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses?.map((wh, i) => (
            <GlassCard key={wh.id} delay={i * 0.08} glow>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <WarehouseIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{wh.name}</h3>
                  {wh.address && <p className="text-xs text-muted-foreground">{wh.address}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {wh.locations?.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-background/30 border border-border/20">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{loc.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/40">location</Badge>
                  </div>
                ))}
                {(!wh.locations || wh.locations.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-2">No locations yet</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-1 text-xs"
                onClick={() => { setSelectedWarehouseId(wh.id); setLocDialogOpen(true); }}
              >
                <Plus className="h-3 w-3" /> Add Location
              </Button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Location Dialog */}
      <Dialog open={locDialogOpen} onOpenChange={setLocDialogOpen}>
        <DialogContent className="glass-card border-border/50 bg-card">
          <DialogHeader><DialogTitle>New Location</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createLocMutation.mutate({
              name: fd.get("name") as string,
              warehouseId: selectedWarehouseId,
            });
          }} className="space-y-4">
            <div className="space-y-2"><Label>Location Name</Label><Input name="name" required placeholder="Zone A - Shelf 1" /></div>
            <Button type="submit" className="w-full" disabled={createLocMutation.isPending}>
              {createLocMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Location
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

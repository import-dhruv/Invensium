import { useState } from "react";
import { useParams } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import {
  receiptApi, deliveryApi, transferApi, adjustmentApi, locationApi, productApi,
  type OperationItem, type Location, type Product,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, XCircle, Clock, FileCheck, Loader2, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  receipts: "Receipts",
  deliveries: "Delivery Orders",
  transfers: "Internal Transfers",
  adjustments: "Stock Adjustments",
};

const statusConfig: Record<string, { icon: typeof Clock; class: string }> = {
  DRAFT: { icon: Clock, class: "bg-muted/40 text-muted-foreground border-border/50" },
  WAITING: { icon: Clock, class: "bg-warning/20 text-warning border-warning/30" },
  READY: { icon: FileCheck, class: "bg-info/20 text-info border-info/30" },
  DONE: { icon: CheckCircle2, class: "bg-primary/20 text-primary border-primary/30" },
  CANCELLED: { icon: XCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
};

function getApiForType(type: string) {
  switch (type) {
    case "receipts": return receiptApi;
    case "deliveries": return deliveryApi;
    case "transfers": return transferApi;
    case "adjustments": return adjustmentApi;
    default: return receiptApi;
  }
}

function getItemsFromResponse(type: string, data: any): OperationItem[] {
  if (!data) return [];
  if (type === "receipts") return data.receipts || [];
  if (type === "deliveries") return data.deliveries || [];
  if (type === "transfers") return data.transfers || [];
  if (type === "adjustments") return data.adjustments || [];
  return [];
}

interface LineItemDialogProps {
  operation: OperationItem;
  type: string;
  onClose: () => void;
}

function LineItemDialog({ operation, type, onClose }: LineItemDialogProps) {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getAll(),
  });

  const products = productsData?.products || [];

  const addLineMutation = useMutation({
    mutationFn: (data: { productId: string; quantityOrdered: number }) => {
      const api = getApiForType(type);
      return api.addLine(operation.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", type] });
      toast.success("Line item added");
      setSelectedProduct("");
      setQuantity("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) return;
    
    addLineMutation.mutate({
      productId: selectedProduct,
      quantityOrdered: parseFloat(quantity),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Line Items - {operation.reference}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Line Items */}
          <div>
            <h3 className="font-medium mb-3">Current Items</h3>
            {operation.lines && operation.lines.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operation.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{line.product.sku}</TableCell>
                        <TableCell className="text-right">
                          {line.quantityOrdered || line.quantity || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No items added yet</p>
            )}
          </div>

          {/* Add New Line Item */}
          {operation.status === "DRAFT" && (
            <div>
              <h3 className="font-medium mb-3">Add Item</h3>
              <form onSubmit={handleAddLine} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={addLineMutation.isPending}>
                  {addLineMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Item
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Operations() {
  const { type = "receipts" } = useParams<{ type: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationItem | null>(null);

  const api = getApiForType(type);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["operations", type],
    queryFn: () => api.getAll(),
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => locationApi.getAll(),
  });

  const operations = getItemsFromResponse(type, responseData);

  const createMutation = useMutation({
    mutationFn: (formData: any) => api.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", type] });
      toast.success("Created successfully");
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", type] });
      toast.success("Updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => api.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", type] });
      toast.success("Validated successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (type === "transfers") {
      createMutation.mutate({
        fromLocationId: fd.get("fromLocationId") as string,
        toLocationId: fd.get("toLocationId") as string,
        notes: (fd.get("notes") as string) || undefined,
      });
    } else if (type === "adjustments") {
      createMutation.mutate({
        locationId: fd.get("locationId") as string,
        reason: (fd.get("reason") as string) || undefined,
      });
    } else {
      createMutation.mutate({
        locationId: fd.get("locationId") as string,
        supplier: type === "receipts" ? (fd.get("partner") as string) || undefined : undefined,
        customer: type === "deliveries" ? (fd.get("partner") as string) || undefined : undefined,
        notes: (fd.get("notes") as string) || undefined,
      } as any);
    }
  };

  const getLocationName = (op: OperationItem) => {
    if (op.location) return `${op.location.warehouse?.name || ""} / ${op.location.name}`;
    return "—";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{typeLabels[type]}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage {type} operations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New {typeLabels[type]?.replace(/s$/, "").replace(/ie$/, "y")}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle>Create {typeLabels[type]?.replace(/s$/, "").replace(/ie$/, "y")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {type === "transfers" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Location</Label>
                    <select name="fromLocationId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select...</option>
                      {locations?.map((l) => <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>To Location</Label>
                    <select name="toLocationId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select...</option>
                      {locations?.map((l) => <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <select name="locationId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    {locations?.map((l) => <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>)}
                  </select>
                </div>
              )}
              {(type === "receipts" || type === "deliveries") && (
                <div className="space-y-2">
                  <Label>{type === "receipts" ? "Supplier" : "Customer"}</Label>
                  <Input name="partner" placeholder="Partner name" />
                </div>
              )}
              {type === "adjustments" ? (
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input name="reason" placeholder="Reason for adjustment" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input name="notes" placeholder="Optional notes" />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard delay={0.1} className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                {(type === "receipts" || type === "deliveries") && <TableHead>Partner</TableHead>}
                {type === "transfers" ? (
                  <>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                  </>
                ) : (
                  <TableHead>Location</TableHead>
                )}
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    No {type} found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                operations.map((op) => {
                  const sc = statusConfig[op.status] || statusConfig.DRAFT;
                  const StatusIcon = sc.icon;
                  return (
                    <TableRow key={op.id} className="border-border/20">
                      <TableCell className="font-mono text-sm font-semibold">{op.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(op.createdAt).toLocaleDateString()}
                      </TableCell>
                      {(type === "receipts" || type === "deliveries") && (
                        <TableCell className="text-sm">{op.supplier || op.customer || "—"}</TableCell>
                      )}
                      {type === "transfers" ? (
                        <>
                          <TableCell className="text-sm text-muted-foreground">
                            {op.fromLocation ? `${op.fromLocation.warehouse?.name || ""} / ${op.fromLocation.name}` : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {op.toLocation ? `${op.toLocation.warehouse?.name || ""} / ${op.toLocation.name}` : "—"}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="text-sm text-muted-foreground">
                          {getLocationName(op)}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => setSelectedOperation(op)}
                        >
                          <Eye className="h-3 w-3" />
                          {op.lines?.length || 0} item{(op.lines?.length || 0) !== 1 ? "s" : ""}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1 text-[10px] border capitalize", sc.class)}>
                          <StatusIcon className="h-3 w-3" />
                          {op.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {op.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-info"
                              onClick={() => updateMutation.mutate({ id: op.id, data: { status: "READY" } })}
                            >
                              Confirm
                            </Button>
                          )}
                          {(op.status === "READY" || op.status === "WAITING") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary"
                              onClick={() => validateMutation.mutate(op.id)}
                            >
                              Validate
                            </Button>
                          )}
                          {op.status !== "DONE" && op.status !== "CANCELLED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive"
                              onClick={() => updateMutation.mutate({ id: op.id, data: { status: "CANCELLED" } })}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>

      {/* Line Items Dialog */}
      {selectedOperation && (
        <LineItemDialog
          operation={selectedOperation}
          type={type}
          onClose={() => setSelectedOperation(null)}
        />
      )}
    </div>
  );
}

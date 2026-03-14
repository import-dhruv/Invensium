import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { 
  productApi, categoryApi, locationApi, 
  type Product, type Category, type CreateProductData, type ReorderRule, type CreateReorderRuleData, type Location 
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, Edit2, Loader2, AlertTriangle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const UOM_OPTIONS = ["UNIT", "KG", "GRAM", "LITER", "METER", "BOX", "PACK", "DOZEN", "TON"];

interface ProductDetailDialogProps {
  product: Product;
  onClose: () => void;
}

function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => locationApi.getAll(),
  });

  const { data: reorderRules } = useQuery<ReorderRule[]>({
    queryKey: ["reorder-rules", product.id],
    queryFn: () => productApi.getReorderRules(product.id),
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: CreateReorderRuleData) => productApi.createReorderRule(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reorder-rules", product.id] });
      toast.success("Reorder rule created");
      setSelectedLocation("");
      setMinQuantity("");
      setMaxQuantity("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => productApi.deleteReorderRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reorder-rules", product.id] });
      toast.success("Reorder rule deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !minQuantity || !maxQuantity) return;
    
    createRuleMutation.mutate({
      locationId: selectedLocation,
      minQuantity: parseFloat(minQuantity),
      maxQuantity: parseFloat(maxQuantity),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 bg-card max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name} ({product.sku})
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stock" className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Stock by Location</h3>
              {product.stockLevels && product.stockLevels.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.stockLevels.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell>{stock.location?.warehouse?.name || "—"}</TableCell>
                          <TableCell>{stock.location?.name || "—"}</TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={cn(stock.quantity <= 0 ? "text-destructive" : "text-primary")}>
                              {stock.quantity}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No stock found</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reorder" className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Current Reorder Rules</h3>
              {reorderRules && reorderRules.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Min Qty</TableHead>
                        <TableHead className="text-right">Max Qty</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reorderRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.location.warehouse.name}</TableCell>
                          <TableCell>{rule.location.name}</TableCell>
                          <TableCell className="text-right font-mono">{rule.minQuantity}</TableCell>
                          <TableCell className="text-right font-mono">{rule.maxQuantity}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No reorder rules configured</p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-3">Add Reorder Rule</h3>
              <form onSubmit={handleCreateRule} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select location...</option>
                      {locations?.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.warehouse?.name} / {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(e.target.value)}
                      placeholder="Minimum stock"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(e.target.value)}
                      placeholder="Maximum stock"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={createRuleMutation.isPending}>
                  {createRuleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Rule
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });
  const categories = categoriesData || [];

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search, catFilter],
    queryFn: () =>
      productApi.getAll({
        search: search || undefined,
        categoryId: catFilter !== "all" ? catFilter : undefined,
      }),
  });
  const products = productsData?.products || [];

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductData> }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setDialogOpen(false);
      setEditProduct(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: productDetail } = useQuery({
    queryKey: ["product-detail", selectedProduct?.id],
    queryFn: () => selectedProduct ? productApi.getById(selectedProduct.id) : null,
    enabled: !!selectedProduct,
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: CreateProductData = {
      name: fd.get("name") as string,
      sku: fd.get("sku") as string,
      categoryId: (fd.get("categoryId") as string) || undefined,
      uom: fd.get("uom") as string,
      description: (fd.get("description") as string) || undefined,
    };

    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your inventory catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle>{editProduct ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" defaultValue={editProduct?.name} required />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input name="sku" defaultValue={editProduct?.sku} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    name="categoryId"
                    defaultValue={editProduct?.categoryId || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Unit of Measure</Label>
                  <select
                    name="uom"
                    defaultValue={editProduct?.uom || "UNIT"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {UOM_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Input name="description" defaultValue={editProduct?.description || ""} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <GlassCard delay={0.05}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard delay={0.1} className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Rules</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No products found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="border-border/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium text-left"
                          onClick={() => setSelectedProduct(p)}
                        >
                          {p.name}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-border/50">
                        {p.category?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.uom}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono font-bold", p.totalStock <= 0 ? "text-destructive" : "text-primary")}>
                        {p.totalStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <Settings className="h-3 w-3" />
                        Manage
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditProduct(p); setDialogOpen(true); }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>

      {/* Product Detail Dialog */}
      {selectedProduct && productDetail && (
        <ProductDetailDialog
          product={productDetail}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

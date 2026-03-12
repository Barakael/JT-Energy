import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search, Loader2, Trash2, Pencil, Tag, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset,
  useAssetCategories, useCreateAssetCategory, useUpdateAssetCategory, useDeleteAssetCategory,
  type Asset, type AssetCategory,
} from "@/hooks/api/useAssets";
import { useStations } from "@/hooks/api/useStations";

const Assets = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | undefined>();

  const { data: assets = [], isLoading } = useAssets(search || undefined, filterCategory);
  const { data: categories = [] } = useAssetCategories();
  const { data: stations = [] } = useStations();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const createCategory = useCreateAssetCategory();
  const updateCategory = useUpdateAssetCategory();
  const deleteCategory = useDeleteAssetCategory();

  // Asset dialog
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState({
    asset_tag: "", name: "", category_id: "", serial_number: "",
    purchase_date: "", purchase_price: "", warranty_expiry: "",
    station_id: "", description: "", quantity: "",
  });

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AssetCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  // ─── Asset handlers ────────────────────────────────────────────
  const openAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({
      asset_tag: "", name: "", category_id: "", serial_number: "",
      purchase_date: "", purchase_price: "", warranty_expiry: "",
      station_id: "", description: "", quantity: "",
    });
    setAssetDialogOpen(true);
  };

  const openEditAsset = (a: Asset) => {
    setEditingAsset(a);
    setAssetForm({
      asset_tag: a.asset_tag,
      name: a.name,
      category_id: a.category_id ? String(a.category_id) : "",
      serial_number: a.serial_number ?? "",
      purchase_date: a.purchase_date ?? "",
      purchase_price: a.purchase_price != null ? String(a.purchase_price) : "",
      warranty_expiry: a.warranty_expiry ?? "",
      station_id: a.station_id ? String(a.station_id) : "",
      description: a.description ?? "",
      quantity: String(a.quantity ?? 1),
    });
    setAssetDialogOpen(true);
  };

  const handleSaveAsset = async () => {
    if (!assetForm.asset_tag || !assetForm.name) {
      toast({ title: "Asset Tag and Name are required", variant: "destructive" });
      return;
    }
    const payload: Record<string, unknown> = {
      asset_tag: assetForm.asset_tag,
      name: assetForm.name,
      category_id: assetForm.category_id ? Number(assetForm.category_id) : null,
      serial_number: assetForm.serial_number || null,
      purchase_date: assetForm.purchase_date || null,
      purchase_price: assetForm.purchase_price ? Number(assetForm.purchase_price) : null,
      warranty_expiry: assetForm.warranty_expiry || null,
      station_id: assetForm.station_id ? Number(assetForm.station_id) : null,
      description: assetForm.description || null,
      quantity: assetForm.quantity ? Number(assetForm.quantity) : 1,
    };
    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({ id: editingAsset.id, ...payload });
        toast({ title: "Asset updated" });
      } else {
        await createAsset.mutateAsync(payload);
        toast({ title: "Asset created" });
      }
      setAssetDialogOpen(false);
    } catch {
      toast({ title: "Failed to save asset", variant: "destructive" });
    }
  };

  const handleDeleteAsset = async (id: number) => {
    try {
      await deleteAsset.mutateAsync(id);
      toast({ title: "Asset deleted" });
    } catch {
      toast({ title: "Failed to delete asset", variant: "destructive" });
    }
  };

  // ─── Category handlers ─────────────────────────────────────────
  const openAddCategory = () => {
    setEditingCat(null);
    setCatForm({ name: "", description: "" });
    setCatDialogOpen(true);
  };

  const openEditCategory = (c: AssetCategory) => {
    setEditingCat(c);
    setCatForm({ name: c.name, description: c.description ?? "" });
    setCatDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    try {
      if (editingCat) {
        await updateCategory.mutateAsync({ id: editingCat.id, ...catForm });
        toast({ title: "Category updated" });
      } else {
        await createCategory.mutateAsync(catForm);
        toast({ title: "Category created" });
      }
      setCatDialogOpen(false);
    } catch {
      toast({ title: "Failed to save category", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Category deleted" });
    } catch {
      toast({ title: "Failed to delete category", variant: "destructive" });
    }
  };

  const totalValue = assets.reduce((s, a) => s + (Number(a.purchase_price) || 0), 0);
  const totalQuantity = assets.reduce((s, a) => s + (a.quantity ?? 1), 0);

  return (
    <HRLayout
      title="Asset Management"
      subtitle="Track and manage company assets, equipment, and inventory"
      actions={<Button onClick={openAddAsset}><Plus className="h-4 w-4 mr-2" /> Add Asset</Button>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-blue-500/10"><Package className="h-5 w-5 text-blue-500" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{assets.length}</p><p className="text-sm text-muted-foreground">Assets Recorded</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-purple-500/10"><FolderOpen className="h-5 w-5 text-purple-500" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{categories.length}</p><p className="text-sm text-muted-foreground">Categories</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-green-500/10"><Tag className="h-5 w-5 text-green-500" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{new Set(assets.map((a) => a.station_name).filter(Boolean)).size}</p><p className="text-sm text-muted-foreground">Stations</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-yellow-500/10"><Package className="h-5 w-5 text-yellow-500" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{totalQuantity.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-xs text-muted-foreground mt-0.5">Value: {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* ─── Assets Tab ─── */}
        <TabsContent value="assets">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tag, name, or serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterCategory ? String(filterCategory) : "all"}
                onValueChange={(v) => setFilterCategory(v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No assets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Asset Tag</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Serial #</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Station</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Purchase Date</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Warranty</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => {
                      const isExpired = asset.warranty_expiry && new Date(asset.warranty_expiry) < new Date();
                      return (
                        <tr key={asset.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-card-foreground">{asset.asset_tag}</td>
                          <td className="px-4 py-3 text-card-foreground font-medium">{asset.name}</td>
                          <td className="px-4 py-3">{asset.category_name ? <StatusBadge label={asset.category_name} variant="default" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{asset.serial_number || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{asset.station_name || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{asset.quantity ?? 1}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{asset.purchase_price != null ? Number(asset.purchase_price).toLocaleString() : "—"}</td>
                          <td className="px-4 py-3">
                            {asset.warranty_expiry ? (
                              <StatusBadge
                                label={new Date(asset.warranty_expiry).toLocaleDateString()}
                                variant={isExpired ? "destructive" : "success"}
                              />
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAsset(asset)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteAsset(asset.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Categories Tab ─── */}
        <TabsContent value="categories">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-card-foreground">Asset Categories</h2>
              <Button size="sm" onClick={openAddCategory}><Plus className="h-3.5 w-3.5 mr-1" /> Add Category</Button>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No categories yet. Create one to get started.</div>
            ) : (
              <div className="divide-y divide-border">
                {categories.map((cat) => (
                  <div key={cat.id} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div>
                      <p className="font-medium text-card-foreground">{cat.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                        <span className="text-xs text-muted-foreground">{cat.assets_count ?? 0} assets</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCategory(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Add/Edit Asset Dialog ─── */}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Tag *</Label>
                <Input value={assetForm.asset_tag} onChange={(e) => setAssetForm({ ...assetForm, asset_tag: e.target.value })} placeholder="e.g. AST-001" />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="e.g. Dell Latitude 5540" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={assetForm.category_id} onValueChange={(v) => setAssetForm({ ...assetForm, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">No categories yet — go to the Categories tab to create one.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input value={assetForm.serial_number} onChange={(e) => setAssetForm({ ...assetForm, serial_number: e.target.value })} placeholder="e.g. SN-ABC12345" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={assetForm.purchase_date} onChange={(e) => setAssetForm({ ...assetForm, purchase_date: e.target.value })} />
              </div>
              
            <div className=" gap-4">
              <div className="space-y-2">
                <Label>Quantity <span className="text-muted-foreground">(default 1)</span></Label>
                <Input type="number" min="1" value={assetForm.quantity} onChange={(e) => setAssetForm({ ...assetForm, quantity: e.target.value })} placeholder="1" />
              </div>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warranty Expiry <span className="text-muted-foreground">(optional)</span></Label>
                <Input type="date" value={assetForm.warranty_expiry} onChange={(e) => setAssetForm({ ...assetForm, warranty_expiry: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Station</Label>
                <Select value={assetForm.station_id} onValueChange={(v) => setAssetForm({ ...assetForm, station_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>
                    {stations.filter((s) => s.active !== false).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.location ? ` — ${s.location}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} rows={3} placeholder="Additional notes about this asset..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAsset} disabled={createAsset.isPending || updateAsset.isPending}>
              {(createAsset.isPending || updateAsset.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAsset ? "Update" : "Add Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Category Dialog ─── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Laptops" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={createCategory.isPending || updateCategory.isPending}>
              {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCat ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Assets;

import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStations, useCreateStation, useUpdateStation, useDeleteStation } from "@/hooks/api/useStations";
import type { Station } from "@/hooks/api/useStations";

const emptyForm = { name: "", code: "", description: "", location: "", active: true };

const Stations = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const { data: stations = [], isLoading } = useStations();
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();
  const deleteStation = useDeleteStation();

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (station: Station) => {
    setEditing(station);
    setForm({
      name: station.name,
      code: station.code,
      description: station.description ?? "",
      location: station.location ?? "",
      active: station.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast({ title: "Please fill required fields (name, code)", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateStation.mutateAsync({ id: editing.id, ...form });
        toast({ title: "Station updated" });
      } else {
        await createStation.mutateAsync(form);
        toast({ title: "Station added" });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Operation failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteStation.mutateAsync(id); toast({ title: "Station deleted" }); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  return (
    <HRLayout
      title="Stations"
      subtitle="Manage company locations and facilities"
      actions={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Station
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stations.map((station) => (
          <div key={station.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-card-foreground">{station.name}</p>
                    <StatusBadge label={station.active ? "Active" : "Inactive"} variant={station.active ? "success" : "default"} />
                  </div>
                  <p className="text-xs text-muted-foreground">Code: {station.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(station)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(station.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{station.description}</p>
            {station.location && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Location:</span> {station.location}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" /> {station.departments ?? 0} departments
            </div>
          </div>
        ))}
      </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Station" : "Add Station"}</DialogTitle>
            <DialogDescription>Fill in the station details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Station Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., HQ, NYC, SF" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State/Country" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createStation.isPending || updateStation.isPending}>
              {(createStation.isPending || updateStation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save Changes" : "Add Station"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Stations;

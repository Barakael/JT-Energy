import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Users, Building2, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/api/useDepartments";
import { useStations } from "@/hooks/api/useStations";
import type { Department } from "@/hooks/api/useDepartments";

const emptyForm = { name: "", code: "", description: "", positions: "", station_id: "__none__", active: true };

const Departments = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const { data: departments = [], isLoading } = useDepartments();
  const { data: stations = [] } = useStations();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      code: dept.code ?? "",
      description: dept.description ?? "",
      positions: dept.positions ?? "",
      station_id: dept.station_id ? dept.station_id.toString() : "__none__",
      active: dept.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast({ title: "Please fill required fields (name, code)", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        positions: form.positions,
        station_id: form.station_id && form.station_id !== "__none__" ? Number(form.station_id) : null,
        active: form.active,
      };
      if (editing) {
        await updateDept.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Department updated" });
      } else {
        await createDept.mutateAsync(payload);
        toast({ title: "Department added" });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Operation failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteDept.mutateAsync(id); toast({ title: "Department removed" }); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  return (
    <HRLayout
      title="Departments"
      subtitle="Manage organizational structure"
      actions={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Department
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-secondary">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-card-foreground">{dept.name}</p>
                    <StatusBadge label={dept.active ? "Active" : "Inactive"} variant={dept.active ? "success" : "default"} />
                  </div>
                  <p className="text-xs text-muted-foreground">Code: {dept.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(dept)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(dept.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{dept.description}</p>
            {dept.station && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" /> {dept.station}
              </div>
            )}
            {dept.positions && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Positions:</span> {dept.positions}
              </p>
            )}
            {dept.head && <p className="text-xs text-muted-foreground mb-2">Head: {dept.head}</p>}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {dept.employees ?? 0} employees
            </div>
          </div>
        ))}
      </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>Fill in the department details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., ENG, HR, MKT" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Station</Label>
              <Select value={form.station_id} onValueChange={(v) => setForm({ ...form, station_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {stations.filter(s => s.active).map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name} ({station.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Positions (comma-separated)</Label>
              <Input
                value={form.positions}
                onChange={(e) => setForm({ ...form, positions: e.target.value })}
                placeholder="Manager, Analyst, Coordinator"
              />
              <p className="text-xs text-muted-foreground">Note: Head of Department is auto-managed</p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createDept.isPending || updateDept.isPending}>
              {(createDept.isPending || updateDept.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Save Changes" : "Add Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Departments;

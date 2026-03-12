import { useState, useMemo } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Mail, Phone, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  type Employee,
} from "@/hooks/api/useEmployees";
import { useDepartments } from "@/hooks/api/useDepartments";
import { useStations } from "@/hooks/api/useStations";

const emptyForm = { name: "", role: "", dept: "", station: "", status: "Active", active: true, email: "", phone: "" };

const Employees = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useEmployees(search || undefined);
  const { data: departments = [] } = useDepartments();
  const { data: stations = [] } = useStations();
  const createEmp   = useCreateEmployee();
  const updateEmp   = useUpdateEmployee();
  const deleteEmp   = useDeleteEmployee();

  // Parse positions from selected department
  const availableRoles = useMemo(() => {
    const dept = departments.find((d) => d.name === form.dept);
    if (!dept || !dept.positions) return [];
    return dept.positions.split(",").map((p) => p.trim()).filter(Boolean);
  }, [form.dept, departments]);

  const selectedDeptStation = useMemo(() => {
    const dept = departments.find((d) => d.name === form.dept);
    return dept?.station_id ? String(dept.station_id) : null;
  }, [form.dept, departments]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      role: emp.role ?? "",
      dept: emp.dept,
      station: "", // Will be auto-filled from department
      status: emp.status,
      active: emp.status === "Active" || emp.status === "Probation",
      email: emp.email,
      phone: emp.phone ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.dept || !form.email) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Find department id from name
    const dept = departments.find((d) => d.name === form.dept);

    const payload = {
      name:          form.name,
      email:         form.email,
      title:         form.role,
      status:        form.active ? form.status : "Inactive",
      phone:         form.phone,
      department_id: dept?.id,
    };

    try {
      if (editingId !== null) {
        await updateEmp.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Employee updated successfully" });
      } else {
        await createEmp.mutateAsync({ ...payload, password: "password", password_confirmation: "password" });
        toast({ title: "Employee added successfully" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to save employee", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEmp.mutateAsync(id);
      toast({ title: "Employee removed" });
    } catch {
      toast({ title: "Failed to delete employee", variant: "destructive" });
    }
  };

  return (
    <HRLayout
      title="Employees"
      subtitle="Manage your workforce directory"
      actions={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                    {emp.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role}</p>
                  </div>
                </div>
                <StatusBadge label={emp.status} variant={emp.status === "Active" ? "success" : emp.status === "Probation" ? "warning" : "destructive"} />
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>{emp.dept}{emp.joined ? ` · Joined ${emp.joined}` : ""}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                    {emp.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {emp.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(emp)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(emp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {employees.length === 0 && !isLoading && (
            <p className="col-span-3 text-center py-10 text-sm text-muted-foreground">No employees found.</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogDescription>Fill in the employee details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={form.dept} onValueChange={(v) => setForm({ ...form, dept: v, role: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d.active).map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role / Title *</Label>
                {availableRoles.length > 0 ? (
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Enter role/title" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Station</Label>
                <Input
                  value={selectedDeptStation ? stations.find(s => s.id === Number(selectedDeptStation))?.name || "—" : "—"}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Auto-assigned from department</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                    <SelectItem value="Exiting">Exiting</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <div className="flex items-center h-10">
                  <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
                  <span className="ml-2 text-sm text-muted-foreground">{form.active ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createEmp.isPending || updateEmp.isPending}>
              {(createEmp.isPending || updateEmp.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId !== null ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Employees;


import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Landmark, Users, Search, Pencil, Trash2, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBankTaxDetails, useCreateBankTax, useUpdateBankTax, useDeleteBankTax, BankTaxRecord } from "@/hooks/api/useBankTax";
import { useEmployees } from "@/hooks/api/useEmployees";

const BankTax = () => {
  const [search, setSearch] = useState("");
  const { data: records = [], isLoading } = useBankTaxDetails(search || undefined);
  const { data: employees = [] } = useEmployees();
  const createBankTax = useCreateBankTax();
  const updateBankTax = useUpdateBankTax();
  const deleteBankTax = useDeleteBankTax();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankTaxRecord | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());

  const toggleReveal = (id: number) =>
    setRevealedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const [form, setForm] = useState({
    user_id: "",
    bank_name: "",
    account_name: "",
    account_type: "",
    account_number: "",
  });

  const existingUserIds = new Set(records.map((r) => r.user_id));
  const availableEmployees = employees.filter((e) => !existingUserIds.has(e.id));

  const openAdd = () => {
    setEditing(null);
    setForm({ user_id: "", bank_name: "", account_name: "", account_type: "", account_number: "" });
    setShowAccount(false);
    setDialogOpen(true);
  };

  const openEdit = (record: BankTaxRecord) => {
    setEditing(record);
    setForm({
      user_id: String(record.user_id),
      bank_name: record.bank_name || "",
      account_name: record.account_name || "",
      account_type: record.account_type || "",
      account_number: record.account_number || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing && !form.user_id) {
      toast({ title: "Please select an employee", variant: "destructive" });
      return;
    }

    const payload: Record<string, unknown> = {
      bank_name: form.bank_name,
      account_name: form.account_name,
      account_type: form.account_type,
    };

    if (form.account_number) payload.account_number = form.account_number;
    if (!editing) payload.user_id = Number(form.user_id);

    try {
      if (editing) {
        await updateBankTax.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Bank & tax details updated" });
      } else {
        await createBankTax.mutateAsync(payload);
        toast({ title: "Bank & tax details added" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to save bank & tax details", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBankTax.mutateAsync(id);
      toast({ title: "Record deleted" });
    } catch {
      toast({ title: "Failed to delete record", variant: "destructive" });
    }
  };

  const totalRecords = records.length;
  const totalEmployees = employees.length;
  const missingRecords = totalEmployees - totalRecords;

  return (
    <HRLayout
      title="Bank & Tax Details"
      subtitle="Manage employee payment and tax information"
      actions={<Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Record</Button>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/10"><Landmark className="h-5 w-5 text-success" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{totalRecords}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-info/10"><Users className="h-5 w-5 text-info" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{missingRecords > 0 ? missingRecords : 0}</p>
            <p className="text-sm text-muted-foreground">Missing Records</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-card-foreground">Employee Payment Details</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No bank & tax records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Bank Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Account Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Account</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-card-foreground">{rec.user_name}</p>
                      <p className="text-xs text-muted-foreground">{rec.user_email}</p>
                    </td>
                    <td className="px-5 py-3 text-card-foreground">{rec.bank_name || "—"}</td>
                    <td className="px-5 py-3 text-card-foreground">{rec.account_name || "—"}</td>
                    <td className="px-5 py-3 text-card-foreground">{rec.account_type || "—"}</td>
                    <td className="px-5 py-3 text-card-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <span>{revealedRows.has(rec.id) ? (rec.account_number || "—") : (rec.masked_account || "—")}</span>
                        {rec.account_number && (
                          <button
                            type="button"
                            onClick={() => toggleReveal(rec.id)}
                            className="text-muted-foreground hover:text-foreground ml-1"
                          >
                            {revealedRows.has(rec.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rec)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(rec.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Bank & Tax Details" : "Add Bank & Tax Details"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>{emp.name} — {emp.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. Barclays" />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="e.g. John Smith" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <div className="relative">
                  <Input
                    type={showAccount ? "text" : "password"}
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                    placeholder={"Enter account number"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccount((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAccount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createBankTax.isPending || updateBankTax.isPending}>
              {(createBankTax.isPending || updateBankTax.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default BankTax;

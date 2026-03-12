import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Receipt, Loader2, Plus, Pencil, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePayslips, useCreatePayslip, useUpdatePayslip, useDeletePayslip, downloadPayslip, Payslip } from "@/hooks/api/usePayslips";
import { useEmployees } from "@/hooks/api/useEmployees";
import { useAuth } from "@/contexts/AuthContext";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const emptyForm = {
  user_id: "", period: "", quarter: "", year: String(CURRENT_YEAR),
  period_start: "", period_end: "", gross: "", deductions: "", net: "",
  status: "Pending", authorized_by: "", date_issued: "",
};

const Payslips = () => {
  const { isHRAdmin } = useAuth();
  const { data: payslips = [], isLoading } = usePayslips();
  const { data: employees = [] } = useEmployees();
  const createPayslip = useCreatePayslip();
  const updatePayslip = useUpdatePayslip();
  const deletePayslip = useDeletePayslip();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payslip | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Group by employee+year for quarterly statement view
  const grouped = payslips.reduce<Record<string, Payslip[]>>((acc, p) => {
    const key = `${p.employee ?? "Unknown"}_${p.year ?? "—"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const totalGross = payslips.reduce((s, p) => s + Number(p.gross), 0);
  const totalDeductions = payslips.reduce((s, p) => s + Number(p.deductions), 0);
  const totalNet = payslips.reduce((s, p) => s + Number(p.net), 0);

  const handleFormChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    if (field === "gross" || field === "deductions") {
      const g = parseFloat(updated.gross) || 0;
      const d = parseFloat(updated.deductions) || 0;
      updated.net = String(Math.max(0, g - d));
    }
    if ((field === "quarter" || field === "year") && updated.quarter && updated.year) {
      const q = field === "quarter" ? value : updated.quarter;
      const y = field === "year" ? value : updated.year;
      const map: Record<string, { s: string; e: string }> = {
        Q1: { s: `${y}-01-01`, e: `${y}-03-31` },
        Q2: { s: `${y}-04-01`, e: `${y}-06-30` },
        Q3: { s: `${y}-07-01`, e: `${y}-09-30` },
        Q4: { s: `${y}-10-01`, e: `${y}-12-31` },
      };
      if (map[q]) { updated.period_start = map[q].s; updated.period_end = map[q].e; updated.period = `${q} ${y}`; }
    }
    setForm(updated);
  };

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (p: Payslip) => {
    setEditing(p);
    setForm({
      user_id: "", period: p.period, quarter: p.quarter ?? "", year: p.year ? String(p.year) : String(CURRENT_YEAR),
      period_start: p.period_start ?? "", period_end: p.period_end ?? "",
      gross: String(p.gross), deductions: String(p.deductions), net: String(p.net),
      status: p.status, authorized_by: p.authorized_by ?? "", date_issued: p.date_issued ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing && !form.user_id) { toast({ title: "Please select an employee", variant: "destructive" }); return; }
    if (!form.period || !form.gross) { toast({ title: "Period and Gross Pay are required", variant: "destructive" }); return; }
    const payload: Record<string, unknown> = {
      period: form.period, quarter: form.quarter || null, year: form.year ? Number(form.year) : null,
      period_start: form.period_start || null, period_end: form.period_end || null,
      gross: parseFloat(form.gross) || 0, deductions: parseFloat(form.deductions) || 0, net: parseFloat(form.net) || 0,
      status: form.status, authorized_by: form.authorized_by || null, date_issued: form.date_issued || null,
    };
    if (!editing) payload.user_id = Number(form.user_id);
    try {
      if (editing) { await updatePayslip.mutateAsync({ id: editing.id, ...payload }); toast({ title: "Payslip updated" }); }
      else { await createPayslip.mutateAsync(payload); toast({ title: "Payslip created" }); }
      setDialogOpen(false);
    } catch { toast({ title: "Failed to save payslip", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    try { await deletePayslip.mutateAsync(id); toast({ title: "Payslip deleted" }); }
    catch { toast({ title: "Failed to delete payslip", variant: "destructive" }); }
  };

  return (
    <HRLayout
      title="Payslips"
      subtitle={isHRAdmin ? "Manage employee payroll statements" : "View and download your pay statements"}
      actions={isHRAdmin ? <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Payslip</Button> : undefined}
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Gross Pay</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{payslips.length ? `$${totalGross.toLocaleString()}` : "—"}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Deductions</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{payslips.length ? `$${totalDeductions.toLocaleString()}` : "—"}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm border-l-4 border-l-accent">
          <p className="text-sm text-muted-foreground">Total Net Pay</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{payslips.length ? `$${totalNet.toLocaleString()}` : "—"}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : payslips.length === 0 ? (
        <div className="bg-card rounded-lg border border-border shadow-sm text-center py-16 text-muted-foreground">No payslips found.</div>
      ) : isHRAdmin ? (
        /* HR: grouped quarterly payroll statement cards */
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, records]) => {
            const [empName] = key.split("_");
            const year = records[0]?.year ?? "—";
            const totalG = records.reduce((s, r) => s + Number(r.gross), 0);
            const totalD = records.reduce((s, r) => s + Number(r.deductions), 0);
            const totalN = records.reduce((s, r) => s + Number(r.net), 0);
            const authorizedBy = records.find((r) => r.authorized_by)?.authorized_by ?? "—";
            const dateIssued = records.find((r) => r.date_issued)?.date_issued ?? "—";
            const employeeId = records[0]?.employee_id ?? "—";
            const quarters = records.map((r) => r.quarter).filter(Boolean).join(", ");
            return (
              <div key={key} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Statement header */}
                <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-card-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" /> Payroll Statement
                    </p>
                    <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                      <p><span className="font-medium text-card-foreground">Employee Name:</span> {empName}</p>
                      <p><span className="font-medium text-card-foreground">Employee ID:</span> {employeeId} &nbsp;|&nbsp; <span className="font-medium text-card-foreground">Period Covered:</span> {quarters} — {year}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Quarter</Button>
                </div>
                {/* Quarterly table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Quarter</th>
                        <th className="text-right px-5 py-3 font-medium text-muted-foreground">Gross Pay</th>
                        <th className="text-right px-5 py-3 font-medium text-muted-foreground">Deductions</th>
                        <th className="text-right px-5 py-3 font-medium text-muted-foreground">Net Pay</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Payment Status</th>
                        <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3 font-medium text-card-foreground">{r.quarter ?? r.period}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground">${Number(r.gross).toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground">${Number(r.deductions).toLocaleString()}</td>
                          <td className="px-5 py-3 text-right font-medium text-card-foreground">${Number(r.net).toLocaleString()}</td>
                          <td className="px-5 py-3"><StatusBadge label={r.status} variant={r.status === "Paid" ? "success" : "warning"} /></td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPayslip(r.id, `payslip-${r.period}`)}><Download className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20 font-semibold text-sm">
                        <td className="px-5 py-3 text-card-foreground">Total</td>
                        <td className="px-5 py-3 text-right text-card-foreground">${totalG.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-card-foreground">${totalD.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-card-foreground">${totalN.toLocaleString()}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-6 text-sm">
                  <span><span className="font-medium text-card-foreground">Authorized By:</span> <span className="text-muted-foreground">{authorizedBy}</span></span>
                  <span><span className="font-medium text-card-foreground">Date Issued:</span> <span className="text-muted-foreground">{dateIssued}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Employee: simple pay history */
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-card-foreground">Pay History</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Period</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Quarter</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Gross</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Deductions</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground flex items-center gap-2"><Receipt className="h-4 w-4 text-muted-foreground" />{p.period}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.quarter ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">${Number(p.gross).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">${Number(p.deductions).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-card-foreground">${Number(p.net).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusBadge label={p.status} variant={p.status === "Paid" ? "success" : "warning"} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadPayslip(p.id, `payslip-${p.period}`)}><Download className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Payslip" : "Add Payslip"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name} — {e.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={form.quarter} onValueChange={(v) => handleFormChange("quarter", v)}>
                  <SelectTrigger><SelectValue placeholder="Select quarter" /></SelectTrigger>
                  <SelectContent>{QUARTERS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={form.year} onValueChange={(v) => handleFormChange("year", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Period Label *</Label>
              <Input value={form.period} onChange={(e) => handleFormChange("period", e.target.value)} placeholder="e.g. Q2 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Period Start</Label><Input type="date" value={form.period_start} onChange={(e) => handleFormChange("period_start", e.target.value)} /></div>
              <div className="space-y-2"><Label>Period End</Label><Input type="date" value={form.period_end} onChange={(e) => handleFormChange("period_end", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Gross Pay *</Label><Input type="number" step="0.01" min="0" value={form.gross} onChange={(e) => handleFormChange("gross", e.target.value)} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Deductions</Label><Input type="number" step="0.01" min="0" value={form.deductions} onChange={(e) => handleFormChange("deductions", e.target.value)} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Net Pay <span className="text-muted-foreground text-xs">(auto-calculated)</span></Label>
                <Input type="number" step="0.01" min="0" value={form.net} onChange={(e) => handleFormChange("net", e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Paid">Paid</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Authorized By</Label><Input value={form.authorized_by} onChange={(e) => setForm({ ...form, authorized_by: e.target.value })} placeholder="Manager / HR Name" /></div>
              <div className="space-y-2"><Label>Date Issued</Label><Input type="date" value={form.date_issued} onChange={(e) => setForm({ ...form, date_issued: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createPayslip.isPending || updatePayslip.isPending}>
              {(createPayslip.isPending || updatePayslip.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Payslips;

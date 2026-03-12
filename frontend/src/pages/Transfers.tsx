import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ArrowRightLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransfers, useCreateTransfer } from "@/hooks/api/useTransfers";

const Transfers = () => {
  const { data: transfers = [], isLoading } = useTransfers();
  const createTransfer = useCreateTransfer();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", fromDept: "", toDept: "", fromRole: "", toRole: "", effectiveDate: "", reason: "" });
  const { toast } = useToast();

  const openAdd = () => {
    setForm({ employee: "", fromDept: "", toDept: "", fromRole: "", toRole: "", effectiveDate: "", reason: "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.employee || !form.fromDept || !form.toDept) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    createTransfer.mutate({
      employee: form.employee,
      from_department: form.fromDept,
      to_department: form.toDept,
      from_role: form.fromRole,
      to_role: form.toRole,
      effective_date: form.effectiveDate,
      reason: form.reason,
    }, {
      onSuccess: () => {
        toast({ title: "Transfer request created" });
        setDialogOpen(false);
      },
      onError: () => toast({ title: "Failed to create transfer", variant: "destructive" }),
    });
  };

  return (
    <HRLayout
      title="Transfers"
      subtitle="Internal employee movements, transfers, promotions, and position changes"
      actions={
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Transfer
        </Button>
      }
    >
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Transfer Records</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">From</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground"></th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">To</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Effective Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{t.employee}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <p>{t.fromDept}</p>
                      <p className="text-xs">{t.fromRole}</p>
                    </td>
                    <td className="px-5 py-3.5"><ArrowRightLeft className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <p>{t.toDept}</p>
                      <p className="text-xs">{t.toRole}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.effectiveDate}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.reason}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={t.status} variant={t.status === "Completed" ? "success" : t.status === "Approved" ? "info" : "warning"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Initiate Transfer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Department *</Label>
                <Input value={form.fromDept} onChange={(e) => setForm({ ...form, fromDept: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>To Department *</Label>
                <Input value={form.toDept} onChange={(e) => setForm({ ...form, toDept: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input value={form.fromRole} onChange={(e) => setForm({ ...form, fromRole: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>New Role</Label>
                <Input value={form.toRole} onChange={(e) => setForm({ ...form, toRole: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createTransfer.isPending}>
              {createTransfer.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Transfers;

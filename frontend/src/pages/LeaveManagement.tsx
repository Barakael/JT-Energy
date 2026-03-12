import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Umbrella, Thermometer, Baby, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLeaveBalances, useLeaveRequests, useApplyLeave, useApproveLeave, useRejectLeave } from "@/hooks/api/useLeave";
import { useAuth } from "@/contexts/AuthContext";

const leaveIcons: Record<string, React.ElementType> = {
  Annual: Umbrella,
  Sick: Thermometer,
  Personal: CalendarDays,
  Parental: Baby,
};

const LeaveManagement = () => {
  const { isHRAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "Annual", from: "", to: "", days: 1, reason: "" });
  const { toast } = useToast();

  const { data: balances = [], isLoading: loadingBalances } = useLeaveBalances();
  const { data: requests = [], isLoading: loadingRequests } = useLeaveRequests();
  const applyLeave    = useApplyLeave();
  const approveLeave  = useApproveLeave();
  const rejectLeave   = useRejectLeave();

  const handleSubmit = async () => {
    if (!form.from || !form.to) {
      toast({ title: "Please select dates", variant: "destructive" });
      return;
    }
    try {
      await applyLeave.mutateAsync({ type: form.type, from_date: form.from, to_date: form.to, days: form.days, reason: form.reason });
      toast({ title: "Leave request submitted" });
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to submit leave request", variant: "destructive" });
    }
  };

  const handleApprove = async (id: number) => {
    try { await approveLeave.mutateAsync(id); toast({ title: "Leave approved" }); }
    catch { toast({ title: "Failed to approve", variant: "destructive" }); }
  };

  const handleReject = async (id: number) => {
    try { await rejectLeave.mutateAsync(id); toast({ title: "Leave rejected" }); }
    catch { toast({ title: "Failed to reject", variant: "destructive" }); }
  };

  return (
    <HRLayout
      title="Leave Management"
      subtitle="Track time-off requests and balances"
      actions={
        <Button onClick={() => { setForm({ type: "Annual", from: "", to: "", days: 1, reason: "" }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Request Leave
        </Button>
      }
    >
      {loadingBalances ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {balances.map((lb) => {
            const Icon = leaveIcons[lb.type] ?? CalendarDays;
            return (
              <div key={lb.type} className="bg-card rounded-lg border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                  <p className="text-sm font-medium text-muted-foreground">{lb.type}</p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-card-foreground">{lb.available}</p>
                  <p className="text-xs text-muted-foreground">{lb.used} / {lb.total} used</p>
                </div>
                <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: lb.total ? `${(lb.used / lb.total) * 100}%` : "0%" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Leave Requests</h2>
        </div>
        {loadingRequests ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">From</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">To</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Days</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  {isHRAdmin && <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{r.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.type}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.from}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.to}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.days}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.reason}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={r.status} variant={r.status === "Approved" ? "success" : r.status === "Rejected" ? "destructive" : "warning"} />
                    </td>
                    {isHRAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        {r.status === "Pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10 h-7" onClick={() => handleApprove(r.id)}>
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7" onClick={() => handleReject(r.id)}>
                              <X className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual Leave</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Personal">Personal Leave</SelectItem>
                  <SelectItem value="Parental">Parental Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From *</Label>
                <Input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>To *</Label>
                <Input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number of Days</Label>
              <Input type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={applyLeave.isPending}>
              {applyLeave.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default LeaveManagement;

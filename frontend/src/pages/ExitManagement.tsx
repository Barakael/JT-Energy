import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, CheckCircle, Clock, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExitRecords, useCreateExit } from "@/hooks/api/useExitManagement";

const clearanceStatusVariant = (s: string) => {
  if (s === "Completed") return "success" as const;
  if (s === "Pending" || s === "In Progress") return "warning" as const;
  return "default" as const;
};

const processStatusVariant = (s: string) => {
  if (s === "Completed") return "success" as const;
  if (s === "In Progress") return "info" as const;
  return "accent" as const;
};

const ExitManagement = () => {
  const { data: exitData = [], isLoading } = useExitRecords();
  const createExit = useCreateExit();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", exit_type: "Resignation", last_day: "", reason: "" });
  const { toast } = useToast();

  const inProgress = exitData.filter((r) => r.status === "In Progress").length;
  const completed = exitData.filter((r) => r.status === "Completed").length;
  const thisMonth = exitData.length;
  const clearancePending = exitData.filter((r) => r.clearance !== "Completed").length;

  const handleSave = () => {
    if (!form.employee || !form.last_day) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    createExit.mutate(form, {
      onSuccess: () => {
        toast({ title: "Exit record created" });
        setDialogOpen(false);
        setForm({ employee: "", exit_type: "Resignation", last_day: "", reason: "" });
      },
      onError: () => toast({ title: "Failed to create exit record", variant: "destructive" }),
    });
  };

  return (
    <HRLayout
      title="Exit Management"
      subtitle="Manage employee offboarding and clearance processes"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Initiate Exit
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="In Progress" value={inProgress} icon={Clock} variant="warning" />
        <StatsCard title="Completed" value={completed} icon={CheckCircle} variant="success" />
        <StatsCard title="This Month" value={thisMonth} icon={LogOut} variant="info" />
        <StatsCard title="Clearance Pending" value={clearancePending} icon={AlertTriangle} variant="accent" />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Exit Records</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Exit Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Last Working Day</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Clearance</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exitData.map((row) => (
                  <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{row.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.department}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        label={row.exitType}
                        variant={row.exitType === "Termination" ? "destructive" : row.exitType === "Retirement" ? "info" : "default"}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.lastDay}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={row.clearance} variant={clearanceStatusVariant(row.clearance)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={row.status} variant={processStatusVariant(row.status)} />
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
          <DialogHeader><DialogTitle>Initiate Exit Process</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee Name *</Label>
              <Input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Exit Type</Label>
              <Select value={form.exit_type} onValueChange={(v) => setForm({ ...form, exit_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resignation">Resignation</SelectItem>
                  <SelectItem value="Termination">Termination</SelectItem>
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Contract End">Contract End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Last Working Day *</Label>
              <Input type="date" value={form.last_day} onChange={(e) => setForm({ ...form, last_day: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createExit.isPending}>
              {createExit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Initiate Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default ExitManagement;

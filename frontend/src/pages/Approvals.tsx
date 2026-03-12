import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { Clock, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLeaveRequests, useApproveLeave, useRejectLeave } from "@/hooks/api/useLeave";

const Approvals = () => {
  const { data: requests = [], isLoading } = useLeaveRequests();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    approveLeave.mutate(id, {
      onSuccess: () => toast({ title: "Request approved" }),
      onError: () => toast({ title: "Failed to approve request", variant: "destructive" }),
    });
  };

  const handleReject = (id: number) => {
    rejectLeave.mutate(id, {
      onSuccess: () => toast({ title: "Request rejected" }),
      onError: () => toast({ title: "Failed to reject request", variant: "destructive" }),
    });
  };

  const pending = requests.filter((r) => r.status === "Pending");
  const approved = requests.filter((r) => r.status === "Approved");
  const rejected = requests.filter((r) => r.status === "Rejected");

  return (
    <HRLayout title="Approvals" subtitle="Manage pending approvals">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Pending" value={pending.length} icon={Clock} variant="warning" />
        <StatsCard title="Approved" value={approved.length} icon={CheckCircle} variant="success" />
        <StatsCard title="Rejected" value={rejected.length} icon={XCircle} variant="default" />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">All Requests</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Period</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Days</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{r.name}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={r.type} variant="info" />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.from} – {r.to}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.days}</td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[220px]">
                      {r.reason ? (
                        <span className="block truncate" title={r.reason}>{r.reason}</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={r.status} variant={r.status === "Approved" ? "success" : r.status === "Rejected" ? "destructive" : "warning"} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {r.status === "Pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10" onClick={() => handleApprove(r.id)} disabled={approveLeave.isPending}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(r.id)} disabled={rejectLeave.isPending}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HRLayout>
  );
};

export default Approvals;

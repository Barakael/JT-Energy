import { HRLayout } from "@/components/HRLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Plus, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useTickets, useCreateTicket } from "@/hooks/api/useHelpDesk";
import { useDepartments } from "@/hooks/api/useDepartments";

type TicketStatus = "Open" | "In Progress" | "Resolved";
type TicketPriority = "Low" | "Medium" | "High";
type TicketCategory = "IT" | "HR" | "Facilities" | "Other";

const statusVariant: Record<string, "info" | "warning" | "success"> = {
  "Open": "info",
  "In Progress": "warning",
  "Resolved": "success",
};

const priorityVariant: Record<string, "destructive" | "warning" | "default"> = {
  "High": "destructive",
  "Medium": "warning",
  "Low": "default",
};

export default function HelpDesk() {
  const { currentUser, isHRAdmin } = useAuth();
  const { data: allTickets = [], isLoading } = useTickets();
  const { data: departments = [] } = useDepartments();
  const createTicket = useCreateTicket();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("IT");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");

  const myTickets = isHRAdmin ? allTickets : allTickets.filter((t) => t.employee === currentUser?.name);
  const openCount = myTickets.filter((t) => t.status === "Open").length;
  const inProgressCount = myTickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = myTickets.filter((t) => t.status === "Resolved").length;

  const handleSubmit = () => {
    if (!subject.trim()) return;
    createTicket.mutate({ subject, category, priority, description, department_id: departmentId ? Number(departmentId) : undefined }, {
      onSuccess: () => {
        toast({ title: "Ticket submitted" });
        setSubject(""); setCategory("IT"); setPriority("Medium"); setDescription(""); setDepartmentId("");
        setOpen(false);
      },
      onError: () => toast({ title: "Failed to submit ticket", variant: "destructive" }),
    });
  };

  return (
    <HRLayout
      title="Help Desk"
      subtitle={isHRAdmin ? "Manage all support tickets" : "Submit and track your support requests"}
      actions={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Ticket
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Open" value={openCount} icon={AlertCircle} variant="info" />
        <StatsCard title="In Progress" value={inProgressCount} icon={Clock} variant="warning" />
        <StatsCard title="Resolved" value={resolvedCount} icon={CheckCircle2} variant="success" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{isHRAdmin ? "All Tickets" : "My Tickets"}</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  {isHRAdmin && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Submitted By</th>}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{ticket.ticket_number}</td>
                    <td className="px-4 py-3.5 font-medium text-foreground max-w-xs truncate">{ticket.subject}</td>
                    <td className="px-4 py-3.5"><StatusBadge label={ticket.category} variant="default" /></td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">{ticket.department_name ?? "—"}</td>
                    <td className="px-4 py-3.5"><StatusBadge label={ticket.priority} variant={priorityVariant[ticket.priority] ?? "default"} /></td>
                    <td className="px-4 py-3.5"><StatusBadge label={ticket.status} variant={statusVariant[ticket.status] ?? "default"} /></td>
                    {isHRAdmin && <td className="px-4 py-3.5 text-foreground">{ticket.employee}</td>}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{ticket.created_at}</td>
                  </tr>
                ))}
                {myTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Subject</Label>
              <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" />
            </div>
            <div>
              <Label>Target Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select department..." /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["IT", "HR", "Facilities", "Other"] as TicketCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Low", "Medium", "High"] as TicketPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1 resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your issue in detail..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!subject.trim() || createTicket.isPending}>
              {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
}

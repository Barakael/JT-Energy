import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ScrollText, Loader2, Trash2, Eye, AlertTriangle, Info, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePolicies, useCreatePolicy, useDeletePolicy, useMarkPolicyRead } from "@/hooks/api/usePolicies";
import { useEmployees } from "@/hooks/api/useEmployees";
import { useAuth } from "@/contexts/AuthContext";

const Policies = () => {
  const { isHRAdmin } = useAuth();
  const { data: policies = [], isLoading } = usePolicies();
  const { data: employees = [] } = useEmployees();
  const createPolicy = useCreatePolicy();
  const deletePolicy = useDeletePolicy();
  const markRead = useMarkPolicyRead();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState<typeof policies[0] | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", type: "Announcement", priority: "Normal", target_type: "All",
  });
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);

  const openAdd = () => {
    setForm({ title: "", content: "", type: "Announcement", priority: "Normal", target_type: "All" });
    setSelectedRecipients([]);
    setDialogOpen(true);
  };

  const toggleRecipient = (id: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    if (form.target_type === "Selected" && selectedRecipients.length === 0) {
      toast({ title: "Select at least one recipient", variant: "destructive" });
      return;
    }
    try {
      await createPolicy.mutateAsync({
        ...form,
        recipient_ids: form.target_type === "Selected" ? selectedRecipients : undefined,
        publish: true,
      });
      toast({ title: "Policy published" });
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to create policy", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePolicy.mutateAsync(id);
      toast({ title: "Policy deleted" });
    } catch {
      toast({ title: "Failed to delete policy", variant: "destructive" });
    }
  };

  const viewPolicy = (policy: typeof policies[0]) => {
    setViewingPolicy(policy);
    setViewDialogOpen(true);
    // Mark as read if employee
    if (!isHRAdmin && !policy.is_read) {
      markRead.mutate(policy.id);
    }
  };

  const priorityIcon = (p: string) => {
    if (p === "Urgent") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (p === "Important") return <Info className="h-4 w-4 text-yellow-500" />;
    return <Megaphone className="h-4 w-4 text-muted-foreground" />;
  };

  const priorityVariant = (p: string): "destructive" | "warning" | "default" => {
    if (p === "Urgent") return "destructive";
    if (p === "Important") return "warning";
    return "default";
  };

  return (
    <HRLayout
      title="Policies & Rules"
      subtitle={isHRAdmin ? "Create and manage company policies, rules, and announcements" : "View company policies and announcements"}
      actions={isHRAdmin ? <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> New Policy</Button> : undefined}
    >
      {/* Stats */}
      {isHRAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {["Policy", "Rule", "Announcement", "Instruction"].map((type) => (
            <div key={type} className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-secondary"><ScrollText className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{policies.filter((p) => p.type === type).length}</p>
                <p className="text-sm text-muted-foreground">{type === "Policy" ? "Policies" : `${type}s`}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : policies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No policies found.</div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${!isHRAdmin && policy.is_read === false ? "border-l-4 border-l-blue-500" : ""}`}
              onClick={() => viewPolicy(policy)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {priorityIcon(policy.priority)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-card-foreground">{policy.title}</p>
                      {!isHRAdmin && policy.is_read === false && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge label={policy.type} variant="default" />
                      <StatusBadge label={policy.priority} variant={priorityVariant(policy.priority)} />
                      {policy.target_type === "Selected" && (
                        <span className="text-xs text-muted-foreground">Targeted</span>
                      )}
                      {policy.creator && <span className="text-xs text-muted-foreground">by {policy.creator.name}</span>}
                      {policy.published_at && (
                        <span className="text-xs text-muted-foreground">{new Date(policy.published_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{policy.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); viewPolicy(policy); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  {isHRAdmin && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(policy.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Policy Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingPolicy && priorityIcon(viewingPolicy.priority)}
              {viewingPolicy?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingPolicy && (
            <div className="py-2">
              <div className="flex items-center gap-2 mb-4">
                <StatusBadge label={viewingPolicy.type} variant="default" />
                <StatusBadge label={viewingPolicy.priority} variant={priorityVariant(viewingPolicy.priority)} />
                {viewingPolicy.creator && <span className="text-xs text-muted-foreground">by {viewingPolicy.creator.name}</span>}
                {viewingPolicy.published_at && <span className="text-xs text-muted-foreground">{new Date(viewingPolicy.published_at).toLocaleString()}</span>}
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {viewingPolicy.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Policy / Rule</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Remote Work Policy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Rule">Rule</SelectItem>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Instruction">Instruction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Important">Important</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                placeholder="Write the policy content, instructions, or announcement here..."
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={form.target_type} onValueChange={(v) => setForm({ ...form, target_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Employees</SelectItem>
                  <SelectItem value="Selected">Selected Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.target_type === "Selected" && (
              <div className="space-y-2">
                <Label>Select Recipients</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-3 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                      <Checkbox checked={selectedRecipients.includes(emp.id)} onCheckedChange={() => toggleRecipient(emp.id)} />
                      <span className="text-sm">{emp.name} <span className="text-xs text-muted-foreground">({emp.dept})</span></span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{selectedRecipients.length} selected</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createPolicy.isPending}>
              {createPolicy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Policies;

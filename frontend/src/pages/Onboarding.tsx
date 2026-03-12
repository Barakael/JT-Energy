import { HRLayout } from "@/components/HRLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { CheckCircle2, Circle, Clock, UserPlus, ChevronRight, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { StatsCard } from "@/components/StatsCard";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding, useCreateHire, useUpdateHire, useDeleteHire, useToggleTask, type NewHire } from "@/hooks/api/useOnboarding";

const emptyForm = () => ({ name: "", role: "", dept: "", startDate: "", email: "" });

export default function Onboarding() {
  const { isHRAdmin } = useAuth();
  const { toast } = useToast();
  const { data: hires = [], isLoading } = useOnboarding();
  const createHire = useCreateHire();
  const updateHire = useUpdateHire();
  const deleteHire = useDeleteHire();
  const toggleTask = useToggleTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<NewHire | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (hire: NewHire) => {
    setEditingId(hire.id);
    setForm({ name: hire.name, role: hire.role ?? "", dept: hire.department, startDate: hire.startDate, email: hire.email ?? "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate.trim()) return;
    const payload = { name: form.name, role: form.role, department: form.dept, start_date: form.startDate, email: form.email };
    if (editingId) {
      updateHire.mutate({ id: editingId, ...payload }, {
        onSuccess: () => { toast({ title: "New hire updated" }); setDialogOpen(false); },
        onError: () => toast({ title: "Failed to update hire", variant: "destructive" }),
      });
    } else {
      createHire.mutate(payload, {
        onSuccess: () => { toast({ title: "New hire added" }); setDialogOpen(false); },
        onError: () => toast({ title: "Failed to add hire", variant: "destructive" }),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteHire.mutate(deleteTarget.id, {
      onSuccess: () => { toast({ title: "Hire removed", variant: "destructive" }); setDeleteTarget(null); },
      onError: () => toast({ title: "Failed to remove hire", variant: "destructive" }),
    });
  };

  const handleToggleTask = (hireId: number, taskId: number) => {
    toggleTask.mutate({ hireId, taskId });
  };

  const fullyOnboarded = hires.filter((h) => h.progress === 100).length;

  if (isHRAdmin) {
    return (
      <HRLayout
        title="Onboarding"
        subtitle="Track and manage new hire onboarding progress"
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add New Hire
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatsCard title="New Hires This Month" value={hires.length} icon={UserPlus} variant="accent" />
          <StatsCard title="Fully Onboarded" value={fullyOnboarded} icon={CheckCircle2} variant="success" />
          <StatsCard title="In Progress" value={hires.length - fullyOnboarded} icon={Clock} variant="warning" />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">New Hire Tracker</h2>
            <span className="text-xs text-muted-foreground">{hires.length} hire{hires.length !== 1 ? "s" : ""}</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : hires.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No new hires yet</p>
              <p className="text-xs text-muted-foreground">Click "Add New Hire" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {hires.map((hire) => (
                <div key={hire.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors group">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">
                    {hire.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{hire.name}</p>
                    <p className="text-xs text-muted-foreground">{hire.role} · {hire.department}</p>
                    {hire.email && <p className="text-xs text-muted-foreground">{hire.email}</p>}
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground w-28 shrink-0">
                    Starts {hire.startDate}
                  </div>
                  <div className="w-36 hidden md:block shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-foreground">{hire.progress}%</span>
                    </div>
                    <Progress value={hire.progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(hire)} className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 text-muted-foreground hover:text-blue-600 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(hire)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? "Edit New Hire" : "Add New Hire"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="sm:col-span-2">
                <Label>Full Name *</Label>
                <Input className="mt-1" placeholder="e.g. Alex Johnson" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input className="mt-1" placeholder="e.g. UX Designer" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <Label>Department</Label>
                <Input className="mt-1" placeholder="e.g. Engineering" value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} />
              </div>
              <div>
                <Label>Start Date *</Label>
                <Input className="mt-1" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>Work Email</Label>
                <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={(createHire.isPending || updateHire.isPending) || !form.name.trim()}>
                {(createHire.isPending || updateHire.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Save Changes" : "Add Hire"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Remove New Hire</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              Are you sure you want to remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span> from the onboarding tracker?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteHire.isPending}>
                {deleteHire.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </HRLayout>
    );
  }

  // Employee view - show the first hire record's tasks (backend returns only the current user's record)
  const myHire = hires[0];
  const tasks = myHire?.tasks ?? [];
  const doneCount = tasks.filter((t) => t.done).length;
  const progressPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <HRLayout title="My Onboarding" subtitle="Complete your onboarding tasks to get started">
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-foreground">Onboarding Progress</h2>
                <p className="text-sm text-muted-foreground">{doneCount} of {tasks.length} tasks completed</p>
              </div>
              <span className="text-2xl font-bold text-foreground">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Checklist</h2>
            </div>
            <div className="divide-y divide-border">
              {tasks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => myHire && handleToggleTask(myHire.id, item.id)}
                  className="flex items-center gap-4 px-5 py-3.5 w-full text-left hover:bg-secondary/40 transition-colors"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn("flex-1 text-sm font-medium text-foreground", item.done && "line-through text-muted-foreground")}>
                    {item.task}
                  </span>
                  <StatusBadge label={item.category} variant={item.done ? "success" : "default"} />
                </button>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">No onboarding tasks assigned yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </HRLayout>
  );
}

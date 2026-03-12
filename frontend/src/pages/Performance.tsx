import { useState, useRef } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Plus, Star, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePerformance, useCreateReview } from "@/hooks/api/usePerformance";
import { useEmployees } from "@/hooks/api/useEmployees";

const ratingColor = (r: number) => {
  if (r >= 8) return "text-success";
  if (r >= 5) return "text-warning";
  return "text-destructive";
};

const Performance = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", department: "", role: "", reviewer_id: "", rating: 5, period: "Q1 2026", feedback: "" });
  const [empSearch, setEmpSearch] = useState("");
  const [empLabel, setEmpLabel] = useState("");
  const [showEmpList, setShowEmpList] = useState(false);
  const empRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: employees = [] } = useEmployees(empSearch);
  const filteredEmps = empSearch.length > 0 ? employees : [];

  const { data: reviews = [], isLoading } = usePerformance();
  const createReview = useCreateReview();

  const openAdd = () => {
    setForm({ employee_id: "", department: "", role: "", reviewer_id: "", rating: 5, period: "Q1 2026", feedback: "" });
    setEmpSearch("");
    setEmpLabel("");
    setShowEmpList(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await createReview.mutateAsync(form);
      toast({ title: "Performance review added" });
      setDialogOpen(false);
    } catch { toast({ title: "Failed to save review", variant: "destructive" }); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <HRLayout
      title="Performance"
      subtitle="Rate and review employee performance (1-10 scale)"
      actions={<Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Review</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/10"><Star className="h-5 w-5 text-success" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{avgRating}</p><p className="text-sm text-muted-foreground">Avg Rating</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-info/10"><TrendingUp className="h-5 w-5 text-info" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{reviews.filter((r) => r.status === "Completed").length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-warning/10"><Star className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{reviews.filter((r) => r.status !== "Completed").length}</p><p className="text-sm text-muted-foreground">Pending</p></div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-card-foreground">Performance Reviews</h2></div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reviewer</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Period</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{r.employee}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.department}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.reviewer}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold text-lg ${ratingColor(r.rating)}`}>{r.rating}</span>
                      <span className="text-muted-foreground text-xs">/10</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.period}</td>
                    <td className="px-5 py-3.5"><StatusBadge label={r.status} variant={r.status === "Completed" ? "success" : "warning"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Performance Review</DialogTitle><DialogDescription>Rate employee performance on a scale of 1-10.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2" ref={empRef}>
                <Label>Employee *</Label>
                <div className="relative">
                  <Input
                    value={empLabel || empSearch}
                    onChange={(e) => {
                      setEmpSearch(e.target.value);
                      setEmpLabel("");
                      setForm({ ...form, employee_id: "" });
                      setShowEmpList(true);
                    }}
                    onFocus={() => setShowEmpList(true)}
                    placeholder="Search by name…"
                    autoComplete="off"
                  />
                  {showEmpList && filteredEmps.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md text-sm">
                      {filteredEmps.map((emp) => (
                        <li
                          key={emp.id}
                          className="flex flex-col px-3 py-2 cursor-pointer hover:bg-accent"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, employee_id: String(emp.id), department: emp.dept, role: emp.role || "" });
                            setEmpLabel(emp.name);
                            setEmpSearch("");
                            setShowEmpList(false);
                          }}
                        >
                          <span className="font-medium text-card-foreground">{emp.name}</span>
                          <span className="text-xs text-muted-foreground">{emp.role} · {emp.dept}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="space-y-2"><Label>Period</Label><Input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Role / Title</Label>
                <Input value={form.role} disabled className="bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rating: {form.rating}/10</Label>
              <Slider min={1} max={10} step={1} value={[form.rating]} onValueChange={(v) => setForm({ ...form, rating: v[0] })} className="py-2" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>1 - Poor</span><span>5 - Average</span><span>10 - Exceptional</span></div>
            </div>
            <div className="space-y-2"><Label>Feedback</Label><Textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createReview.isPending}>
              {createReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Performance;

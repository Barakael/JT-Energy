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
import { Switch } from "@/components/ui/switch";
import { Plus, GraduationCap, Users, Clock, Loader2, MapPin, CalendarDays, UserPlus, ClipboardList, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrainingPrograms, useCreateTraining, useAssignByDepartment, useGetAttendees, useMarkAttended } from "@/hooks/api/useTraining";
import { useDepartments } from "@/hooks/api/useDepartments";

const Training = () => {
  const { data: programs = [], isLoading } = useTrainingPrograms();
  const { data: departments = [] } = useDepartments();
  const createTraining = useCreateTraining();
  const assignByDept = useAssignByDepartment();
  const markAttended = useMarkAttended();
  const { toast } = useToast();

  // Add training dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "Compliance", instructor: "", description: "",
    venue: "", start_date: "", end_date: "", start_time: "", end_time: "", mode: "Offline",
  });

  // Assign by department dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [allDepartments, setAllDepartments] = useState(false);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);

  // Attendance dialog
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceProgramId, setAttendanceProgramId] = useState<number | null>(null);
  const { data: attendees = [], isLoading: attendeesLoading } = useGetAttendees(attendanceProgramId);

  const openAdd = () => {
    setForm({ title: "", category: "Compliance", instructor: "", description: "", venue: "", start_date: "", end_date: "", start_time: "", end_time: "", mode: "Offline" });
    setDialogOpen(true);
  };

  const openAssign = (programId: number) => {
    setSelectedProgramId(programId);
    setAllDepartments(false);
    setSelectedDeptIds([]);
    setAssignDialogOpen(true);
  };

  const openAttendance = (programId: number) => {
    setAttendanceProgramId(programId);
    setAttendanceDialogOpen(true);
  };

  const toggleDept = (id: number) =>
    setSelectedDeptIds((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);

  const handleSave = () => {
    if (!form.title || !form.instructor) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    createTraining.mutate(form, {
      onSuccess: () => { toast({ title: "Training program added" }); setDialogOpen(false); },
      onError: () => toast({ title: "Failed to add training program", variant: "destructive" }),
    });
  };

  const handleAssign = () => {
    if (!selectedProgramId) return;
    if (!allDepartments && selectedDeptIds.length === 0) {
      toast({ title: "Please select at least one department", variant: "destructive" });
      return;
    }
    assignByDept.mutate(
      { trainingId: selectedProgramId, all_departments: allDepartments || undefined, department_ids: allDepartments ? undefined : selectedDeptIds },
      {
        onSuccess: (data) => {
          toast({ title: `${data.assigned_count ?? 0} employee(s) assigned` });
          setAssignDialogOpen(false);
        },
        onError: () => toast({ title: "Failed to assign employees", variant: "destructive" }),
      }
    );
  };

  const handleToggleAttended = (trainingId: number, enrollmentId: number, current: boolean) => {
    markAttended.mutate(
      { trainingId, enrollmentId, attended: !current },
      { onError: () => toast({ title: "Failed to update attendance", variant: "destructive" }) }
    );
  };

  return (
    <HRLayout
      title="Training"
      subtitle="Company-wide learning management"
      actions={<Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Training</Button>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/10"><GraduationCap className="h-5 w-5 text-success" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{programs.filter((p) => p.status === "Active").length}</p>
            <p className="text-sm text-muted-foreground">Active Programs</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-info/10"><Users className="h-5 w-5 text-info" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{programs.reduce((s, p) => s + (p.enrollments_count ?? 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-secondary"><Clock className="h-5 w-5 text-muted-foreground" /></div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{programs.filter((p) => p.status === "Draft").length}</p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary"><GraduationCap className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium text-card-foreground">{prog.title}</p>
                    <p className="text-xs text-muted-foreground">{prog.category} · Instructor: {prog.instructor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Button variant="outline" size="sm" onClick={() => openAssign(prog.id)}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openAttendance(prog.id)}>
                    <ClipboardList className="h-3.5 w-3.5 mr-1" /> Attendance
                  </Button>
                  <StatusBadge label={prog.status} variant={prog.status === "Active" ? "success" : "default"} />
                </div>
              </div>
              {prog.description && <p className="text-sm text-muted-foreground mt-2">{prog.description}</p>}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                {prog.venue && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {prog.venue}</span>}
                {prog.start_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {prog.start_date}{prog.end_date && prog.end_date !== prog.start_date ? ` — ${prog.end_date}` : ""}
                  </span>
                )}
                {prog.start_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {prog.start_time}{prog.end_time ? ` – ${prog.end_time}` : ""}
                  </span>
                )}
                {prog.mode && <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{prog.mode}</span>}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <Users className="h-3.5 w-3.5" /> {prog.enrollments_count ?? 0} enrolled
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Training Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Training Program</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instructor *</Label>
              <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Training Hall B, 2nd Floor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createTraining.isPending}>
              {createTraining.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign by Department Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Assign by Department</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">All employees in the selected departments will be enrolled in this training.</p>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">All Departments</p>
              <p className="text-xs text-muted-foreground">Enroll every employee in the company</p>
            </div>
            <Switch checked={allDepartments} onCheckedChange={setAllDepartments} />
          </div>

          {!allDepartments && (
            <div className="space-y-1 max-h-56 overflow-y-auto border border-border rounded-lg p-3 mt-2">
              {departments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No departments found.</p>
              ) : departments.map((dept) => (
                <label key={dept.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedDeptIds.includes(dept.id)}
                    onCheckedChange={() => toggleDept(dept.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{dept.name}</p>
                    {dept.employees !== undefined && (
                      <p className="text-xs text-muted-foreground">{dept.employees} employee{dept.employees !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {!allDepartments && (
            <p className="text-xs text-muted-foreground">{selectedDeptIds.length} department{selectedDeptIds.length !== 1 ? "s" : ""} selected</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignByDept.isPending || (!allDepartments && selectedDeptIds.length === 0)}>
              {assignByDept.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Assign Employees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={(open) => { setAttendanceDialogOpen(open); if (!open) setAttendanceProgramId(null); }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Attendance</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mark employees as attended for this training session.</p>
          {attendeesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : attendees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No employees enrolled yet. Use "Assign" to add them.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto border border-border rounded-lg p-3 mt-2">
              {attendees.map((att) => (
                <div key={att.enrollment_id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{att.name}</p>
                    <p className="text-xs text-muted-foreground">{att.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleAttended(attendanceProgramId!, att.enrollment_id, att.attended)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      att.attended
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-muted text-muted-foreground border-border hover:border-success/40"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {att.attended ? "Attended" : "Mark Attended"}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {attendees.filter((a) => a.attended).length} / {attendees.length} attended
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Training;

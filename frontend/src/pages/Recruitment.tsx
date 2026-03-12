import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, UserPlus, Users, Briefcase, MapPin, Loader2, CalendarDays, Clock, Video, Trash2, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobs, useCreateJob } from "@/hooks/api/useJobs";
import { useJobInterviews, useCreateInterview, useInterviewDetail, InterviewSummary } from "@/hooks/api/useInterviews";
import { useEmployees } from "@/hooks/api/useEmployees";
import { useDepartments } from "@/hooks/api/useDepartments";
import { useStations } from "@/hooks/api/useStations";

const Recruitment = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", department_id: "", location: "", type: "Full-time", description: "" });
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useJobs();
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: stations = [] } = useStations();
  const createJob = useCreateJob();

  // Interview state
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [viewingInterviewId, setViewingInterviewId] = useState<number | null>(null);
  const { data: jobInterviews = [] } = useJobInterviews(selectedJobId);
  const { data: interviewDetail } = useInterviewDetail(viewingInterviewId);
  const createInterview = useCreateInterview();

  const [interviewForm, setInterviewForm] = useState({
    title: "", scheduled_date: "", scheduled_time: "", venue: "", description: "",
  });
  const [selectedInterviewers, setSelectedInterviewers] = useState<number[]>([]);
  const [intervieweeRows, setIntervieweeRows] = useState<{ name: string; email: string; phone: string }[]>([
    { name: "", email: "", phone: "" },
  ]);

  const openAdd = () => {
    setForm({ title: "", department_id: "", location: "", type: "Full-time", description: "" });
    setDialogOpen(true);
  };

  // Derive positions (roles) from selected department
  const selectedDept = departments.find((d) => d.id === Number(form.department_id));
  const deptPositions: string[] = selectedDept?.positions
    ? selectedDept.positions.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const handleSave = async () => {
    if (!form.title || !form.department_id) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    try {
      await createJob.mutateAsync({
        title: form.title,
        department_id: Number(form.department_id),
        location: form.location,
        type: form.type,
        description: form.description,
      });
      toast({ title: "Job posting created" });
      setDialogOpen(false);
    } catch { toast({ title: "Failed to create job posting", variant: "destructive" }); }
  };

  const openCreateInterview = (jobId: number) => {
    setSelectedJobId(jobId);
    setInterviewForm({ title: "", scheduled_date: "", scheduled_time: "", venue: "", description: "" });
    setSelectedInterviewers([]);
    setIntervieweeRows([{ name: "", email: "", phone: "" }]);
    setInterviewDialogOpen(true);
  };

  const openJobInterviews = (jobId: number) => {
    setSelectedJobId(jobId);
    setViewingInterviewId(null);
  };

  const toggleInterviewer = (id: number) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addIntervieweeRow = () => setIntervieweeRows((prev) => [...prev, { name: "", email: "", phone: "" }]);
  const removeIntervieweeRow = (idx: number) => setIntervieweeRows((prev) => prev.filter((_, i) => i !== idx));
  const updateIntervieweeRow = (idx: number, field: string, val: string) => {
    setIntervieweeRows((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: val } : row));
  };

  const handleCreateInterview = async () => {
    if (!interviewForm.title || !interviewForm.scheduled_date || selectedInterviewers.length === 0) {
      toast({ title: "Title, date, and at least one interviewer required", variant: "destructive" });
      return;
    }
    const validInterviewees = intervieweeRows.filter((r) => r.name.trim());
    if (validInterviewees.length === 0) {
      toast({ title: "Add at least one interviewee", variant: "destructive" });
      return;
    }
    try {
      await createInterview.mutateAsync({
        jobId: selectedJobId!,
        ...interviewForm,
        interviewer_ids: selectedInterviewers,
        interviewees: validInterviewees,
      });
      toast({ title: "Interview created" });
      setInterviewDialogOpen(false);
    } catch {
      toast({ title: "Failed to create interview", variant: "destructive" });
    }
  };

  const openCount       = jobs.filter((j) => j.status === "Open").length;
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants ?? 0), 0);
  const closedCount     = jobs.filter((j) => j.status === "Closed").length;

  return (
    <HRLayout
      title="Recruitment"
      subtitle="Job postings, applicant tracking, and interviews"
      actions={<Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Post Job</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/10"><Briefcase className="h-5 w-5 text-success" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{openCount}</p><p className="text-sm text-muted-foreground">Open Positions</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-info/10"><Users className="h-5 w-5 text-info" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{totalApplicants}</p><p className="text-sm text-muted-foreground">Total Applicants</p></div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-secondary"><UserPlus className="h-5 w-5 text-muted-foreground" /></div>
          <div><p className="text-2xl font-bold text-card-foreground">{closedCount}</p><p className="text-sm text-muted-foreground">Filled Positions</p></div>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        {/* ─── Job Postings Tab ─── */}
        <TabsContent value="jobs">
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-card-foreground">Job Postings</h2></div>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="divide-y divide-border">
                {jobs.map((job) => (
                  <div key={job.id} className="px-5 py-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">{job.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.department || "—"}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || job.station || "—"}</span>
                          <span>{job.type}</span>
                          {job.posted_at && <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>}
                        </div>
                        {job.description && <p className="text-sm text-muted-foreground mt-2">{job.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openCreateInterview(job.id)}>
                          <Video className="h-3.5 w-3.5 mr-1" /> Schedule Interview
                        </Button>
                        <div className="text-right">
                          <p className="text-lg font-bold text-card-foreground">{job.applicants ?? 0}</p>
                          <p className="text-xs text-muted-foreground">applicants</p>
                        </div>
                        <StatusBadge label={job.status} variant={job.status === "Open" ? "success" : "default"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Interviews Tab ─── */}
        <TabsContent value="interviews">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Job list */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-card-foreground text-sm">Select Job</h2></div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => openJobInterviews(job.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors ${selectedJobId === job.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <p className="text-sm font-medium text-card-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.department}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle: Interviews for selected job */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-card-foreground text-sm">
                  {selectedJobId ? "Interviews" : "Select a job"}
                </h2>
              </div>
              {selectedJobId ? (
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {jobInterviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">No interviews scheduled yet.</p>
                  ) : (
                    jobInterviews.map((iv: InterviewSummary) => (
                      <button
                        key={iv.id}
                        onClick={() => setViewingInterviewId(iv.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors ${viewingInterviewId === iv.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      >
                        <p className="text-sm font-medium text-card-foreground">{iv.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <CalendarDays className="h-3 w-3" />
                          {iv.scheduled_date}
                          {iv.scheduled_time && <><Clock className="h-3 w-3 ml-1" /> {iv.scheduled_time}</>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge label={iv.status} variant={iv.status === "Scheduled" ? "info" : iv.status === "Completed" ? "success" : "default"} />
                          <span className="text-xs text-muted-foreground">{iv.interviewees_count ?? iv.interviewees?.length ?? 0} interviewees</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4">Choose a job to view its interviews.</p>
              )}
            </div>

            {/* Right: Interview detail */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-card-foreground text-sm">Details</h2>
              </div>
              {interviewDetail ? (
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  <div>
                    <h3 className="font-medium text-card-foreground">{interviewDetail.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {interviewDetail.venue && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {interviewDetail.venue}</p>}
                      <p className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {interviewDetail.scheduled_date} {interviewDetail.scheduled_time}</p>
                    </div>
                    {interviewDetail.description && <p className="text-sm text-muted-foreground mt-2">{interviewDetail.description}</p>}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interviewers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {interviewDetail.interviewers.map((iv) => (
                        <span key={iv.id} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300">{iv.name}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interviewees</p>
                    <div className="space-y-3">
                      {interviewDetail.interviewees.map((ie) => (
                        <div key={ie.id} className="border border-border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{ie.name}</p>
                              {ie.email && <p className="text-xs text-muted-foreground">{ie.email}</p>}
                            </div>
                            <StatusBadge label={ie.status} variant={ie.status === "Selected" ? "success" : ie.status === "Rejected" ? "destructive" : "default"} />
                          </div>
                          {ie.average_marks !== null && ie.average_marks !== undefined && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <Star className="h-3.5 w-3.5 text-yellow-500" />
                              <span className="font-medium">{ie.average_marks}/10</span>
                              <span className="text-muted-foreground">({ie.feedback_count} reviews)</span>
                            </div>
                          )}
                          {ie.feedback && ie.feedback.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {ie.feedback.map((fb) => (
                                <div key={fb.id} className="bg-muted/30 rounded p-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{fb.interviewer?.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500" /> {fb.marks}/10</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        fb.recommendation.includes("Yes") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        fb.recommendation.includes("No") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                      }`}>{fb.recommendation}</span>
                                    </div>
                                  </div>
                                  {fb.comments && <p className="text-muted-foreground mt-1 flex items-start gap-1"><MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {fb.comments}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4">Select an interview to view details.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Job Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v, title: "" })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.filter((d) => d.active !== false).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Title / Role *</Label>
              {deptPositions.length > 0 ? (
                <Select value={form.title} onValueChange={(v) => setForm({ ...form, title: v })}>
                  <SelectTrigger><SelectValue placeholder="Select role from department" /></SelectTrigger>
                  <SelectContent>
                    {deptPositions.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.department_id ? "No roles defined — type a title" : "Select department first"} />
              )}
              {form.department_id && deptPositions.length === 0 && (
                <p className="text-xs text-muted-foreground">No positions defined for this department. You can type a custom title above.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Location / Station</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                <SelectContent>
                  {stations.filter((s) => s.active !== false).map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}{s.location ? ` — ${s.location}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createJob.isPending}>
              {createJob.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Post Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Interview Title *</Label>
              <Input value={interviewForm.title} onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })} placeholder="e.g. Technical Round 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={interviewForm.scheduled_date} onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={interviewForm.scheduled_time} onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={interviewForm.venue} onChange={(e) => setInterviewForm({ ...interviewForm, venue: e.target.value })} placeholder="e.g. Conference Room A" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={interviewForm.description} onChange={(e) => setInterviewForm({ ...interviewForm, description: e.target.value })} rows={2} />
            </div>

            {/* Interviewers */}
            <div className="space-y-2">
              <Label>Interviewers * (select employees)</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                {employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-3 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selectedInterviewers.includes(emp.id)} onCheckedChange={() => toggleInterviewer(emp.id)} />
                    <span className="text-sm">{emp.name} <span className="text-xs text-muted-foreground">({emp.dept})</span></span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{selectedInterviewers.length} selected</p>
            </div>

            {/* Interviewees */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Interviewees *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIntervieweeRow}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {intervieweeRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                    <Input placeholder="Name *" value={row.name} onChange={(e) => updateIntervieweeRow(idx, "name", e.target.value)} />
                    <Input placeholder="Email" value={row.email} onChange={(e) => updateIntervieweeRow(idx, "email", e.target.value)} />
                    <Input placeholder="Phone" value={row.phone} onChange={(e) => updateIntervieweeRow(idx, "phone", e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeIntervieweeRow(idx)} disabled={intervieweeRows.length === 1}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInterview} disabled={createInterview.isPending}>
              {createInterview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Recruitment;

import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Video, CalendarDays, Clock, MapPin, Users, Loader2, Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMyInterviews, useInterviewDetail, useSubmitFeedback } from "@/hooks/api/useInterviews";

const MyInterviews = () => {
  const { data: interviews = [], isLoading } = useMyInterviews();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: detail } = useInterviewDetail(selectedId);
  const submitFeedback = useSubmitFeedback();

  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<{ interviewId: number; intervieweeId: number; intervieweeName: string } | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ marks: 5, comments: "", recommendation: "Neutral" });

  const openFeedback = (interviewId: number, intervieweeId: number, name: string) => {
    setFeedbackTarget({ interviewId, intervieweeId, intervieweeName: name });
    setFeedbackForm({ marks: 5, comments: "", recommendation: "Neutral" });
    setFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTarget) return;
    try {
      await submitFeedback.mutateAsync({
        interviewId: feedbackTarget.interviewId,
        intervieweeId: feedbackTarget.intervieweeId,
        marks: feedbackForm.marks,
        comments: feedbackForm.comments || undefined,
        recommendation: feedbackForm.recommendation,
      });
      toast({ title: "Feedback submitted" });
      setFeedbackDialog(false);
    } catch {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    }
  };

  return (
    <HRLayout title="My Assignments" subtitle="Interviews you're assigned to as an interviewer">
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-card-foreground">No interviews assigned</p>
          <p className="text-sm text-muted-foreground">You'll see interviews here when assigned as an interviewer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview list */}
          <div className="space-y-4">
            <h2 className="font-semibold text-card-foreground">Assignments</h2>
            {interviews.map((iv) => (
              <button
                key={iv.id}
                onClick={() => setSelectedId(iv.id)}
                className={`w-full text-left bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-all ${selectedId === iv.id ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{iv.title}</p>
                    {iv.job && <p className="text-xs text-muted-foreground mt-0.5">Job: {iv.job.title}</p>}
                  </div>
                  <StatusBadge label={iv.status} variant={iv.status === "Scheduled" ? "info" : iv.status === "Completed" ? "success" : "default"} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {iv.scheduled_date}</span>
                  {iv.scheduled_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {iv.scheduled_time}</span>}
                  {iv.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {iv.venue}</span>}
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {iv.interviewees_count ?? iv.interviewees?.length} candidates</span>
                </div>
              </button>
            ))}
          </div>

          {/* Interview detail & scoring */}
          <div>
            {detail ? (
              <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
                <h3 className="font-semibold text-card-foreground mb-4">{detail.title} — Candidates</h3>
                {detail.description && <p className="text-sm text-muted-foreground mb-4">{detail.description}</p>}
                <div className="space-y-3">
                  {detail.interviewees.map((ie) => (
                    <div key={ie.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">{ie.name}</p>
                          {ie.email && <p className="text-xs text-muted-foreground">{ie.email}</p>}
                          {ie.phone && <p className="text-xs text-muted-foreground">{ie.phone}</p>}
                        </div>
                        <Button size="sm" onClick={() => openFeedback(detail.id, ie.id, ie.name)}>
                          <Send className="h-3.5 w-3.5 mr-1" /> Score
                        </Button>
                      </div>
                      {/* Show own submitted feedback */}
                      {ie.feedback && ie.feedback.length > 0 && (
                        <div className="mt-3 bg-muted/30 rounded p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-medium">{ie.feedback[0].marks}/10</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              ie.feedback[0].recommendation.includes("Yes") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              ie.feedback[0].recommendation.includes("No") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>{ie.feedback[0].recommendation}</span>
                          </div>
                          {ie.feedback[0].comments && <p className="text-muted-foreground mt-1">{ie.feedback[0].comments}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 shadow-sm text-center text-muted-foreground">
                Select an interview to view candidates and submit scores.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Submit Dialog */}
      <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Score: {feedbackTarget?.intervieweeName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Marks (1-10): <span className="font-bold text-lg">{feedbackForm.marks}</span></Label>
              <Slider
                value={[feedbackForm.marks]}
                onValueChange={(v) => setFeedbackForm({ ...feedbackForm, marks: v[0] })}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 (Poor)</span>
                <span>10 (Excellent)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recommendation *</Label>
              <Select value={feedbackForm.recommendation} onValueChange={(v) => setFeedbackForm({ ...feedbackForm, recommendation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strong Yes">Strong Yes</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Strong No">Strong No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea value={feedbackForm.comments} onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} rows={3} placeholder="Your assessment of the candidate..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback} disabled={submitFeedback.isPending}>
              {submitFeedback.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default MyInterviews;

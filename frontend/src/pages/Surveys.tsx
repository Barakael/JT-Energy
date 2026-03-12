import { useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ClipboardList, Trash2, GripVertical, Eye, BarChart2, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSurveys, useCreateSurvey, useDeleteSurvey, useRespondSurvey, useSurveyResults,
  type Survey, type SurveyQuestion,
} from "@/hooks/api/useSurveys";

type QuestionDraft = {
  text: string;
  type: SurveyQuestion["type"];
  options?: string;
};

const Surveys = () => {
  const { isHRAdmin } = useAuth();
  const { data: surveys = [], isLoading } = useSurveys();
  const createSurvey = useCreateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const respondSurvey = useRespondSurvey();

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSurvey, setViewSurvey] = useState<Survey | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [newQ, setNewQ] = useState<QuestionDraft>({ text: "", type: "text", options: "" });

  // Take survey dialog
  const [takeSurvey, setTakeSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Results dialog
  const [resultsSurveyId, setResultsSurveyId] = useState<number | null>(null);
  const { data: resultsData, isLoading: resultsLoading } = useSurveyResults(resultsSurveyId);

  const { toast } = useToast();

  const openAdd = () => {
    setForm({ title: "", description: "" });
    setQuestions([]);
    setDialogOpen(true);
  };

  const addQuestion = () => {
    if (!newQ.text) return;
    setQuestions((prev) => [...prev, { ...newQ }]);
    setNewQ({ text: "", type: "text", options: "" });
  };

  const removeQuestion = (i: number) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const openTakeSurvey = (survey: Survey) => {
    setAnswers({});
    setTakeSurvey(survey);
  };

  const setAnswer = (questionId: number, value: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const handleSubmitAnswers = () => {
    if (!takeSurvey) return;
    const unanswered = takeSurvey.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast({ title: "Please answer all questions", variant: "destructive" });
      return;
    }
    respondSurvey.mutate(
      { id: takeSurvey.id, answers: takeSurvey.questions.map((q) => ({ question_id: q.id, answer: answers[q.id] ?? "" })) },
      {
        onSuccess: () => { toast({ title: "Response submitted!" }); setTakeSurvey(null); },
        onError: () => toast({ title: "Failed to submit response", variant: "destructive" }),
      }
    );
  };

  const renderQuestionInput = (q: SurveyQuestion) => {
    const val = answers[q.id] ?? "";
    if (q.type === "text") {
      return (
        <Textarea rows={2} className="resize-none" value={val}
          onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="Your answer..." />
      );
    }
    if (q.type === "rating") {
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setAnswer(q.id, String(n))}
              className={`w-9 h-9 rounded-full text-sm font-semibold border transition-colors ${
                val === String(n) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary text-foreground"
              }`}>
              {n}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === "yes_no") {
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
              className={`px-5 py-2 rounded-md text-sm font-medium border transition-colors ${
                val === opt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary text-foreground"
              }`}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === "multiple_choice") {
      const opts = (q.options ?? "").split(",").map((o) => o.trim()).filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => (
            <button key={opt} type="button" onClick={() => setAnswer(q.id, opt)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                val === opt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary text-foreground"
              }`}>
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderResultSummary = (q: { question_text: string; type: string; options?: string; answers: { user: string; answer: string }[] }) => {
    const { type, answers: ans } = q;
    if (type === "yes_no") {
      const yes = ans.filter((a) => a.answer.toLowerCase() === "yes").length;
      const no  = ans.filter((a) => a.answer.toLowerCase() === "no").length;
      return (
        <div className="flex gap-4 text-sm mt-1">
          <span className="text-green-600 font-medium">Yes: {yes}</span>
          <span className="text-red-500 font-medium">No: {no}</span>
        </div>
      );
    }
    if (type === "rating") {
      const nums = ans.map((a) => Number(a.answer)).filter((n) => !isNaN(n));
      const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "—";
      const counts = [1, 2, 3, 4, 5].map((n) => ({ n, c: nums.filter((x) => x === n).length }));
      return (
        <div className="mt-1 space-y-1">
          <p className="text-sm font-medium">Average: {avg} / 5</p>
          <div className="flex gap-3">
            {counts.map(({ n, c }) => (
              <div key={n} className="flex flex-col items-center text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{c}</span>
                <span>{n}★</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (type === "multiple_choice") {
      const opts = (q.options ?? "").split(",").map((o) => o.trim()).filter(Boolean);
      return (
        <div className="mt-1 flex flex-wrap gap-3">
          {opts.map((opt) => (
            <span key={opt} className="text-sm text-foreground">
              <span className="font-semibold">{opt}</span>: {ans.filter((a) => a.answer === opt).length}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-1 space-y-1 max-h-36 overflow-y-auto">
        {ans.map((a, i) => (
          <div key={i} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{a.user}:</span> {a.answer}
          </div>
        ))}
        {ans.length === 0 && <p className="text-xs text-muted-foreground italic">No answers yet</p>}
      </div>
    );
  };

  const handleSave = () => {
    if (!form.title || questions.length === 0) {
      toast({ title: "Add a title and at least one question", variant: "destructive" });
      return;
    }
    createSurvey.mutate({
      title: form.title,
      description: form.description,
      questions: questions.map((q) => ({ text: q.text, type: q.type, options: q.options })),
    }, {
      onSuccess: () => {
        toast({ title: "Survey created" });
        setDialogOpen(false);
      },
      onError: () => toast({ title: "Failed to create survey", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    deleteSurvey.mutate(id, {
      onSuccess: () => toast({ title: "Survey deleted" }),
      onError: () => toast({ title: "Failed to delete survey", variant: "destructive" }),
    });
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { text: "Free Text", rating: "Rating (1-5)", multiple_choice: "Multiple Choice", yes_no: "Yes / No" };
    return map[t] || t;
  };

  return (
    <HRLayout
      title="Surveys"
      subtitle="Create and manage employee surveys"
      actions={
        isHRAdmin ? (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Create Survey
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary"><ClipboardList className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium text-card-foreground">{survey.title}</p>
                    <p className="text-xs text-muted-foreground">{survey.created_at}</p>
                  </div>
                </div>
                <StatusBadge label={survey.status} variant={survey.status === "Active" ? "success" : survey.status === "Closed" ? "default" : "warning"} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{survey.questions.length} questions · {survey.responses_count} responses</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {isHRAdmin ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setViewSurvey(survey)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setResultsSurveyId(survey.id)}>
                        <BarChart2 className="h-3.5 w-3.5 mr-1" /> Results
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(survey.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : survey.has_responded ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium px-2">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                    </span>
                  ) : survey.status === "Active" ? (
                    <Button variant="ghost" size="sm" onClick={() => openTakeSurvey(survey)}>
                      <ClipboardList className="h-3.5 w-3.5 mr-1" /> Answer
                    </Button>
                  ) : (
                    <span className="italic px-2">Not open</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Survey Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Survey</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Survey Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-base font-semibold">Questions ({questions.length})</Label>
              <div className="space-y-2 mt-2">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">{i + 1}. {q.text}</p>
                      <p className="text-xs text-muted-foreground">{typeLabel(q.type)}{q.options ? ` — ${q.options}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 border border-dashed border-border rounded-md space-y-3">
                <Input placeholder="Question text..." value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newQ.type} onValueChange={(v) => setNewQ({ ...newQ, type: v as SurveyQuestion["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Free Text</SelectItem>
                      <SelectItem value="rating">Rating (1-5)</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="yes_no">Yes / No</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
                </div>
                {newQ.type === "multiple_choice" && (
                  <Input placeholder="Options (comma-separated)" value={newQ.options ?? ""} onChange={(e) => setNewQ({ ...newQ, options: e.target.value })} />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createSurvey.isPending}>
              {createSurvey.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Questions Dialog (admin) */}
      <Dialog open={!!viewSurvey} onOpenChange={() => setViewSurvey(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewSurvey?.title}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">{viewSurvey?.description}</p>
          <div className="space-y-3">
            {viewSurvey?.questions.map((q, i) => (
              <div key={q.id} className="bg-secondary/50 rounded-md px-4 py-3">
                <p className="text-sm font-medium text-card-foreground">{i + 1}. {q.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{typeLabel(q.type)}{q.options ? `: ${q.options}` : ""}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Take Survey Dialog (employee) */}
      <Dialog open={!!takeSurvey} onOpenChange={() => setTakeSurvey(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{takeSurvey?.title}</DialogTitle></DialogHeader>
          {takeSurvey?.description && (
            <p className="text-sm text-muted-foreground mb-2">{takeSurvey.description}</p>
          )}
          <div className="space-y-5 py-2">
            {takeSurvey?.questions.map((q, i) => (
              <div key={q.id}>
                <p className="text-sm font-medium text-foreground mb-2">
                  {i + 1}. {q.text}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">({typeLabel(q.type)})</span>
                </p>
                {renderQuestionInput(q)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTakeSurvey(null)}>Cancel</Button>
            <Button onClick={handleSubmitAnswers} disabled={respondSurvey.isPending}>
              {respondSurvey.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog (admin) */}
      <Dialog open={resultsSurveyId !== null} onOpenChange={() => setResultsSurveyId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Survey Results</DialogTitle></DialogHeader>
          {resultsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : resultsData ? (
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">{resultsData.total_responses}</span> total response{resultsData.total_responses !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {resultsData.questions.map((q, i) => (
                  <div key={q.question_id} className="bg-secondary/40 rounded-lg px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      {i + 1}. {q.question_text}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">({typeLabel(q.type)})</span>
                    </p>
                    {renderResultSummary(q)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Surveys;

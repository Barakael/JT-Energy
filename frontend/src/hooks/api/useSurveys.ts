import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface SurveyQuestion {
  id: number;
  text: string;
  type: "text" | "rating" | "yes_no" | "multiple_choice";
  options?: string;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  status: string;
  responses_count: number;
  has_responded: boolean;
  questions: SurveyQuestion[];
  created_at: string;
}

export interface SurveyResultAnswer {
  user: string;
  answer: string;
}

export interface SurveyResultQuestion {
  question_id: number;
  question_text: string;
  type: string;
  options?: string;
  answers: SurveyResultAnswer[];
}

export interface SurveyResults {
  total_responses: number;
  questions: SurveyResultQuestion[];
}

function mapSurvey(raw: Record<string, unknown>): Survey {
  return {
    id:              raw.id as number,
    title:           (raw.title as string) ?? "",
    description:     raw.description as string,
    status:          (raw.status as string) ?? "Draft",
    responses_count: (raw.responses_count as number) ?? 0,
    has_responded:   (raw.has_responded as boolean) ?? false,
    questions:       ((raw.questions as Record<string, unknown>[]) ?? []).map((q) => ({
      id:      q.id as number,
      text:    q.text as string,
      type:    q.type as SurveyQuestion["type"],
      options: q.options as string,
    })),
    created_at: raw.created_at
      ? new Date(raw.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
  };
}

export function useSurveys() {
  return useQuery<Survey[]>({
    queryKey: ["surveys"],
    queryFn: () => api.get("/api/v1/surveys").then((r) => r.data.map(mapSurvey)),
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/surveys", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useDeleteSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/surveys/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useRespondSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }: { id: number; answers: { question_id: number; answer: string }[] }) =>
      api.post(`/api/v1/surveys/${id}/respond`, { answers }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  });
}

export function useSurveyResults(surveyId: number | null) {
  return useQuery<SurveyResults>({
    queryKey: ["surveys", "results", surveyId],
    queryFn: () => api.get(`/api/v1/surveys/${surveyId}/responses`).then((r) => r.data),
    enabled: surveyId !== null,
  });
}

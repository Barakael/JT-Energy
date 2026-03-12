import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface InterviewSummary {
  id: number;
  title: string;
  scheduled_date: string;
  scheduled_time?: string;
  venue?: string;
  description?: string;
  status: string;
  job?: { id: number; title: string };
  creator?: { id: number; name: string };
  interviewers: { id: number; name: string; email: string }[];
  interviewees: { id: number; name: string; email?: string; phone?: string; status: string }[];
  interviewees_count: number;
}

export interface IntervieweeDetail {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  feedback: {
    id: number;
    marks: number;
    comments?: string;
    recommendation: string;
    interviewer?: { id: number; name: string };
  }[];
  average_marks?: number;
  feedback_count?: number;
}

export interface InterviewDetail {
  id: number;
  title: string;
  scheduled_date: string;
  scheduled_time?: string;
  venue?: string;
  description?: string;
  status: string;
  job?: { id: number; title: string };
  creator?: { id: number; name: string };
  interviewers: { id: number; name: string; email: string }[];
  interviewees: IntervieweeDetail[];
}

export function useJobInterviews(jobId: number | null) {
  return useQuery<InterviewSummary[]>({
    queryKey: ["interviews", "job", jobId],
    queryFn: () =>
      api.get(`/api/v1/jobs/${jobId}/interviews`).then((r) => r.data),
    enabled: !!jobId,
  });
}

export function useInterviewDetail(interviewId: number | null) {
  return useQuery<InterviewDetail>({
    queryKey: ["interviews", "detail", interviewId],
    queryFn: () =>
      api.get(`/api/v1/interviews/${interviewId}`).then((r) => r.data),
    enabled: !!interviewId,
  });
}

export function useMyInterviews() {
  return useQuery<InterviewSummary[]>({
    queryKey: ["interviews", "my"],
    queryFn: () =>
      api.get("/api/v1/interviews/my").then((r) => r.data),
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, ...data }: { jobId: number } & Record<string, unknown>) =>
      api.post(`/api/v1/jobs/${jobId}/interviews`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews"] }),
  });
}

export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/interviews/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews"] }),
  });
}

export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/interviews/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews"] }),
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      interviewId,
      intervieweeId,
      ...data
    }: {
      interviewId: number;
      intervieweeId: number;
      marks: number;
      comments?: string;
      recommendation: string;
    }) =>
      api
        .post(`/api/v1/interviews/${interviewId}/interviewees/${intervieweeId}/feedback`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interviews"] }),
  });
}

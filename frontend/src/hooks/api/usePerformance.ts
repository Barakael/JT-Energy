import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface PerformanceReview {
  id: number;
  employee: string;
  reviewer: string;
  department: string;
  rating: number;
  period: string;
  feedback?: string;
  status: string;
}

function mapReview(raw: Record<string, unknown>): PerformanceReview {
  const reviewee = (raw.reviewee as Record<string, unknown>) ?? {};
  const reviewer = (raw.reviewer as Record<string, unknown>) ?? {};
  const dept     = (raw.department as Record<string, unknown>) ?? {};
  return {
    id:         raw.id as number,
    employee:   (reviewee.name as string) ?? "",
    reviewer:   (reviewer.name as string) ?? "",
    department: (dept.name as string) ?? "",
    rating:     raw.rating as number,
    period:     (raw.period as string) ?? "",
    feedback:   raw.feedback as string,
    status:     (raw.status as string) ?? "Draft",
  };
}

export function usePerformance() {
  return useQuery<PerformanceReview[]>({
    queryKey: ["performance"],
    queryFn: () =>
      api.get("/api/v1/performance").then((r) => (r.data.data ?? r.data).map(mapReview)),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/performance", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performance"] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/performance/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performance"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/performance/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performance"] }),
  });
}

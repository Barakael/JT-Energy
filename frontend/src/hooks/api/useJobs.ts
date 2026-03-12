import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Job {
  id: number;
  title: string;
  department_id: number | null;
  department: string;
  station: string;
  location: string;
  type: string;
  status: string;
  applicants: number;
  posted_at?: string;
  description?: string;
}

function mapJob(raw: Record<string, unknown>): Job {
  return {
    id:            raw.id as number,
    title:         raw.title as string,
    department_id: (raw.department_id as number) ?? null,
    department:    (raw.department_name as string) ?? "",
    station:       (raw.station_name as string) ?? "",
    location:      (raw.location as string) ?? "",
    type:          (raw.type as string) ?? "",
    status:        (raw.status as string) ?? "Open",
    applicants:    (raw.applicants as number) ?? 0,
    posted_at:     raw.posted_at as string,
    description:   raw.description as string,
  };
}

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: () =>
      api.get("/api/v1/jobs").then((r) => (r.data.data ?? r.data).map(mapJob)),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/jobs", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/jobs/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/jobs/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

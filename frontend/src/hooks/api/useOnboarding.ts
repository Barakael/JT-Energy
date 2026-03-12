import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface OnboardingTask {
  id: number;
  task: string;
  category: string;
  done: boolean;
}

export interface NewHire {
  id: number;
  name: string;
  email?: string;
  role?: string;
  department: string;
  startDate: string;
  progress: number;
  tasks: OnboardingTask[];
}

function mapHire(raw: Record<string, unknown>): NewHire {
  const dept  = (raw.department as Record<string, unknown>) ?? {};
  const tasks = (raw.tasks as Record<string, unknown>[]) ?? [];
  return {
    id:         raw.id as number,
    name:       (raw.name as string) ?? "",
    email:      raw.email as string,
    role:       raw.role as string,
    department: (dept.name as string) ?? "",
    startDate:  raw.start_date
      ? new Date(raw.start_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    progress:   (raw.progress as number) ?? 0,
    tasks:      tasks.map((t) => ({
      id:       t.id as number,
      task:     t.task as string,
      category: t.category as string,
      done:     t.done as boolean,
    })),
  };
}

export function useOnboarding() {
  return useQuery<NewHire[]>({
    queryKey: ["onboarding"],
    queryFn: () =>
      api.get("/api/v1/onboarding").then((r) => (r.data.data ?? r.data).map(mapHire)),
  });
}

export function useCreateHire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/onboarding", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });
}

export function useUpdateHire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/onboarding/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });
}

export function useDeleteHire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/onboarding/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hireId, taskId }: { hireId: number; taskId: number }) =>
      api.patch(`/api/v1/onboarding/${hireId}/tasks/${taskId}/toggle`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding"] }),
  });
}

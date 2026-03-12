import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface ExitRecord {
  id: number;
  name: string;
  department: string;
  exitType: string;
  lastDay: string;
  clearance: string;
  status: string;
}

function mapExit(raw: Record<string, unknown>): ExitRecord {
  const user    = (raw.user as Record<string, unknown>) ?? {};
  const profile = (user.profile as Record<string, unknown>) ?? {};
  const dept    = (profile.department as Record<string, unknown>) ?? {};
  return {
    id:         raw.id as number,
    name:       (user.name as string) ?? "",
    department: (dept.name as string) ?? "",
    exitType:   (raw.exit_type as string) ?? "",
    lastDay:    raw.last_day
      ? new Date(raw.last_day as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    clearance:  (raw.clearance_status as string) ?? "Not Started",
    status:     (raw.status as string) ?? "Initiated",
  };
}

export function useExitRecords() {
  return useQuery<ExitRecord[]>({
    queryKey: ["exits"],
    queryFn: () =>
      api.get("/api/v1/exits").then((r) => (r.data.data ?? r.data).map(mapExit)),
  });
}

export function useCreateExit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/exits", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exits"] }),
  });
}

export function useUpdateExit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/exits/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exits"] }),
  });
}

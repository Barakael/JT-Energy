import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  available: number;
}

export interface LeaveRequest {
  id: number;
  name: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: string;
}

function mapRequest(raw: Record<string, unknown>): LeaveRequest {
  const user = (raw.user as Record<string, unknown>) ?? {};
  return {
    id:     raw.id as number,
    name:   (user.name as string) ?? "",
    type:   (raw.type as string) ?? "",
    from:   new Date(raw.from_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    to:     new Date(raw.to_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    days:   raw.days as number,
    reason: (raw.reason as string) ?? "",
    status: (raw.status as string) ?? "Pending",
  };
}

export function useLeaveBalances() {
  return useQuery<LeaveBalance[]>({
    queryKey: ["leave", "balances"],
    queryFn: () => api.get("/api/v1/leave/balances").then((r) => r.data),
  });
}

export function useLeaveRequests() {
  return useQuery<LeaveRequest[]>({
    queryKey: ["leave", "requests"],
    queryFn: () =>
      api.get("/api/v1/leave").then((r) => (r.data.data ?? r.data).map(mapRequest)),
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/leave", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leave"] });
    },
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/api/v1/leave/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave"] }),
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/api/v1/leave/${id}/reject`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave"] }),
  });
}

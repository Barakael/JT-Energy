import { useQuery } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface DashboardStats {
  employee_count: number;
  open_jobs: number;
  on_leave_today: number;
  pending_approvals: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.get("/api/v1/dashboard/stats").then((r) => r.data),
  });
}

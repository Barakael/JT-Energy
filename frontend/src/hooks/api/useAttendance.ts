import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface AttendanceRecord {
  id?: number;
  date: string;
  employee: string;
  clockIn: string;
  clockOut: string;
  hours: string;
  status: "Present" | "Absent" | "Late" | "Half Day";
}

function mapRecord(raw: Record<string, unknown>): AttendanceRecord {
  const user = (raw.user as Record<string, unknown>) ?? {};
  return {
    id:       raw.id as number,
    date:     new Date(raw.date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    employee: (user.name as string) ?? "",
    clockIn:  (raw.clock_in as string) ?? "—",
    clockOut: (raw.clock_out as string) ?? "—",
    hours:    (raw.hours as string) ?? "—",
    status:   (raw.status as AttendanceRecord["status"]) ?? "Present",
  };
}

export function useAttendance(params?: { month?: string; search?: string }) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", params],
    queryFn: () =>
      api
        .get("/api/v1/attendance", { params })
        .then((r) => (r.data.data ?? r.data).map(mapRecord)),
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/v1/attendance/clock-in").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/v1/attendance/clock-out").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

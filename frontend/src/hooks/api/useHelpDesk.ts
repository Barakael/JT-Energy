import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  employee: string;
  department_id?: number;
  department_name?: string;
  created_at: string;
}

function mapTicket(raw: Record<string, unknown>): Ticket {
  const user = (raw.user as Record<string, unknown>) ?? {};
  const dept = (raw.department as Record<string, unknown>) ?? {};
  return {
    id:              raw.id as number,
    ticket_number:   (raw.ticket_number as string) ?? `TKT-${raw.id}`,
    subject:         (raw.subject as string) ?? "",
    description:     (raw.description as string) ?? "",
    category:        (raw.category as string) ?? "",
    priority:        (raw.priority as string) ?? "Medium",
    status:          (raw.status as string) ?? "Open",
    employee:        (user.name as string) ?? "",
    department_id:   raw.department_id as number | undefined,
    department_name: (dept.name as string) || undefined,
    created_at: raw.created_at
      ? new Date(raw.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
  };
}

export function useTickets(status?: string) {
  return useQuery<Ticket[]>({
    queryKey: ["tickets", status],
    queryFn: () =>
      api
        .get("/api/v1/tickets", { params: { status } })
        .then((r) => (r.data.data ?? r.data).map(mapTicket)),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/tickets", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/tickets/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Transfer {
  id: number;
  employee: string;
  fromDept: string;
  toDept: string;
  fromRole: string;
  toRole: string;
  effectiveDate: string;
  reason: string;
  status: string;
}

function mapTransfer(raw: Record<string, unknown>): Transfer {
  const user   = (raw.user as Record<string, unknown>) ?? {};
  const from   = (raw.from_department as Record<string, unknown>) ?? {};
  const to     = (raw.to_department as Record<string, unknown>) ?? {};
  return {
    id:            raw.id as number,
    employee:      (user.name as string) ?? "",
    fromDept:      (from.name as string) ?? "",
    toDept:        (to.name as string) ?? "",
    fromRole:      (raw.from_role as string) ?? "",
    toRole:        (raw.to_role as string) ?? "",
    effectiveDate: raw.effective_date
      ? new Date(raw.effective_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    reason:        (raw.reason as string) ?? "",
    status:        (raw.status as string) ?? "Pending",
  };
}

export function useTransfers() {
  return useQuery<Transfer[]>({
    queryKey: ["transfers"],
    queryFn: () =>
      api.get("/api/v1/transfers").then((r) => (r.data.data ?? r.data).map(mapTransfer)),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/transfers", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}

export function useUpdateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/transfers/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}

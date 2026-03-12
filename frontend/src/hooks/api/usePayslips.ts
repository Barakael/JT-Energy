import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Payslip {
  id: number;
  period: string;
  quarter: string | null;
  year: number | null;
  period_start: string;
  period_end: string;
  gross: number;
  deductions: number;
  net: number;
  status: string;
  authorized_by: string | null;
  date_issued: string | null;
  employee?: string;
  employee_id?: string | number;
}

export function usePayslips() {
  return useQuery<Payslip[]>({
    queryKey: ["payslips"],
    queryFn: () => api.get("/api/v1/payslips").then((r) => r.data),
  });
}

export function useCreatePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/payslips", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payslips"] }),
  });
}

export function useUpdatePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/payslips/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payslips"] }),
  });
}

export function useDeletePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/payslips/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payslips"] }),
  });
}

export async function downloadPayslip(id: number, filename = "payslip") {
  const r = await api.get(`/api/v1/payslips/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([r.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

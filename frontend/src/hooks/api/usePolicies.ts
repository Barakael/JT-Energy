import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Policy {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  target_type: string;
  created_by: number;
  creator?: { id: number; name: string };
  published_at?: string;
  recipients_count?: number;
  is_read?: boolean;
  created_at: string;
}

export function usePolicies() {
  return useQuery<Policy[]>({
    queryKey: ["policies"],
    queryFn: () =>
      api.get("/api/v1/policies").then((r) => r.data.data ?? r.data),
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/policies", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/policies/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/policies/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkPolicyRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/api/v1/policies/${id}/read`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policies"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

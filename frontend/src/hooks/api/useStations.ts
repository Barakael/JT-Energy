import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Station {
  id: number;
  name: string;
  code: string;
  description: string;
  location: string;
  active: boolean;
  departments: number;
}

export function useStations() {
  return useQuery<Station[]>({
    queryKey: ["stations"],
    queryFn: () => api.get("/api/v1/stations").then((r) => r.data),
  });
}

export function useCreateStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Station>) =>
      api.post("/api/v1/stations", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stations"] }),
  });
}

export function useUpdateStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Station> & { id: number }) =>
      api.put(`/api/v1/stations/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stations"] }),
  });
}

export function useDeleteStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/stations/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stations"] }),
  });
}

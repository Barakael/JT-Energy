import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role?: string;         // job title from profile
  dept: string;
  status: string;
  phone?: string;
  joined?: string;
}

function mapEmployee(raw: Record<string, unknown>): Employee {
  const profile = (raw.profile as Record<string, unknown>) ?? {};
  const dept    = (profile.department as Record<string, unknown>) ?? {};
  return {
    id:     raw.id as number,
    name:   raw.name as string,
    email:  raw.email as string,
    role:   (profile.title as string) ?? "",
    dept:   (dept.name as string) ?? "",
    status: (profile.status as string) ?? "Active",
    phone:  (profile.phone as string) ?? "",
    joined: profile.joined_at
      ? new Date(profile.joined_at as string).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "",
  };
}

export function useEmployees(search?: string) {
  return useQuery<Employee[]>({
    queryKey: ["employees", search],
    queryFn: () =>
      api
        .get("/api/v1/employees", { params: { search } })
        .then((r) => (r.data.data ?? r.data).map(mapEmployee)),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/employees", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/employees/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/employees/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

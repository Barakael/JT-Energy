import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface Document {
  id: number;
  title: string;
  employee: string;
  type: string;
  uploadedDate: string;
  size: string;
  status: string;
}

function mapDoc(raw: Record<string, unknown>): Document {
  const user = (raw.user as Record<string, unknown>) ?? {};
  return {
    id:           raw.id as number,
    title:        (raw.title as string) ?? "",
    employee:     (user.name as string) ?? "",
    type:         (raw.type as string) ?? "",
    uploadedDate: raw.created_at
      ? new Date(raw.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    size:         (raw.file_size as string) ?? "",
    status:       (raw.status as string) ?? "Active",
  };
}

export function useDocuments(search?: string) {
  return useQuery<Document[]>({
    queryKey: ["documents", search],
    queryFn: () =>
      api
        .get("/api/v1/documents", { params: { search } })
        .then((r) => (r.data.data ?? r.data).map(mapDoc)),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api
        .post("/api/v1/documents", formData, { headers: { "Content-Type": "multipart/form-data" } })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/documents/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export async function downloadDocument(id: number, filename = "document") {
  const r = await api.get(`/api/v1/documents/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([r.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface AssetCategory {
  id: number;
  name: string;
  description: string | null;
  assets_count: number;
}

export function useAssetCategories() {
  return useQuery<AssetCategory[]>({
    queryKey: ["asset-categories"],
    queryFn: () => api.get("/api/v1/asset-categories").then((r) => r.data),
  });
}

export function useCreateAssetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post("/api/v1/asset-categories", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["asset-categories"] }),
  });
}

export function useUpdateAssetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description?: string }) =>
      api.put(`/api/v1/asset-categories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["asset-categories"] }),
  });
}

export function useDeleteAssetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/asset-categories/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["asset-categories"] }),
  });
}

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  category_id: number | null;
  category_name: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  warranty_expiry: string | null;
  station_id: number | null;
  station_name: string | null;
  description: string | null;
  quantity: number;
  created_by_name: string | null;
  created_at: string;
}

export function useAssets(search?: string, categoryId?: number) {
  return useQuery<Asset[]>({
    queryKey: ["assets", search, categoryId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryId) params.category_id = String(categoryId);
      return api.get("/api/v1/assets", { params }).then((r) => r.data);
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/assets", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/assets/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/assets/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

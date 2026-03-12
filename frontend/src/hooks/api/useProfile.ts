import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface ProfileDetail {
  phone: string;
  location: string;
  startDate: string;
  manager: string;
  employeeId: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export function useProfileDetail(userId?: number) {
  return useQuery<ProfileDetail>({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: () =>
      api.get("/api/auth/me").then(({ data }) => {
        const user    = data.user ?? data;
        const profile = user.profile ?? {};
        const ec      = user.emergency_contact ?? {};
        return {
          phone:       profile.phone ?? "",
          location:    profile.location ?? "",
          startDate:   profile.joined_at
            ? new Date(profile.joined_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "",
          manager:     profile.manager?.name ?? "",
          employeeId:  user.employee_id ?? "",
          emergencyContact: {
            name:     ec.name ?? "",
            relation: ec.relation ?? "",
            phone:    ec.phone ?? "",
          },
        };
      }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/api/v1/employees/${id}`, data).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["profile", vars.id] });
    },
  });
}

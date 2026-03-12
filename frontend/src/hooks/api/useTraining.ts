import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface TrainingProgram {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  status: string;
  description?: string;
  enrollments_count: number;
  venue?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  mode?: string;
  max_capacity?: number;
}

export interface TrainingEnrollment {
  id: number;
  title: string;
  category: string;
  instructor: string;
  progress: number;
  status: string;
  duration: string;
}

function mapProgram(raw: Record<string, unknown>): TrainingProgram {
  return {
    id:                raw.id as number,
    title:             raw.title as string,
    category:          (raw.category as string) ?? "",
    instructor:        (raw.instructor as string) ?? "",
    duration:          (raw.duration as string) ?? "",
    status:            (raw.status as string) ?? "Active",
    description:       raw.description as string,
    enrollments_count: (raw.enrollments_count as number) ?? (raw.enrolled as number) ?? 0,
    venue:             (raw.venue as string) ?? "",
    start_date:        (raw.start_date as string) ?? "",
    end_date:          (raw.end_date as string) ?? "",
    start_time:        (raw.start_time as string) ?? "",
    end_time:          (raw.end_time as string) ?? "",
    mode:              (raw.mode as string) ?? "Offline",
    max_capacity:      (raw.max_capacity as number) ?? undefined,
  };
}

function mapEnrollment(raw: Record<string, unknown>): TrainingEnrollment {
  const program = (raw.program as Record<string, unknown>) ?? {};
  return {
    id:         raw.id as number,
    title:      (program.title as string) ?? "",
    category:   (program.category as string) ?? "",
    instructor: (program.instructor as string) ?? "",
    progress:   (raw.progress as number) ?? 0,
    status:     (raw.status as string) ?? "Enrolled",
    duration:   (program.duration as string) ?? "",
  };
}

export function useTrainingPrograms() {
  return useQuery<TrainingProgram[]>({
    queryKey: ["training", "programs"],
    queryFn: () =>
      api.get("/api/v1/training").then((r) => (r.data.data ?? r.data).map(mapProgram)),
  });
}

export function useMyEnrollments() {
  return useQuery<TrainingEnrollment[]>({
    queryKey: ["training", "my-enrollments"],
    queryFn: () =>
      api.get("/api/v1/training/my-enrollments").then((r) => r.data.map(mapEnrollment)),
  });
}

export function useCreateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/api/v1/training", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });
}

export function useUpdateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put(`/api/v1/training/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });
}

export function useDeleteTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/training/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trainingId: number) =>
      api.post(`/api/v1/training/${trainingId}/enroll`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });
}

export interface TrainingAttendee {
  enrollment_id: number;
  user_id: number;
  name: string;
  email: string;
  status: string;
  attended: boolean;
}

export function useAssignByDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trainingId, department_ids, all_departments }: { trainingId: number; department_ids?: number[]; all_departments?: boolean }) =>
      api.post(`/api/v1/training/${trainingId}/assign-by-department`, { department_ids, all_departments }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });
}

export function useGetAttendees(trainingId: number | null) {
  return useQuery<TrainingAttendee[]>({
    queryKey: ["training", "attendees", trainingId],
    queryFn: () => api.get(`/api/v1/training/${trainingId}/attendees`).then((r) => r.data),
    enabled: trainingId !== null,
  });
}

export function useMarkAttended() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trainingId, enrollmentId, attended }: { trainingId: number; enrollmentId: number; attended: boolean }) =>
      api.patch(`/api/v1/training/${trainingId}/enrollments/${enrollmentId}/attended`, { attended }).then((r) => r.data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["training", "attendees", vars.trainingId] }),
  });
}

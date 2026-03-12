import { useQuery } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface NotificationItem {
  id: number;
  title: string;
  type: string;
  priority: string;
  published_at: string;
  excerpt: string;
  is_read: boolean;
}

export function useUnreadNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications", "unread"],
    queryFn: () =>
      api.get("/api/v1/notifications/unread").then((r) => r.data),
  });
}

export function useNotificationCount() {
  return useQuery<number>({
    queryKey: ["notifications", "count"],
    queryFn: () =>
      api.get("/api/v1/notifications/count").then((r) => r.data.count as number),
  });
}

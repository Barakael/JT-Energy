import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/components/api/axios";

export interface ChatConversation {
  id: number;
  title: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  sql_query: string | null;
  created_at: string;
}

interface ChatResponse {
  conversation_id: number;
  message: string;
  sql_query: string | null;
}

export function useConversations() {
  return useQuery<ChatConversation[]>({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/ai/conversations");
      return data;
    },
  });
}

export function useConversationMessages(conversationId: number | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ["ai-messages", conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/ai/conversations/${conversationId}`);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation<ChatResponse, Error, { message: string; conversation_id?: number }>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/v1/ai/chat", payload);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ai-conversations"] });
      qc.invalidateQueries({ queryKey: ["ai-messages", data.conversation_id] });
    },
  });
}

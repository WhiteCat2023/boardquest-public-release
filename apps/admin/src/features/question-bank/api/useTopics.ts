import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { showFeedback } from "@/components/modal";

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTopicInput {
  name: string;
  description?: string;
}

export interface UpdateTopicInput {
  id: string;
  name: string;
  description?: string;
}

export function useTopics(categoryId: string | null | undefined) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["topics", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await axiosPrivate.get(
        `/questions/category/${categoryId}/topics`
      );
      const data = response.data?.data?.topics ?? response.data?.topics ?? [];
      return data as Topic[];
    },
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useCreateTopic(categoryId: string | null | undefined) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopicInput) => {
      if (!categoryId) throw new Error("Subject ID is required");
      const response = await axiosPrivate.post(
        `/questions/category/${categoryId}/topics`,
        data
      );
      return response.data?.data?.topic ?? response.data?.topic;
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: ["topics", categoryId] });
      showFeedback.success(`Topic "${topic?.name || "Topic"}" added successfully!`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create topic";
      showFeedback.error(msg);
    },
  });
}

export function useUpdateTopic(categoryId: string | null | undefined) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTopicInput) => {
      const response = await axiosPrivate.put(
        `/questions/topics/${id}`,
        data
      );
      return response.data?.data?.topic ?? response.data?.topic;
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: ["topics", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      showFeedback.success(`Topic "${topic?.name || "Topic"}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update topic";
      showFeedback.error(msg);
    },
  });
}

export function useDeleteTopic(categoryId: string | null | undefined) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await axiosPrivate.delete(
        `/questions/topics/${topicId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", categoryId] });
      showFeedback.success("Topic removed successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to remove topic";
      showFeedback.error(msg);
    },
  });
}

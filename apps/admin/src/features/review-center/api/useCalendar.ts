import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { 
  ReviewSchedule,
  CreateReviewSchedulePayload,
  UpdateReviewSchedulePayload
} from "../types/types";

export function useReviewSchedules(params?: { company?: string }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewSchedules", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/calendar/schedules/get", {
        params,
      });
      const resData = response.data?.data;
      let list: ReviewSchedule[] = [];
      if (Array.isArray(resData)) list = resData;
      else if (Array.isArray(resData?.schedules)) list = resData.schedules;
      else if (Array.isArray(response.data?.schedules)) list = response.data.schedules;

      if (params?.company && params.company !== "ALL") {
        return list.filter(
          (s) => s.companyName?.toLowerCase() === params.company?.toLowerCase()
        );
      }
      return list;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: (query) => (query.state.error ? false : 1000 * 5),
  });
}

export const useCalendar = useReviewSchedules;

export function useCreateReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewSchedulePayload) => {
      const response = await axiosPrivate.post("/calendar/schedules/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

export function useUpdateReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewSchedulePayload }) => {
      const response = await axiosPrivate.put(`/calendar/schedules/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

export function useDeleteReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/calendar/schedules/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

// ==========================================
// CALENDAR EVENTS (MONGODB DATABASE)
// ==========================================

import type { CalendarEvent } from "../components/calendar/types";

export function useCalendarEvents() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<CalendarEvent[]>({
    queryKey: ["calendarEvents"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/calendar/events");
      const resData = response.data?.data;
      if (Array.isArray(resData?.events)) return resData.events;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(response.data?.events)) return response.data.events;
      return [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: (query) => (query.state.error ? false : 1000 * 5),
  });
}

export function useCreateCalendarEvent() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CalendarEvent>) => {
      const response = await axiosPrivate.post("/calendar/events", data);
      return response.data?.data?.event || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CalendarEvent>;
    }) => {
      const response = await axiosPrivate.put(`/calendar/events/${id}`, data);
      return response.data?.data?.event || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/calendar/events/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}



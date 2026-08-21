import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { GameBadge, GameConfigSettings } from "../types/types";

export function useGameBadges() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<GameBadge[]>({
    queryKey: ["game-badges"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/game/badges");
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBadge() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeData: Partial<GameBadge>) => {
      const response = await axiosPrivate.post("/game/badges", badgeData);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-badges"] });
    },
  });
}

export function useUpdateBadge() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GameBadge> }) => {
      const response = await axiosPrivate.put(`/game/badges/${id}`, data);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-badges"] });
    },
  });
}

export function useToggleBadgeActive() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.patch(`/game/badges/${id}/toggle`);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-badges"] });
    },
  });
}

export function useDeleteBadge() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/game/badges/${id}`);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-badges"] });
    },
  });
}

export function useGameConfig() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<GameConfigSettings>({
    queryKey: ["game-config"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/game/config");
      const data = response.data?.data;
      return {
        baseXP: data?.baseXP ?? 10,
        xpMultiplier: data?.xpMultiplier ?? 1.5,
        streakBonusPercentage: data?.streakBonusPercentage ?? 10,
        accuracyThreshold: data?.accuracyThreshold ?? 70,
        levelUpXpBase: data?.levelUpXpBase ?? 100,
        maxLevelCap: data?.maxLevelCap ?? 50,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateGameConfig() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData: Partial<GameConfigSettings>) => {
      const response = await axiosPrivate.put("/game/config", configData);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-config"] });
    },
  });
}

export interface LeaderboardStudent {
  userId: string;
  userName: string;
  level: number;
  totalXP: number;
  streak: number;
  rank: number;
}

export function useGameLeaderboard(params?: { limit?: number; subject?: string }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<LeaderboardStudent[]>({
    queryKey: ["game-leaderboard", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/game/leaderboard", { params });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

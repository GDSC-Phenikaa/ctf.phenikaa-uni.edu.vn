import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type AdminChallenge = {
  id?: number;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  points: number;
  flag?: string;
  hidden: boolean;
  docker: boolean;
  dockerImage?: string;
};

export function useAdminChallenges() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<AdminChallenge[]>({
    queryKey: ["admin-challenges", token],
    queryFn: async () => {
      if (!token) return [];

      const res = await fetch("https://ctf-backend.caxtiq.me/admin/challenges/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch admin challenges");
      }
      const data = await res.json();
      return data.challenges || [];
    },
    enabled: !!token,
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdminChallenge) => {
      const token = localStorage.getItem("token");

      const res = await fetch("https://ctf-backend.caxtiq.me/admin/challenges/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create challenge");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
    },
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AdminChallenge }) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/challenges/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update challenge");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
    },
  });
}

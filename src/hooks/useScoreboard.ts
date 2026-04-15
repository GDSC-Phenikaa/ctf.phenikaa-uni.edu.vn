import { useQuery } from "@tanstack/react-query";

export type ScoreboardEntry = {
  user_id: number;
  username: string;
  name: string;
  score: number;
};

export type ScoreboardResponse = {
  status: string;
  scoreboard: ScoreboardEntry[];
};

export function useScoreboardCTF() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<ScoreboardResponse>({
    queryKey: ["scoreboard", "ctf", token],
    queryFn: async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("https://ctf-backend.caxtiq.me/scoreboard/ctf", {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to fetch CTF scoreboard");
      }

      return res.json();
    },
  });
}

export function useScoreboardLMS() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<ScoreboardResponse>({
    queryKey: ["scoreboard", "lms", token],
    queryFn: async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("https://ctf-backend.caxtiq.me/scoreboard/lms", {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to fetch LMS scoreboard");
      }

      return res.json();
    },
  });
}

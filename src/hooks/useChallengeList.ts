import { useQuery } from "@tanstack/react-query";

type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorName: string;
  docker: boolean;
  solves?: number; // Add solves if needed
};

type ChallengeListResponse = {
  challenges: Challenge[];
};

export function useChallengeList() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<ChallengeListResponse>({
    queryKey: ["challenges", token], // Updated query key
    queryFn: async () => {
      if (!token) {
        throw new Error("Unauthorized: No token found");
      }

      const res = await fetch("http://localhost:3333/user/challenges/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to fetch challenges");
      }

      return res.json();
    },
    enabled: !!token, // Only run the query if the token exists
  });
}
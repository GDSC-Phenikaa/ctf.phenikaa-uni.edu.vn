import { useQuery } from "@tanstack/react-query";

export type ProgressItem = {
  questionId: number;
  correct: boolean;
  moduleId?: number;
  lessonId?: number;
};

export function useProgress() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<ProgressItem[]>({
    queryKey: ["lms-progress", token],
    queryFn: async () => {
      if (!token) return [];

      const res = await fetch("http://localhost:3333/user/lms/progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch progress");
      }
      const data = await res.json();
      return data.progress || [];
    },
    enabled: !!token,
  });
}

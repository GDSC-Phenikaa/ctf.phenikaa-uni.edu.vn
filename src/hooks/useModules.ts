import { useQuery } from "@tanstack/react-query";

export type LessonBasic = {
  id: number;
  title: string;
  order: number;
  moduleId: number;
};

export type Module = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonBasic[];
};

export function useModules() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<Module[]>({
    queryKey: ["lms-modules", token],
    queryFn: async () => {
      if (!token) return [];

      const res = await fetch("http://localhost:3333/user/lms/modules", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch modules");
      }
      const data = await res.json();
      return data.modules || [];
    },
    enabled: !!token,
  });
}

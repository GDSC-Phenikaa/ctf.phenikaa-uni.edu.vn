import { useQuery } from "@tanstack/react-query";

export type OptionType = {
  id: number;
  text: string;
};

export type QuestionType = {
  id: number;
  content: string;
  type?: string;
  options: string | string[]; // Given as a JSON string in DB but returned as array string or stringified JSON depending on backend
  correct_answer?: string;
  points: number;
  lessonId: number;
};

export type LessonType = {
  id: number;
  title: string;
  content: string; // Markdown/HTML
  order: number;
  moduleId: number;
  questions?: QuestionType[];
};

export function useLesson(id: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<LessonType>({
    queryKey: ["lms-lesson", id, token],
    queryFn: async () => {
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`http://localhost:3333/user/lms/lessons/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch lesson");
      }
      const data = await res.json();
      return data.lesson;
    },
    enabled: !!token && !!id,
  });
}

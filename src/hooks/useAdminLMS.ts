import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CreateModuleInput = {
  title: string;
  description: string;
  order: number;
};

export type CreateLessonInput = {
  module_id: number;
  title: string;
  content: string;
  order: number;
};

export type CreateQuestionInput = {
  lesson_id: number;
  content: string;
  type: string;
  options: string; // JSON string format like "[\"A\", \"B\"]"
  correct_answer: string;
  points: number;
};

export type AdminQuestion = {
  id: number;
  content: string;
  type?: string;
  options: string;
  points: number;
  correct_answer: string;
  lesson_id: number;
};

export type AdminLesson = {
  id: number;
  title: string;
  content: string;
  order: number;
  module_id: number;
  questions?: AdminQuestion[];
};

export type AdminModule = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons?: AdminLesson[];
};

export function useAdminModules() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<AdminModule[]>({
    queryKey: ["admin-lms-modules", token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch("http://localhost:3333/admin/lms/modules", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch admin modules");
      const data = await res.json();
      return data.modules || [];
    },
    enabled: !!token,
  });
}

function invalidateAll(queryClient: any) {
  queryClient.invalidateQueries({ queryKey: ["admin-lms-modules"] });
  queryClient.invalidateQueries({ queryKey: ["lms-modules"] });
  queryClient.invalidateQueries({ queryKey: ["lms-lesson"] });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateModuleInput) => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3333/admin/lms/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create module");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLessonInput) => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3333/admin/lms/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create lesson");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuestionInput) => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3333/admin/lms/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create question");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CreateQuestionInput> }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3333/admin/lms/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update question");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3333/admin/lms/modules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete module");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3333/admin/lms/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3333/admin/lms/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

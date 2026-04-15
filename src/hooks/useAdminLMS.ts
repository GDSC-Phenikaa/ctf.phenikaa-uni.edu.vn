import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CreateModuleInput = {
  title: string;
  description: string;
  order: number;
};

export type CreateLessonInput = {
  module_id: number;
  title: string;
  body?: string;
  content?: string;
  video_iframe?: string;
  order: number;
};

export type CreateVideoSegmentInput = {
  lesson_id: number;
  title: string;
  description?: string;
  start_seconds: number;
  end_seconds: number;
  order?: number;
};

export type QuestionPlacement = "lesson" | "segment";

export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "true_false"
  | "short_text"
  | "long_text"
  | "numeric"
  | "code"
  | "mcq"
  | "text";

export type CreateQuestionInput = {
  lesson_id: number;
  placement: QuestionPlacement;
  video_segment_id?: number | null;
  type: QuestionType;
  prompt?: string;
  content?: string;
  options?: string;
  answer_key?: string;
  correct_answer?: string;
  points: number;
  order?: number;
};

export type AdminVideoSegment = {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  start_seconds: number;
  end_seconds: number;
  order: number;
};

export type AdminQuestion = {
  id: number;
  lesson_id: number;
  placement?: QuestionPlacement;
  video_segment_id?: number | null;
  type?: QuestionType;
  prompt?: string;
  content?: string;
  options?: string;
  points: number;
  answer_key?: string;
  correct_answer?: string;
  order?: number;
};

export type AdminLesson = {
  id: number;
  title: string;
  body?: string;
  content?: string;
  video_iframe?: string;
  order: number;
  module_id: number;
  segments?: AdminVideoSegment[];
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
      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/modules", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch admin modules");
      const data = await res.json();
      return data.modules || [];
    },
    enabled: !!token,
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["admin-lms-modules"] });
  queryClient.invalidateQueries({ queryKey: ["lms-modules"] });
  queryClient.invalidateQueries({ queryKey: ["lms-lesson"] });
  queryClient.invalidateQueries({ queryKey: ["lms-progress"] });
}

function withToken() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateModuleInput) => {
      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withToken() },
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

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateModuleInput }) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update module");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLessonInput) => {
      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withToken() },
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

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateLessonInput> }) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateVideoSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVideoSegmentInput) => {
      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/video-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create video segment");
      }
      return res.json();
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateVideoSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateVideoSegmentInput> }) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/video-segments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update video segment");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuestionInput) => {
      const payload = {
        ...data,
        video_segment_id: data.placement === "lesson" ? null : data.video_segment_id,
      };

      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(payload),
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateQuestionInput> }) => {
      const payload = {
        ...data,
        video_segment_id: data.placement === "lesson" ? null : data.video_segment_id,
      };

      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update question");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useRunLmsV2Migration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("https://ctf-backend.caxtiq.me/admin/lms/migrations/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withToken() },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to run LMS v2 migration");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/modules/${id}`, {
        method: "DELETE",
        headers: withToken(),
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
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/lessons/${id}`, {
        method: "DELETE",
        headers: withToken(),
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteVideoSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/video-segments/${id}`, {
        method: "DELETE",
        headers: withToken(),
      });
      if (!res.ok) throw new Error("Failed to delete video segment");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`https://ctf-backend.caxtiq.me/admin/lms/questions/${id}`, {
        method: "DELETE",
        headers: withToken(),
      });
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json().catch(() => ({}));
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

import { useQuery } from "@tanstack/react-query";
import { normalizeQuestionType, type NormalizedQuestionType } from "./lmsUtils";

export type OptionType = {
  id: number;
  text: string;
};

export type QuestionType = {
  id: number;
  lessonId: number;
  placement: "lesson" | "segment";
  videoSegmentId: number | null;
  type: NormalizedQuestionType;
  prompt: string;
  content?: string;
  options?: string | string[];
  points: number;
  order: number;
};

export type LessonSegment = {
  id: number;
  lessonId: number;
  title: string;
  description?: string;
  startSeconds: number;
  endSeconds: number;
  order: number;
};

export type LessonType = {
  id: number;
  title: string;
  body: string;
  content?: string;
  videoIframe?: string;
  order: number;
  moduleId: number;
  segments: LessonSegment[];
  questions?: QuestionType[];
};

type LessonApiQuestion = {
  id: number;
  lesson_id?: number;
  lessonId?: number;
  placement?: "lesson" | "segment";
  video_segment_id?: number | null;
  videoSegmentId?: number | null;
  type?: string;
  prompt?: string;
  content?: string;
  options?: string | string[];
  points?: number;
  order?: number;
};

type LessonApiSegment = {
  id: number;
  lesson_id?: number;
  lessonId?: number;
  title?: string;
  description?: string;
  start_seconds?: number;
  startSeconds?: number;
  end_seconds?: number;
  endSeconds?: number;
  order?: number;
};

type LessonApiData = {
  id: number;
  title?: string;
  body?: string;
  content?: string;
  video_iframe?: string;
  videoIframe?: string;
  order?: number;
  module_id?: number;
  moduleId?: number;
  segments?: LessonApiSegment[];
  questions?: LessonApiQuestion[];
};

export function useLesson(id: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<LessonType>({
    queryKey: ["lms-lesson", id, token],
    queryFn: async () => {
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`https://ctf-backend.caxtiq.me/user/lms/lessons/${id}`, {
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
      const lesson: LessonApiData = data.lesson;

      return {
        id: lesson.id,
        title: lesson.title || "Untitled lesson",
        body: lesson.body || lesson.content || "",
        content: lesson.content,
        videoIframe: lesson.video_iframe || lesson.videoIframe || "",
        order: lesson.order || 0,
        moduleId: lesson.module_id ?? lesson.moduleId ?? 0,
        segments: (lesson.segments || []).map((segment) => ({
          id: segment.id,
          lessonId: segment.lesson_id ?? segment.lessonId ?? lesson.id,
          title: segment.title || "Untitled segment",
          description: segment.description || "",
          startSeconds: segment.start_seconds ?? segment.startSeconds ?? 0,
          endSeconds: segment.end_seconds ?? segment.endSeconds ?? 0,
          order: segment.order ?? 0,
        })),
        questions: (lesson.questions || []).map((question) => ({
          id: question.id,
          lessonId: question.lesson_id ?? question.lessonId ?? lesson.id,
          placement: question.placement || "lesson",
          videoSegmentId: question.video_segment_id ?? question.videoSegmentId ?? null,
          type: normalizeQuestionType(question.type),
          prompt: question.prompt || question.content || "Untitled question",
          content: question.content,
          options: question.options,
          points: question.points ?? 0,
          order: question.order ?? 0,
        })),
      };
    },
    enabled: !!token && !!id,
  });
}

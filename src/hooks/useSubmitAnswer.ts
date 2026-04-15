import { useMutation, useQueryClient } from "@tanstack/react-query";

export type AnswerValue = string | number | boolean | string[];

type SubmitAnswerInput = {
  questionId: number;
  answer: AnswerValue;
};

type SubmitAnswerResponse = {
  status: string;
  correct: boolean;
  awarded_points?: number;
  normalized_answer?: string;
  message?: string;
};

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswerResponse, Error, SubmitAnswerInput>({
    mutationFn: async ({ questionId, answer }) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://ctf-backend.caxtiq.me/user/lms/questions/${questionId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit answer");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-progress"] });
    },
  });
}

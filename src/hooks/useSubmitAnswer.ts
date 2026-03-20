import { useMutation } from "@tanstack/react-query";

type SubmitAnswerInput = {
  questionId: number;
  answer: string;
};

type SubmitAnswerResponse = {
  status: string;
  correct: boolean;
  message?: string;
};

export function useSubmitAnswer() {
  return useMutation<SubmitAnswerResponse, Error, SubmitAnswerInput>({
    mutationFn: async ({ questionId, answer }) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3333/user/lms/questions/${questionId}/submit`, {
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
  });
}

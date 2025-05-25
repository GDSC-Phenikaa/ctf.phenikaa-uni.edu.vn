import { useMutation } from "@tanstack/react-query";

type SubmitFlagInput = {
  challenge_id: number;
  flag: string;
};

type SubmitFlagResponse = {
  success: boolean;
  message?: string;
};

export function useSubmitFlag() {
  return useMutation<SubmitFlagResponse, Error, SubmitFlagInput>({
    mutationFn: async (data: SubmitFlagInput) => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3333/user/challenges/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit flag");
      }

      return res.json();
    },
  });
}
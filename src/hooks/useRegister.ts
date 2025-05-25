import { useMutation } from "@tanstack/react-query";

type RegisterInput = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

type RegisterResponse = {
  token?: string;
  message?: string;
  [key: string]: any;
};

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch("http://localhost:3333/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Registration failed";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await res.text();
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
  });
}
import { useMutation } from "@tanstack/react-query";

type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  token?: string;
  message?: string;
  [key: string]: any;
};

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (data: LoginInput) => {
      const res = await fetch("http://localhost:3333/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        // credentials: "include",
      });

      if (!res.ok && res.status != 401) {
        const errorData = await res.json();
        throw new Error("Invalid email or password");
      }

      return res.json();
    },
  });
}
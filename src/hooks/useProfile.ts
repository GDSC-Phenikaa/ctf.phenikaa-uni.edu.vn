import { useQuery } from "@tanstack/react-query";

type ProfileResponse = {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
};

export function useProfile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery<ProfileResponse | null>({
    queryKey: ["profile", token], // <-- include token in key
    queryFn: async () => {
      if (!token) return null;

      const res = await fetch("http://localhost:3333/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!token,
  });
}
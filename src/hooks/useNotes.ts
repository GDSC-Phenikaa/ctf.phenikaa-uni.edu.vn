import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://ctf-backend.caxtiq.me";

export type NoteItem = {
  id: number;
  href: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export type NotesListResponse = {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  notes: NoteItem[];
};

export type NotesQueryParams = {
  href?: string;
  page?: number;
  limit?: number;
};

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function buildQuery(params?: NotesQueryParams): string {
  const search = new URLSearchParams();
  if (params?.href) search.set("href", params.href);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function useNotes(params?: NotesQueryParams) {
  const token = getToken();

  return useQuery<NotesListResponse>({
    queryKey: ["notes", token, params?.href || "", params?.page || 1, params?.limit || 20],
    queryFn: async () => {
      if (!token) {
        return {
          status: "success",
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: 0,
          total_pages: 0,
          notes: [],
        };
      }

      const res = await fetch(`${BASE_URL}/user/notes${buildQuery(params)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to fetch notes");
      }

      return res.json();
    },
    enabled: !!token,
  });
}

export function useNote(id?: number) {
  const token = getToken();

  return useQuery<{ status: string; note: NoteItem }>({
    queryKey: ["note", token, id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/user/notes/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to fetch note");
      }

      return res.json();
    },
    enabled: !!token && !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { href: string; content: string }) => {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/user/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to create note");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; href: string; content: string }) => {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/user/notes/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ href: payload.href, content: payload.content }),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to update note");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/user/notes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Failed to delete note");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note"] });
    },
  });
}

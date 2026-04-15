import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://ctf-backend.caxtiq.me";
const QUERY_KEY = ["workspace-status"];

export type WorkspaceStatus = "running" | "stopped" | "unknown";

export type WorkspaceStatusResponse = {
  status: WorkspaceStatus;
};

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

/**
 * Polls the workspace status every 10 seconds.
 * Returns isRunning = true when the backend responds with 200.
 */
export function useWorkspaceStatus() {
  const token = getToken();

  return useQuery<WorkspaceStatusResponse | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      if (!token) return null;

      const res = await fetch(`${BASE_URL}/workspace/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        return res.json();
      }

      // 404 or any non-200 means no active workspace
      return null;
    },
    refetchInterval: 10_000, // re-check every 10 seconds
    enabled: !!token,
  });
}

/** Starts a new workspace container. */
export function useStartWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceStatusResponse, Error>({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${BASE_URL}/workspace/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to start workspace");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Stops and destroys the active workspace container. */
export function useStopWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${BASE_URL}/workspace/stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to stop workspace");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

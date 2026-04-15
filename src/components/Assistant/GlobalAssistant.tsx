"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Affix,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconMessageCircle, IconSend } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useRouter } from "../../i18n/navigation";
import { useProfile } from "../../hooks/useProfile";
import { useChallengeList } from "../../hooks/useChallengeList";
import { useProgress } from "../../hooks/useProgress";
import { useModules } from "../../hooks/useModules";
import { useScoreboardCTF, useScoreboardLMS } from "../../hooks/useScoreboard";
import { useWorkspaceStatus } from "../../hooks/useWorkspace";

type AssistantRecommendation = {
  type: "lms_lesson" | "ctf_challenge" | "workspace" | "general";
  id?: number;
  title: string;
  reason: string;
  href?: string;
};

type AssistantAction = {
  label: string;
  href: string;
};

type AssistantResponse = {
  answer: string;
  recommendations: AssistantRecommendation[];
  actions: AssistantAction[];
};

function clipText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b\d{10,16}\b/g, "[redacted-number]");
}

function captureRenderedDomSnapshot(): {
  title: string;
  url: string;
  headings: string[];
  visibleText: string;
  visibleActions: string[];
} {
  const root =
    document.querySelector("main") ||
    document.querySelector("[role='main']") ||
    document.body;

  const headingNodes = Array.from(root.querySelectorAll("h1, h2, h3"));
  const headings = headingNodes
    .map((node) => node.textContent?.trim() || "")
    .filter(Boolean)
    .slice(0, 20);

  const actionNodes = Array.from(root.querySelectorAll("button, a, [role='button']"));
  const visibleActions = actionNodes
    .map((node) => node.textContent?.trim() || "")
    .filter((text) => text.length > 0 && text.length < 100)
    .slice(0, 40);

  const rawVisibleText = (root as HTMLElement).innerText || "";
  const normalizedText = rawVisibleText.replace(/\s+/g, " ").trim();

  return {
    title: document.title,
    url: window.location.href,
    headings,
    visibleText: clipText(redactSensitiveText(normalizedText), 12000),
    visibleActions,
  };
}

function inferPageType(pathname: string): string {
  if (pathname.includes("/lms/lessons/")) return "lms-lesson";
  if (pathname.includes("/lms/modules")) return "lms-modules";
  if (pathname.includes("/lms/progress")) return "lms-progress";
  if (pathname.includes("/challenges")) return "challenges";
  if (pathname.includes("/workspace")) return "workspace";
  if (pathname.includes("/profile")) return "profile";
  if (pathname.includes("/scoreboard")) return "scoreboard";
  return "general";
}

export default function GlobalAssistant() {
  const router = useRouter();
  const pathname = usePathname();

  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [error, setError] = useState<string>("");

  const { data: profile } = useProfile();
  const { data: challengeData } = useChallengeList();
  const { data: progress } = useProgress();
  const { data: modules } = useModules();
  const { data: ctfScoreboard } = useScoreboardCTF();
  const { data: lmsScoreboard } = useScoreboardLMS();
  const { data: workspaceStatus } = useWorkspaceStatus();

  const context = useMemo(() => {
    const safePathname = pathname || "";
    const pageType = inferPageType(safePathname);
    const challenges = challengeData?.challenges || [];
    const progressItems = progress || [];
    const moduleItems = modules || [];

    const correctCount = progressItems.filter((item) => item.correct).length;
    const attemptCount = progressItems.length;
    const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
    const totalLessons = moduleItems.reduce((sum, moduleItem) => sum + (moduleItem.lessons?.length || 0), 0);

    const ctfRank = profile
      ? [...(ctfScoreboard?.scoreboard || [])]
          .sort((a, b) => b.score - a.score)
          .findIndex((entry) => entry.user_id === profile.id || entry.username === profile.username) + 1
      : 0;

    const lmsRank = profile
      ? [...(lmsScoreboard?.scoreboard || [])]
          .sort((a, b) => b.score - a.score)
          .findIndex((entry) => entry.user_id === profile.id || entry.username === profile.username) + 1
      : 0;

    return {
      route: safePathname,
      pageType,
      profile: {
        id: profile?.id,
        username: profile?.username,
        isAdmin: profile?.isAdmin,
      },
      challengeStats: {
        totalChallenges: challenges.length,
        challengesWithSolves: challenges.filter((challenge) => (challenge.solves || 0) > 0).length,
      },
      lmsStats: {
        modules: moduleItems.length,
        lessons: totalLessons,
        attempts: attemptCount,
        correct: correctCount,
        accuracy,
      },
      scoreboard: {
        ctfRank: ctfRank > 0 ? ctfRank : null,
        lmsRank: lmsRank > 0 ? lmsRank : null,
      },
      workspace: {
        running: !!workspaceStatus,
      },
    };
  }, [pathname, profile, challengeData, progress, modules, ctfScoreboard, lmsScoreboard, workspaceStatus]);

  const handleAsk = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setStreamingAnswer("");
    setResponse(null);

    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: {
            ...context,
            domSnapshot: captureRenderedDomSnapshot(),
          },
          stream: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to get AI response");
      }

      if (!res.body) {
        throw new Error("Streaming is not available in this environment.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.replace(/^event:\s*/, "").trim();
            continue;
          }

          if (!line.startsWith("data:")) continue;
          const raw = line.replace(/^data:\s*/, "").trim();

          if (!raw) continue;

          if (currentEvent === "answer") {
            try {
              const data = JSON.parse(raw) as { chunk?: string };
              if (data.chunk) {
                setStreamingAnswer((prev) => prev + data.chunk);
              }
            } catch {
              // Ignore malformed stream chunk.
            }
          }

          if (currentEvent === "done") {
            try {
              const finalData = JSON.parse(raw) as AssistantResponse;
              setResponse(finalData);
            } catch {
              // Ignore malformed final payload.
            }
          }

          if (currentEvent === "error") {
            try {
              const errData = JSON.parse(raw) as { error?: string };
              throw new Error(errData.error || "Streaming failed");
            } catch {
              throw new Error("Streaming failed");
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Affix position={{ right: 20, bottom: 72 }} zIndex={3000}>
        <ActionIcon
          size={56}
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => setOpened(true)}
          aria-label="Open AI assistant"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}
        >
          <IconMessageCircle size={28} />
        </ActionIcon>
      </Affix>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="AI Copilot"
        position="right"
        size="md"
        padding="md"
      >
        <Stack>
          <Badge variant="light">Page: {context.pageType}</Badge>

          <Text size="sm" c="dimmed">
            Ask for guidance based on your current page and progress.
          </Text>

          <Group align="end">
            <TextInput
              style={{ flex: 1 }}
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
              placeholder="What should I focus on next?"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAsk();
                }
              }}
            />
            <Button onClick={() => void handleAsk()} loading={loading} rightSection={<IconSend size={16} />}>
              Ask
            </Button>
          </Group>

          {loading && (
            <Group>
              <Loader size="sm" />
              <Text size="sm">Thinking...</Text>
            </Group>
          )}

          {error && <Text c="red">{error}</Text>}

          {(streamingAnswer || response) && (
            <Stack>
              <Card withBorder>
                <Title order={5} mb="xs">Answer</Title>
                <Text size="sm">{response?.answer || streamingAnswer}</Text>
              </Card>

              <Card withBorder>
                <Title order={5} mb="xs">Recommendations</Title>
                <Stack gap="xs">
                  {response?.recommendations?.length ? (
                    response.recommendations.map((item, idx) => {
                      const href = item.href;

                      return <Box key={`${item.title}-${idx}`}>
                        <Group justify="space-between" align="center">
                          <Text fw={600} size="sm">{item.title}</Text>
                          <Badge variant="dot">{item.type}</Badge>
                        </Group>
                        <Text size="sm" c="dimmed">{item.reason}</Text>
                        {href && (
                          <Button size="xs" variant="subtle" mt="xs" onClick={() => router.push(href)}>
                            Open
                          </Button>
                        )}
                        {idx < response.recommendations.length - 1 && <Divider my="xs" />}
                      </Box>;
                    })
                  ) : (
                    <Text size="sm" c="dimmed">Recommendations will appear after streaming finishes.</Text>
                  )}
                </Stack>
              </Card>

              <Card withBorder>
                <Title order={5} mb="xs">Quick Actions</Title>
                <Group>
                  {(response?.actions || []).map((action, idx) => (
                    <Button key={`${action.label}-${idx}`} size="xs" variant="light" onClick={() => router.push(action.href)}>
                      {action.label}
                    </Button>
                  ))}
                </Group>
              </Card>

              <Text size="xs" c="dimmed">
                AI suggestions may be incorrect. Verify important steps before acting.
              </Text>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
}

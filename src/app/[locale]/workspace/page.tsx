"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  Button,
  Center,
  Group,
  Badge,
  Stack,
  Alert,
  Popover,
  Loader,
  Paper,
  ThemeIcon,
  List,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconTerminal2,
  IconPlayerPlay,
  IconPlayerStop,
  IconMaximize,
  IconAlertCircle,
  IconClock,
  IconCpu,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useWorkspaceStatus, useStartWorkspace, useStopWorkspace } from "../../../hooks/useWorkspace";

const BASE_URL = "https://ctf-backend.caxtiq.me";
const TIMER_KEY = "workspace_start_time";

function useElapsedTimer(active: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      sessionStorage.removeItem(TIMER_KEY);
      setElapsed(0);
      return;
    }

    // Persist start time across re-renders/hotloads
    if (!sessionStorage.getItem(TIMER_KEY)) {
      sessionStorage.setItem(TIMER_KEY, String(Date.now()));
    }

    const tick = () => {
      const start = parseInt(sessionStorage.getItem(TIMER_KEY) ?? String(Date.now()), 10);
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function WorkspacePage() {
  const t = useTranslations("workspace");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data: statusData, isLoading: isStatusLoading } = useWorkspaceStatus();
  const startMutation = useStartWorkspace();
  const stopMutation = useStopWorkspace();

  const isRunning = statusData !== null && statusData !== undefined;
  const isStarting = startMutation.isPending && !isRunning;
  const isStopping = stopMutation.isPending;

  const elapsed = useElapsedTimer(isRunning);

  const proxyUrl = token
    ? `${BASE_URL}/workspace/proxy/?token=${encodeURIComponent(token)}&resize=remote&autoconnect=1`
    : "";

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen?.();
  };

  const handleStop = async () => {
    setStopConfirmOpen(false);
    try {
      await stopMutation.mutateAsync();
    } catch {
      // error shown via mutation state
    }
  };

  // Not logged in
  if (!token) {
    return (
      <Center h="60vh">
        <Alert icon={<IconAlertCircle />} color="red" title="Authentication Required">
          {t("notLoggedIn")}
        </Alert>
      </Center>
    );
  }

  // Initial status check loading
  if (isStatusLoading) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container
      fluid
      py="md"
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      {/* ── Running State ── */}
      {isRunning && (
        <Stack gap="sm" style={{ flex: 1, minHeight: 0 }}>
          {/* Toolbar */}
          <Paper
            withBorder
            p="xs"
            radius="md"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Group gap="sm">
              <Badge color="teal" variant="dot" size="lg">
                {t("running")}
              </Badge>
              <Group gap={4}>
                <IconClock size={14} />
                <Text fz="sm" ff="monospace">
                  {elapsed}
                </Text>
              </Group>
            </Group>
            <Group gap="xs">
              <Tooltip label={t("fullscreen")}>
                <ActionIcon variant="light" onClick={handleFullscreen} size="lg">
                  <IconMaximize size={18} />
                </ActionIcon>
              </Tooltip>

              <Popover
                opened={stopConfirmOpen}
                onClose={() => setStopConfirmOpen(false)}
                position="bottom-end"
                withArrow
              >
                <Popover.Target>
                  <Button
                    color="red"
                    variant="light"
                    size="xs"
                    leftSection={<IconPlayerStop size={14} />}
                    loading={isStopping}
                    onClick={() => setStopConfirmOpen((o) => !o)}
                  >
                    {isStopping ? t("stopping") : t("stop")}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text size="sm" mb="sm" maw={260}>
                    {t("confirmStop")}
                  </Text>
                  <Group gap="xs">
                    <Button size="xs" color="red" onClick={handleStop}>
                      {t("confirmStopYes")}
                    </Button>
                    <Button size="xs" variant="subtle" onClick={() => setStopConfirmOpen(false)}>
                      {t("cancelStop")}
                    </Button>
                  </Group>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Paper>

          {/* The VNC iframe */}
          <Paper
            withBorder
            radius="md"
            style={{
              overflow: "hidden",
              width: "100%",
              flex: 1,
              minHeight: "clamp(320px, 58dvh, 900px)",
            }}
          >
            <iframe
              ref={iframeRef}
              src={proxyUrl}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              title="Pwnbox Desktop"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </Paper>
        </Stack>
      )}

      {/* ── Starting State ── */}
      {isStarting && (
        <Center h="60vh">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text fz="lg" fw={500}>
              {t("starting")}
            </Text>
            <Text fz="sm" c="dimmed">
              This usually takes 10–30 seconds.
            </Text>
          </Stack>
        </Center>
      )}

      {/* ── Idle State ── */}
      {!isRunning && !isStarting && (
        <Center h="70vh">
          <Stack align="center" gap="xl" maw={520}>
            <ThemeIcon size={72} radius="xl" variant="light" color="violet">
              <IconTerminal2 size={40} />
            </ThemeIcon>

            <Stack align="center" gap="xs">
              <Title order={1} ta="center">
                {t("title")}
              </Title>
              <Text c="dimmed" ta="center" fz="md">
                {t("description")}
              </Text>
            </Stack>

            <Paper withBorder p="md" radius="md" w="100%">
              <Group gap="xs" mb="xs">
                <IconCpu size={16} />
                <Text fz="sm" fw={500}>
                  {t("specs")}
                </Text>
              </Group>
              <List spacing="xs" size="sm" icon={<IconInfoCircle size={14} />}>
                <List.Item>Kasm Ubuntu Desktop (kasmweb/ubuntu-bionic-desktop)</List.Item>
                <List.Item>Pre-installed tools: curl, wget, Python 3, nmap</List.Item>
                <List.Item>{t("tip")}</List.Item>
              </List>
            </Paper>

            {(startMutation.isError || stopMutation.isError) && (
              <Alert icon={<IconAlertCircle />} color="red" w="100%">
                {startMutation.isError ? t("errorStart") : t("errorStop")}
              </Alert>
            )}

            <Button
              size="lg"
              leftSection={<IconPlayerPlay size={20} />}
              onClick={() => startMutation.mutate()}
              loading={startMutation.isPending}
              radius="md"
              variant="filled"
              color="violet"
            >
              {t("launch")}
            </Button>
          </Stack>
        </Center>
      )}
    </Container>
  );
}

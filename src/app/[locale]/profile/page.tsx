"use client";

import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Grid,
  Loader,
  Center,
  Alert,
  Progress,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import { IconAlertCircle, IconBooks, IconFlag, IconTrophy, IconUser, IconTerminal2 } from "@tabler/icons-react";
import { useProfile } from "../../../hooks/useProfile";
import { useChallengeList } from "../../../hooks/useChallengeList";
import { useProgress } from "../../../hooks/useProgress";
import { useScoreboardCTF, useScoreboardLMS } from "../../../hooks/useScoreboard";
import { useModules } from "../../../hooks/useModules";
import { useWorkspaceStatus } from "../../../hooks/useWorkspace";

function rankForUser(scoreboard: { user_id: number; username: string; score: number }[] | undefined, profile: { id?: number; username?: string } | null) {
  if (!scoreboard || !profile) return null;

  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);
  const index = sorted.findIndex(
    (entry) =>
      (profile.id !== undefined && entry.user_id === profile.id) ||
      (profile.username !== undefined && entry.username === profile.username),
  );

  return index === -1 ? null : index + 1;
}

export default function ProfilePage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const profileQuery = useProfile();
  const challengesQuery = useChallengeList();
  const progressQuery = useProgress();
  const modulesQuery = useModules();
  const ctfScoreboardQuery = useScoreboardCTF();
  const lmsScoreboardQuery = useScoreboardLMS();
  const workspaceStatusQuery = useWorkspaceStatus();

  const profile = profileQuery.data;
  const challenges = challengesQuery.data?.challenges || [];
  const progress = progressQuery.data || [];
  const modules = modulesQuery.data || [];
  const ctfScoreboard = ctfScoreboardQuery.data?.scoreboard || [];
  const lmsScoreboard = lmsScoreboardQuery.data?.scoreboard || [];

  const challengeSolvedCount = challenges.filter((challenge) => (challenge.solves || 0) > 0).length;

  const totalLessons = modules.reduce((sum, moduleItem) => sum + (moduleItem.lessons?.length || 0), 0);

  const totalAttempts = progress.length;
  const correctAttempts = progress.filter((item) => item.correct).length;
  const lmsAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const ctfRank = rankForUser(ctfScoreboard, profile || null);
  const lmsRank = rankForUser(lmsScoreboard, profile || null);

  const ctfEntry = ctfScoreboard.find(
    (entry) =>
      (profile?.id !== undefined && entry.user_id === profile.id) ||
      (profile?.username !== undefined && entry.username === profile.username),
  );

  const lmsEntry = lmsScoreboard.find(
    (entry) =>
      (profile?.id !== undefined && entry.user_id === profile.id) ||
      (profile?.username !== undefined && entry.username === profile.username),
  );

  const anyLoading =
    profileQuery.isLoading ||
    challengesQuery.isLoading ||
    progressQuery.isLoading ||
    modulesQuery.isLoading ||
    ctfScoreboardQuery.isLoading ||
    lmsScoreboardQuery.isLoading ||
    workspaceStatusQuery.isLoading;

  if (!token) {
    return (
      <Center h="60vh">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Authentication Required">
          Please log in to view your profile dashboard.
        </Alert>
      </Center>
    );
  }

  if (anyLoading) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg" align="flex-start">
        <div>
          <Title order={1}>Profile</Title>
          <Text c="dimmed">Unified view from all active user endpoints.</Text>
        </div>
        <Badge color={workspaceStatusQuery.data ? "teal" : "gray"} variant="light" leftSection={<IconTerminal2 size={12} />}>
          Workspace: {workspaceStatusQuery.data ? "Running" : "Stopped"}
        </Badge>
      </Group>

      {(profileQuery.isError || challengesQuery.isError || progressQuery.isError || modulesQuery.isError) && (
        <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="md" title="Partial data warning">
          Some endpoints failed to load, but available profile data is still shown.
        </Alert>
      )}

      <Grid gutter="md" mb="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Group mb="sm">
              <IconUser size={18} />
              <Title order={4}>Identity</Title>
            </Group>
            <Stack gap="xs">
              <Text><b>Name:</b> {profile?.name || "N/A"}</Text>
              <Text><b>Username:</b> {profile?.username || "N/A"}</Text>
              <Text><b>Email:</b> {profile?.email || "N/A"}</Text>
              <Text><b>Role:</b> {profile?.isAdmin ? "Admin" : "User"}</Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Group mb="sm">
              <IconTrophy size={18} />
              <Title order={4}>Ranking</Title>
            </Group>
            <Stack gap="xs">
              <Text><b>CTF Rank:</b> {ctfRank ? `#${ctfRank}` : "Not ranked"}</Text>
              <Text><b>CTF Score:</b> {ctfEntry?.score ?? 0}</Text>
              <Text><b>LMS Rank:</b> {lmsRank ? `#${lmsRank}` : "Not ranked"}</Text>
              <Text><b>LMS Score:</b> {lmsEntry?.score ?? 0}</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb={6}>
            <Text fw={600}>Challenges</Text>
            <IconFlag size={16} />
          </Group>
          <Text size="xl" fw={700}>{challenges.length}</Text>
          <Text size="sm" c="dimmed">Total available</Text>
        </Card>

        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb={6}>
            <Text fw={600}>Solved Presence</Text>
            <IconFlag size={16} />
          </Group>
          <Text size="xl" fw={700}>{challengeSolvedCount}</Text>
          <Text size="sm" c="dimmed">Challenges with at least one solve</Text>
        </Card>

        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb={6}>
            <Text fw={600}>LMS Modules</Text>
            <IconBooks size={16} />
          </Group>
          <Text size="xl" fw={700}>{modules.length}</Text>
          <Text size="sm" c="dimmed">Published modules</Text>
        </Card>

        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb={6}>
            <Text fw={600}>LMS Lessons</Text>
            <IconBooks size={16} />
          </Group>
          <Text size="xl" fw={700}>{totalLessons}</Text>
          <Text size="sm" c="dimmed">Across all modules</Text>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="sm">LMS Progress</Title>
        <Stack gap="xs">
          <Text>Total attempts: {totalAttempts}</Text>
          <Text>Correct answers: {correctAttempts}</Text>
          <Group justify="space-between">
            <Text fw={600}>Accuracy</Text>
            <Text fw={700}>{lmsAccuracy}%</Text>
          </Group>
          <Progress value={lmsAccuracy} radius="xl" size="lg" />
        </Stack>

        <Divider my="md" />
      </Card>
    </Container>
  );
}

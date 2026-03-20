"use client";

import { useProgress } from "../../../../hooks/useProgress";
import { Container, Title, Text, Card, Stack, Loader, Center, Group, RingProgress } from "@mantine/core";

export default function LmsProgressPage() {
  const { data: progress, isLoading, isError } = useProgress();

  if (isLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (isError || !progress) {
    return <Center h="100vh"><Text color="red">Failed to load progress.</Text></Center>;
  }

  const totalAttempted = progress.length;
  const correctAnswers = progress.filter(p => p.correct).length;
  const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">Learning Progress</Title>
      
      <Group justify="center" mb="xl">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Group justify="center">
            <RingProgress
              size={150}
              thickness={16}
              sections={[{ value: accuracy, color: accuracy > 70 ? 'teal' : accuracy > 40 ? 'yellow' : 'red' }]}
              label={
                <Text c="blue" fw={700} ta="center" size="xl">
                  {accuracy}%
                </Text>
              }
            />
            <Stack gap="xs" ml="md">
              <Text fw={500} size="lg">Accuracy Rate</Text>
              <Text c="dimmed">{correctAnswers} of {totalAttempted} correct</Text>
            </Stack>
          </Group>
        </Card>
      </Group>

      <Title order={3} mb="md">Recent Activity</Title>
      <Stack gap="sm">
        {progress.map((item, idx) => (
          <Card key={idx} withBorder padding="sm" radius="md">
            <Group justify="space-between">
              <Text fw={500}>Question ID: {item.questionId}</Text>
              <Text c={item.correct ? "teal" : "red"} fw={600}>
                {item.correct ? "CORRECT" : "INCORRECT"}
              </Text>
            </Group>
          </Card>
        ))}
        {progress.length === 0 && (
          <Text ta="center" c="dimmed">You haven&apos;t attempted any questions yet.</Text>
        )}
      </Stack>
    </Container>
  );
}

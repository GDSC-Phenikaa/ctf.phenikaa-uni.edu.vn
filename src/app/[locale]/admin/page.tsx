"use client";

import { Box, Title, Text, Card, Group, SimpleGrid, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconSettings, IconBook, IconFlag } from "@tabler/icons-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <Box py="md">
      <Group mb="xl">
        <IconSettings size={32} />
        <Title order={1}>Admin Dashboard</Title>
      </Group>
      <Text c="dimmed" mb="xl">Manage the platform content from here.</Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Group mb="md">
            <IconFlag size={28} color="blue" />
            <Title order={3}>Challenges Management</Title>
          </Group>
          <Text c="dimmed" mb="lg">
            Create, update, and review CTF challenges, flags, and points.
          </Text>
          <Button fullWidth variant="light" color="blue" onClick={() => router.push("/admin/challenges")}>
            Manage Challenges
          </Button>
        </Card>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Group mb="md">
            <IconBook size={28} color="teal" />
            <Title order={3}>LMS Management</Title>
          </Group>
          <Text c="dimmed" mb="lg">
            Create modules, write lessons, and configure quizzes.
          </Text>
          <Button fullWidth variant="light" color="teal" onClick={() => router.push("/admin/lms")}>
            Manage LMS
          </Button>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

"use client";

import { useModules } from "../../../../hooks/useModules";
import { Container, Title, Text, Card, Group, Stack, Loader, Center, Button, Badge } from "@mantine/core";
import { useRouter } from "../../../../i18n/navigation";
import { IconBook } from "@tabler/icons-react";

export default function LmsModulesPage() {
  const { data: modules, isLoading, isError } = useModules();
  const router = useRouter();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError || !modules) {
    return (
      <Center h="100vh">
        <Text color="red">Failed to load learning modules.</Text>
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Learning Modules</Title>
      <Text c="dimmed" mb="xl">Explore our curated learning materials and quizzes to improve your skills.</Text>

      <Stack gap="xl">
        {[...modules].sort((a,b)=>a.order - b.order).map((mod) => (
          <Card key={mod.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={3}>{mod.order}. {mod.title}</Title>
              <Badge color="blue">{mod.lessons?.length || 0} Lessons</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              {mod.description}
            </Text>

            <Stack gap="sm">
              {[...(mod.lessons || [])].sort((a,b)=>a.order - b.order).map((lesson) => (
                <Card key={lesson.id} withBorder shadow="none" padding="sm" radius="md">
                  <Group justify="space-between">
                    <Group>
                      <IconBook size={20} color="gray" />
                      <Text fw={500}>{lesson.order}. {lesson.title}</Text>
                    </Group>
                    <Button variant="light" onClick={() => router.push(`/lms/lessons/${lesson.id}`)}>
                      Start Lesson
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        ))}
        {modules.length === 0 && (
          <Text ta="center" c="dimmed">No modules available right now.</Text>
        )}
      </Stack>
    </Container>
  );
}

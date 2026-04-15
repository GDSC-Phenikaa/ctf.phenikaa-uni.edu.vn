"use client";

import { useTranslations } from "next-intl";
import { Container, Title, Tabs, Table, Avatar, Group, Text, Badge, Paper, Center, Loader, Alert } from "@mantine/core";
import { IconTrophy, IconBook, IconAlertCircle } from "@tabler/icons-react";
import { useScoreboardCTF, useScoreboardLMS, ScoreboardEntry } from "../../../hooks/useScoreboard";

function ScoreboardTable({ data, isLoading, error }: { data: ScoreboardEntry[] | undefined, isLoading: boolean, error: any }) {
  const t = useTranslations("scoreboardPage");

  if (isLoading) {
    return (
      <Center py="xl" style={{ minHeight: "300px" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title={t("error")} color="red" mt="md">
        {error.message}
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Center py="xl" style={{ minHeight: "300px" }}>
        <Text c="dimmed">No data available.</Text>
      </Center>
    );
  }

  const rows = data.sort((a, b) => b.score - a.score).map((entry, index) => {
    let rankColor = "gray";
    if (index === 0) rankColor = "yellow";
    else if (index === 1) rankColor = "gray.4";
    else if (index === 2) rankColor = "orange.7";

    return (
      <Table.Tr key={entry.user_id}>
        <Table.Td>
          <Badge color={rankColor} variant={index < 3 ? "filled" : "light"} size="lg" circle>
            {index + 1}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar color="blue" radius="xl">{entry.name.charAt(0).toUpperCase()}</Avatar>
            <div>
              <Text fz="sm" fw={500}>
                {entry.name}
              </Text>
              <Text fz="xs" c="dimmed">
                @{entry.username}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text fw={700} ta="right" size="lg">
            {entry.score}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper withBorder radius="md" mt="md" style={{ overflow: "hidden" }}>
      <Table verticalSpacing="sm" striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "80px" }}>{t("rank")}</Table.Th>
            <Table.Th>{t("participant")}</Table.Th>
            <Table.Th style={{ textAlign: "right", width: "120px" }}>{t("score")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* Overriding some table cell padding manually to align with headers */}
          {rows}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

export default function ScoreboardPage() {
  const t = useTranslations("scoreboardPage");
  
  const { data: ctfData, isLoading: isCtfLoading, error: ctfError } = useScoreboardCTF();
  const { data: lmsData, isLoading: isLmsLoading, error: lmsError } = useScoreboardLMS();

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center" style={{ fontSize: "2.5rem" }}>
        {t("title")}
      </Title>

      <Tabs defaultValue="ctf" variant="outline" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="ctf" leftSection={<IconTrophy size="1.2rem" />}>
            <Text fw={500} size="lg">{t("ctf")}</Text>
          </Tabs.Tab>
          <Tabs.Tab value="lms" leftSection={<IconBook size="1.2rem" />}>
            <Text fw={500} size="lg">{t("lms")}</Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ctf" pt="md">
          <ScoreboardTable 
            data={ctfData?.scoreboard} 
            isLoading={isCtfLoading} 
            error={ctfError}
          />
        </Tabs.Panel>

        <Tabs.Panel value="lms" pt="md">
          <ScoreboardTable 
            data={lmsData?.scoreboard} 
            isLoading={isLmsLoading} 
            error={lmsError}
          />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
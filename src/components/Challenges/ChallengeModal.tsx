"use client"

import { Modal, Text, TextInput, Button, Group, Badge, Stack, TypographyStylesProvider } from "@mantine/core"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { useSubmitFlag } from "../../hooks/useSubmit"
import { useTranslations } from "next-intl"

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  type: string
  points: number
  createdAt: string
  updatedAt: string
  author: {
    name: string
    profileUrl: string
  }
  docker: boolean
  solved: boolean
  solves?: number
  detailedDescription?: string
}

interface ChallengeModalProps {
  challenge: Challenge | null
  opened: boolean
  onClose: () => void
}export default function ChallengeModal({ challenge, opened, onClose }: ChallengeModalProps) {
  const [flag, setFlag] = useState("");
  const [connection, setConnection] = useState("Click spawn Docker to get IP and Port");
  const [isSpawning, setIsSpawning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null); // State for feedback message
  const submitFlag = useSubmitFlag();
  const t = useTranslations();

  const handleSubmit = () => {
    if (!challenge) return;

    submitFlag.mutate(
      { challenge_id: parseInt(challenge.id), flag },
      {
        onSuccess: (data) => {
          setFeedback(t("challenges.submitSuccess"));
          setFlag(""); 
        },
        onError: (error: any) => {
          setFeedback(t("challenges.submitError"));
        },
      }
    );
  };

  const handleSummon = () => {
    setIsSpawning(true);
    setConnection("Spawning Docker... Please wait.");

    setTimeout(() => {
      setConnection("Docker is running at localhost:3599");
      setIsSpawning(false); 
    }, 20000);
  };

  if (!challenge) return null;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setFeedback(null); // Clear feedback when modal is closed
        onClose();
      }}
      title={
        <Group gap="sm">
          <Text fw={500}>{challenge.title}</Text>
          <Badge color="blue" variant="light">
            {challenge.solves || 0} {t("challenges.solves")}
          </Badge>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <div>
          <Text size="xl" fw={600} mb="xs">
            {challenge.title}
          </Text>
          <Text size="sm" c="dimmed">
            {t("challenges.points")}: {challenge.points}
          </Text>
        </div>

        <TypographyStylesProvider>
          <ReactMarkdown>
            {challenge.detailedDescription || challenge.description}
          </ReactMarkdown>
        </TypographyStylesProvider>

        {challenge.docker && (
          <Stack gap="xs" align="center">
            <Button
              onClick={handleSummon}
              disabled={isSpawning || connection !== "Click spawn Docker to get IP and Port"} // Disable button while spawning
              loading={isSpawning} // Show loading spinner on button
            >
              {t("challenges.spawn-docker")}
            </Button>
            <Text size="sm" c="dimmed" mt="xs">
              {connection}
            </Text>
          </Stack>
        )}

        <div style={{ marginTop: "2rem" }}>
          <Group gap="sm" style={{ marginBottom: "1rem" }}>
            <TextInput
              placeholder={t("challenges.flag")}
              value={flag}
              onChange={(event) => setFlag(event.currentTarget.value)}
              style={{ flex: 1 }}
              size="md"
              disabled={challenge.solved} // Disable input if already solved
            />
            <Button
              onClick={handleSubmit}
              disabled={!flag.trim() || submitFlag.isPending || challenge.solved} // Disable button if solved
            >
              {submitFlag.isPending ? t("challenges.submitting") : t("challenges.submit")}
            </Button>
          </Group>
          {feedback && (
            <Text size="sm" c={submitFlag.isError ? "red" : "green"} mt="xs">
              {feedback}
            </Text>
          )}
          {challenge.solved && (
            <Text size="sm" c="green" mt="xs">
              {t("challenges.alreadySolved")}
            </Text>
          )}
        </div>
      </Stack>
    </Modal>
  );
}
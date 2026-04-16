"use client";

import { useLesson } from "../../../../../hooks/useLesson";
import { useSubmitAnswer } from "../../../../../hooks/useSubmitAnswer";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Loader,
  Center,
  Radio,
  Button,
  Group,
  Notification,
  TextInput,
  Checkbox,
  Textarea,
  NumberInput,
  Divider,
  Badge,
  Box,
} from "@mantine/core";
import { useRouter } from "../../../../../i18n/navigation";
import { useState, use, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { parseQuestionOptions, toTimestampLabel } from "../../../../../hooks/lmsUtils";
import type { AnswerValue } from "../../../../../hooks/useSubmitAnswer";

type AnswerState = Record<number, AnswerValue>;

function extractYoutubeEmbedSrc(iframeHtml?: string): string {
  if (!iframeHtml) return "";

  const match = iframeHtml.match(/src\s*=\s*"([^"]+)"/i) || iframeHtml.match(/src\s*=\s*'([^']+)'/i);
  const src = match?.[1] || "";
  if (!src) return "";

  try {
    const url = new URL(src);
    const allowedHost =
      url.hostname === "www.youtube.com" ||
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube-nocookie.com" ||
      url.hostname === "youtube-nocookie.com";
    if (!allowedHost || !url.pathname.startsWith("/embed/")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default function LessonPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const lessonId = parseInt(params.id);
  const router = useRouter();
  
  const { data: lesson, isLoading, isError } = useLesson(lessonId);
  const submitMutation = useSubmitAnswer();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [results, setResults] = useState<Record<number, { correct: boolean; shown: boolean }>>({});

  const sortedSegments = useMemo(
    () => [...(lesson?.segments || [])].sort((a, b) => a.order - b.order),
    [lesson?.segments],
  );

  const sortedQuestions = useMemo(
    () => [...(lesson?.questions || [])].sort((a, b) => a.order - b.order),
    [lesson?.questions],
  );

  const lessonQuestions = useMemo(
    () => sortedQuestions.filter((q) => q.placement === "lesson"),
    [sortedQuestions],
  );

  const segmentQuestionsMap = useMemo(() => {
    const grouped: Record<number, typeof sortedQuestions> = {};
    for (const question of sortedQuestions) {
      if (question.placement !== "segment" || !question.videoSegmentId) continue;
      if (!grouped[question.videoSegmentId]) grouped[question.videoSegmentId] = [];
      grouped[question.videoSegmentId].push(question);
    }
    return grouped;
  }, [sortedQuestions]);

  const orphanSegmentQuestions = useMemo(() => {
    const validSegmentIds = new Set(sortedSegments.map((segment) => segment.id));
    return sortedQuestions.filter(
      (q) => q.placement === "segment" && (!q.videoSegmentId || !validSegmentIds.has(q.videoSegmentId)),
    );
  }, [sortedQuestions, sortedSegments]);

  const videoEmbedSrc = extractYoutubeEmbedSrc(lesson?.videoIframe);

  if (isLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (isError || !lesson) {
    return <Center h="100vh"><Text color="red">Failed to load lesson.</Text></Center>;
  }

  const handleSubmit = async (questionId: number) => {
    const answer = answers[questionId];
    if (
      answer === undefined ||
      answer === null ||
      answer === "" ||
      (Array.isArray(answer) && answer.length === 0)
    ) {
      return;
    }

    try {
      const res = await submitMutation.mutateAsync({ questionId, answer });
      setResults(prev => ({ ...prev, [questionId]: { correct: res.correct, shown: true } }));
    } catch (err: any) {
      alert(err.message || "Error submitting answer");
    }
  };

  const renderQuestionInput = (question: (typeof sortedQuestions)[number]) => {
    const currentAnswer = answers[question.id];
    const options = parseQuestionOptions(question.options);

    switch (question.type) {
      case "multi_choice":
        return (
          <Checkbox.Group
            value={Array.isArray(currentAnswer) ? currentAnswer : []}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
          >
            <Stack gap="xs" mt="xs">
              {options.map((opt) => (
                <Checkbox key={opt} value={opt} label={opt} />
              ))}
            </Stack>
          </Checkbox.Group>
        );
      case "true_false":
        return (
          <Group>
            <Button
              variant={currentAnswer === true ? "filled" : "light"}
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: true }))}
            >
              True
            </Button>
            <Button
              variant={currentAnswer === false ? "filled" : "light"}
              color="gray"
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: false }))}
            >
              False
            </Button>
          </Group>
        );
      case "short_text":
        return (
          <TextInput
            placeholder="Type your answer"
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setAnswers((prev) => ({ ...prev, [question.id]: val }));
            }}
          />
        );
      case "long_text":
      case "code":
        return (
          <Textarea
            minRows={question.type === "code" ? 8 : 4}
            autosize
            placeholder={question.type === "code" ? "Write your code answer" : "Type your answer"}
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setAnswers((prev) => ({ ...prev, [question.id]: val }));
            }}
          />
        );
      case "numeric":
        return (
          <NumberInput
            placeholder="Enter a number"
            value={typeof currentAnswer === "number" ? currentAnswer : null}
            onChange={(value) => {
              if (typeof value === "number") {
                setAnswers((prev) => ({ ...prev, [question.id]: value }));
              } else {
                setAnswers((prev) => ({ ...prev, [question.id]: "" }));
              }
            }}
          />
        );
      case "single_choice":
      default:
        return (
          <Radio.Group
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
          >
            <Stack gap="xs" mt="xs">
              {options.map((opt) => (
                <Radio key={opt} value={opt} label={opt} />
              ))}
            </Stack>
          </Radio.Group>
        );
    }
  };

  const renderQuestionCard = (question: (typeof sortedQuestions)[number]) => {
    const answer = answers[question.id];
    const canSubmit = !(
      answer === undefined ||
      answer === null ||
      answer === "" ||
      (Array.isArray(answer) && answer.length === 0)
    );

    return (
      <Card key={question.id} withBorder padding="md" radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600}>{question.prompt}</Text>
          <Badge variant="light">{question.points} pt</Badge>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Type: {question.type.replace("_", " ")}
        </Text>

        <Box mb="md">{renderQuestionInput(question)}</Box>

        <Group>
          <Button onClick={() => handleSubmit(question.id)} loading={submitMutation.isPending} disabled={!canSubmit}>
            Submit Answer
          </Button>

          {results[question.id]?.shown && (
            <Notification
              withCloseButton={false}
              color={results[question.id].correct ? "teal" : "red"}
              title={results[question.id].correct ? "Correct!" : "Incorrect"}
            >
              {results[question.id].correct ? "Great job!" : "Try again."}
            </Notification>
          )}
        </Group>
      </Card>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Button variant="subtle" onClick={() => router.push("/lms/modules")} mb="md">
        ← Back to Modules
      </Button>

      <Card shadow="sm" padding="xl" radius="md" withBorder mb="xl">
        <Title order={1} mb="md">{lesson.title}</Title>
        <div className="markdown-body">
          <ReactMarkdown>{lesson.body}</ReactMarkdown>
        </div>
      </Card>

      {videoEmbedSrc && (
        <Card shadow="sm" padding="xl" radius="md" withBorder mb="xl">
          <Title order={3} mb="md">Lesson Video</Title>
          <Box
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              borderRadius: 12,
              overflow: "hidden",
              background: "#000",
            }}
          >
            <iframe
              src={videoEmbedSrc}
              title={`${lesson.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                border: 0,
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
        </Card>
      )}

      {sortedSegments.length > 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder mb="xl">
          <Title order={3} mb="md">Video Segments</Title>
          <Stack gap="md">
            {sortedSegments.map((segment) => (
              <Card key={segment.id} withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{segment.title}</Text>
                  <Badge variant="dot">
                    {toTimestampLabel(segment.startSeconds)} - {toTimestampLabel(segment.endSeconds)}
                  </Badge>
                </Group>

                {segment.description && (
                  <Text size="sm" c="dimmed" mb="md">
                    {segment.description}
                  </Text>
                )}

                <Stack gap="sm">
                  {(segmentQuestionsMap[segment.id] || []).map((question) => renderQuestionCard(question))}
                  {(segmentQuestionsMap[segment.id] || []).length === 0 && (
                    <Text size="sm" c="dimmed">
                      No questions for this segment yet.
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      )}

      {lessonQuestions.length > 0 && (
        <>
          <Divider my="lg" />
          <Title order={3} mb="md">Lesson Questions</Title>
          <Stack gap="md" mb="xl">
            {lessonQuestions.map((question) => renderQuestionCard(question))}
          </Stack>
        </>
      )}

      {orphanSegmentQuestions.length > 0 && (
        <>
          <Divider my="lg" />
          <Title order={4} mb="md">Orphan Segment Questions</Title>
          <Text size="sm" c="dimmed" mb="md">
            These questions reference missing segments.
          </Text>
          <Stack gap="md">{orphanSegmentQuestions.map((question) => renderQuestionCard(question))}</Stack>
        </>
      )}

      {lessonQuestions.length === 0 && sortedSegments.length === 0 && (
        <Text c="dimmed">No questions available for this lesson yet.</Text>
      )}
    </Container>
  );
}

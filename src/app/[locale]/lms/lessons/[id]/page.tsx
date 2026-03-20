"use client";

import { useLesson } from "../../../../../hooks/useLesson";
import { useSubmitAnswer } from "../../../../../hooks/useSubmitAnswer";
import { Container, Title, Text, Card, Stack, Loader, Center, Radio, Button, Group, Notification, TextInput } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { useState, use } from "react";
import ReactMarkdown from "react-markdown";

export default function LessonPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const lessonId = parseInt(params.id);
  const router = useRouter();
  
  const { data: lesson, isLoading, isError } = useLesson(lessonId);
  const submitMutation = useSubmitAnswer();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, { correct: boolean; shown: boolean }>>({});

  if (isLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (isError || !lesson) {
    return <Center h="100vh"><Text color="red">Failed to load lesson.</Text></Center>;
  }

  const handleSubmit = async (questionId: number) => {
    const answer = answers[questionId];
    if (!answer) return;

    try {
      const res = await submitMutation.mutateAsync({ questionId, answer });
      setResults(prev => ({ ...prev, [questionId]: { correct: res.correct, shown: true } }));
    } catch (err: any) {
      alert(err.message || "Error submitting answer");
    }
  };

  return (
    <Container size="lg" py="xl">
      <Button variant="subtle" onClick={() => router.push('/lms/modules')} mb="md">
        ← Back to Modules
      </Button>

      <Card shadow="sm" padding="xl" radius="md" withBorder mb="xl">
        <Title order={1} mb="md">{lesson.title}</Title>
        <div className="markdown-body">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>
      </Card>

      {lesson.questions && lesson.questions.length > 0 && (
        <>
          <Title order={3} mb="md">Quiz</Title>
          <Stack gap="md">
            {lesson.questions.map((q) => {
              // Handle JSON stringified options
              let optionsList: string[] = [];
              try {
                optionsList = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
              } catch (e) {
                optionsList = [];
              }

              return (
                <Card key={q.id} withBorder padding="md" radius="md">
                  <Text fw={500} mb="sm">{q.content} ({q.points} pt)</Text>
                  
                  {q.type === "text" ? (
                    <TextInput 
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ""}
                      onChange={(e) => {
                        const val = e.currentTarget.value;
                        setAnswers(prev => ({ ...prev, [q.id]: val }));
                      }}
                      mb="md"
                    />
                  ) : (
                    <Radio.Group
                      value={answers[q.id] || ""}
                      onChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                      mb="md"
                    >
                      <Stack gap="xs" mt="xs">
                        {optionsList.map((opt, idx) => (
                          <Radio key={idx} value={opt} label={opt} />
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}

                  <Group>
                    <Button 
                      onClick={() => handleSubmit(q.id)} 
                      loading={submitMutation.isPending}
                      disabled={!answers[q.id]}
                    >
                      Submit Answer
                    </Button>
                    
                    {results[q.id]?.shown && (
                      <Notification 
                        withCloseButton={false} 
                        color={results[q.id].correct ? "teal" : "red"}
                        title={results[q.id].correct ? "Correct!" : "Incorrect"}
                      >
                        {results[q.id].correct ? "Great job!" : "Try again."}
                      </Notification>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </>
      )}
    </Container>
  );
}

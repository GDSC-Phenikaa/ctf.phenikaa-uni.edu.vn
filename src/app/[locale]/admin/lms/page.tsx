"use client";

import { useState } from "react";
import {
  useCreateModule,
  useCreateLesson,
  useCreateQuestion,
  useCreateVideoSegment,
  useDeleteModule,
  useDeleteLesson,
  useDeleteQuestion,
  useDeleteVideoSegment,
  useAdminModules,
  useUpdateLesson,
  useUpdateQuestion,
  useUpdateVideoSegment,
  useRunLmsV2Migration,
  type AdminQuestion,
  type AdminLesson,
  type AdminVideoSegment,
  type QuestionPlacement,
  type QuestionType,
} from "../../../../hooks/useAdminLMS";
import {
  Box,
  Title,
  Button,
  Stack,
  Group,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Card,
  Text,
  Accordion,
  Loader,
  Center,
  ActionIcon,
  Select,
  Badge,
  Alert,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconList, IconTrash, IconEdit, IconSparkles, IconVideo } from "@tabler/icons-react";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multi_choice", label: "Multi Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "code", label: "Code" },
  { value: "mcq", label: "Legacy MCQ" },
  { value: "text", label: "Legacy Text" },
];

const PLACEMENTS: { value: QuestionPlacement; label: string }[] = [
  { value: "lesson", label: "Lesson" },
  { value: "segment", label: "Video Segment" },
];

function isValidYouTubeIframe(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!trimmed.includes("<iframe") || !trimmed.includes("</iframe>")) return false;
  return (
    trimmed.includes("youtube.com/embed/") ||
    trimmed.includes("youtube-nocookie.com/embed/")
  );
}

export default function AdminLmsPage() {
  const [modalType, setModalType] = useState<
    "module" | "lesson" | "segment" | "question" | "edit-lesson" | "edit-segment" | "edit-question" | null
  >(null);
  const [editLessonItem, setEditLessonItem] = useState<AdminLesson | null>(null);
  const [editSegmentItem, setEditSegmentItem] = useState<AdminVideoSegment | null>(null);
  const [editQuestionItem, setEditQuestionItem] = useState<AdminQuestion | null>(null);

  const { data: modules, isLoading } = useAdminModules();

  const createModule = useCreateModule();
  const createLesson = useCreateLesson();
  const createVideoSegment = useCreateVideoSegment();
  const createQuestion = useCreateQuestion();
  const updateLesson = useUpdateLesson();
  const updateVideoSegment = useUpdateVideoSegment();
  const updateQuestion = useUpdateQuestion();
  const runMigration = useRunLmsV2Migration();

  const deleteModule = useDeleteModule();
  const deleteLesson = useDeleteLesson();
  const deleteVideoSegment = useDeleteVideoSegment();
  const deleteQuestion = useDeleteQuestion();

  const moduleForm = useForm({
    initialValues: { title: "", description: "", order: 1 },
  });

  const lessonForm = useForm({
    initialValues: { module_id: 1, title: "", body: "", content: "", video_iframe: "", order: 1 },
  });

  const segmentForm = useForm({
    initialValues: {
      lesson_id: 1,
      title: "",
      description: "",
      start_seconds: 0,
      end_seconds: 60,
      order: 0,
    },
    validate: {
      end_seconds: (value, values) =>
        value > values.start_seconds ? null : "End seconds must be greater than start seconds",
    },
  });

  const questionForm = useForm({
    initialValues: {
      lesson_id: 1,
      placement: "lesson" as QuestionPlacement,
      video_segment_id: null as number | null,
      type: "single_choice" as QuestionType,
      prompt: "",
      content: "",
      options: "",
      answer_key: "",
      correct_answer: "",
      points: 10,
      order: 0,
    },
    validate: {
      points: (value) => (value >= 0 ? null : "Points must be >= 0"),
      video_segment_id: (value, values) => {
        if (values.placement === "segment" && !value) {
          return "Segment question requires a video segment";
        }
        return null;
      },
    },
  });

  const handleModuleSubmit = async (values: typeof moduleForm.values) => {
    try {
      await createModule.mutateAsync(values);
      setModalType(null);
      moduleForm.reset();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleLessonSubmit = async (values: typeof lessonForm.values) => {
    if (!isValidYouTubeIframe(values.video_iframe)) {
      alert("Video iframe must be a valid YouTube embed iframe");
      return;
    }

    try {
      if (modalType === "edit-lesson" && editLessonItem) {
        await updateLesson.mutateAsync({
          id: editLessonItem.id,
          data: values,
        });
      } else {
        await createLesson.mutateAsync(values);
      }

      setModalType(null);
      setEditLessonItem(null);
      lessonForm.reset();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSegmentSubmit = async (values: typeof segmentForm.values) => {
    try {
      if (modalType === "edit-segment" && editSegmentItem) {
        await updateVideoSegment.mutateAsync({
          id: editSegmentItem.id,
          data: values,
        });
      } else {
        await createVideoSegment.mutateAsync(values);
      }

      setModalType(null);
      setEditSegmentItem(null);
      segmentForm.reset();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleQuestionSubmit = async (values: typeof questionForm.values) => {
    try {
      const payload = {
        ...values,
        video_segment_id: values.placement === "lesson" ? null : values.video_segment_id,
      };

      if (modalType === "edit-question" && editQuestionItem) {
        await updateQuestion.mutateAsync({ id: editQuestionItem.id, data: payload });
      } else {
        await createQuestion.mutateAsync(payload);
      }

      setModalType(null);
      setEditQuestionItem(null);
      questionForm.reset();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenAddModule = () => {
    moduleForm.reset();
    moduleForm.setFieldValue("order", (modules?.length || 0) + 1);
    setModalType("module");
  };

  const handleOpenAddLesson = (modId: number, lessonCount: number) => {
    lessonForm.reset();
    lessonForm.setValues({
      module_id: modId,
      title: "",
      body: "",
      content: "",
      video_iframe: "",
      order: lessonCount + 1,
    });
    setModalType("lesson");
  };

  const handleOpenEditLesson = (lesson: AdminLesson) => {
    lessonForm.setValues({
      module_id: lesson.module_id,
      title: lesson.title,
      body: lesson.body || "",
      content: lesson.content || "",
      video_iframe: lesson.video_iframe || "",
      order: lesson.order || 0,
    });
    setEditLessonItem(lesson);
    setModalType("edit-lesson");
  };

  const handleOpenAddSegment = (lesson: AdminLesson) => {
    const nextOrder = (lesson.segments?.length || 0) + 1;
    segmentForm.setValues({
      lesson_id: lesson.id,
      title: "",
      description: "",
      start_seconds: 0,
      end_seconds: 60,
      order: nextOrder,
    });
    setModalType("segment");
  };

  const handleOpenEditSegment = (segment: AdminVideoSegment) => {
    segmentForm.setValues({
      lesson_id: segment.lesson_id,
      title: segment.title,
      description: segment.description || "",
      start_seconds: segment.start_seconds,
      end_seconds: segment.end_seconds,
      order: segment.order || 0,
    });
    setEditSegmentItem(segment);
    setModalType("edit-segment");
  };

  const handleOpenAddQuestion = (lesson: AdminLesson, placement: QuestionPlacement, segmentId?: number) => {
    questionForm.reset();
    questionForm.setValues({
      lesson_id: lesson.id,
      placement,
      video_segment_id: placement === "segment" ? segmentId || null : null,
      type: "single_choice",
      prompt: "",
      content: "",
      options: "",
      answer_key: "",
      correct_answer: "",
      points: 10,
      order: 0,
    });
    setModalType("question");
  };

  const handleOpenEditQuestion = (q: AdminQuestion) => {
    questionForm.setValues({
      lesson_id: q.lesson_id,
      placement: q.placement || "lesson",
      video_segment_id: q.video_segment_id || null,
      type: q.type || "single_choice",
      prompt: q.prompt || "",
      content: q.content || "",
      options: q.options || "",
      answer_key: q.answer_key || "",
      correct_answer: q.correct_answer || "",
      points: q.points || 0,
      order: q.order || 0,
    });
    setEditQuestionItem(q);
    setModalType("edit-question");
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <Box py="md">
      <Group justify="space-between" mb="xl">
        <Title order={2}>LMS v2 Content Management</Title>
        <Group>
          <Button
            color="grape"
            leftSection={<IconSparkles size={16} />}
            loading={runMigration.isPending}
            onClick={async () => {
              if (!confirm("Run LMS v2 migration now? This should only be done once.")) return;
              try {
                await runMigration.mutateAsync();
                alert("Migration completed");
              } catch (e: any) {
                alert(e.message || "Migration failed");
              }
            }}
          >
            Run v2 Migration
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAddModule}>
            Add Module
          </Button>
        </Group>
      </Group>

      <Alert color="blue" mb="lg" title="LMS v2 fields enabled">
        Lessons now support body and video_iframe, questions support placement and richer types, and segments can be managed per lesson.
      </Alert>

      {modules && modules.length > 0 ? (
        <Accordion variant="separated">
          {[...modules].sort((a, b) => a.order - b.order).map((mod) => (
            <Accordion.Item key={mod.id} value={String(mod.id)}>
              <Accordion.Control>
                <Group justify="space-between">
                  <Group>
                    <IconList size={18} />
                    <Text fw={600}>
                      Module {mod.order}: {mod.title}
                    </Text>
                  </Group>
                  <ActionIcon
                    component="div"
                    color="red"
                    variant="subtle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this module?")) deleteModule.mutate(mod.id);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed" mb="lg">
                  {mod.description}
                </Text>

                <Title order={5} mb="md">
                  Lessons
                </Title>
                <Stack gap="sm" mb="md">
                  {[...(mod.lessons || [])].sort((a, b) => a.order - b.order).map((lesson) => {
                    const lessonQuestions = (lesson.questions || []).filter((q) => (q.placement || "lesson") === "lesson");
                    const segmentQuestions = (lesson.questions || []).filter((q) => (q.placement || "lesson") === "segment");

                    return (
                      <Card key={lesson.id} withBorder p="sm" pl="md">
                        <Group justify="space-between" mt="sm">
                          <Text size="md" fw={500}>
                            Lesson {lesson.order}: {lesson.title}
                          </Text>
                          <Group>
                            <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenEditLesson(lesson)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                            <Button size="xs" variant="light" color="teal" onClick={() => handleOpenAddSegment(lesson)}>
                              Add Segment
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="orange"
                              leftSection={<IconPlus size={14} />}
                              onClick={() => handleOpenAddQuestion(lesson, "lesson")}
                            >
                              Add Lesson Question
                            </Button>
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => {
                                if (confirm("Delete this lesson?")) deleteLesson.mutate(lesson.id);
                              }}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        <Text size="xs" c="dimmed" mt="sm">
                          body: {(lesson.body || "").slice(0, 80) || "(empty)"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          video_iframe: {lesson.video_iframe ? "configured" : "none"}
                        </Text>

                        <Divider my="sm" />

                        <Group justify="space-between" mb="xs">
                          <Text fw={600}>Video Segments</Text>
                          <Badge variant="light" leftSection={<IconVideo size={12} />}>
                            {lesson.segments?.length || 0}
                          </Badge>
                        </Group>

                        <Stack gap="xs" mb="sm">
                          {[...(lesson.segments || [])].sort((a, b) => a.order - b.order).map((segment) => (
                            <Card key={segment.id} withBorder bg="gray.0" p="xs">
                              <Group justify="space-between">
                                <Box>
                                  <Text size="sm" fw={500}>
                                    {segment.order}. {segment.title}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {segment.start_seconds}s - {segment.end_seconds}s
                                  </Text>
                                </Box>
                                <Group gap="xs">
                                  <Button
                                    size="xs"
                                    variant="subtle"
                                    onClick={() => handleOpenAddQuestion(lesson, "segment", segment.id)}
                                  >
                                    Add Question
                                  </Button>
                                  <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenEditSegment(segment)}>
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                  <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    onClick={() => {
                                      if (confirm("Delete this video segment?")) deleteVideoSegment.mutate(segment.id);
                                    }}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                            </Card>
                          ))}
                          {(lesson.segments || []).length === 0 && (
                            <Text size="xs" c="dimmed">
                              No segments defined.
                            </Text>
                          )}
                        </Stack>

                        <Divider my="sm" />

                        <Text fw={600} size="sm" mb="xs">
                          Lesson Questions
                        </Text>
                        <Stack gap="xs" mb="sm">
                          {lessonQuestions.map((q) => (
                            <Group key={q.id} justify="space-between" bg="gray.1" p="xs" style={{ borderRadius: 6 }}>
                              <Box>
                                <Text size="sm" fw={500}>
                                  {q.prompt || q.content || "Untitled question"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  Type: {q.type || "single_choice"} | Placement: lesson | Points: {q.points}
                                </Text>
                              </Box>
                              <Group gap="xs">
                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenEditQuestion(q)}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() => {
                                    if (confirm("Delete this question?")) deleteQuestion.mutate(q.id);
                                  }}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          ))}
                          {lessonQuestions.length === 0 && (
                            <Text size="xs" c="dimmed">
                              No lesson-level questions.
                            </Text>
                          )}
                        </Stack>

                        <Text fw={600} size="sm" mb="xs">
                          Segment Questions
                        </Text>
                        <Stack gap="xs">
                          {segmentQuestions.map((q) => (
                            <Group key={q.id} justify="space-between" bg="gray.1" p="xs" style={{ borderRadius: 6 }}>
                              <Box>
                                <Text size="sm" fw={500}>
                                  {q.prompt || q.content || "Untitled question"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  Type: {q.type || "single_choice"} | Segment ID: {q.video_segment_id || "n/a"} | Points: {q.points}
                                </Text>
                              </Box>
                              <Group gap="xs">
                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenEditQuestion(q)}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() => {
                                    if (confirm("Delete this question?")) deleteQuestion.mutate(q.id);
                                  }}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          ))}
                          {segmentQuestions.length === 0 && (
                            <Text size="xs" c="dimmed">
                              No segment-level questions.
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                  {(!mod.lessons || mod.lessons.length === 0) && (
                    <Text size="sm" c="dimmed">
                      No lessons have been added to this module yet.
                    </Text>
                  )}
                </Stack>

                <Button
                  size="sm"
                  variant="light"
                  color="teal"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleOpenAddLesson(mod.id, mod.lessons?.length || 0)}
                >
                  Add Lesson to Module
                </Button>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Text c="dimmed" ta="center" mt="xl">
          No learning modules found. Create one to get started!
        </Text>
      )}

      <Modal opened={modalType === "module"} onClose={() => setModalType(null)} title="Create Module">
        <form onSubmit={moduleForm.onSubmit(handleModuleSubmit)}>
          <TextInput required label="Title" placeholder="Module 1" {...moduleForm.getInputProps("title")} mb="sm" />
          <Textarea
            required
            label="Description"
            placeholder="Intro..."
            {...moduleForm.getInputProps("description")}
            mb="sm"
          />
          <NumberInput required label="Order" min={0} {...moduleForm.getInputProps("order")} mb="md" />
          <Button type="submit" fullWidth loading={createModule.isPending}>
            Create
          </Button>
        </form>
      </Modal>

      <Modal
        opened={modalType === "lesson" || modalType === "edit-lesson"}
        onClose={() => setModalType(null)}
        title={modalType === "edit-lesson" ? "Edit Lesson" : "Create Lesson"}
        size="lg"
      >
        <form onSubmit={lessonForm.onSubmit(handleLessonSubmit)}>
          <NumberInput required label="Module ID" min={1} disabled {...lessonForm.getInputProps("module_id")} mb="sm" />
          <TextInput required label="Title" placeholder="Lesson Name" {...lessonForm.getInputProps("title")} mb="sm" />
          <Textarea label="Body (Markdown/HTML)" minRows={5} {...lessonForm.getInputProps("body")} mb="sm" />
          <Textarea label="Legacy Content" minRows={3} {...lessonForm.getInputProps("content")} mb="sm" />
          <Textarea
            label="YouTube Embed Iframe"
            description="Must contain <iframe> and youtube.com/embed or youtube-nocookie.com/embed"
            minRows={3}
            {...lessonForm.getInputProps("video_iframe")}
            mb="sm"
          />
          <NumberInput required label="Order" min={0} {...lessonForm.getInputProps("order")} mb="md" />
          <Button type="submit" fullWidth color="teal" loading={createLesson.isPending || updateLesson.isPending}>
            {modalType === "edit-lesson" ? "Save Changes" : "Create"}
          </Button>
        </form>
      </Modal>

      <Modal
        opened={modalType === "segment" || modalType === "edit-segment"}
        onClose={() => setModalType(null)}
        title={modalType === "edit-segment" ? "Edit Video Segment" : "Create Video Segment"}
      >
        <form onSubmit={segmentForm.onSubmit(handleSegmentSubmit)}>
          <NumberInput required label="Lesson ID" min={1} disabled {...segmentForm.getInputProps("lesson_id")} mb="sm" />
          <TextInput required label="Title" {...segmentForm.getInputProps("title")} mb="sm" />
          <Textarea label="Description" {...segmentForm.getInputProps("description")} mb="sm" />
          <NumberInput required label="Start Seconds" min={0} {...segmentForm.getInputProps("start_seconds")} mb="sm" />
          <NumberInput required label="End Seconds" min={1} {...segmentForm.getInputProps("end_seconds")} mb="sm" />
          <NumberInput required label="Order" min={0} {...segmentForm.getInputProps("order")} mb="md" />
          <Button
            type="submit"
            fullWidth
            color="cyan"
            loading={createVideoSegment.isPending || updateVideoSegment.isPending}
          >
            {modalType === "edit-segment" ? "Save Changes" : "Create"}
          </Button>
        </form>
      </Modal>

      <Modal
        opened={modalType === "question" || modalType === "edit-question"}
        onClose={() => setModalType(null)}
        title={modalType === "edit-question" ? "Edit Question" : "Create Question"}
      >
        <form onSubmit={questionForm.onSubmit(handleQuestionSubmit)}>
          <NumberInput required label="Lesson ID" min={1} disabled {...questionForm.getInputProps("lesson_id")} mb="sm" />
          <Select required label="Placement" data={PLACEMENTS} {...questionForm.getInputProps("placement")} mb="sm" />

          {questionForm.values.placement === "segment" && (
            <NumberInput
              required
              label="Video Segment ID"
              min={1}
              {...questionForm.getInputProps("video_segment_id")}
              mb="sm"
            />
          )}

          <Select required label="Question Type" data={QUESTION_TYPES} {...questionForm.getInputProps("type")} mb="sm" />
          <TextInput label="Prompt" {...questionForm.getInputProps("prompt")} mb="sm" />
          <Textarea label="Legacy Content" {...questionForm.getInputProps("content")} mb="sm" />
          <Textarea
            label="Options"
            description="JSON array or CSV for choice questions"
            placeholder='["A", "B"] or A, B'
            {...questionForm.getInputProps("options")}
            mb="sm"
          />
          <Textarea
            label="Answer Key"
            description='Stringified JSON, e.g. {"correct":"answer"}'
            {...questionForm.getInputProps("answer_key")}
            mb="sm"
          />
          <TextInput label="Legacy Correct Answer" {...questionForm.getInputProps("correct_answer")} mb="sm" />
          <NumberInput required label="Points" min={0} {...questionForm.getInputProps("points")} mb="sm" />
          <NumberInput label="Order" min={0} {...questionForm.getInputProps("order")} mb="md" />
          <Button type="submit" fullWidth color="orange" loading={createQuestion.isPending || updateQuestion.isPending}>
            {modalType === "edit-question" ? "Save Changes" : "Create"}
          </Button>
        </form>
      </Modal>
    </Box>
  );
}

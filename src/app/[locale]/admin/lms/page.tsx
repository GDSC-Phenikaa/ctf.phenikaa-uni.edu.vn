"use client";

import { useState } from "react";
import { 
  useCreateModule, useCreateLesson, useCreateQuestion, 
  useDeleteModule, useDeleteLesson, useDeleteQuestion,
  useAdminModules, useUpdateQuestion, AdminQuestion, AdminLesson
} from "../../../../hooks/useAdminLMS";
import { Box, Title, Button, Stack, Group, Modal, TextInput, Textarea, NumberInput, Card, Text, Accordion, Loader, Center, ActionIcon, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconList, IconTrash, IconEdit } from "@tabler/icons-react";

export default function AdminLmsPage() {
  const [modalType, setModalType] = useState<"module" | "lesson" | "question" | "edit-question" | null>(null);
  const [editQuestionItem, setEditQuestionItem] = useState<AdminQuestion | null>(null);

  const { data: modules, isLoading } = useAdminModules();
  
  const createModule = useCreateModule();
  const createLesson = useCreateLesson();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  
  const deleteModule = useDeleteModule();
  const deleteLesson = useDeleteLesson();
  const deleteQuestion = useDeleteQuestion();

  const moduleForm = useForm({
    initialValues: { title: "", description: "", order: 1 },
  });

  const lessonForm = useForm({
    initialValues: { module_id: 1, title: "", content: "", order: 1 },
  });

  const questionForm = useForm({
    initialValues: { lesson_id: 1, content: "", type: "mcq", options: '["Option A", "Option B"]', correct_answer: "", points: 10 },
  });

  const handleModuleSubmit = async (values: typeof moduleForm.values) => {
    try {
      await createModule.mutateAsync(values);
      setModalType(null);
      moduleForm.reset();
    } catch (e: any) { alert(e.message); }
  };

  const handleLessonSubmit = async (values: typeof lessonForm.values) => {
    try {
      await createLesson.mutateAsync(values);
      setModalType(null);
      lessonForm.reset();
    } catch (e: any) { alert(e.message); }
  };

  const handleQuestionSubmit = async (values: typeof questionForm.values) => {
    try {
      const payload = { ...values };
      if (payload.type === "text") {
        payload.options = "[]";
      }
      
      if (modalType === "edit-question" && editQuestionItem) {
        await updateQuestion.mutateAsync({ id: editQuestionItem.id, data: payload });
      } else {
        await createQuestion.mutateAsync(payload);
      }
      
      setModalType(null);
      setEditQuestionItem(null);
      questionForm.reset();
    } catch (e: any) { alert(e.message); }
  };

  const handleOpenAddModule = () => {
    moduleForm.reset();
    moduleForm.setFieldValue("order", (modules?.length || 0) + 1);
    setModalType("module");
  };

  const handleOpenAddLesson = (mod: any) => {
    lessonForm.reset();
    lessonForm.setValues({ module_id: mod.id, title: "", content: "", order: (mod.lessons?.length || 0) + 1 });
    setModalType("lesson");
  };

  const handleOpenAddQuestion = (lesson: any) => {
    questionForm.reset();
    questionForm.setValues({ lesson_id: lesson.id, content: "", type: "mcq", options: '["Option A", "Option B"]', correct_answer: "", points: 10 });
    setModalType("question");
  };

  const handleOpenEditQuestion = (q: AdminQuestion, lesson: AdminLesson) => {
    questionForm.setValues({
      lesson_id: lesson.id,
      content: q.content,
      type: q.type || "mcq",
      options: q.options || '[]',
      correct_answer: q.correct_answer || "",
      points: q.points || 10,
    });
    setEditQuestionItem(q);
    setModalType("edit-question");
  };

  if (isLoading) {
    return <Center h="100vh"><Loader /></Center>;
  }

  return (
    <Box py="md">
      <Group justify="space-between" mb="xl">
        <Title order={2}>LMS Hierarchy Management</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenAddModule}>
          Add Module
        </Button>
      </Group>

      {modules && modules.length > 0 ? (
        <Accordion variant="separated">
          {modules.map((mod) => (
            <Accordion.Item key={mod.id} value={mod.id.toString()}>
              <Accordion.Control>
                <Group justify="space-between">
                  <Group>
                    <IconList size={18} />
                    <Text fw={600}>Module {mod.order}: {mod.title}</Text>
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
                <Text size="sm" c="dimmed" mb="lg">{mod.description}</Text>
                
                <Title order={5} mb="md">Lessons</Title>
                <Stack gap="sm" mb="md">
                  {mod.lessons?.map((lesson) => (
                    <Card key={lesson.id} withBorder p="sm" pl="md">
                      <Group justify="space-between" mt="sm">
                        <Text size="md" fw={500}>Lesson {lesson.order}: {lesson.title}</Text>
                        <Group>
                          <Button 
                            size="xs" 
                            variant="light" 
                            color="orange" 
                            leftSection={<IconPlus size={14} />} 
                            onClick={() => handleOpenAddQuestion(lesson)}
                          >
                            Add Question
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

                      {/* Display nested questions directly since backend provides them now */}
                      {lesson.questions && lesson.questions.length > 0 ? (
                        <Stack gap="xs" mt="md" pl="md" style={{ borderLeft: "2px solid #eee" }}>
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase">QUESTIONS</Text>
                          {lesson.questions.map(q => (
                            <Group key={q.id} justify="space-between" bg="gray.1" p="xs" style={{ borderRadius: 6 }}>
                              <Box>
                                <Text size="sm" fw={500}>{q.content}</Text>
                                <Text size="xs" c="dimmed">
                                  Type: {q.type || 'mcq'} | Points: {q.points} | Answer: {q.correct_answer}
                                </Text>
                              </Box>
                              <Group gap="xs">
                                <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenEditQuestion(q, lesson)}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon color="red" variant="subtle" onClick={() => {
                                  if (confirm("Delete this question?")) deleteQuestion.mutate(q.id);
                                }}>
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="xs" c="dimmed" mt="sm" pl="md">No questions assigned.</Text>
                      )}
                    </Card>
                  ))}
                  {(!mod.lessons || mod.lessons.length === 0) && (
                    <Text size="sm" c="dimmed">No lessons have been added to this module yet.</Text>
                  )}
                </Stack>

                <Button 
                  size="sm" 
                  variant="light" 
                  color="teal" 
                  leftSection={<IconPlus size={16} />} 
                  onClick={() => handleOpenAddLesson(mod)}
                >
                  Add Lesson to Module
                </Button>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Text c="dimmed" ta="center" mt="xl">No learning modules found. Create one to get started!</Text>
      )}

      {/* Modals */}
      <Modal opened={modalType === "module"} onClose={() => setModalType(null)} title="Create Module">
        <form onSubmit={moduleForm.onSubmit(handleModuleSubmit)}>
          <TextInput required label="Title" placeholder="Module 1" {...moduleForm.getInputProps("title")} mb="sm" />
          <Textarea required label="Description" placeholder="Intro..." {...moduleForm.getInputProps("description")} mb="sm" />
          <NumberInput required label="Order" min={1} {...moduleForm.getInputProps("order")} mb="md" />
          <Button type="submit" fullWidth loading={createModule.isPending}>Create</Button>
        </form>
      </Modal>

      <Modal opened={modalType === "lesson"} onClose={() => setModalType(null)} title="Create Lesson">
        <form onSubmit={lessonForm.onSubmit(handleLessonSubmit)}>
          <NumberInput required label="Module ID" min={1} disabled {...lessonForm.getInputProps("module_id")} mb="sm" />
          <TextInput required label="Title" placeholder="Lesson Name" {...lessonForm.getInputProps("title")} mb="sm" />
          <Textarea required label="Content (Markdown)" minRows={5} {...lessonForm.getInputProps("content")} mb="sm" />
          <NumberInput required label="Order" min={1} {...lessonForm.getInputProps("order")} mb="md" />
          <Button type="submit" fullWidth color="teal" loading={createLesson.isPending}>Create</Button>
        </form>
      </Modal>

      <Modal opened={modalType === "question" || modalType === "edit-question"} onClose={() => setModalType(null)} title={modalType === "edit-question" ? "Edit Question" : "Create Question"}>
        <form onSubmit={questionForm.onSubmit(handleQuestionSubmit)}>
          <NumberInput required label="Lesson ID" min={1} disabled {...questionForm.getInputProps("lesson_id")} mb="sm" />
          <TextInput required label="Question Content" placeholder="What tag..." {...questionForm.getInputProps("content")} mb="sm" />
          <Select required label="Question Type" data={[{value: "mcq", label: "Multiple Choice"}, {value: "text", label: "Text input"}]} {...questionForm.getInputProps("type")} mb="sm" />
          {questionForm.values.type === "mcq" && (
            <Textarea required label="Options (JSON Array)" placeholder='["Option A", "Option B"]' {...questionForm.getInputProps("options")} mb="sm" />
          )}
          <TextInput required label="Correct Answer" placeholder="<script>" {...questionForm.getInputProps("correct_answer")} mb="sm" />
          <NumberInput required label="Points" min={0} {...questionForm.getInputProps("points")} mb="md" />
          <Button type="submit" fullWidth color="orange" loading={createQuestion.isPending || updateQuestion.isPending}>
            {modalType === "edit-question" ? "Save Changes" : "Create"}
          </Button>
        </form>
      </Modal>
    </Box>
  );
}

"use client";

import { useState } from "react";
import { useAdminChallenges, useCreateChallenge, useUpdateChallenge } from "../../../../hooks/useAdminChallenges";
import { Box, Title, Button, Table, Group, Modal, TextInput, Textarea, Checkbox, Select, NumberInput, ActionIcon, Center, Loader } from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

export default function AdminChallengesPage() {
  const { data: challenges, isLoading } = useAdminChallenges();
  const createMutation = useCreateChallenge();
  const updateMutation = useUpdateChallenge();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      type: "Web",
      points: 100,
      flag: "",
      hidden: false,
      docker: false,
      dockerImage: "",
    },
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    form.reset();
    setModalOpen(true);
  };

  const handleOpenEdit = (chal: any) => {
    setEditingId(chal.id);
    form.setValues({
      title: chal.title,
      description: chal.description,
      difficulty: chal.difficulty,
      type: chal.type,
      points: chal.points,
      flag: chal.flag || "",
      hidden: chal.hidden,
      docker: chal.docker,
      dockerImage: chal.dockerImage || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setModalOpen(false);
      form.reset();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  if (isLoading) {
    return <Center h="100vh"><Loader /></Center>;
  }

  return (
    <Box py="md">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Manage Challenges</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Create Challenge
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Difficulty</Table.Th>
            <Table.Th>Points</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {challenges?.map((chal) => (
            <Table.Tr key={chal.id}>
              <Table.Td>{chal.id}</Table.Td>
              <Table.Td>{chal.title}</Table.Td>
              <Table.Td>{chal.type}</Table.Td>
              <Table.Td>{chal.difficulty}</Table.Td>
              <Table.Td>{chal.points}</Table.Td>
              <Table.Td>
                <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(chal)}>
                  <IconEdit size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
          {(!challenges || challenges.length === 0) && (
            <Table.Tr>
              <Table.Td colSpan={6} align="center">No challenges found</Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Challenge" : "Create Challenge"} size="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput required label="Title" placeholder="SQL Injection Basics" {...form.getInputProps("title")} mb="sm" />
          <Textarea required label="Description" placeholder="Find the flaw..." {...form.getInputProps("description")} mb="sm" minRows={3} />
          <Group grow mb="sm">
            <Select required label="Difficulty" data={["Easy", "Medium", "Hard", "Insane"]} {...form.getInputProps("difficulty")} />
            <Select required label="Type" data={["Web", "Crypto", "Pwn", "Reverse", "OSINT", "Forensics", "Misc"]} {...form.getInputProps("type")} />
          </Group>
          <Group grow mb="sm">
            <NumberInput required label="Points" min={0} {...form.getInputProps("points")} />
            <TextInput label="Flag" placeholder="GDSC{...}" {...form.getInputProps("flag")} />
          </Group>
          <Group mb="sm">
            <Checkbox label="Hidden" {...form.getInputProps("hidden", { type: "checkbox" })} />
            <Checkbox label="Uses Docker" {...form.getInputProps("docker", { type: "checkbox" })} />
          </Group>
          {form.values.docker && (
            <TextInput label="Docker Image" placeholder="user/image" {...form.getInputProps("dockerImage")} mb="sm" />
          )}
          <Button type="submit" fullWidth mt="md" loading={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "Save Changes" : "Create"}
          </Button>
        </form>
      </Modal>
    </Box>
  );
}

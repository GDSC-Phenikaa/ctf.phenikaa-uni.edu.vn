"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  Modal,
  Pagination,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconNote, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote, type NoteItem } from "../../hooks/useNotes";

function toAbsoluteCurrentUrl(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return `${window.location.origin}${pathname}`;
}

export default function GlobalNotes() {
  const pathname = usePathname();

  const [opened, setOpened] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NoteItem | null>(null);
  const [scope, setScope] = useState<"all" | "current">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hrefInput, setHrefInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [error, setError] = useState("");

  const currentPageHref = useMemo(() => toAbsoluteCurrentUrl(pathname || "/"), [pathname]);

  const notesQuery = useNotes({
    page,
    limit: 10,
    href: scope === "current" ? currentPageHref : undefined,
  });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const filteredNotes = useMemo(() => {
    const notes = notesQuery.data?.notes ?? [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return notes;

    return notes.filter((note) => {
      const hrefMatch = note.href.toLowerCase().includes(keyword);
      const contentMatch = note.content.toLowerCase().includes(keyword);
      return hrefMatch || contentMatch;
    });
  }, [notesQuery.data?.notes, search]);

  const totalPages = Math.max(notesQuery.data?.total_pages || 1, 1);

  const openCreateForCurrentPage = () => {
    setHrefInput(currentPageHref);
    setContentInput("");
    setError("");
    setCreateOpen(true);
  };

  const openEdit = (note: NoteItem) => {
    setEditTarget(note);
    setHrefInput(note.href);
    setContentInput(note.content);
    setError("");
    setEditOpen(true);
  };

  const handleCreate = async () => {
    if (!hrefInput.trim() || !contentInput.trim()) {
      setError("Both href and content are required.");
      return;
    }

    setError("");
    try {
      await createNote.mutateAsync({ href: hrefInput.trim(), content: contentInput.trim() });
      setCreateOpen(false);
      setContentInput("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create note";
      setError(message);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;

    if (!hrefInput.trim() || !contentInput.trim()) {
      setError("Both href and content are required.");
      return;
    }

    setError("");
    try {
      await updateNote.mutateAsync({ id: editTarget.id, href: hrefInput.trim(), content: contentInput.trim() });
      setEditOpen(false);
      setEditTarget(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update note";
      setError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this note?")) return;

    try {
      await deleteNote.mutateAsync(id);
    } catch {
      // no-op, react-query error surface is enough for now
    }
  };

  const openQuickTakeNote = () => {
    setHrefInput(currentPageHref);
    setContentInput("");
    setError("");
    setQuickOpen(true);
  };

  const handleQuickCreate = async () => {
    if (!contentInput.trim()) {
      setError("Content is required.");
      return;
    }

    setError("");
    try {
      await createNote.mutateAsync({ href: currentPageHref, content: contentInput.trim() });
      setQuickOpen(false);
      setContentInput("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create note";
      setError(message);
    }
  };

  return (
    <>
      <Affix position={{ right: 20, bottom: 140 }} zIndex={3000}>
        <Stack gap="xs">
          <ActionIcon
            size={42}
            radius="xl"
            variant="filled"
            color="green"
            onClick={openQuickTakeNote}
            aria-label="Quick take note"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          >
            <IconPlus size={20} />
          </ActionIcon>

          <ActionIcon
            size={56}
            radius="xl"
            variant="filled"
            color="teal"
            onClick={() => setOpened(true)}
            aria-label="Open notes"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.22)" }}
          >
            <IconNote size={28} />
          </ActionIcon>
        </Stack>
      </Affix>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="My Notes"
        position="right"
        size="md"
        padding="md"
      >
        <Stack>
          <Group justify="space-between" align="center">
            <Badge variant="light">Current page: {currentPageHref}</Badge>
            <Group gap="xs">
              <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openCreateForCurrentPage}>
                Take Note
              </Button>
            </Group>
          </Group>

          <SegmentedControl
            value={scope}
            onChange={(value) => {
              setScope(value as "all" | "current");
              setPage(1);
            }}
            data={[
              { label: "All notes", value: "all" },
              { label: "This page", value: "current" },
            ]}
          />

          <TextInput
            placeholder="Search notes by URL or content"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          {notesQuery.isLoading && (
            <Group>
              <Loader size="sm" />
              <Text size="sm">Loading notes...</Text>
            </Group>
          )}

          {notesQuery.isError && (
            <Text c="red" size="sm">
              Failed to load notes.
            </Text>
          )}

          {!notesQuery.isLoading && filteredNotes.length === 0 && (
            <Text c="dimmed" size="sm">
              No notes yet. Create one for this page or any link.
            </Text>
          )}

          {filteredNotes.map((note) => (
            <Card key={note.id} withBorder>
              <Group justify="space-between" mb="xs" align="flex-start">
                <Title order={6}>Note #{note.id}</Title>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(note)}>
                    <IconPencil size={15} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => void handleDelete(note.id)}>
                    <IconTrash size={15} />
                  </ActionIcon>
                </Group>
              </Group>

              <Text size="xs" c="dimmed" lineClamp={1} mb="xs">
                {note.href}
              </Text>
              <Text size="sm" mb="sm">
                {note.content}
              </Text>

              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  Updated: {note.updated_at ? new Date(note.updated_at).toLocaleString() : "-"}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => window.open(note.href, "_blank", "noopener,noreferrer")}
                >
                  Visit Link
                </Button>
              </Group>
            </Card>
          ))}

          <Group justify="center">
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        </Stack>
      </Drawer>

      <Modal opened={quickOpen} onClose={() => setQuickOpen(false)} title="Quick Note" centered>
        <Stack>
          <Text size="sm" c="dimmed">Saving note for:</Text>
          <TextInput value={currentPageHref} readOnly />
          <Textarea
            label="Content"
            minRows={3}
            value={contentInput}
            onChange={(event) => setContentInput(event.currentTarget.value)}
            placeholder="Write a quick note for this page"
            required
          />
          {error && <Text c="red" size="sm">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setQuickOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleQuickCreate()} loading={createNote.isPending}>
              Save Quick Note
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Create Note" centered>
        <Stack>
          <TextInput
            label="Href"
            value={hrefInput}
            onChange={(event) => setHrefInput(event.currentTarget.value)}
            placeholder="https://example.com/page"
            required
          />
          <Textarea
            label="Content"
            minRows={4}
            value={contentInput}
            onChange={(event) => setContentInput(event.currentTarget.value)}
            placeholder="Write your note"
            required
          />
          {error && <Text c="red" size="sm">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} loading={createNote.isPending}>
              Save Note
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editOpen} onClose={() => setEditOpen(false)} title="Edit Note" centered>
        <Stack>
          <TextInput
            label="Href"
            value={hrefInput}
            onChange={(event) => setHrefInput(event.currentTarget.value)}
            placeholder="https://example.com/page"
            required
          />
          <Textarea
            label="Content"
            minRows={4}
            value={contentInput}
            onChange={(event) => setContentInput(event.currentTarget.value)}
            placeholder="Write your note"
            required
          />
          {error && <Text c="red" size="sm">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpdate()} loading={updateNote.isPending}>
              Update Note
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

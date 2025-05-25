import { Paper, Text, Stack } from "@mantine/core";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    profileUrl: string;
  };
  docker: boolean;
  solved: boolean;
}

interface PreviewCardProps {
  challenge: Challenge;
  onClick?: () => void;
}

export default function PreviewCard({ challenge, onClick }: PreviewCardProps) {
  return (
    <Paper
      shadow="lg"
      radius="xl"
      p="md"
      onClick={onClick}
      style={{
        backgroundColor: challenge.solved ? "#ffe4e1" : "#fff0f5", // Pastel pinks
        width: "220px",
        height: "140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "transform 0.3s ease, background-color 0.3s ease",
        cursor: "pointer",
        border: "2px solid #ffb6c1", // Light pink border
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; // Slight zoom on hover
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)"; // Reset zoom
      }}
    >
      <Stack gap="xs" align="center">
        <Text
          size="lg"
          fw={700}
          style={{
            textAlign: "center",
            color: challenge.solved ? "#2d7d32" : "#ff69b4", // Green for solved, hot pink for unsolved
            fontFamily: "'SuperBubble', cursive, sans-serif", // Playful font
          }}
        >
          {challenge.title}
        </Text>
        <Text
          size="xl"
          fw={900}
          style={{
            fontSize: "2.5rem",
            color: challenge.solved ? "#2d7d32" : "#ff69b4", // Match title color
            fontFamily: "'SuperBubble', cursive, sans-serif",
          }}
        >
          {challenge.points}
        </Text>
      </Stack>
    </Paper>
  );
}
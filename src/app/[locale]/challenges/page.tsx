"use client";

import PreviewCard from "../../../components/Challenges/Preview";
import ChallengeModal from "../../../components/Challenges/ChallengeModal";
import { Select, Group, Text, Stack, Loader, Center } from "@mantine/core";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChallengeList } from "../../../hooks/useChallengeList";
import { useTranslations } from "next-intl";

type Challenge = {
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
  solves?: number
  solved: boolean
};

export default function Page() {
  const [sortBy, setSortBy] = useState<string>("points-desc");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  // Check if the user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        setIsLoggedIn(true);
      }
    }
  }, [router]);

  const { data, isLoading, isError, error } = useChallengeList();

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError || !data?.challenges) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text color="red">{error?.message || "Failed to load challenges"}</Text>
      </Center>
    );
  }

  // Ensure challenges have all required fields
  const challenges: Challenge[] = data.challenges.map((challenge: any) => ({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    type: challenge.type,
    points: challenge.points,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
    author: challenge.author ?? { name: "", profileUrl: "" },
    docker: challenge.docker,
    solves: challenge.solves,
    solved: challenge.solved ?? false,
  }));

  // Sort challenges
  const sortChallenges = (challenges: Challenge[], sortOption: string) => {
    const sorted = [...challenges];

    switch (sortOption) {
      case "points-asc":
        return sorted.sort((a, b) => a.points - b.points);
      case "points-desc":
        return sorted.sort((a, b) => b.points - a.points);
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "difficulty":
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return sorted.sort(
          (a, b) =>
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        );
      case "solved":
        return sorted.sort((a, b) => Number(b.solves) - Number(a.solves));
      case "unsolved":
        return sorted.sort((a, b) => Number(a.solves) - Number(b.solves));
      default:
        return sorted;
    }
  };

  const sortedChallenges = sortChallenges(challenges, sortBy);

  // Group challenges by type
  const groupedChallenges = sortedChallenges.reduce(
    (groups, challenge) => {
      const type = challenge.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(challenge);
      return groups;
    },
    {} as Record<string, Challenge[]>
  );

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setModalOpened(true);
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Group mb="xl" align="center">
        <Select
          placeholder={t("challenges.select-placeholder")}
          value={sortBy}
          onChange={(value) => setSortBy(value || "points-desc")}
          data={[
            { value: "points-desc", label: t("challenges.filter.htl") },
            { value: "points-asc", label: t("challenges.filter.lth") },
            { value: "title-asc", label: t("challenges.filter.taz") },
            { value: "title-desc", label: t("challenges.filter.tza") },
            { value: "difficulty", label: t("challenges.filter.difficulty") },
            { value: "solved", label: t("challenges.filter.solvedfirst") },
            { value: "unsolved", label: t("challenges.filter.unsolvedfirst") },
          ]}
          style={{ width: "200px" }}
        />
      </Group>

      <Stack gap="2xl">
        {Object.entries(groupedChallenges).map(([type, challenges]) => (
          <div key={type}>
            <Text size="xl" fw={500} c="#666" mb="md" style={{ fontSize: "1.5rem" }}>
              {type}
            </Text>
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {challenges.map((challenge) => (
                <PreviewCard
                  key={challenge.id}
                  challenge={challenge}
                  onClick={() => handleCardClick(challenge)}
                />
              ))}
            </div>
          </div>
        ))}
      </Stack>

      <ChallengeModal challenge={selectedChallenge} opened={modalOpened} onClose={() => setModalOpened(false)} />
    </div>
  );
}
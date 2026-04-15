"use client";

import { Box, Group, NavLink, Paper, Title } from "@mantine/core";
import { IconDashboard, IconFlag, IconBook } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Link } from "../../../i18n/navigation";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to determine if a link is active
  const isActive = (path: string) => {
    // Exact match for dashboard, or prefix match for sub-pages
    if (path.endsWith("/admin")) {
      return pathname.endsWith("/admin");
    }
    return pathname.includes(path);
  };

  return (
    <Group align="flex-start" wrap="nowrap" style={{ height: "100%", width: "100%" }} gap={0}>
      {/* Sidebar Navigation */}
      <Paper
        withBorder
        p="md"
        style={{
          width: 260,
          minHeight: "calc(100vh - 60px)", // Assuming roughly 60px header
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
        }}
      >
        <Title order={4} mb="lg" c="dimmed">Admin Controls</Title>

        <NavLink
          component={Link}
          href="/admin"
          label="Dashboard"
          leftSection={<IconDashboard size={18} stroke={1.5} />}
          active={isActive("/admin") && !pathname.includes("/challenges") && !pathname.includes("/lms")}
          variant="light"
          mb="sm"
          style={{ borderRadius: 6 }}
        />
        <NavLink
          component={Link}
          href="/admin/challenges"
          label="Challenges Management"
          leftSection={<IconFlag size={18} stroke={1.5} />}
          active={isActive("/admin/challenges")}
          variant="light"
          mb="sm"
          style={{ borderRadius: 6 }}
        />
        <NavLink
          component={Link}
          href="/admin/lms"
          label="LMS Content Management"
          leftSection={<IconBook size={18} stroke={1.5} />}
          active={isActive("/admin/lms")}
          variant="light"
          style={{ borderRadius: 6 }}
        />
      </Paper>

      {/* Main Content Area */}
      <Box style={{ flex: 1, padding: "24px", overflowY: "auto", height: "calc(100vh - 60px)" }}>
        {children}
      </Box>
    </Group>
  );
}

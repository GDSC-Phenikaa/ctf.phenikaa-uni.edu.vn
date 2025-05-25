"use client";

import { AppShell, Group, ActionIcon, Text, useMantineColorScheme, Button, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon, IconHome, IconFlag, IconScoreboard, IconUser } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./Shell.module.css";
import { ReactNode, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import Navbar from "../Navbar/Navbar";

type ShellProps = {
    children: ReactNode;
};

// Create QueryClient ONCE outside the component
const queryClient = new QueryClient();

export default function Shell({ children }: ShellProps) {
    const t = useTranslations();
    return (
        <QueryClientProvider client={queryClient}>
            <AppShell
                header={{ height: 60 }}
                footer={{ height: 40 }}
                padding="md"
                style={{ height: "100%" }}
            >
                <AppShell.Header>
                    <Navbar/>
                </AppShell.Header>
                <AppShell.Main
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                    }}
                >
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                        {children}
                    </div>
                </AppShell.Main>
                <AppShell.Footer>
                    <Group align="center" justify="center" h="100%" w="100%">
                        <Text ta="center" size="sm">
                            {t("footer.copyright")}
                        </Text>
                    </Group>
                </AppShell.Footer>
            </AppShell>
        </QueryClientProvider>
    )
}
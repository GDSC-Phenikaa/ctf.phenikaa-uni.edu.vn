"use client"
import { Group, ActionIcon, Button, Text, Menu, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconHome, IconFlag, IconScoreboard, IconUser, IconSun, IconMoon, IconLogout } from "@tabler/icons-react";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { useProfile } from "../../hooks/useProfile";
import classes from "./Navbar.module.css";
import cx from 'clsx'; 

export default function Navbar() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const t = useTranslations();
    const currentLocale = useLocale();
    const { data: profile } = useProfile();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <Group h="100%" px="md" justify="space-between">
            <Group>
                {/* Top navigation links */}
                <Text component="a" href="/" mx="sm" style={{ display: "flex", alignItems: "center" }}>
                    <IconHome size={18} style={{ marginRight: 6 }} />
                    {t("navigation.home")}
                </Text>
                <Text component="a" href="/challenges" mx="sm" style={{ display: "flex", alignItems: "center" }}>
                    <IconFlag size={18} style={{ marginRight: 6 }} />
                    {t("navigation.challenges")}
                </Text>
                <Text component="a" href="/scoreboard" mx="sm" style={{ display: "flex", alignItems: "center" }}>
                    <IconScoreboard size={18} style={{ marginRight: 6 }} />
                    {t("navigation.scoreboard")}
                </Text>
                <Text component="a" href="/profile" mx="sm" style={{ display: "flex", alignItems: "center" }}>
                    <IconUser size={18} style={{ marginRight: 6 }} />
                    {t("navigation.profile")}
                </Text>
            </Group>
            <Group gap={2}>
                <LanguageSwitcher currentLocale={currentLocale} />
                <ActionIcon
                    onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                    variant="transparent"
                    size="xl"
                    aria-label="Toggle color scheme"
                >
                    <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
                    <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
                </ActionIcon>
                {profile ? (
                    <Menu shadow="md" width={180} position="bottom-end" withinPortal={true}>
                        <Menu.Target>
                            <Button
                                variant="transparent"
                                radius="xl"
                                style={{ cursor: "pointer" }}
                                rightSection={<IconUser size={16} />}
                            >
                                {profile.name || profile.username || profile.email}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                color="red"
                                leftSection={<IconLogout size={16} />}
                                onClick={handleLogout}
                            >
                                {t("navigation.logoutButton") || "Logout"}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                ) : (
                    <Button variant="filled" onClick={() => window.location.href = "/login"}>
                        {t("navigation.loginButton")}
                    </Button>
                )}                        
            </Group>
        </Group>
    )
}
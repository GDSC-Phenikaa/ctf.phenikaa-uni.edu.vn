"use client";
import { useEffect, useState } from "react";
import { Button, Group, Input, Text, Paper, Center } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useLogin } from "../../../hooks/useLogin";

export default function LoginPage() {
    const t = useTranslations();
    const login = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (login.isSuccess && login.data.token) {
            localStorage.setItem("token", login.data.token);
            window.location.href = "/";
        }
    }, [login.isSuccess, login.data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password && !login.isPending) {
            login.mutate({ email, password });
        }
    };

    return (
        <Center style={{ flex: 1, minHeight: 0 }}>
            <Paper shadow="md" p="xl" radius="md" style={{ minWidth: 320 }}>
                <form onSubmit={handleSubmit}>
                    <Text size="xl" mb="md" ta="center">
                        {t("login.title")}
                    </Text>
                    <Group align="vertical" grow>
                        <Input
                            placeholder={t("login.username")}
                            value={email}
                            onChange={e => setEmail(e.currentTarget.value)}
                            disabled={login.isPending}
                        />
                        <Input
                            placeholder={t("login.password")}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.currentTarget.value)}
                            disabled={login.isPending}
                        />
                    </Group>
                    {login.isError && (
                        <Text color="red" size="sm" mt="sm" ta="center">
                            {"Login failed"}
                        </Text>
                    )}
                    <Button
                        mt="md"
                        fullWidth
                        variant="filled"
                        loading={login.isPending}
                        type="submit"
                        disabled={!email || !password}
                    >
                        {t("login.button")}
                    </Button>

                    <Text mt="md" size="sm" ta="center">
                        {t("login.noAccount")}{" "}
                        <Text component="a" href="/register" color="blue" style={{ textDecoration: "underline" }}>
                            {t("login.registerHere")}
                        </Text>
                    </Text>
                </form>
            </Paper>
        </Center>
    );
}
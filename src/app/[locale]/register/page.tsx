"use client";
import { Button, Input, Text, Paper, Center, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRegister } from "../../../hooks/useRegister";
import { useState } from "react";

export default function RegisterPage() {
    const t = useTranslations();
    const register = useRegister();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName || !username || !password || !confirmPassword || !email) {
            setError(t("register.fillAllFields") || "Please fill all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError(t("register.passwordMismatch") || "Passwords do not match.");
            return;
        }

        register.mutate(
            { name: fullName, username, password, email },
            {
                onError: (err: any) => {
                    setError(err?.message || t("register.failed") || "Registration failed.");
                },
                onSuccess: () => {
                    window.location.href = "/login";
                },
            }
        );
    };

    return (
        <Center style={{ flex: 1, minHeight: 0 }}>
            <Paper shadow="md" p="xl" radius="md" style={{ minWidth: 320 }}>
                <form onSubmit={handleSubmit}>
                    <Text size="xl" mb="md" ta="center">
                        {t("register.title")}
                    </Text>
                    <Stack>
                        <Input
                            placeholder={t("register.fullName")}
                            value={fullName}
                            onChange={e => setFullName(e.currentTarget.value)}
                            disabled={register.isPending}
                        />
                        <Input
                            placeholder={t("register.username")}
                            value={username}
                            onChange={e => setUsername(e.currentTarget.value)}
                            disabled={register.isPending}
                        />
                        <Input
                            placeholder={t("register.email")}
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.currentTarget.value)}
                            disabled={register.isPending}
                        />
                        <Input
                            placeholder={t("register.password")}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.currentTarget.value)}
                            disabled={register.isPending}
                        />
                        <Input
                            placeholder={t("register.confirmPassword")}
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.currentTarget.value)}
                            disabled={register.isPending}
                        />
                    </Stack>
                    {error && (
                        <Text color="red" size="sm" mt="sm" ta="center">
                            {error}
                        </Text>
                    )}
                    <Button
                        mt="md"
                        fullWidth
                        variant="filled"
                        type="submit"
                        loading={register.isPending}
                        disabled={
                            !fullName ||
                            !username ||
                            !password ||
                            !confirmPassword ||
                            !email ||
                            register.isPending
                        }
                    >
                        {t("register.registerButton")}
                    </Button>

                    <Text mt="md" size="sm" ta="center">
                        {t("register.alreadyHaveAccount")}{" "}
                        <Text component="a" href="/login" color="blue" style={{ textDecoration: "underline" }}>
                            {t("register.loginHere")}
                        </Text>
                    </Text>
                </form>
            </Paper>
        </Center>
    );
}
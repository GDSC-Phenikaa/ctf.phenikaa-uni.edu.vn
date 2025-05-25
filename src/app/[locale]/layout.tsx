import "@mantine/core/styles.css";
import React from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
  ActionIcon,
  AppShell,
  Group,
  Text
} from "@mantine/core";
import { theme } from "./theme";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import Shell from "../../components/Shell/Shell";
import "./globals.css";
import { hasLocale, NextIntlClientProvider, useMessages } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";

export const metadata = {
  title: "PKA CTF",
  description: "PKA CTF is a Capture The Flag competition platform.",
};

export default async function RootLayout({children, params}:
  {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale}>
          <MantineProvider theme={theme}>
            <Shell>
              {children}
            </Shell>
          </MantineProvider>
        </NextIntlClientProvider>

      </body>
    </html>
  );
}

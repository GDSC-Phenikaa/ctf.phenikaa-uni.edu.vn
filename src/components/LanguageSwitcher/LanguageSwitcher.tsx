"use client";
import { Button } from "@mantine/core";
import { useRouter, usePathname } from "next/navigation";

type LanguageSwitcherProps = {
  currentLocale: string;
};

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = currentLocale === "en" ? "vi" : "en";

  const handleLocaleChange = () => {
    const segments = pathname.split("/");
    segments[1] = otherLocale;
    router.push(segments.join("/") || "/");
  };

  return (
    <Button
      variant="transparent"
      radius="xl"
      onClick={handleLocaleChange}
      style={{ marginRight: 8 }}
    >
      {currentLocale.toUpperCase()}
    </Button>
  );
}
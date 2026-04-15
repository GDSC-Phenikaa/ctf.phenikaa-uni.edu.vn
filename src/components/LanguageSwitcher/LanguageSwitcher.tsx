"use client";
import { Button } from "@mantine/core";
import { useRouter, usePathname } from "../../i18n/navigation";

type LanguageSwitcherProps = {
  currentLocale: string;
};

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = currentLocale === "en" ? "vi" : "en";

  const handleLocaleChange = () => {
    router.replace(pathname, { locale: otherLocale });
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
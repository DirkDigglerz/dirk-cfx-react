"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, BackgroundImage, MantineColorShade } from "@mantine/core";
import { useMemo, useEffect } from "react";
import theme from "@/theme";

import { useSettings } from "@/utils/useSettings";
import { mergeMantineThemeSafe } from "@/utils/mergeMantineTheme";
import { DirkErrorBoundary } from "./DirkErrorBoundary";
import { isEnvBrowser } from "@/utils";

export type DirkProviderProps = {
  children: React.ReactNode;
  themeOverride?: any;
};

export function DirkProvider({ children, themeOverride }: DirkProviderProps) {
  const {
    hydrated,
    primaryColor,
    primaryShade,
    customTheme,
    game,
  } = useSettings();

  // 🚫 do not render until state is stable
  if (!hydrated) return null;

  const mergedTheme = useMemo(
    () =>
      mergeMantineThemeSafe(
        { ...theme, primaryColor, primaryShade: primaryShade as MantineColorShade },
        customTheme,
        themeOverride
      ),
    [primaryColor, primaryShade, customTheme, themeOverride]
  );

  useEffect(() => {
    document.body.style.fontFamily =
      game === "rdr3"
        ? '"Red Dead", sans-serif'
        : '"Akrobat Regular", sans-serif';
  }, [game]);

  const content = isEnvBrowser() ? (
    <BackgroundImage
      w="100vw"
      h="100vh"
      src={game === "fivem"
        ? "https://i.ytimg.com/vi/TOxuNbXrO28/maxresdefault.jpg"
        : "https://raw.githubusercontent.com/Jump-On-Studios/RedM-jo_libs/refs/heads/main/source-repositories/Menu/public/assets/images/background_dev.jpg"}
    >
      {children}
    </BackgroundImage>
  ) : (
    children
  );

  return (
    <DirkErrorBoundary>
      <MantineProvider theme={mergedTheme} defaultColorScheme="dark">
        {content}
      </MantineProvider>
    </DirkErrorBoundary>
  );
}

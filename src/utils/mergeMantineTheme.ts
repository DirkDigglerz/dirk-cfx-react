import type { MantineThemeOverride } from "@mantine/core";

const isValidColorScale = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length >= 5 && v.every(c => typeof c === "string");

export function mergeMantineThemeSafe(
  base: MantineThemeOverride,
  custom?: Record<string, string[]>,
  override?: MantineThemeOverride
): MantineThemeOverride {
  const colors = { ...base.colors };

  for (const [key, value] of Object.entries(custom ?? {})) {
    if (isValidColorScale(value)) {
      colors[key] = value as [string, string, string, string, string, string, string, string, string, string, ...string[]];
    } else {
      console.warn(`[theme] invalid color ignored: ${key}`, value);
    }
  }

  return {
    ...base,
    ...override,
    colors: {
      ...colors,
      ...(override?.colors ?? {}),
    },
  };
}

import type { MantineColorsTuple, MantineThemeOverride } from "@mantine/core";

const isValidColorScale = (v: unknown): v is MantineColorsTuple =>
  Array.isArray(v) && v.length === 10 && v.every((shade) => typeof shade === "string");

export function mergeMantineThemeSafe(
  base: MantineThemeOverride,
  custom?: MantineColorsTuple,
  override?: MantineThemeOverride
): MantineThemeOverride {
  const colors = { ...base.colors };

  if (custom && isValidColorScale(custom)) {
    colors["custom"] = custom;
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

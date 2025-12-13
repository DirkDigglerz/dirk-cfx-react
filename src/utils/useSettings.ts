import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";
import { MantineColorsTuple } from "@mantine/core";

export type SettingsState = {
  hydrated: boolean;
  game: "fivem" | "rdr3";
  primaryColor: string;
  primaryShade: number;
  itemImgPath: string;
  customTheme?: MantineColorsTuple;
};

export const useSettings = create<SettingsState>(() => ({
  hydrated: false,
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
  customTheme: [
    "#f0f4ff",
    "#d9e3ff",
    "#bfcfff",
    "#a6bbff",
    "#8ca7ff",
    "#7393ff",
    "#5a7fff",
    "#406bff",
    "#2547ff",
    "#0b33ff",
  ],
}));


registerInitialFetch<Partial<SettingsState>>("GET_SETTINGS")
  .then((data) => {
    useSettings.setState({
      ...data,
      hydrated: true,
    });
  })
  .catch(() => {
    useSettings.setState({ hydrated: true });
  });

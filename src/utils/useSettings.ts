import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";

export type SettingsState = {
  hydrated: boolean;
  game: "fivem" | "rdr3";
  primaryColor: string;
  primaryShade: number;
  itemImgPath: string;
  customTheme: Record<string, string[]>;
};

export const useSettings = create<SettingsState>(() => ({
  hydrated: false,
  game: "fivem",
  primaryColor: "dirk",
  primaryShade: 9,
  itemImgPath: "",
  customTheme: {},
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

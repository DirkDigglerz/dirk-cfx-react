import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/notify.css';
import './styles/fonts.css';
import './styles/scrollBar.css';
import './styles/tornEdge.css';


import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { BackgroundImage, MantineColorShade, MantineProvider, MantineThemeOverride } from '@mantine/core';
import { fetchNui, isEnvBrowser, registerInitialFetch, useAutoFetcher } from '@/utils';
import { create } from 'zustand';
import theme from '@/theme';
import { useEffect, useMemo } from 'react';
library.add(fas, far, fab);

export type DirkProviderProps = {
  fakeBackground?: boolean;
  children: React.ReactNode;
  themeOverride?: MantineThemeOverride;
}

type SettingsProps = {
  game: 'rdr3' | 'fivem';
  primaryColor: string;
  primaryShade: number;
  itemImgPath: string;
  customTheme: Record<string, string[]>;
}

export const useSettings = create<SettingsProps>((set) => ({
  game: 'fivem',
  primaryColor: 'dirk',
  primaryShade: 9,
  itemImgPath: 'https://assets.dirkcfx.com/items/',
  customTheme: {},
}));


registerInitialFetch<Partial<SettingsProps>>("GET_SETTINGS", undefined, {
  game: 'fivem',
  primaryColor: 'dirk',
  primaryShade: 9,
  itemImgPath: 'https://assets.dirkcfx.com/items/',
  customTheme: {},
}).then((data) => {
  useSettings.setState({
    ...data,
  });
});

export function DirkProvider(props: DirkProviderProps) {
  const primaryColor = useSettings((data) => data.primaryColor);
  const primaryShade = useSettings((data) => data.primaryShade);
  const customTheme = useSettings((data) => data.customTheme);
  const game = useSettings((data) => data.game);
  // Memoize the merged theme to avoid unnecessary recalculations
  const mergedTheme = useMemo<MantineThemeOverride>(() => ({
    ...theme,
    primaryColor: primaryColor,
    primaryShade: primaryShade as MantineColorShade,
    colors: {
      ...theme.colors,
      ...customTheme, // Custom theme colors will override/extend base colors
      ...props.themeOverride?.colors, // Props theme colors will override/extend previous colors
    },
    ...props.themeOverride, // Props theme will override/extend the entire theme
  }), [primaryColor, primaryShade, customTheme, props.themeOverride]);

  useEffect(() => {
    document.fonts.ready.then(() => {
    document.body.style.fontFamily = 
      game === 'rdr3' ? '"Red Dead", sans-serif' :
      game === 'fivem' ? '"Akrobat Regular", sans-serif' :
      'sans-serif';
    });
  }, [game]);

  useEffect(() => {
    fetchNui('NUI_READY')
  },  []);

  useAutoFetcher();
  
  
  return (
    <MantineProvider theme={mergedTheme} defaultColorScheme='dark'>
      <Wrapper>
        {props.children}
      </Wrapper>
    </MantineProvider>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const game = useSettings((data) => data.game);
  if (!isEnvBrowser()) return <>{children}</>;
  return (
    <BackgroundImage
      w="100vw"
      h="100vh"
      style={{ overflow: 'hidden', backgroundColor: 'transparent' }}
      src={game === 'fivem'
        ? 'https://i.ytimg.com/vi/TOxuNbXrO28/maxresdefault.jpg'
        : 'https://raw.githubusercontent.com/Jump-On-Studios/RedM-jo_libs/refs/heads/main/source-repositories/Menu/public/assets/images/background_dev.jpg'}
    >
      {children}
    </BackgroundImage>
  );
}


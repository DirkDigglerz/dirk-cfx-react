import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/niceFont.css';
import './styles/scrollBar.css';


import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { BackgroundImage, MantineProvider } from '@mantine/core';
import { isEnvBrowser } from '@/utils';
import { create } from 'zustand';
import theme from '@/theme';
library.add(fas, far, fab);

export type DirkProviderProps = {
  fakeBackground?: boolean;
  children: React.ReactNode;
}

export const useSettings = create<{
  game: 'rdr3' | 'fivem';
  primaryColor: string;
  primaryShade: number;
  customTheme: Record<string, string[]>;
}>((set) => ({
  game: 'rdr3',
  primaryColor: 'teal',
  primaryShade: 6,
  customTheme: {},
}));

export function DirkProvider(props: DirkProviderProps) {
  const primaryColor = useSettings((data) => data.primaryColor);
  const primaryShade = useSettings((data) => data.primaryShade);
  const customTheme = useSettings((data) => data.customTheme);
  
  // Ensure the theme is updated when the settings change

  // useEffect(() => {
  //   const updatedTheme = {
  //     ...theme, // Start with the existing theme object
  //     colors: {
  //       ...theme.colors, // Copy the existing colors
  //       custom: customTheme
  //     },
  //   };
    
  //   setCurTheme(updatedTheme);
  //   // set primary color
  //   setCurTheme({
  //     ...updatedTheme,
  //     primaryColor: primaryColor,
  //     primaryShade: primaryShade,
  //   });

  // }, [primaryColor, primaryShade, customTheme]);

  // useEffect(() => {
  //   // fetchSettings();
  //   runInitialFetches();
  // }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <Wrapper>
        {props.children}
      </Wrapper>
    </MantineProvider>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const game = useSettings((data) => data.game);
  return isEnvBrowser() ? ( 
    <BackgroundImage w='100vw' h='100vh' style={{overflow:'hidden'}}
      src={game === 'fivem' ?
        "https://i.ytimg.com/vi/TOxuNbXrO28/maxresdefault.jpg"
        : "https://raw.githubusercontent.com/Jump-On-Studios/RedM-jo_libs/refs/heads/main/source-repositories/Menu/public/assets/images/background_dev.jpg"}
    >  
      {children}
    </BackgroundImage>
  ) : (
    <>{children}</>
  )
}


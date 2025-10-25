import { DirkProvider, MotionFlex, Title, TornEdgeSVGFilter, useNuiEvent, useSettings, useTornEdges } from "dirk-cfx-react";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { useFastTravel } from "./useFastTravel";
import { Image } from "@mantine/core";
import Grid from "./Grid";




const App: React.FC = () => {
  const open = useFastTravel((state) => state.open);
  useNuiEvent('CLOSE_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: false });
  });

  useNuiEvent('OPEN_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: true });
  });
  const game = useSettings((data) => data.game);
  useSettings.setState({ primaryColor: 'red', game: 'fivem' });
  const tornEdgeCSS = useTornEdges();
  return (
    <DirkProvider>
      <TornEdgeSVGFilter />
      <AnimatePresence>
        {open && (
          <MotionFlex
            className={tornEdgeCSS}
            direction="column"
            w='115vh'
            h='65vh'
            bg='rgba(0,0,0,0.7)'
            pos='absolute'
            left='50%'
            top='50%'
            style={{ 
              transform: 'translate(-50%, -50%)',
              borderRadius: 'var(--mantine-radius-xs)',
            }}
            align="center"
          >

            <Title 
              p='sm'
              icon='car'
              bg='rgba(0,0,0,0.5)'
              title='Fast Travel'
              description="Fast Travel"
            />
            <Grid />
          </MotionFlex>
        )}
      </AnimatePresence>
    </DirkProvider>
  );
};

export default App;







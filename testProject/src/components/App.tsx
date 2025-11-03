import { createSkill, DirkProvider, ModalProvider, MotionFlex, Title, TornEdgeSVGFilter, useNuiEvent, useSettings, useTornEdges } from "dirk-cfx-react";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { useFastTravel } from "./useFastTravel";
import { Image, Text } from "@mantine/core";
import Grid from "./Grid";


export const {skill: drugSkill, useSkill: useDrugSkill} = createSkill({
  baseLevel: 1,
  maxLevel: 99,
  baseXP: 83,
  modifier: 1,
});

const App: React.FC = () => {
  const open = useFastTravel((state) => state.open);
  useNuiEvent('CLOSE_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: false });
  });

  useNuiEvent('OPEN_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: true });
  });
  const game = useSettings((data) => data.game);
  // useSettings.setState({ primaryColor: 'red', game: 'fivem' });
  const tornEdgeCSS = useTornEdges();
  const { nextLevelXP } = useDrugSkill(0);
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
            {nextLevelXP}
            <Title 
              p='sm'
              icon='car'
              bg='rgba(0,0,0,0.5)'
              title='Fast Travel'
              description="Fast Travel"
              rightSection={
                <Text>hi</Text>
              }
            />
            <Grid />
          </MotionFlex>
        )}
      </AnimatePresence>
    </DirkProvider>
  );
};

export default App;







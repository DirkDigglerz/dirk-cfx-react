import { use } from "react";
import { colorWithAlpha, MotionFlex, useTornEdges } from "../../../dist";
import { useHover } from "@mantine/hooks";
import { FastTravelLocation, useFastTravel } from "./useFastTravel";
import { Flex, Image, Text, useMantineTheme } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TravelLocationCard } from "./LocationCard";

export default function Grid(){
  const locations = useFastTravel((state) => state.locations);
  return (
    <MotionFlex
      flex={1}
      w='100%'
      mah='100%'
      p='sm'
      gap='md'
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        // rows 20vh height
        gridAutoRows: '20vh',
        overflowY: 'auto',

        // gradient mask at bottom to soften cutoff of last row
        maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', 
      }}
      pb='xl'
    >
      {locations.map((location, index) => (
        <TravelLocationCard key={index} {...location} />
      ))}
    </MotionFlex>
  )
}



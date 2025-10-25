import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMantineTheme, Flex, Image, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useTornEdges, MotionFlex, colorWithAlpha } from "../../../dist";
import { FastTravelLocation } from "./useFastTravel";

export function TravelLocationCard(props: FastTravelLocation){ 
  const tornEdgeCSS = useTornEdges();
  const {hovered, ref} = useHover();
  const theme = useMantineTheme();

  return (

    <MotionFlex
      pos="relative"   
    >
      <MotionFlex
        ref={ref}
        className={tornEdgeCSS}
        w='100%'
        h='20vh'
        // bg='rgba(123, 123, 123, 0.4)'
        style={{
          borderRadius: theme.radius.xs,
          // backgroundColor: hovered ? 'rgba(100, 100, 100, 0.5)' : 'rgba(77, 77, 77, 0.5)',
          backgroundImage: `url(${props.image})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          filter: hovered ? 'none' : 'grayscale(100%) brightness(70%)',
          transition: 'filter 0.3s ease', 
        }}
      >
        <Image
          // use picsum for now 
          src={props.image}
          alt={props.name}
          fit="cover"
          w='100%'
          h='100%'
          style={{
            // b&w unless hovered but soft otherwise so its nto too harsh 
            filter: hovered ? 'none' : 'grayscale(100%) brightness(70%)', 
            transition: 'filter 0.3s ease',
            borderRadius: theme.radius.xs,
          }}
        />
      </MotionFlex>

      <Flex
        pos="absolute"
        bottom="0vh"
        left="1vh"
        w='95%'
        justify={'space-between'}
        align="center"
      >
        <Text
          size="lg"
          style={{
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "white",
            textShadow: `
              -0.2vh -0.2vh 0 black,
              0.2vh -0.2vh 0 black,
              -0.2vh  0.2vh 0 black,
              0.2vh  0.2vh 0 black,
              0  0 0.2vh black
            `,
          }}
        >
          {props.name}
        </Text>
        <Text
          size="md"
          style={{
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "white",
            textShadow: `
              -0.2vh -0.2vh 0 black,
              0.2vh -0.2vh 0 black,
              -0.2vh  0.2vh 0 black,
              0.2vh  0.2vh 0 black,
              0  0 0.2vh black
            `,
          }}
        >
          {'$'}{props.price}
        </Text>
      </Flex>

      <Flex
        bg={colorWithAlpha(theme.colors[theme.primaryColor][theme.primaryShade as number], 0.6)}
        className={tornEdgeCSS}
        pos="absolute"
        top="1vh"
        right="1vh"
        p='xs'
        style={{
          borderRadius: theme.radius.xs,
          filter: hovered ? 'none' : 'grayscale(100%) brightness(70%)',
          transition: 'filter 0.3s ease',
        }}
        gap='xs'
        align='center'
      >
        <FontAwesomeIcon
          icon="users"
          style={{
            fontSize: theme.fontSizes.xs
          }}
        />
        <Text
          size='xs'
        >
          1
        </Text>
      </Flex>
    </MotionFlex>
  )
}
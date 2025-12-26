import { colorWithAlpha } from "@/utils";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { BorderedIcon } from "./BorderedIcon";
import { useSettings } from "@/utils/useSettings";

export type ButtonProps = {
  icon: string;
  onClick?: () => void;
};

export type TitleProps = {
  title: string
  description: string;
  icon: string;
  iconColor?: string;
  bg?: string;
  w?: string;
  removeBorder?: boolean;
  borderColor?: string;
  p?: string;
  rightSection?: React.ReactNode;
};


export function Title(props: TitleProps) {
  const game = useSettings((state) => state.game);  
  const theme = useMantineTheme();
  return (
    <Flex
      direction='column'
      bg={props.bg || 'transparent'}
      gap='xs'
      w={props.w || '100%'}
      p={props.p || 'unset'}
      pb={!props.p ? 'sm' : props.p}
      // bg='red'
      style={{
        userSelect: 'none',
        borderBottom: props.removeBorder ? 'none' : `0.3vh solid ${props.borderColor || colorWithAlpha(theme.colors[theme.primaryColor][9], 0.5)}`
      }}
    >
      <Flex
        align='center'
        justify={'center'}
      >

        <Flex
          align='center'
          gap='sm'
          pr='xs'      
          >
          <BorderedIcon
            icon={props.icon as IconName}
            fontSize={theme.fontSizes.md}
            color={props.iconColor}
          />
          <Flex
            direction='column'
            gap='0.25vh'
            // w='30%'
          >
            <Text p='0' size='sm' style={{
              lineHeight: theme.fontSizes.md,
              fontFamily: game == 'fivem' ? 'Akrobat Bold' : 'Red Dead',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>{props.title}</Text>
            <Text 
              size='xs'
              c='grey'
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
            >{props.description}</Text>
          </Flex>
        </Flex>
        <Flex
          ml='auto'
          align='center'
          gap='xs'
        >
          {props.rightSection}
        </Flex>
      </Flex>
    </Flex>
  );
}

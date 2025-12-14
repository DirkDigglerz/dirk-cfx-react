import { useMantineTheme, Flex, Text, alpha } from "@mantine/core";
import { MotionFlex } from "./Motion";
import { Variants } from "framer-motion";
import { colorWithAlpha } from "@/utils";

export type InputContainerProps = {
  title?:string;
  error?: string;
  description?:string;
  children?:React.ReactNode;
  w?:string | number;
  flex?:number | string;
  h?:string | number;
  bg?:string;
  p?:string | number;
  variants?: Variants;
  style?:React.CSSProperties;
  rightSection?:React.ReactNode;
}

export function InputContainer(props: InputContainerProps){
  const theme = useMantineTheme()
  return (
    <MotionFlex
      w={props.w || '100%'}
      flex={props.flex}
      direction='column'
      h={props.h}
      gap={props.title ? 'xs' : 0}
      

      bg={props.bg || alpha(theme.colors.dark[9], 0.65)}
      p={props.p || 'sm'}
      style={{
        borderRadius: theme.radius.xs,
        boxShadow: theme.shadows.sm,
        overflow: 'hidden',
        border: props.error ? `1px solid rgba(255, 100, 100, 0.8)` : '1px solid var(--mantine-color-dark-7)', 
        ...props.style,
      }}
      variants={props.variants}
    >

      <Flex
        align='center'
        gap='xs'
        
      >
        {(props.title || props.description) && (
          <Flex
            direction={'column'}
            gap='xxs'
            p={props.p == '0' ? 'sm' : 0}
          >
            {props.title && (
              <Text
                size="sm"
                style={{
                  lineHeight: '1.25vh',
                  fontFamily: 'Akrobat Bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >{props.title}</Text>     
            )}
            {props.description && (
              <Text
                size='xs'
                c='rgba(255, 255, 255, 0.8)'
                fw={400}
              >{props.description}</Text>  
            )}

          </Flex>
        )}
        {props.error && (
          <Text
            size='xs'
            c={theme.colors.red[9]}
            fw={600}
            mb='auto'
            lh='0.8'
          >
            {props.error}
          </Text> 
        )}
        <Flex
          ml='auto'
        >
          {props.rightSection}
        </Flex>
      </Flex>
      {props.children}            
    </MotionFlex>
  )
}
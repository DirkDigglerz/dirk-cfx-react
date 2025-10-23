import { MotionFlex, MotionIcon } from "@/components/Motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { AnimatePresence } from "framer-motion";
import { useModal, useModalActions } from "./store";

export default function Modal(){
  const active = useModal((state) => state.active);
  const {hideModal} = useModalActions();
  const theme = useMantineTheme();
  
  return (
    
   <AnimatePresence>
      {active && (
        <MotionFlex
          h='100%'
          w='100%'
          bg='rgba(0, 0, 0, 0.3)'
          pos='absolute'
          style={{
            zIndex: 2000,
            filter: 'drop-shadow(0 0 2vh black)',

          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          align='center'
          justify='center'
        >

          <MotionFlex
            pos='absolute'
            top='50%'
            left='50%'
            w='40%'
            style={{
              transform: 'translate(-50%, -50%)',
              borderRadius: theme.radius.xs,
              boxShadow: theme.shadows.xl,
              zIndex: 2100,
            }}
            bg={'rgba(48, 48, 48, 0.84)'}
          
            initial={{ scale: 0.8, opacity: 0, transform: 'translate(-50%, -50%)' }}
            animate={{ scale: 1, opacity: 1, transform: 'translate(-50%, -50%)' }}
            exit={{ scale: 0.8, opacity: 0, transform: 'translate(-50%, -50%)' }}
            p='sm'
            direction='column'
            // align='flex-start'
            mah='80%'
            maw='70%'
            gap='xs'
          >

            <Flex
              direction={'column'}
              w='100%'
            >
              <Flex
                w='100%'
                align='center'
                gap='xs'
              >
                {active.icon && (
                  <FontAwesomeIcon 
                    icon={active.icon as any} 
                    style={{
                      fontSize: theme.fontSizes.xs,
                    }} 
                  />
                )}
                <Text
                  size='sm'
                >
                  {active.title}
                </Text>
                <MotionIcon
                  icon='times'
                  color='rgba(255, 255, 255, 0.7)'
                  whileHover={{
                    scale: 1.1,
                    filter: 'brightness(1.2)',
                  }}
                  style={{
                    marginLeft: 'auto',
                    cursor: 'pointer',
                    fontSize: theme.fontSizes.sm,
                  }}
                  onClick={() => {
                    hideModal();
                  }}
                />
              </Flex>
              <Text
                size="xs"
                c='rgba(255, 255, 255, 0.7)'
              >
                {active.description}
              </Text>
            </Flex>
            {active.children}
          </MotionFlex>
        </MotionFlex>
      )}
   </AnimatePresence>
  )
}
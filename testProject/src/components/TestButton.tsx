import { Button, Flex } from "@mantine/core";
import { useModalActions } from "dirk-cfx-react";

export default function TestButton(){
   const {showModal} = useModalActions();
  return (
    <Button
      onClick={() => {
        showModal({
          title: 'Test Modal',
          icon: 'info-circle',
          description: 'This is a test modal from TestButton component',
          width: '30%',
          children: (
            <Flex>

            </Flex>
          )
        });
      }}
    >
      Test Button
    </Button>
  )
}
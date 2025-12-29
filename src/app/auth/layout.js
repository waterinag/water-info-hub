import { Box, Flex } from "@radix-ui/themes";
import Image from "next/image";

function AuthLayout({ children }) {
  return (
    <div className="!bg-[#FCFCFD] min-h-screen">
      <Flex gap="3" align="center">
        
        {/* <Flex
          className="min-h-screen"
          direction="column"
          justify="center"
          width="100%"
          p="5"
        > */}
        {children}
        {/* </Flex> */}
      </Flex>
    </div>
  );
}

export default AuthLayout;

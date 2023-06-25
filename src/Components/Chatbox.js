import { Box } from "@chakra-ui/layout";
// import "./styles.css";
import DirectChat from "./DirectChat";
import { ChatState } from "../context/chatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
    // console.log("chatbox");
    const { selectedChat } = ChatState();

    return (
        <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            alignItems="center"
            flexDir="column"
            p={3}
            bg="white"
            w={{ base: "100%", md: "68%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <DirectChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </Box>
    );
};

export default Chatbox;
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/chatProvider'
import axios from 'axios'
import { AddIcon } from '@chakra-ui/icons'
import GroupChatModal from './GroupChatModal'
import ChatLoading from './ChatLoading'
import ChatLogic, { getSender } from '../Config/ChatLogic'

const MyChats = ({ fetchAgain }) => {
    // console.log("mychats");
    const [loggedUser, setLoggedUser] = useState()
    const [loading, setLoading] = useState(true);
    const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState()

    const toast = useToast()

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/',
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    };

    async function makeRequest() {
        try {
            const response = await axios.request(config);
            // console.log(JSON.stringify(response.data));
            setChats(response.data.data);

        }
        catch (error) {
            console.log(error);
            toast({
                title: "Error occured in fetching chats",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        // setLoading(true)
        setLoggedUser(JSON.parse(localStorage.getItem('userInfo')))
        makeRequest();
    }, [fetchAgain])

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={3}
            bg="white"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: "16px", md: "18px" }}
                fontFamily="Noto Sans"
                display="flex"
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                My Chats
                <GroupChatModal>
                    <Button
                        display="flex"
                        fontSize={{ base: "14px", md: "12px", lg: "14px" }}
                        rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModal>
            </Box>
            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {!loading ? (
                    <Stack overflowY="scroll">
                        {chats.map((chat) => (
                            <Box
                                onClick={() => setSelectedChat(chat)}
                                cursor="pointer"
                                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                                color={selectedChat === chat ? "white" : "black"}
                                px={3}
                                py={2}
                                borderRadius="lg"
                                key={chat._id}
                            >
                                <Text>
                                    {!chat.isGroupChat
                                        ? getSender(user, chat.participants).name
                                        : chat.chatName}
                                </Text>
                                {chat.latestMessage && (
                                    <Text fontSize="xs">
                                        <b>{chat.latestMessage.sender.name} : </b>
                                        {chat.latestMessage.content.length > 50
                                            ? chat.latestMessage.content.substring(0, 51) + "..."
                                            : chat.latestMessage.content}
                                    </Text>
                                )}
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
        </Box>
    );
}

export default MyChats
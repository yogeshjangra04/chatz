import React, { useState, useEffect } from 'react'
import { ChatState } from '../context/chatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender } from '../Config/ChatLogic';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios'
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';

const ENDPOINT = "https://nexus-backend-39dm.onrender.com";
var socket, selectedChat1;

const DirectChat = ({ fetchAgain, setFetchAgain }) => {

    const { user, selectedChat, setSelectedChat, notifications, setNotifications } = ChatState();
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [msgSendLoading, setMsgSendLoading] = useState(false)
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false) //i am typing
    const [isTyping, setIsTyping] = useState(false) //other person is typing
    const toast = useToast();


    const fetchMessages = () => {
        if (!selectedChat) return;
        setLoading(true)

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://nexus-backend-39dm.onrender.com/api/v1/message/${selectedChat._id}`,
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        };

        async function makeRequest() {
            try {
                const response = await axios.request(config);

                setMessages(response.data.messages);
                console.log(response.data.messages);

                socket.emit('join room', selectedChat._id)
            }
            catch (error) {
                console.log(error);
                toast({
                    title: "Error occured in fetching messages",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom'
                })
            }
            setLoading(false)
        }

        makeRequest();


    }

    const sendMessage = (e) => {
        //if the button pressed is enter button and new message is not empty
        if (e.key === "Enter" && newMessage !== "") {

            setMsgSendLoading(true)
            setTyping(false)
            socket.emit('stopped typing', selectedChat._id);

            let data = JSON.stringify({
                "chatId": `${selectedChat._id}`,
                "content": newMessage
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://nexus-backend-39dm.onrender.com/api/v1/message/',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                data: data
            };

            async function makeRequest() {

                try {
                    setNewMessage("")
                    const response = await axios.request(config);
                    // console.log(response.data.message);
                    socket.emit('new message', response.data.message)
                    setMessages([...messages, response.data.message])
                    console.log([...messages, response.data.message])
                    //new msg event

                    setFetchAgain(!fetchAgain)

                }
                catch (error) {
                    console.log(error);
                    toast({
                        title: "Error occured in sending message",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                        position: 'bottom'
                    })
                }
                setMsgSendLoading(false);
            }

            makeRequest();


        }
    }

    useEffect(() => {
        console.log("useEffect called")
        socket = io(ENDPOINT);

        socket.emit('setup', user);
        socket.on('connected', () => { setSocketConnected(true) })

        socket.on('typing', () => { setIsTyping(true) })
        socket.on('stopped typing', () => { setIsTyping(false) })


    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChat1 = selectedChat;
    }, [selectedChat])

    useEffect(() => {

        socket.on('message received', (newMessage) => {
            //if the user is on a different chat channel or no channel is currently selected
            if (!selectedChat1 || (selectedChat1._id !== newMessage.chat._id)) {
                //send a notification
                if (!notifications.includes(newMessage)) {
                    setNotifications([newMessage, ...notifications])
                    setFetchAgain(!fetchAgain);
                }

            } else {
                setMessages([...messages, newMessage]);
                console.log('message received');
            }
            // setFetchAgain(!fetchAgain)
        })
    })





    const typingHandler = (e) => {
        setNewMessage(e.target.value)
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        const timeLimit = 3000;

        setTimeout(() => {
            socket.emit('stopped typing', selectedChat._id);
            setTyping(false);
        }, timeLimit)

    }


    return (
        <>
            {selectedChat ? (
                <>
                    {/* {This is the top info bar in every chat container} */}
                    <Text
                        fontSize={{ base: "20px", md: "22px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Noto Sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            alignItems="center"
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat(null)}
                        />
                        {messages &&
                            !selectedChat.isGroupChat ? (
                            <>
                                <Text> {getSender(user, selectedChat.participants).name} </Text>
                                <ProfileModal
                                    user={getSender(user, selectedChat.participants)}
                                />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    // fetchMessages={fetchMessages}
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                />
                            </>
                        )}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='teal.500'
                                size='xl'
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <Box
                                display="flex"
                                flexDirection="column"
                                overflowY="scroll"
                                scrollbarWidth="none"
                            >
                                <ScrollableChat messages={messages} />
                            </Box>
                        )}
                        {isTyping ? <Text> typing... </Text> : <></>}
                        <FormControl
                            onKeyDown={sendMessage}
                            isRequired mt={3}
                            display="flex"
                            justifyContent="space-between"
                        >

                            <Input
                                variant="outline"
                                bg="white"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                                height="45px"
                            />
                            {msgSendLoading ?
                                <Spinner m={2} /> :
                                <></>
                            }

                        </FormControl>
                    </Box>

                </>
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h={{ base: "100%", md: "100%" }}
                >
                    <Text
                        fontFamily="Noto Sans" fontSize="2xl" pb="80px"
                    >
                        Start a conversation
                    </Text>


                </Box>

            )
            }

        </>

    )

}

export default DirectChat
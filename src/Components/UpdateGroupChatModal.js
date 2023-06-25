import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
    IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from '../context/chatProvider'
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import { ViewIcon } from '@chakra-ui/icons';

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();

    const { user, selectedChat, setSelectedChat } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        setLoading(true)

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://nexus-backend-39dm.onrender.com/api/v1/user/list?search=${search}`,
            headers: {
                'Authorization': `Bearer ${user.token}`,
            }
        };

        async function makeRequest() {
            try {
                const response = await axios.request(config);
                console.log(JSON.stringify(response.data));
                //filter out the ones who are already in the group
                const participantIDs = selectedChat.participants.map((u) => u._id);
                const filteredResults = response.data.data.filter((u) => {
                    return !participantIDs.includes(u._id);
                })
                console.log(filteredResults);
                setSearchResults(filteredResults)
                setLoading(false);

            }
            catch (error) {

                toast({
                    title: "Error Occured",
                    // description: error.response.data.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: 'top-left'
                })
                console.log(error.response);
                setLoading(false);
            }
        }
        makeRequest();
    };


    const addToGroup = (userToAdd) => {

        //if the user already exists in participants list, then he cannot be added
        const participantIDs = selectedChat.participants.map((u) => u._id);

        if (participantIDs.includes(userToAdd)._id) {
            toast({
                title: "Error Occured!",
                description: "User already exists in group.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }


        setLoading(true)
        let data = JSON.stringify({
            "chatId": `${selectedChat._id}`,
            "userId": `${userToAdd._id}`
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/group/addUser',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            data: data
        };

        async function makeRequest() {

            try {
                const response = await axios.request(config);
                console.log(JSON.stringify(response.data));

                toast({
                    title: "User added to group!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });

                setSelectedChat(response.data)
                setSearchResults(searchResults.filter((u) => u._id !== userToAdd._id))
                // setFetchAgain(!fetchAgain)
                setLoading(false)
            }
            catch (error) {
                console.log(error);
                toast({
                    title: "Error Occured!",
                    description: "User could not be added to group.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });
                setLoading(false)
            }
        }
        makeRequest();
    };


    const deleteFromGroup = (userToDelete) => {
        //only group admin can delete users
        //but any person can leave by themselves

        //if the caller is not the admin and the user to be deleted is not the user himself
        if (user._id !== selectedChat.groupAdmin._id && userToDelete._id !== user._id) {
            return toast({
                title: "You are not the admin!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
        }

        setLoading(true)

        let data = JSON.stringify({
            "chatId": `${selectedChat._id}`,
            "userId": `${userToDelete._id}`
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/group/removeUser',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            data: data
        };

        async function makeRequest() {
            try {
                const response = await axios.request(config);
                console.log(JSON.stringify(response.data));

                toast({
                    title: "User deleted from group!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });

                if (userToDelete._id === user._id) {
                    setSelectedChat(null);
                } else {
                    setSelectedChat(response.data)
                }

                // setSelectedChat(response.data)
                setSearchResults([...searchResults, userToDelete])
                setFetchAgain(!fetchAgain)
                setLoading(false)

            }
            catch (error) {
                console.log(error);

                toast({
                    title: "Error Occured!",
                    description: "User could not deleted from group.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });
                setLoading(false)
            }
        }

        makeRequest();


    };

    const renameGroup = () => {

        setRenameLoading(true)

        let data = JSON.stringify({
            "chatId": `${selectedChat._id}`,
            "chatName": `${groupChatName}`
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/group/rename',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            data: data
        };

        async function makeRequest() {
            try {
                const response = await axios.request(config);
                console.log(JSON.stringify(response.data));

                toast({
                    title: "Group renamed!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });

                setSelectedChat(response.data)
                setFetchAgain(!fetchAgain)
                setRenameLoading(false)

            }
            catch (error) {
                console.log(error);

                toast({
                    title: "Error Occured!",
                    description: "Group could not be renamed.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });
                setRenameLoading(false)
            }
        }
        makeRequest();
    };


    return (
        <>
            <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="20px"
                        fontFamily="Noto Sans"
                        d="flex"
                        justifyContent="center"
                    >
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.participants.map((u) => (
                                //if the participant is the user himself then don't show
                                u._id !== user._id && (
                                    <UserBadgeItem
                                        key={u._id}
                                        user={u}
                                        admin={selectedChat.groupAdmin}
                                        handleFunction={() => deleteFromGroup(u)}
                                    />)
                            ))}
                        </Box>
                        {selectedChat.groupAdmin._id === user._id ?
                            (<>
                                <FormControl display="flex">
                                    <Input
                                        placeholder="Enter Name of Chat"
                                        mb={3}
                                        onChange={(e) => setGroupChatName(e.target.value)}
                                    />
                                    <Button
                                        variant="solid"
                                        colorScheme="teal"
                                        ml={1}
                                        isLoading={renameloading}
                                        onClick={renameGroup}
                                    >Update </Button>
                                </FormControl>
                                <FormControl>
                                    <Input
                                        placeholder="Add Users (Enter Name of User)"
                                        mb={4}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </FormControl>


                                {loading ? (
                                    <div>Loading...</div>
                                ) : (
                                    searchResults
                                        ?.slice(0, 4)
                                        .map((user) => (
                                            <UserListItem
                                                key={user._id}
                                                user={user}
                                                handleFunction={() => addToGroup(user)}
                                            />
                                        ))
                                )}
                            </>
                            ) : (<></>)

                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={() => deleteFromGroup(user)}
                            colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default UpdateGroupChatModal
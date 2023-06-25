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
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from '../context/chatProvider'
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, setChats } = ChatState();

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
                setSearchResults(response.data.data)
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


    const addToSelectedUsers = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            return toast({
                title: "User already added!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
        toast({
            title: "Added to Selection",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom",
        });
    };


    const deleteFromSelectedUsers = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== userToDelete._id));
    };

    const createGroup = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedUsers.length < 2) {
            toast({
                title: "Please select atleast 2 users!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        let data = JSON.stringify({
            "chatName": groupChatName,
            "participants": JSON.stringify(selectedUsers.map((u) => u._id))
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/group/create',
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
                setChats([response.data, ...chats]);

                toast({
                    title: "Group Successfully Created!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });
                setGroupChatName("");
                setSelectedUsers([]);
                onClose();
            }
            catch (error) {
                // console.log(error.response.data.message);
                toast({
                    title: `Error! Group could not be created`,
                    status: "failure",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });

            }
        }

        makeRequest();
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="20px"
                        fontFamily="Noto Sans"
                        d="flex"
                        justifyContent="center"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                placeholder="Enter Name of Chat"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add Users (Enter Name of User)"
                                mb={4}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => deleteFromSelectedUsers(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            searchResults
                                ?.slice(0, 4)
                                .map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => addToSelectedUsers(user)}
                                    />
                                ))
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={createGroup}
                            colorScheme="blue">
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;
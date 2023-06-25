import React from 'react'
import { Tooltip, Box, Button, Text, Menu, MenuButton, Avatar, MenuItem, MenuList, Drawer, DrawerFooter, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react'
import { SearchIcon, BellIcon, ChevronDownIcon, SpinnerIcon } from "@chakra-ui/icons"
import { Badge } from 'antd'
import { useState } from 'react'
import { ChatState } from '../context/chatProvider'
import ProfileModal from './ProfileModal'
import UserListItem from './UserListItem'
import { useHistory } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/hooks'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import { getSender } from '../Config/ChatLogic'


const SideDrawer = () => {

    const { user, setUser, setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState()

    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState(false)

    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    const logoutHandler = () => {
        localStorage.removeItem("userInfo")
        setChats([])
        setUser(null)
        setSelectedChat(null)
        history.push("/")
    }

    const handleSearch = () => {
        if (!search) {
            return toast({
                title: "Please enter something in search box!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: 'top-left'
            })
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
                    description: error.response.data.message,
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
    }

    const startChatHandler = (id) => {
        setLoadingChat(true);

        let data = JSON.stringify({
            "userId": `${id}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/chat/',
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
                //if the chat id returned is not found in the existing chat list, then only render a new chat, append it to the chats list
                if (!chats.find(chat => chat._id === response.data._id)) {
                    setChats([response.data, ...chats])
                    toast({
                        title: "New Chat Created!",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                        position: 'bottom'
                    })
                } else {
                    toast({
                        title: "Chat Already Exists!",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                        position: 'bottom'
                    })
                }

                setSelectedChat(response.data)

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
            setLoadingChat(false);
            onClose();
        }
        makeRequest();

    }
    console.log(notifications);
    return (
        <>
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                bg='white'
                w='100%'
                p="5px 10px 5px 10px"
                borderWidth="5px"
            >
                <Tooltip label="Search Users" hasArrow placement='bottom-end'>
                    <Button variant="ghost" onClick={onOpen}>
                        <SearchIcon />
                        <Text d={{ base: "none", md: "flex", px: '4' }}>
                            <span style={{ marginLeft: '5px' }}> Search Users </span>
                        </Text>
                    </Button>

                </Tooltip>
                <Text fontSize='xl' fontFamily='Noto Sans'>
                    Nexus
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1} >
                            <Badge count={notifications.length}>
                                <BellIcon fontSize="2xl" />
                            </Badge>
                        </MenuButton>
                        <MenuList pl={2}>
                            {notifications.length > 0 ? (notifications.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotifications(notifications.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.participants).name}`}
                                </MenuItem>))) :
                                (
                                    <span>No New Messages</span>
                                )
                            }
                        </MenuList>
                    </Menu>

                    <Menu>
                        <MenuButton ml={8} as={Button} rightIcon={<ChevronDownIcon />}>

                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.dp !== "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg" ? user.dp : null} />

                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem> My Profile </MenuItem>
                            </ProfileModal>
                            <MenuItem onClick={logoutHandler}> Logout </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader> Search Users </DrawerHeader>

                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder='Enter Name or Email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <Button
                                onClick={handleSearch}
                            >
                                Go
                            </Button>
                        </Box>
                        <Box>
                            {loading ? (
                                <ChatLoading />
                            ) : (
                                // console.log(searchResults);
                                searchResults?.map((searchedUser) => (
                                    <UserListItem
                                        key={searchedUser._id}
                                        user={searchedUser}
                                        handleFunction={() => startChatHandler(searchedUser._id)}
                                    />
                                ))
                                // <span>results</span>
                            )}
                        </Box>
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default SideDrawer
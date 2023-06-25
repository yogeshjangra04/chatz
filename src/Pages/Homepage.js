import React from 'react'
import { useEffect } from 'react';
import {
    Box,
    Container,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import Login from '../Components/Login';
import Signup from '../Components/Signup';
import { useHistory } from 'react-router-dom';

export default function Homepage() {

    const history = useHistory();

    useEffect(() => {
        //if the user is already logged in, redirect to chat page
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            history.push("/chat")
        }
    }, [history])

    return (<Container maxW="xl" centerContent>
        <Box
            display="flex"
            justifyContent="center"
            p={3}
            bg="white"
            w="100%"
            m="40px 0 15px 0"
            borderRadius="lg"
            borderWidth="1px"
        >
            <Text fontSize="2xl" fontFamily="Noto Sans">
                Nexus Chat
            </Text>
        </Box>
        <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
            <Tabs isFitted variant="soft-rounded">
                <TabList mb="1em">
                    <Tab>Login</Tab>
                    <Tab>Sign Up</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel >
                        <Login />
                    </TabPanel>
                    <TabPanel>
                        <Signup />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Container>
    );
}


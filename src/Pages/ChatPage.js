import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/chatProvider'
import { Box } from "@chakra-ui/react";
import SideDrawer from '../Components/SideDrawer'
import MyChats from '../Components/MyChats'
import Chatbox from '../Components/Chatbox'
import { useHistory } from 'react-router-dom';


const ChatPage = () => {
    //extract the state from the context
    // console.log("chatpage");
    const { user, setUser } = ChatState()
    const [fetchAgain, setFetchAgain] = useState(false)
    // console.log(fetchAgain);
    const history = useHistory();


    useEffect(() => {
        //this sets the user data from local storage

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);
        console.log(userInfo);


        if (!userInfo) {
            // window.location.reload(false);
            history.push("/")
        }


    }, [history, setUser])


    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <Box
                display='flex'
                justifyContent='space-between'
                w='100%'
                h='91.5vh'
                p='10px'
            >
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
            </Box>
        </div>
    )
}

export default ChatPage
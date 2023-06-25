import { useState, useEffect, useContext, createContext } from 'react'
import { useHistory } from 'react-router-dom';


const ChatContext = createContext()
//making state accessible to all parts of the app

const ChatProvider = ({ children }) => {

    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);


    const history = useHistory();

    useEffect(() => {
        //this sets the user data from local storage

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if (!userInfo) {
            history.push("/")
        }

    }, [history])

    return (
        <ChatContext.Provider
            value={{
                user, setUser,
                selectedChat, setSelectedChat,
                chats, setChats,
                notifications, setNotifications
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    //exported the chat states to be used in other files
    return useContext(ChatContext);
}


export default ChatProvider;
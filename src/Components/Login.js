import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { AiFillEye } from 'react-icons/ai'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)

    const [loading, setLoading] = useState(false)

    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show)

    const submitHandler = () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please fill in all the fields!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            return;
        }

        let data = JSON.stringify({
            "email": email,
            "password": password,
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:5000/api/v1/user/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                toast({
                    title: "User successfully Logged in!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom"
                });
                localStorage.setItem("userInfo", JSON.stringify(response.data))
                setLoading(false);
                history.push('/chat')

            })
            .catch((error) => {
                console.log(error);
                toast({
                    title: "Login Unsuccessful!",
                    description: error.response.data.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom"
                });
                setLoading(false);
            });
    };

    return <VStack spacing='5px'>

        <FormControl id='email' isRequired>
            <FormLabel> Email </FormLabel>
            <Input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />
        </FormControl>
        <FormControl id='password' isRequired>
            <FormLabel> Password </FormLabel>
            <InputGroup>
                <Input
                    type={show ? "" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick} backgroundColor={'white'}>
                        <AiFillEye />
                    </Button>
                </InputRightElement>
            </InputGroup>

        </FormControl>


        <Button
            colorScheme="blue"
            width="100%"
            style={{ marginTop: 15 }}
            onClick={submitHandler}
        >
            Sign In
        </Button>

        <Button
            colorScheme="red"
            width="100%"
            style={{ marginTop: 4 }}

            onClick={() => {
                setEmail('guest@gmail.com')
                setPassword('123')

            }}
        >
            Get Guest ID
        </Button>

    </VStack>
}

export default Login
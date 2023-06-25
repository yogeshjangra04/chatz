import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { AiFillEye } from 'react-icons/ai'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'

const Signup = () => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [picture, setPicture] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)

    const toast = useToast();
    const history = useHistory();


    const handleClick = () => setShow(!show)

    const postPicture = (pic) => {
        setLoading(true);
        console.log("hello")
        if (!pic) {
            toast({
                title: "No Picture",
                description: "Please select a picture",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            setLoading(false);
        }
        if (pic.type === 'image/jpeg' || pic.type === 'image/png' || pic.type === 'image/jpg') {
            const data = new FormData();
            data.append("file", pic)
            data.append("upload_preset", "nexus-chat")
            data.append("cloud_name", "dua1ucdsg")
            axios.post("https://api.cloudinary.com/v1_1/dua1ucdsg/image/upload", data)
                .then((res) => {
                    console.log('cloudinary response', res)
                    setPicture(res.data.url.toString())
                    setLoading(false);
                    toast({
                        title: "File Successfully Uploaded",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                        position: "top"
                    });
                })
                .catch((error) => {
                    console.log("Error")
                    console.log(error);
                    setLoading(false);
                })
        } else {
            setLoading(false);
            toast({
                title: "Picture Type Error",
                description: "Picture should be of type JPEG or PNG",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            return;

        }


    };
    const submitHandler = () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Please fill in all the fields!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match!",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            setLoading(false);
        }
        var data;
        if (picture) {
            data = JSON.stringify({
                "name": name,
                "email": email,
                "password": password,
                "dp": picture
            });


        } else {
            data = JSON.stringify({
                "name": name,
                "email": email,
                "password": password,
            });
        }

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://nexus-backend-39dm.onrender.com/api/v1/user/register',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                toast({
                    title: "User successfully Registered!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
                localStorage.setItem("userInfo", JSON.stringify(response.data))
                setLoading(false);
                history.push('/chat')

            })
            .catch((error) => {
                console.log(error);
                toast({
                    title: "Registration Unsuccessful!",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
                setLoading(false);
            });
    };

    return <VStack spacing='5px'>
        <FormControl id='first-name' isRequired>
            <FormLabel> Name </FormLabel>
            <Input
                onChange={(e) => setName(e.target.value)}

            />
        </FormControl>
        <FormControl id='email' isRequired>
            <FormLabel> Email </FormLabel>
            <Input
                onChange={(e) => setEmail(e.target.value)}

            />
        </FormControl>
        <FormControl id='password' isRequired>
            <FormLabel> Password </FormLabel>
            <InputGroup>
                <Input
                    type={show ? "" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick} backgroundColor={'white'}>
                        <AiFillEye />
                    </Button>
                </InputRightElement>
            </InputGroup>

        </FormControl>
        <FormControl id='confirm-password' isRequired>
            <FormLabel> Confirm Password </FormLabel>
            <InputGroup>
                <Input
                    type={show ? "" : "password"}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick} backgroundColor={'white'}>
                        <AiFillEye />
                    </Button>
                </InputRightElement>
            </InputGroup>

        </FormControl>
        <FormControl id="pic">
            <FormLabel>Profile Picture</FormLabel>
            <Input
                type="file"
                p={1.5}
                accept="image/*"
                onChange={(e) => postPicture(e.target.files[0])}
            />
        </FormControl>
        <Button
            colorScheme="blue"
            width="100%"
            style={{ marginTop: 15 }}
            onClick={submitHandler}
            isLoading={loading}
        >
            Sign Up
        </Button>

    </VStack>
}

export default Signup
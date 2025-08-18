"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Button, Text, TextInput, Stack, PasswordInput, Box } from "@mantine/core";
import CancelIcon from "@mui/icons-material/Cancel";
import { auth } from "@/app/firebase/config";
import { UserCredential, createUserWithEmailAndPassword } from "firebase/auth";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import Header from "@/components/Header";

export default function SignUp() {
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");

    const router = useRouter();

    const handleSignUp = async () => {
        try {
            const res: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log(res);
            setEmail("");
            setPassword("");
            router.push("/");
        } catch (e) {
            showNotification({
                title: "Something went wrong",
                message: e instanceof FirebaseError ? e.message : "Please Try Again Later",
                color: "red",
                radius: "xs",
                style: {
                    maxWidth: "40vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CancelIcon />,
            });
        }
    };

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
            <Stack
                flex={1}
                style={{ overflow: "auto" }}
                bg="var(--mantine-color-body)"
                align="stretch"
                justify="center"
                gap="sm"
            >
                <Text ta="center" size="xl" fw={700} w={{ base: "90%", sm: "60%", md: "40%", lg: "30%" }} mx="auto">
                    Sign Up
                </Text>
                <TextInput
                    radius="xs"
                    w={{ base: "90%", sm: "60%", md: "40%", lg: "30%" }}
                    mx="auto"
                    placeholder="Email"
                    value={email}
                    color="pale-green"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                />
                <PasswordInput
                    radius="xs"
                    w={{ base: "90%", sm: "60%", md: "40%", lg: "30%" }}
                    mx="auto"
                    placeholder="Password"
                    value={password}
                    color="pale-green"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
                <Button
                    variant="filled"
                    radius="xs"
                    w={{ base: "90%", sm: "60%", md: "40%", lg: "30%" }}
                    mx="auto"
                    color="pale-green"
                    onClick={handleSignUp}
                >
                    Sign Up
                </Button>
            </Stack>
        </Box>
    );
}

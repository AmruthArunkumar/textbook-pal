"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Button, Text, TextInput, Stack, PasswordInput, Box } from "@mantine/core";
import CancelIcon from "@mui/icons-material/Cancel";
import { auth } from "@/app/firebase/config";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import { showNotification } from "@mantine/notifications";
import Header from "@/components/Header";
import { FirebaseError } from "firebase/app";

export default function LogIn() {
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");

    const router = useRouter();

    const handleLogIn = async () => {
        try {
            const res: UserCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log({ res });
            sessionStorage.setItem("user", "true");
            setEmail("");
            setPassword("");
            router.push("/dashboard");
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
            <Stack flex={1} style={{overflow: "auto"}} bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
                <Text ta="center" size="xl" fw={700} w={{ base: "90%", sm: "60%", md: "40%", lg: "30%" }} mx="auto">
                    Log In
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
                    onClick={handleLogIn}
                >
                    Log In
                </Button>
            </Stack>
        </Box>
    );
}

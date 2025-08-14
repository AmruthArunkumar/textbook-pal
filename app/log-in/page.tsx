"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Button, Text, TextInput, Stack, PasswordInput, Notification } from "@mantine/core";
import CancelIcon from "@mui/icons-material/Cancel";
import { EmailAndPasswordActionHook, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { UserCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import { notifications, showNotification } from "@mantine/notifications";

export default function LogIn() {
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");

    const [signInWithEmailAndPassword]: EmailAndPasswordActionHook = useSignInWithEmailAndPassword(auth);

    const router = useRouter();

    const handleLogIn = async () => {
        try {
            const res: UserCredential | undefined = await signInWithEmailAndPassword(email, password);
            console.log({ res });
            if (!res) {
                setPassword("");
                notifications.show({
                    title: "Bummer!",
                    message: "Something went wrong — check your credentials.",
                    radius: "xs",
                    color: "red",
                    style: {
                        maxWidth: "40vw",
                        marginLeft: "auto",
                        marginRight: "auto",
                    },
                    icon: <CancelIcon />,
                });
                return;
            }
            sessionStorage.setItem("user", "true");
            setEmail("");
            setPassword("");
            router.push("/");
        } catch (e) {
            showNotification({
                title: "Bummer!",
                message: "Something went wrong — check your credentials.",
                color: "red",
                radius: "xs",
                style: {
                    maxWidth: "40vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CancelIcon />,
            });
            console.error(e);
        }
    };

    return (
        <>
            <Stack h={"100vh"} bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
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
        </>
    );
}

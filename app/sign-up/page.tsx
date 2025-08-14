"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Button, Text, TextInput, Stack, PasswordInput } from "@mantine/core";
import { EmailAndPasswordActionHook, useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { UserCredential } from "firebase/auth";

export default function SignUp() {
    const [email, setEmail]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");
    const [password, setPassword]: [string, Dispatch<SetStateAction<string>>] = useState<string>("");

    const [createUserWithEmailAndPassword]: EmailAndPasswordActionHook = useCreateUserWithEmailAndPassword(auth);

    const handleSignUp = async () => {
        try {
            const res: UserCredential | undefined = await createUserWithEmailAndPassword(email, password);
            console.log({ res });
            setEmail("");
            setPassword("");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Stack h={"100vh"} bg="var(--mantine-color-body)" align="stretch" justify="center" gap="sm">
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
    );
}

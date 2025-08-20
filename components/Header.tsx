"use client";
import {
    ActionIcon,
    Box,
    Burger,
    Button,
    Divider,
    Drawer,
    Group,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";

export default function Header() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

    const [user] = useAuthState(auth);
    const [userSession, setUserSession] = useState<string | null>(null);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setUserSession(sessionStorage.getItem("user"));
    }, []);

    const handleLogInClick = () => {
        router.push("/log-in");
    };

    const handleLogOutClick = async () => {
        closeDrawer();
        await signOut(auth);
        sessionStorage.removeItem("user");
        setUserSession(null);
        router.push("/");
    };

    const handleSignUpClick = () => {
        router.push("/sign-up");
    };

    return (
        <Box style={{ height: "60px" }}>
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: "8px",
                    right: "8px",
                    height: "60px",
                    borderBottom: "2px solid light-dark(#DDDDDD, #444444)",
                }}
            >
                <Group justify="right" h="100%">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
                        radius={"xs"}
                    >
                        {mounted &&
                            (computedColorScheme === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />)}
                    </ActionIcon>
                    {!user && userSession !== "true" ? (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogInClick} radius={"sm"}>
                                Log in
                            </Button>
                            <Button onClick={handleSignUpClick} color="pale-green" radius={"sm"}>
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogOutClick} radius={"sm"}>
                                Log Out
                            </Button>
                        </Group>
                    )}

                    <Burger opened={false} onClick={toggleDrawer} hiddenFrom="sm" />
                </Group>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                withCloseButton={false}
                size="75%"
                padding="sm"
                hiddenFrom="sm"
                zIndex={1000}
            >
                {!user && userSession !== "true" ? (
                    <Group justify="center" grow pb="xl" px="md" pt={"16px"}>
                        <Button variant="default" onClick={handleLogInClick} radius={"sm"}>
                            Log in
                        </Button>
                        <Button onClick={handleSignUpClick} color="pale-green" radius={"sm"}>
                            Sign up
                        </Button>
                    </Group>
                ) : (
                    <Group justify="center" grow pb="xl" px="md" pt={"16px"}>
                        <Button variant="default" onClick={handleLogOutClick} radius={"sm"}>
                            Log Out
                        </Button>
                    </Group>
                )}
            </Drawer>
        </Box>
    );
}

"use client";
import {
    ActionIcon,
    Box,
    Burger,
    Button,
    Divider,
    Drawer,
    Group,
    Tabs,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { ForumOutlined, StyleOutlined, UploadFileOutlined } from "@mui/icons-material";

export default function TabHeader({ setTab }: { setTab: Dispatch<SetStateAction<number>> }) {
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
        await signOut(auth);
        sessionStorage.removeItem("user");
        setUserSession(null);
        router.push("/")
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
                    zIndex: 1000,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Group justify="left" h="100%">
                    {(user || userSession) && (
                        <Box style={{ height: "60px", display: "flex", alignItems: "flex-end" }}>
                            <Tabs color="pale-green" radius="xs" defaultValue="documents" style={{ marginTop: "11px" }}>
                                <Tabs.List>
                                    <Tabs.Tab
                                        onClick={() => setTab(0)}
                                        value="documents"
                                        leftSection={<UploadFileOutlined />}
                                    >
                                        Documents
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        onClick={() => setTab(1)}
                                        value="chatbot"
                                        leftSection={<ForumOutlined />}
                                    >
                                        Q&A Chatbot
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        onClick={() => setTab(2)}
                                        value="study-tools"
                                        leftSection={<StyleOutlined />}
                                    >
                                        Study Tools
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                        </Box>
                    )}
                </Group>
                <Group justify="right" h="100%">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
                    >
                        {mounted &&
                            (computedColorScheme === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />)}
                    </ActionIcon>
                    {!user && !userSession ? (
                        <Group visibleFrom="xs">
                            <Button variant="default" onClick={handleLogInClick}>
                                Log in
                            </Button>
                            <Button onClick={handleSignUpClick} color="pale-green">
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group visibleFrom="xs">
                            <Button variant="default" onClick={handleLogOutClick}>
                                Log Out
                            </Button>
                        </Group>
                    )}

                    <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="xs" />
                </Group>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="sm"
                title="Navigation"
                hiddenFrom="sm"
                zIndex={1000}
            >
                <Divider my="sm" />

                {!user && userSession !== "true" ? (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogInClick}>
                            Log in
                        </Button>
                        <Button onClick={handleSignUpClick} color="pale-green">
                            Sign up
                        </Button>
                    </Group>
                ) : (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogOutClick}>
                            Log Out
                        </Button>
                    </Group>
                )}
            </Drawer>
        </Box>
    );
}

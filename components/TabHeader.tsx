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

export default function TabHeader({ tab, setTab }: { tab: number; setTab: Dispatch<SetStateAction<number>> }) {
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
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Group justify="left" h="100%">
                    {(user || userSession) && (
                        <Box style={{ height: "60px", display: "flex", alignItems: "flex-end" }} visibleFrom="sm">
                            <Tabs
                                color="pale-green"
                                radius="xs"
                                defaultValue="documents"
                                value={tab === 0 ? "documents" : tab === 1 ? "chatbot" : "study-tools"}
                                onChange={(value) => {
                                    if (value === "documents") setTab(0);
                                    if (value === "chatbot") setTab(1);
                                    if (value === "study-tools") setTab(2);
                                }}
                            >
                                <Tabs.List>
                                    <Tabs.Tab
                                        value="documents"
                                        leftSection={<UploadFileOutlined />}
                                    >
                                        Documents
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="chatbot"
                                        leftSection={<ForumOutlined />}
                                    >
                                        Q&A Chatbot
                                    </Tabs.Tab>
                                    <Tabs.Tab
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
                        radius={"xs"}
                    >
                        {mounted &&
                            (computedColorScheme === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />)}
                    </ActionIcon>
                    {!user && !userSession ? (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogInClick} radius={"xs"}>
                                Log in
                            </Button>
                            <Button onClick={handleSignUpClick} color="pale-green" radius={"xs"}>
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group visibleFrom="sm">
                            <Button variant="default" onClick={handleLogOutClick} radius={"xs"}>
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

                <Group justify="center" grow px="md" pt={"16px"}>
                    <Button.Group orientation="vertical">
                        <Button
                            variant={tab == 0 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                setTab(0);
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            Documents
                        </Button>
                        <Button
                            variant={tab == 1 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                setTab(1);
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            Q&A Chatbot
                        </Button>
                        <Button
                            variant={tab == 2 ? "light" : "default"}
                            color={"pale-green"}
                            onClick={() => {
                                setTab(2);
                                closeDrawer();
                            }}
                            radius={"xs"}
                        >
                            Study Tools
                        </Button>
                    </Button.Group>
                </Group>

                <Divider my="lg" />

                {!user && userSession !== "true" ? (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogInClick} radius={"xs"}>
                            Log in
                        </Button>
                        <Button onClick={handleSignUpClick} color="pale-green" radius={"xs"}>
                            Sign up
                        </Button>
                    </Group>
                ) : (
                    <Group justify="center" grow pb="xl" px="md">
                        <Button variant="default" onClick={handleLogOutClick} radius={"xs"}>
                            Log Out
                        </Button>
                    </Group>
                )}
            </Drawer>
        </Box>
    );
}

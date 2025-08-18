"use client";
import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Dashboard() {
    const [tab, setTab] = useState<number>(0);

    const [user] = useAuthState(auth);
    const [userSession, setUserSession] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setUserSession(sessionStorage.getItem("user"));
    }, []);

    if (!user && !userSession) {
        router.push("/");
    }

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <TabHeader setTab={setTab} />
            <main style={{ flex: 1, display: "flex", margin: "8px" }}>Content: {tab}</main>
        </Box>
    );
}

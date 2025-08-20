"use client";
import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import DocumentPage from "@/components/DocumentPage";

export default function Dashboard() {
    const [tab, setTab] = useState<number>(0);

    const [userSession, setUserSession] = useState<string | null>(null);
    const [checkedSession, setCheckedSession] = useState(false);
    const router = useRouter();

    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        setUserSession(sessionStorage.getItem("user"));
        setCheckedSession(true);
    }, []);

    useEffect(() => {
        if (!loading && checkedSession) {
            if (!user && userSession !== "true") {
                router.push("/");
            }
        }
    }, [loading, checkedSession, user, userSession, router]);

    const tabToTitle = (tab: number): string => {
        switch (tab) {
            case 0:
                return "Documents";
            case 1:
                return "Q&A Chatbot";
            case 2:
                return "Study Tools";
            default:
                return tab.toString();
        }
    };

    return (
        <Box style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
            <TabHeader tab={tab} setTab={setTab} />
            <Box flex={1} display={"flex"} m={"8px"} style={{ flexDirection: "column" }}>
                {tab === 0 && <DocumentPage />}
                {tab === 1 && `Content: ${tabToTitle(tab)}`}
                {tab === 2 && `Content: ${tabToTitle(tab)}`}
            </Box>
        </Box>
    );
}

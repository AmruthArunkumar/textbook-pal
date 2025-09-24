"use client";
import { Box, Button, Group, Input, ScrollArea } from "@mantine/core";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { app, auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { inflateSync } from "zlib";
import { GoogleGenAI } from "@google/genai";
import KNN from "@/app/api/compare";
import ReactMarkdown from "react-markdown";
import { showNotification, updateNotification } from "@mantine/notifications";

interface Note {
    id: string;
    embedding: number[];
    name: string;
    compressedText: string;
    position: number;
}

export default function ChatbotPage() {
    const [user, loading] = useAuthState(auth);
    const db = getFirestore(app);

    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const handleQuery = async (query: string) => {
        showNotification({
            id: "handle-query",
            title: "Sending...",
            message: "Your answer is being generated",
            loading: true,
            autoClose: false,
            withCloseButton: false,
            radius: "xs",
            style: {
                maxWidth: "max(40vw, 300px)",
                marginLeft: "auto",
                marginRight: "auto",
            },
        });
        if (!user) return;
        const notesRef = collection(db, "Users", user.uid, "Notes");
        try {
            const queryresponse = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: query,
                config: {
                    outputDimensionality: 1024,
                },
            });
            const queryembd = queryresponse.embeddings![0].values!;

            const snapshot = await getDocs(notesRef);
            const embds: Note[] = [];
            snapshot.forEach((doc) => {
                embds.push(doc.data() as Note);
            });
            const top5 = KNN(embds, queryembd, 5);

            const decompressed = top5.map((c) => inflateSync(Buffer.from(c.compressedText, "base64")).toString());

            const context = "Extra Context:\n\n" + decompressed.join("\n\n");
            query += "\n\n" + context;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: query,
            });

            setAnswer(response.text ?? "Nothing Received");

            updateNotification({
                id: "handle-query",
                title: "Success!",
                message: "Answer Generated Successfully",
                color: "green",
                radius: "xs",
                loading: false,
                autoClose: true,
                withCloseButton: true,
                style: {
                    maxWidth: "max(40vw, 300px)",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CheckIcon />,
            });
        } catch (e) {
            console.error("Error adding document: ", e);
            updateNotification({
                id: "handle-query",
                title: "Uh Oh!",
                message: "Error Generating Answer",
                color: "red",
                radius: "xs",
                loading: false,
                autoClose: true,
                withCloseButton: true,
                style: {
                    maxWidth: "max(40vw, 300px)",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CloseIcon />,
            });
        }
    };

    return (
        <Box display={"flex"} style={{ flexDirection: "column" }}>
            <Group display={"flex"} justify="flex-start" h={60} pb={"8px"}>
                <Input
                    radius="xs"
                    size="md"
                    placeholder="Type your question here"
                    flex={1}
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                />
                <Button
                    rightSection={<SendIcon />}
                    radius={"xs"}
                    size="md"
                    color="pale-green"
                    onClick={async () => {
                        await handleQuery(query);
                        setQuery("");
                    }}
                >
                    Send
                </Button>
            </Group>
            <ScrollArea
                style={{
                    position: "absolute",
                    top: 128,
                    left: 16,
                    right: 16,
                    bottom: 16,
                }}
                overscrollBehavior="none"
                scrollbarSize={8}
                scrollHideDelay={500}
                offsetScrollbars
            >
                <ReactMarkdown>{answer}</ReactMarkdown>
            </ScrollArea>
        </Box>
    );
}

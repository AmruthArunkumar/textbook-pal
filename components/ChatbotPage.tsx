"use client";
import { Box, Button, Group, Input, ScrollArea } from "@mantine/core";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { app, auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { inflateSync } from "zlib";
import { GoogleGenAI } from "@google/genai";
import KNN from "@/app/api/compare";
import ReactMarkdown from "react-markdown";

interface Note {
    id: string;
    embedding: number[];
    name: string;
    compressedText: string;
}

export default function ChatbotPage() {
    const [user, loading] = useAuthState(auth);
    const db = getFirestore(app);

    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState(`
        asd
        fa
        dsf
        af
        gs
        dfg
        s
        dfgs
        dfg
        s
        dfg
        s
        fg
        sdfg
        s
        fg
        s
        fdg
        s
        fg
        sdf
        g
        sdf
        g
        sfd
        gs
        fdg
        sd
        f
        gd
        sh
        fgd
        <h1>gh
        dfg
        hd
        fg
        hd
        fgh
        dfg
        h
        dfgh
        dg
        dgfh
        gdf
        h
        dgh
        f
        s
        dfg
        s
        fdg
        sfdg
        s
        dfg
        sf
        gs
        fg
        sdf
        gs
        dfg
        sd
        fg
        sdf
        gs
        dfg
        sf
        g
        sf
        gs
        fdg
        s
        fgdsfg
        s
        dfg
        sfd
        g
        sdfg
        s
        fdg
        s
        fdg
        sf
        g
        fd
        sg
        dfs
        g.forEach(element => {
        });</h1>
        `);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const handleQuery = async (query: string) => {
        if (!user) return;
        const notesRef = collection(db, "Users", user.uid, "Notes");

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
        console.log(embds);
        const top5 = KNN(embds, queryembd, 5);

        const decompressed = top5.map((c) => inflateSync(Buffer.from(c.compressedText, "base64")).toString());
        console.log(decompressed);

        const context = "Context:\n\n" + decompressed.join("\n\n");
        query += "\n\n" + context;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
        });

        console.log(response.text);
        setAnswer(response.text ?? "Nothing Received");
    };

    return (
        <Box display={"flex"} style={{ flexDirection: "column" }}>
            <Group
                display={"flex"}
                justify="flex-start"
                h={60}
                pb={"8px"}
                // style={{ borderBottom: "2px solid light-dark(#DDDDDD, #444444)" }}
            >
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
                    visibleFrom="sm"
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
            >
                <ReactMarkdown>{answer}</ReactMarkdown>
            </ScrollArea>
        </Box>
    );
}

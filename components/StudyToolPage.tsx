"use client";
import {
    Accordion,
    Box,
    Button,
    Group,
    Input,
    NativeSelect,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircle";
import { useEffect, useState } from "react";
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

interface Question {
    q: string;
    a: string;
    b: string;
    c: string;
    d: string;
    ans: string;
    exp: string;
}

export default function StudyToolPage() {
    const [user, loading] = useAuthState(auth);
    const db = getFirestore(app);

    const [answer, setAnswer] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const [type, setType] = useState("kt");
    const [doc, setDoc] = useState("");

    const [notes, setNotes] = useState<{ [key: string]: Note[] }>({});
    const [names, setNames] = useState<string[]>([]);

    useEffect(() => {
        handleGetAllDocuments();
    }, [user]);

    const handleGetAllDocuments = async () => {
        if (!user) return;
        const notesRef = collection(db, "Users", user.uid, "Notes");
        const snapshot = await getDocs(notesRef);
        const noteNames: Set<string> = new Set([]);
        const allNotes: { [key: string]: Note[] } = {};
        snapshot.forEach((doc) => {
            const data: Note = doc.data() as Note;
            if (noteNames.has(data.name)) {
                allNotes[data.name].push(data);
            } else {
                allNotes[data.name] = [data];
                noteNames.add(data.name);
            }
        });
        Object.keys(allNotes).forEach((e) => {
            allNotes[e].sort((a, b) => a.position - b.position);
        });
        setNotes(allNotes);
        console.log(allNotes);
        const sortedNames = Object.keys(allNotes);
        sortedNames.sort((a, b) => a.localeCompare(b));
        setNames(sortedNames);
        setDoc(sortedNames[0]);
    };

    const parseQuestions = (questions: string) => {
        if (questions == "") return;
        const qarray: Question[] = [];
        const lines: string[] = questions.split("\n\n");
        let currentHeading = "";
        lines.forEach((line) => {
            if (line.startsWith("#")) {
                currentHeading = line.replace(/^#+|#+$/g, "").trim();
            } else {
                const q = line.split("[QUESTION START]")[1].split("[QUESTION END]")[0];
                qarray.push({
                    q: q.split("A)")[0].trim(),
                    a: q.split("A)")[1].split("B)")[0].trim(),
                    b: q.split("B)")[1].split("C)")[0].trim(),
                    c: q.split("C)")[1].split("D)")[0].trim(),
                    d: q.split("D)")[1].split("Correct Answer)")[0].trim(),
                    ans: q.split("Correct Answer)")[1].split("Explanation)")[0].trim(),
                    exp: q.split("Explanation)")[1].trim(),
                } as Question);
            }
        });
        setQuestions(qarray);
    };

    const handleQuery = async () => {
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
        try {
            const preprompt =
                type == "kt"
                    ? "preprompt_keyterms.txt"
                    : type == "ov"
                    ? "preprompt_overview.txt"
                    : "preprompt_question.txt";
            const res = await fetch("/prompts/" + preprompt);
            const data = await res.text();

            let content = "";
            notes[doc]
                .map((e) => e.compressedText)
                .forEach((c: string) => {
                    content += inflateSync(Buffer.from(c, "base64")).toString();
                });
            const prompt = `${data}\n\nContent: ${content}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            type == "qs" ? parseQuestions(response.text ?? "") : setAnswer(response.text ?? "Nothing Received");

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
                <SegmentedControl
                    size="md"
                    radius="xs"
                    color="pale-green"
                    withItemsBorders={false}
                    transitionDuration={500}
                    value={type}
                    onChange={setType}
                    data={[
                        { label: "Key Terms", value: "kt" },
                        { label: "Overview", value: "ov" },
                        { label: "Questions", value: "qs" },
                    ]}
                />
                <NativeSelect
                    value={doc}
                    onChange={(e) => setDoc(e.currentTarget.value)}
                    size="md"
                    radius="xs"
                    flex={1}
                    data={names}
                />
                <Button
                    rightSection={<SendIcon />}
                    radius={"xs"}
                    size="md"
                    color="pale-green"
                    onClick={async () => {
                        await handleQuery();
                    }}
                >
                    Send
                </Button>
            </Group>
            {type == "qs" ? (
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
                    <Accordion variant="separated" radius="xs">
                        {questions.map((q, i) => {
                            return (
                                <Accordion.Item key={i} value={i.toString()}>
                                    <Accordion.Control style={{ whiteSpace: "pre-line" }}>
                                        <b>{q.q}</b>
                                        <br />
                                        <br />
                                        {"A) " + q.a + "\nB) " + q.b + "\nC) " + q.c + "\nD) " + q.d}
                                    </Accordion.Control>
                                    <Accordion.Panel style={{ whiteSpace: "pre-line" }}>
                                        {"Correct Answer: " + q.ans + "\nExplanation: " + q.exp}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                </ScrollArea>
            ) : (
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
            )}
        </Box>
    );
}

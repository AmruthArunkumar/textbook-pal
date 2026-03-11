"use client";
import { ActionIcon, Affix, Box, Button, FileButton, Grid, Group, Menu, Paper, SimpleGrid, Text } from "@mantine/core";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useEffect, useRef, useState } from "react";
import { app, auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, writeBatch } from "firebase/firestore";
import { showNotification, updateNotification } from "@mantine/notifications";
import { parsePDF } from "@/app/api/parser";
import { SentenceSplitter } from "@llamaindex/core/node-parser";
import { deflateSync, inflateSync } from "zlib";
import { GoogleGenAI } from "@google/genai";
import KNN from "@/app/api/compare";

interface Note {
    id: string;
    embedding: number[];
    name: string;
    compressedText: string;
    position: number;
}

export default function DocumentPage() {
    const [user, loading] = useAuthState(auth);
    const db = getFirestore(app);

    const [file, setFile] = useState<File | null>(null);
    const resetRef = useRef<() => void>(null);
    const [notes, setNotes] = useState<{ ids: string[]; name: string }[]>([]);

    useEffect(() => {
        handleGetAllDocuments();
    }, [user]);

    const clearFile = () => {
        setFile(null);
        resetRef.current?.();
    };

    const handleAddDocument = async () => {
        showNotification({
            id: "add-doc",
            title: "Uploading...",
            message: "Your document is being parsed and uploaded",
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
            // Parsing
            const docs: {
                id: string | undefined;
                text: string;
            }[] = await parsePDF(file!);
            let content = "";
            docs.map((d) => (content += d.text + "\n"));

            // Chunking
            const splitter = new SentenceSplitter({
                chunkSize: 400,
                chunkOverlap: 0,
            });
            const output = splitter.splitText(content);

            if (output.length >= 50) throw "too big";

            // Compression
            const compressed = output.map((c) => deflateSync(c).toString("base64"));
            console.log(output.map((o, i) => ((compressed[i].length / o.length) * 100).toFixed(1).toString() + "%"));

            // Embedding
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
            const response = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: output,
                config: {
                    outputDimensionality: 1024,
                },
            });
            console.log(response.embeddings);
            const embeddings = response.embeddings;

            // Storing in DB
            const batch = writeBatch(db);
            const ids: string[] = [];

            compressed.forEach((c, i) => {
                const newDocRef = doc(notesRef);
                batch.set(newDocRef, {
                    name: file?.name.replace(/\.pdf$/i, "") ?? "N/A",
                    compressedText: c,
                    embedding: embeddings![i].values,
                    position: i
                });
                ids.push(newDocRef.id);
            });

            await batch.commit();
            console.log("Document written with ID: ", ids);
            setNotes([...notes, { name: file?.name ?? "N/A", ids: ids }]);
            clearFile();

            updateNotification({
                id: "add-doc",
                title: "Success!",
                message: "Document Saved Successfully",
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
                id: "add-doc",
                title: "Uh Oh!",
                message: "Error Adding Document",
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

    const handleDeleteDocument = async (name: string, ids: string[]) => {
        if (!user) return;
        const notesDoc = collection(db, "Users", user.uid, "Notes");
        try {
            const batch = writeBatch(db);

            ids.forEach((id) => {
                const d = doc(notesDoc, id);
                batch.delete(d);
            });

            await batch.commit();

            // const docRef = await deleteDoc(notesDoc);
            console.log("Document deleted");
            setNotes((prevNotes) => prevNotes.filter((note) => note.name !== name));
            showNotification({
                title: "Success!",
                message: "Document Removed Successfully",
                color: "green",
                radius: "xs",
                style: {
                    maxWidth: "40vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CheckIcon />,
            });
        } catch (e) {
            console.error("Error Removing Document: ", e);
            showNotification({
                title: "Uh Oh!",
                message: "Error Removing Document",
                color: "red",
                radius: "xs",
                style: {
                    maxWidth: "40vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                },
                icon: <CloseIcon />,
            });
        }
    };

    const handleGetAllDocuments = async () => {
        if (!user) return;
        const notesRef = collection(db, "Users", user.uid, "Notes");
        const snapshot = await getDocs(notesRef);
        const noteNames: Set<string> = new Set([]);
        const allNotes: { ids: string[]; name: string }[] = [];
        snapshot.forEach((doc) => {
            const data: Note = doc.data() as Note;
            if (noteNames.has(data.name)) {
                allNotes.forEach((n) => {
                    if (n.name === data.name) {
                        n.ids.push(doc.id);
                    }
                });
            } else {
                allNotes.push({ name: data.name, ids: [doc.id] });
                noteNames.add(data.name);
            }
        });
        setNotes([...allNotes]);
        console.log(allNotes)
    };

    return (
        <Box display={"flex"} style={{ flexDirection: "column", gap: "16px" }}>
            {file && (
                <Group
                    display={"flex"}
                    justify="flex-start"
                    pb={"8px"}
                    style={{ borderBottom: "2px solid light-dark(#DDDDDD, #444444)" }}
                >
                    <Text size="md" ta="center" flex={1}>
                        Picked file: {file.name}
                    </Text>
                    <Button
                        rightSection={<UploadFileIcon />}
                        radius={"sm"}
                        size="md"
                        color="pale-green"
                        visibleFrom="sm"
                        onClick={handleAddDocument}
                    >
                        Upload
                    </Button>
                </Group>
            )}
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="md" style={{ width: "100%" }}>
                {notes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((n, i) => {
                        return (
                            <Paper withBorder shadow="sm" radius="md" p="16px" key={i} display={"flex"}>
                                <PictureAsPdfIcon sx={{ color: "#E57373", mr: "16px" }} />
                                <Text flex={1} truncate="end">
                                    {n.name}
                                </Text>
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" color="gray">
                                            <MoreVertIcon />
                                        </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Item
                                            color="red"
                                            onClick={() => {
                                                handleDeleteDocument(n.name, n.ids);
                                            }}
                                        >
                                            Delete
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Paper>
                        );
                    })}
            </SimpleGrid>
            <FileButton onChange={setFile} accept="application/pdf">
                {(props) => (
                    <Affix {...props} position={{ bottom: 25, right: 25 }}>
                        <ActionIcon color="pale-green" radius="xl" size={60}>
                            <AddIcon />
                        </ActionIcon>
                    </Affix>
                )}
            </FileButton>
        </Box>
    );
}

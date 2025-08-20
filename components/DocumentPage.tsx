"use client";
import { ActionIcon, Affix, Box, Button, FileButton, Grid, Group, Menu, Paper, SimpleGrid, Text } from "@mantine/core";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useEffect, useState } from "react";
import TabHeader from "@/components/TabHeader";
import { app, auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from "firebase/firestore";
import { showNotification } from "@mantine/notifications";

interface Note {
    id: string;
    embedding: number[];
    compressedText: string;
}

export default function DocumentPage() {
    const [user, loading] = useAuthState(auth);
    const db = getFirestore(app);

    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState<{ id: string; text: string }[]>([]);

    useEffect(() => {
        handleGetAllDocuments();
    }, [user]);

    const handleAddDocument = async () => {
        if (!user) return;
        const notesRef = collection(db, "Users", user.uid, "Notes");
        try {
            const docRef = await addDoc(notesRef, { compressedText: file?.name ?? "N/A", embedding: [1, 2, 3] });
            console.log("Document written with ID: ", docRef.id);
            setNotes([...notes, { text: file?.name ?? "N/A", id: docRef.id }]);
            setFile(null);
            showNotification({
                title: "Success!",
                message: "Document Saved Successfully",
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
            console.error("Error adding document: ", e);
            showNotification({
                title: "Uh Oh!",
                message: "Error Adding Document",
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

    const handleDeleteDocument = async (id: string) => {
        if (!user) return;
        console.log(id)
        const notesDoc = doc(db, "Users", user.uid, "Notes", id);
        try {
            const docRef = await deleteDoc(notesDoc);
            console.log("Document deleted");
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
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
        const allNotes: { id: string; text: string }[] = [];
        snapshot.forEach((doc) => {
            const data: Note = doc.data() as Note;
            allNotes.push({ text: data.compressedText, id: doc.id });
        });
        console.log(allNotes)
        setNotes(allNotes);
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
                    <ActionIcon radius={"sm"} size="xl" color="pale-green" hiddenFrom="sm" onClick={handleAddDocument}>
                        <UploadFileIcon />
                    </ActionIcon>
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
                {notes.map((n, i) => {
                    return (
                        <Paper withBorder shadow="sm" radius="md" p="16px" key={i} display={"flex"}>
                            <PictureAsPdfIcon sx={{ color: "#E57373", mr: "16px" }} />
                            <Text flex={1} truncate="end">
                                {n.text.replace(/\.pdf$/i, "")}
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
                                            handleDeleteDocument(n.id);
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
            <Box display={"flex"} style={{ flexDirection: "row", gap: "16px" }}></Box>
        </Box>
    );
}

"use server";

import { LlamaParseReader } from "llama-cloud-services";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
};

export const parsePDF = async (file: File) => {
    // const reader = new LlamaParseReader({ apiKey: process.env.NEXT_PUBLIC_LLAMA_PARSE_KEY, resultType: "markdown" });
    // const content = await fileToUint8Array(file);
    // const documents = await reader.loadDataAsContent(content, file.name);
    // console.log("Docs (server):", documents.length);

    // return documents.map((doc) => ({
    //     id: doc.id_,
    //     text: doc.text
    // }));
    const loader = new PDFLoader(file)
    const docs = await loader.load();
    console.log(docs)
    return docs.map((doc) => ({
        id: doc.id,
        text: doc.pageContent
    }));
};

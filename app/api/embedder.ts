"use server";

import { ContentEmbedding, GoogleGenAI, Models } from "@google/genai";

export default async function embed(ai: Models, content: string): Promise<ContentEmbedding[] | undefined> {
    const response = await ai.embedContent({
        model: "gemini-embedding-001",
        contents: content,
    });
    return response.embeddings;
}

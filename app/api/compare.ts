var similarity = require("compute-cosine-similarity");

interface Note {
    id: string;
    embedding: number[];
    name: string;
    compressedText: string;
}

function compare(emb1: number[], emb2: number[]): number {
    return similarity(emb1, emb2);
}

export default function KNN(col: Note[], query: number[], k: number) {
    return col
        .sort((a, b) => {
            return compare(b.embedding, query) - compare(a.embedding, query);
        })
        .slice(0, k);
}

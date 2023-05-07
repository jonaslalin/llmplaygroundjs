import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

export async function makeVectorStore(
    textPath: string,
    {
        chunkSize = 1000,
        chunkOverlap = 200,
        embeddingsCacheDir = "embeddings/",
        useEmbeddingsCache = false,
    }: {
        chunkSize?: number;
        chunkOverlap?: number;
        embeddingsCacheDir?: string;
        useEmbeddingsCache?: boolean;
    } = {}
) {
    const embeddings = new OpenAIEmbeddings();
    if (useEmbeddingsCache) {
        const vectorStore = await HNSWLib.load(embeddingsCacheDir, embeddings);
        return vectorStore;
    }
    const loader = new TextLoader(textPath);
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
    const docs = await loader.loadAndSplit(splitter);
    const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
    await vectorStore.save(embeddingsCacheDir);
    return vectorStore;
}

import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { makeVectorStore } from "../src/langchain.js";

// const text = await pdf2Text("docs/catan.pdf");
// await writeFile("docs/catan.txt", text, "utf8");

const chat = new ChatOpenAI({ temperature: 0 });
const vectorStore = await makeVectorStore("docs/catan.txt", {
    chunkSize: 300,
    chunkOverlap: 20,
    embeddingsCacheDir: "embeddings/catan/",
    useEmbeddingsCache: false,
});

const systemTemplate =
    "Your task is to answer questions.\n" +
    "You can only use the information provided by <context> to answer these questions.\n\n" +
    "First, identify all subquestions within <question>. " +
    "For each subquestion:\n" +
    "1. Write down the subquestion.\n" +
    "2. Write down the text passages from <context> that can be used for answering the subquestion. " +
    "If no relevant text passages can be found, say so.\n" +
    "3. Answer the subquestion by only using the relevant text passages. " +
    "If you can't answer the subquestion by looking at the relevant text passages, say so.\n\n" +
    "Use the following format:\n" +
    "<subquestion1>\n" +
    "<!-- Write down the first subquestion. -->\n" +
    "</subquestion1>\n" +
    "<textpassages_for_subquestion1>\n" +
    "<!-- Write down the text passages from <context> that can be used for answering the first subquestion. " +
    "If no relevant text passages can be found, say so. -->\n" +
    "</textpassages_for_subquestion1>\n" +
    "<subanswer1>\n" +
    "<!-- Answer the first subquestion by only using the relevant text passages. " +
    "If you can't answer the first subquestion by looking at the relevant text passages, say so. -->\n" +
    "</subanswer1>\n" +
    "<subquestion2>\n" +
    "<!-- Write down the second subquestion. -->\n" +
    "</subquestion2>\n" +
    "<textpassages_for_subquestion2>\n" +
    "<!-- Write down the text passages from <context> that can be used for answering the second subquestion. " +
    "If no relevant text passages can be found, say so. -->\n" +
    "</textpassages_for_subquestion2>\n" +
    "<subanswer2>\n" +
    "<!-- Answer the second subquestion by only using the relevant text passages. " +
    "If you can't answer the second subquestion by looking at the relevant text passages, say so. -->\n" +
    "</subanswer2>\n" +
    "<question>\n" +
    "<!-- Repeat the original contents of <question>. -->\n" +
    "</question>\n" +
    "<finalanswer>\n" +
    "<!-- Combine all subanswers. -->\n" +
    "</finalanswer>\n\n" +
    "<context>\n" +
    "{context}" +
    "\n</context>";
const userTemplate = "<question>\n{question}\n</question>";
const messages = [
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(userTemplate),
];
const prompt = ChatPromptTemplate.fromPromptMessages(messages);
console.log(
    "System template:\n" +
        "```\n" +
        systemTemplate +
        "\n```\n\n" +
        "User template:\n" +
        "```\n" +
        userTemplate +
        "\n```\n"
);

const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(chat, { prompt, verbose: false }),
    retriever: vectorStore.asRetriever(),
    returnSourceDocuments: true,
});

let query, response;

// query = "Lisa has 5 cards and rolls a 7. Kalle has 9 cards. What happens?";
query = "What do I need to buy a road/settlement/city/development card?";
response = await chain.call({ query });
console.log(
    "Context:\n" +
        "```\n" +
        response.sourceDocuments.map((doc: Document) => doc.pageContent).join("\n\n") +
        "\n```\n\n" +
        `Query:\n${query}\n\n` +
        `Response:\n${response.text}`
);

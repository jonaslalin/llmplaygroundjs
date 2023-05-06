import { HumanChatMessage } from "langchain/schema";
import { Client } from "../src/langchain.js";

const response = await Client.getCompletion([
    new HumanChatMessage("Translate from English to French: I love programming."),
]);
console.log(response);

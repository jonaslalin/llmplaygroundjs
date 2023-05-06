import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseChatMessage } from "langchain/schema";
import { getApiKey } from "./config.js";

export function makeClient(apiKey: string) {
    const client = new ChatOpenAI({ openAIApiKey: apiKey });
    return client;
}

export async function getCompletion(
    messages: Array<BaseChatMessage>,
    {
        client,
        model = "gpt-3.5-turbo",
        temperature = 0,
    }: {
        client: ChatOpenAI;
        model?: string;
        temperature?: number;
    }
) {
    client.modelName = model;
    client.temperature = temperature;
    const response = await client.call(messages);
    return response;
}

export class Client {
    private static client: ChatOpenAI;

    private constructor() {}

    private static async makeClient() {
        const apiKey = await getApiKey();
        const client = makeClient(apiKey);
        return client;
    }

    private static async getClient() {
        if (!Client.client) {
            Client.client = await Client.makeClient();
        }
        return Client.client;
    }

    static async getCompletion(
        messages: Array<BaseChatMessage>,
        {
            model = "gpt-3.5-turbo",
            temperature = 0,
        }: {
            model?: string;
            temperature?: number;
        } = {}
    ) {
        const client = await Client.getClient();
        const response = await getCompletion(messages, { client, model, temperature });
        return response;
    }
}

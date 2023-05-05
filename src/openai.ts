import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from "openai";

import { readFile } from "fs/promises";

export async function getApiKey() {
    let apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
        return apiKey;
    }
    try {
        var dotEnv = await readFile(".env", "utf8");
    } catch (err) {
        throw new Error("Can't find .env file in project root");
    }
    const re = /^OPENAI_API_KEY=(?<apiKey>.*)$/m;
    const result = re.exec(dotEnv);
    apiKey = result?.groups?.apiKey;
    if (!apiKey) {
        throw new Error("Can't find OPENAI_API_KEY inside .env file");
    }
    return apiKey;
}

export function makeClient(apiKey: string) {
    const configuration = new Configuration({ apiKey });
    const client = new OpenAIApi(configuration);
    return client;
}

export async function getCompletion(
    messages: Array<ChatCompletionRequestMessage>,
    {
        client,
        model = "gpt-3.5-turbo",
        temperature = 0,
    }: {
        client: OpenAIApi;
        model?: string;
        temperature?: number;
    }
) {
    const apiResponse = await client.createChatCompletion({ model, messages, temperature });
    const response = apiResponse.data.choices[0].message as ChatCompletionResponseMessage;
    return response;
}

export class Client {
    private static client: OpenAIApi;

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
        messages: Array<ChatCompletionRequestMessage>,
        {
            model = "gpt-3.5-turbo",
            temperature = 0,
        }: {
            model?: string;
            temperature?: number;
        }
    ) {
        const client = await Client.getClient();
        const response = await getCompletion(messages, { client, model, temperature });
        return response;
    }
}

export class Chat {
    history: Array<ChatCompletionRequestMessage | ChatCompletionResponseMessage> = [];

    constructor() {}

    static toDebugMessage(message: ChatCompletionRequestMessage | ChatCompletionResponseMessage) {
        return `### ${message.role.toUpperCase()} ###\n${message.content}\n\n`;
    }

    async getCompletion(
        messages: Array<ChatCompletionRequestMessage>,
        {
            model = "gpt-3.5-turbo",
            temperature = 0,
            save = false,
            debug = true,
        }: {
            model?: string;
            temperature?: number;
            save?: boolean;
            debug?: boolean;
        } = {}
    ) {
        let newMessages = [...this.history, ...messages] as Array<
            ChatCompletionRequestMessage | ChatCompletionResponseMessage
        >;
        const response = await Client.getCompletion(newMessages, { model, temperature });
        newMessages = [...newMessages, response];
        if (save) {
            this.history = newMessages;
        }
        if (debug) {
            newMessages
                .map((message) => Chat.toDebugMessage(message))
                .forEach((debugMessage) => console.log(debugMessage));
        }
        return response;
    }
}

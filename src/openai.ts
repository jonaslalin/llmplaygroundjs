import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from "openai";

import { readFile } from "fs/promises";

export async function getApiKey() {
    try {
        var dotEnv = await readFile(".env", "utf8");
    } catch (err) {
        throw new Error("Can't find .env file in project root");
    }
    const re = /OPENAI_API_KEY=(?<apiKey>.*)$/m;
    const result = re.exec(dotEnv);
    const apiKey = result?.groups?.apiKey;
    if (!apiKey) {
        throw new Error("Can't find OPENAI_API_KEY inside .env file");
    }
    return apiKey;
}

export function getClient(apiKey: string) {
    const configuration = new Configuration({ apiKey });
    const client = new OpenAIApi(configuration);
    return client;
}

export async function getCompletion(
    client: OpenAIApi,
    {
        model = "gpt-3.5-turbo",
        messages,
        temperature = 0,
    }: {
        model?: string;
        messages: Array<ChatCompletionRequestMessage | ChatCompletionResponseMessage>;
        temperature?: number;
    }
) {
    const apiResponse = await client.createChatCompletion({ model, messages, temperature });
    const response = apiResponse.data.choices[0].message as ChatCompletionResponseMessage;
    return response;
}

export class StatefulChat {
    history: Array<ChatCompletionRequestMessage | ChatCompletionResponseMessage> = [];

    constructor(private client: OpenAIApi) {}

    toDebugMessage(message: ChatCompletionRequestMessage | ChatCompletionResponseMessage) {
        return `### ${message.role.toUpperCase()} ###\n${message.content}\n\n`;
    }

    async getCompletion(
        messages: Array<ChatCompletionRequestMessage | ChatCompletionResponseMessage>,
        {
            debug = true,
            save = false,
        }: {
            debug?: boolean;
            save?: boolean;
        } = {}
    ) {
        let newHistory = [...this.history, ...messages] as Array<
            ChatCompletionRequestMessage | ChatCompletionResponseMessage
        >;
        const response = await getCompletion(this.client, { messages: newHistory });
        newHistory = [...newHistory, response];
        if (debug) {
            newHistory
                .map((message) => this.toDebugMessage(message))
                .forEach((debugMessage) => console.log(debugMessage));
        }
        if (save) {
            this.history = newHistory;
        }
        return response;
    }
}

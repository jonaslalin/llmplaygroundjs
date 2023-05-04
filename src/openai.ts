import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

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
        messages: Array<ChatCompletionRequestMessage>;
        temperature?: number;
    }
) {
    const apiResponse = await client.createChatCompletion({ model, messages, temperature });
    const response = apiResponse.data.choices[0].message as ChatCompletionRequestMessage;
    return response;
}

export class StatefulChat {
    history: Array<ChatCompletionRequestMessage> = [];

    constructor(private client: OpenAIApi) {}

    async getCompletion(
        messages: Array<ChatCompletionRequestMessage>,
        {
            save = false,
        }: {
            save?: boolean;
        } = {}
    ) {
        const response = await getCompletion(this.client, { messages: [...this.history, ...messages] });
        if (save) {
            this.history = [...this.history, ...messages, response];
        }
        return response;
    }
}

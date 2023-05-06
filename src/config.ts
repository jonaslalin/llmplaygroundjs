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

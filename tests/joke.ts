import * as openai from "../src/openai";

async function main() {
    const chat = new openai.Chat();

    await chat.getCompletion([
        {
            role: "user",
            content: "Tell me a joke.",
        },
    ]);

    const response = await chat.getCompletion([
        {
            role: "system",
            content:
                "Your task is to tell jokes.\n" +
                "Only reply with a minified JSON object using the following JSON schema:\n" +
                "{\n" +
                '    "$schema": "https://json-schema.org/draft/2020-12/schema",\n' +
                '    "$id": "https://example.com/joke.schema.json",\n' +
                '    "title": "Joke",\n' +
                '    "description": "A joke from ChatGPT",\n' +
                '    "type": "object",\n' +
                '    "properties": {\n' +
                '        "answer": {\n' +
                '            "description": "The answer to the joke",\n' +
                '            "type": "string"\n' +
                "        },\n" +
                '        "question": {\n' +
                '            "description": "The joke",\n' +
                '            "type": "string"\n' +
                "        }\n" +
                "    },\n" +
                '    "required": ["answer", "question"]\n' +
                "}",
        },
        {
            role: "user",
            content: "Tell me a joke about an apple and a banana.",
        },
    ]);
    const joke = JSON.parse(response.content);
    console.log("Parsed JavaScript object:", joke);
}

main().then(() => {}, console.error.bind(null));
